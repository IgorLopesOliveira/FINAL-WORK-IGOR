import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const punches = [
  "Jab",
  "Cross",
  "Right hook",
  "Left uppercut",
  "Right uppercut",
];

const INITIAL_TIME = 3000;
const TIME_DECREMENT = 200;

const FRONT_PUNCHES = ["jab", "cross"];
const UPPERCUT_PUNCHES = ["left uppercut", "right uppercut"];

function normalize(str) {
  return str.toLowerCase().replace(/_/g, " ").trim();
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    maxWidth: '852px',
    maxHeight: '393px',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontFamily: "'Lexend', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box',
    margin: '0 auto',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    marginBottom: '2rem',
  },
  button: {
    fontFamily: "'Lexend', sans-serif",
    padding: '20px 30px',
    borderRadius: '50px',
    border: '2px solid #2C2C2C',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.2s ease',
    margin: '10px',
  },
  bigText: {
    fontSize: '4rem',
    fontWeight: 900,
    marginBottom: '2rem',
  },
  progress: {
    fontSize: '1.5rem',
    marginTop: '1rem',
  },
  fail: {
    color: "#B44",
  },
  slow: {
    color: "#B44",
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '0 1rem',
  },
  popupOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(44,44,44,0.25)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popup: {
    fontFamily: "'Lexend', sans-serif",
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    padding: '36px 32px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    color: '#2C2C2C',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  popupTitle: {
    fontSize: '1.6rem',
    fontWeight: 900,
  },
  popupText: {
    fontSize: '1.1rem',
    fontWeight: 400,
    color: '#222',
  },
  popupButton: {
    fontFamily: "'Lexend', sans-serif",
    padding: '14px 32px',
    borderRadius: '50px',
    border: '2px solid #2C2C2C',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '120px',
    transition: 'all 0.2s ease',
    marginTop: '10px',
  },
};

function Accuracy() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [phase, setPhase] = useState("menu");
  const [currentPunch, setCurrentPunch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(INITIAL_TIME);
  const [failType, setFailType] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const timeoutRef = useRef(null);
  const inputLocked = useRef(false);

  useEffect(() => {
    if (!socket) return;

    const handlePunch = (data) => {
      const expected = normalize(currentPunch);
      const received = Array.isArray(data.type)
        ? data.type.map(normalize)
        : [normalize(data.type)];

      if (phase === "menu") {
        if (received.some(p => FRONT_PUNCHES.includes(p))) {
          startGame();
        }
        return;
      }

      if (phase !== "input" || inputLocked.current) return;

      const matched = received.some(p => {
        if (FRONT_PUNCHES.includes(expected)) return FRONT_PUNCHES.includes(p);
        if (UPPERCUT_PUNCHES.includes(expected)) return UPPERCUT_PUNCHES.includes(p);
        return p === expected;
      });

      inputLocked.current = true;
      clearTimeout(timeoutRef.current);

      if (matched) {
        if (currentIndex === 9) {
          setPhase("win");
        } else {
          setCurrentIndex(i => i + 1);
          setTimer(t => Math.max(200, t - TIME_DECREMENT));
          setPhase("show");
        }
      } else {
        setFailType("fail");
        setPhase("fail");
      }
    };

    socket.on("punch", handlePunch);
    return () => socket.off("punch", handlePunch);
  }, [socket, phase, currentPunch, currentIndex]);

  useEffect(() => {
    if (phase !== "input") return;
    inputLocked.current = false;
    timeoutRef.current = setTimeout(() => {
      inputLocked.current = true;
      setFailType("slow");
      setPhase("fail");
    }, timer);
    return () => clearTimeout(timeoutRef.current);
  }, [phase, timer]);

  useEffect(() => {
    if (phase === "show") {
      const next = punches[Math.floor(Math.random() * punches.length)];
      setCurrentPunch(next);
      setPhase("input");
    }
  }, [phase]);

  const startGame = () => {
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setPhase("show");
    setFailType("");
    setShowInfo(false);
  };

  const resetGame = () => {
    setPhase("menu");
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setFailType("");
    setCurrentPunch("");
    setShowInfo(true);
    clearTimeout(timeoutRef.current);
    inputLocked.current = false;
  };

  if (showInfo) {
    return (
      <div style={styles.popupOverlay}>
        <div style={styles.popup}>
          <div style={styles.popupTitle}>{t("accuracy.infoTitle", "How the game works")}</div>
          <div style={styles.popupText}>
            {t(
              "accuracy.infoText",
              "You will see a punch type on the screen. Hit the correct punch before the time runs out. 10 correct punches to win!"
            )}
          </div>
          <button style={styles.popupButton} onClick={() => setShowInfo(false)}>
            {t("accuracy.understood", "Understood")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {phase === "menu" && (
        <div style={styles.centered}>
          <button
            style={{
              position: "absolute",
              top: 24,
              right: 32,
              background: "none",
              border: "none",
              fontSize: "2rem",
              cursor: "pointer",
            }}
            onClick={() => navigate("/minimenu")}
          >
            ↩
          </button>
          <h1 style={styles.title}>{t("accuracy.title", "Accuracy Game")}</h1>
          <div style={{ marginTop: "2rem", fontSize: "1.3rem", fontWeight: 700 }}>
            {t("accuracy.jabToStart", "Put your gloves on and throw a jab to start")}
          </div>
        </div>
      )}
      {phase === "input" && (
        <div style={styles.centered}>
          <h2 style={styles.title}>{t("accuracy.hit", "Hit this punch!")}</h2>
          <div style={styles.bigText}>{currentPunch}</div>
          <div style={styles.progress}>{currentIndex + 1}/10</div>
          <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
            {t("accuracy.timeLeft", "Time left")}: {(timer / 1000).toFixed(1)}s
          </div>
        </div>
      )}
      {phase === "fail" && (
        <div style={styles.centered}>
          <h2 style={{ ...styles.title, ...(failType === "slow" ? styles.slow : styles.fail) }}>
            {failType === "slow"
              ? t("accuracy.tooSlow", "Too Slow!")
              : t("accuracy.wrongPunch", "Wrong Punch")}
          </h2>
          <button style={styles.button} onClick={resetGame}>
            {t("accuracy.backToMenu", "Back to Accuracy Menu")}
          </button>
        </div>
      )}
      {phase === "win" && (
        <div style={styles.centered}>
          <h1 style={styles.title}>
            {t("accuracy.completed", "You completed all 10 punches!")}
          </h1>
          <button style={styles.button} onClick={resetGame}>
            {t("accuracy.playAgain", "Play Again")}
          </button>
        </div>
      )}
    </div>
  );
}

export default Accuracy;
