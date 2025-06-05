import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const punches = ["Jab", "Left hook", "Uppercut"];
const INITIAL_TIME = 2000; // ms
const TIME_DECREMENT = 200; // ms

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    maxWidth: '852px',
    maxHeight: '393px',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxSizing: 'border-box',
    margin: '0 auto',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    width: '100%',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2C2C2C',
    color: '#EFEFEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
  },
  iconSymbol: {
    fontSize: '20px',
    lineHeight: '1',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    marginBottom: '2rem',
  },
  button: {
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
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '0 1rem',
  },
};

function Accuracy() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [phase, setPhase] = useState("menu"); // menu, show, input, fail, win
  const [currentPunch, setCurrentPunch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(INITIAL_TIME);
  const [feedback, setFeedback] = useState("");
  const timeoutRef = useRef(null);

  // Start the game
  const startGame = () => {
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setPhase("show");
    setFeedback("");
  };

  // Show the punch to hit
  useEffect(() => {
    if (phase === "show") {
      const punch = punches[Math.floor(Math.random() * punches.length)];
      setCurrentPunch(punch);
      setPhase("input");
    }
    // eslint-disable-next-line
  }, [phase]);

  // Handle punch input and timer
  useEffect(() => {
    if (phase !== "input") return;

    // Set up timer for this punch
    timeoutRef.current = setTimeout(() => {
      setPhase("fail");
      setFeedback("");
    }, timer);

    // Listen for punch
    const handlePunch = (data) => {
      const punch = (data.type || "").toLowerCase().trim();
      const expected = (currentPunch || "").toLowerCase().trim();
      if (punch === expected) {
        clearTimeout(timeoutRef.current);
        if (currentIndex === 9) {
          setPhase("win");
        } else {
          setCurrentIndex((idx) => idx + 1);
          setTimer((t) => Math.max(200, t - TIME_DECREMENT));
          setPhase("show");
        }
      } else {
        clearTimeout(timeoutRef.current);
        setFeedback(data.type);
        setPhase("fail");
      }
    };

    socket.on("punch", handlePunch);
    return () => {
      clearTimeout(timeoutRef.current);
      socket.off("punch", handlePunch);
    };
    // eslint-disable-next-line
  }, [phase, timer, currentPunch, currentIndex, socket]);

  // Reset to menu
  const resetGame = () => {
    setPhase("menu");
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setFeedback("");
    setCurrentPunch("");
  };

  // Render functions
  const renderMenu = () => (
    <div style={styles.centered}>
      <div style={styles.header}>
        <div />
        <h1 style={styles.title}>{t("accuracy.title", "Accuracy Game")}</h1>
        <div
          style={styles.icon}
          onClick={() => navigate("/minimenu")}
        >
          <span style={styles.iconSymbol}>↩</span>
        </div>
      </div>
      <button style={styles.button} onClick={startGame}>{t("accuracy.start", "Start")}</button>
    </div>
  );

  const renderInput = () => (
    <div style={styles.centered}>
      <h2 style={styles.title}>{t("accuracy.hit", "Hit this punch!")}</h2>
      <div style={styles.bigText}>{currentPunch}</div>
      <div style={styles.progress}>
        {currentIndex + 1}/10
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        {t("accuracy.timeLeft", "Time left")}: {(timer / 1000).toFixed(1)}s
      </div>
    </div>
  );

  const renderFail = () => (
    <div style={styles.centered}>
      <h2 style={{ ...styles.title, ...styles.fail }}>{t("accuracy.wrongPunch", "Wrong Punch")}</h2>
      <button style={styles.button} onClick={resetGame}>{t("accuracy.backToMenu", "Back to Accuracy Menu")}</button>
    </div>
  );

  const renderWin = () => (
    <div style={styles.centered}>
      <h1 style={styles.title}>{t("accuracy.completed", "You completed all 10 punches!")}</h1>
      <button style={styles.button} onClick={resetGame}>{t("accuracy.playAgain", "Play Again")}</button>
    </div>
  );

  if (phase === "menu") return <div style={styles.container}>{renderMenu()}</div>;
  if (phase === "input") return <div style={styles.container}>{renderInput()}</div>;
  if (phase === "fail") return <div style={styles.container}>{renderFail()}</div>;
  if (phase === "win") return <div style={styles.container}>{renderWin()}</div>;

  return null;
}

export default Accuracy;