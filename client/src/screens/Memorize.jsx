import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const punches = ["Jab", "Left hook","Right hook", "Left Uppercut", "Right Uppercut", "Cross"];

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
    marginBottom: '0.5rem',
  },
  popupText: {
    fontSize: '1.1rem',
    fontWeight: 400,
    marginBottom: '0.5rem',
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

function Memorize() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [phase, setPhase] = useState("menu"); // menu, show, wait, input, fail, win
  const [combo, setCombo] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDisplay, setCurrentDisplay] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [feedback, setFeedback] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const punchCooldown = 1000;
  const lastPunchTimeRef = useRef(0);

  useEffect(() => {
    if (!socket || phase !== "input") return;
    const handlePunch = (data) => {
      const now = Date.now();
      if (now - lastPunchTimeRef.current < punchCooldown) return;
      const punch = (data.type || "").toLowerCase().trim();
      const expected = (combo[currentIndex] || "").toLowerCase().trim();

      // Accept jab/cross as equivalent, and left/right uppercut as equivalent
      const FRONT_PUNCHES = ["jab", "cross"];
      const UPPERCUT_PUNCHES = ["left uppercut", "right uppercut"];

      lastPunchTimeRef.current = now;

      // If expected is jab or cross, accept either
      if (FRONT_PUNCHES.includes(expected) && FRONT_PUNCHES.includes(punch)) {
        setFeedback(combo[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        return;
      }
      // If expected is left/right uppercut, accept either
      if (UPPERCUT_PUNCHES.includes(expected) && UPPERCUT_PUNCHES.includes(punch)) {
        setFeedback(combo[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
        return;
      }
      // Otherwise, strict match
      if (punch === expected) {
        setFeedback(combo[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      } else {
        setFeedback(data.type);
        setPhase("fail");
      }
    };
    socket.on("punch", handlePunch);
    return () => socket.off("punch", handlePunch);
  }, [socket, combo, currentIndex, phase, punchCooldown]);

  useEffect(() => {
    if (phase === "input" && currentIndex === combo.length && combo.length > 0) {
      setTimeout(() => {
        if (combo.length === 2) {
          setPhase("win");
        } else {
          setTimeout(() => {
            nextRound();
          }, 2000);
        }
      }, 500);
    }
  }, [currentIndex, phase, combo.length]);

  useEffect(() => {
    if (phase === "show" && combo.length > 0) {
      showCombo(combo);
    }
    // eslint-disable-next-line
  }, [phase, combo]);

  const nextRound = () => {
    setCombo(prevCombo => {
      let newPunch;
      do {
        newPunch = punches[Math.floor(Math.random() * punches.length)];
      } while (prevCombo.length > 0 && newPunch === prevCombo[prevCombo.length - 1]);
      return [...prevCombo, newPunch];
    });
    setCurrentIndex(0);
    setFeedback("");
    setPhase("show");
  };

  const startGame = () => {
    const first = punches[Math.floor(Math.random() * punches.length)];
    setCombo([first]);
    setCurrentIndex(0);
    setFeedback("");
    setPhase("show");
  };

  const showCombo = (comboList) => {
    let i = 0;
    setCurrentDisplay(comboList[0]);
    const interval = setInterval(() => {
      i++;
      if (i < comboList.length) {
        setCurrentDisplay(comboList[i]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase("wait");
          startCountdown();
        }, 700);
      }
    }, 1000);
  };

  const startCountdown = () => {
    setCountdown(3);
    let time = 3;
    const interval = setInterval(() => {
      time--;
      setCountdown(time);
      if (time <= 0) {
        clearInterval(interval);
        setPhase("input");
        setCurrentIndex(0);
        setFeedback("");
        lastPunchTimeRef.current = 0;
      }
    }, 1000);
  };

  const resetGame = () => {
    setCombo([]);
    setCurrentIndex(0);
    setCurrentDisplay("");
    setPhase("menu");
    setFeedback("");
    lastPunchTimeRef.current = 0;
    setShowInfo(true);
  };

  // Info popup before the game
  const renderInfoPopup = () => (
    <div style={styles.popupOverlay}>
      <div style={styles.popup}>
        <div style={styles.popupTitle}>{t("memorize.infoTitle", "How the game works")}</div>
        <div style={styles.popupText}>
          {t(
            "memorize.infoText",
            "You will have on the screen a punch type, you will have to hit the right punch. If correct you'll have a punch added to the one before, it's quick so you have to be focused. As you keep getting the combinations correct more punches will be added till you reach a 10 punch combination."
          )}
        </div>
        <button style={styles.popupButton} onClick={() => setShowInfo(false)}>
          {t("memorize.understood", "Understood")}
        </button>
      </div>
    </div>
  );

  // Render functions for each phase
  const renderMenu = () => (
    <div style={styles.centered}>
      <button
        style={{
          position: "absolute",
          top: 24,
          right: 32,
          background: "none",
          border: "none",
          color: "#2C2C2C",
          fontSize: "2rem",
          cursor: "pointer",
          zIndex: 2,
          padding: 0,
          width: "auto",
          height: "auto",
          boxShadow: "none",
        }}
        onClick={() => navigate("/minimenu")}
        aria-label="Back"
      >
        <span style={{ fontSize: "2rem", lineHeight: 1 }}>↩</span>
      </button>
      <div style={styles.header}>
        <div />
        <h1 style={styles.title}>{t("memorize.memorizeTitle")}</h1>
        <div />
      </div>
      <button style={styles.button} onClick={startGame}>{t("memorize.start")}</button>
    </div>
  );

  const renderShow = () => (
    <div style={styles.centered}>
      <h2 style={styles.title}>{t("memorize.memorizeTitle")}</h2>
      <div style={styles.bigText}>{currentDisplay}</div>
    </div>
  );

  const renderWait = () => (
    <div style={styles.centered}>
      <h2 style={styles.title}>{t("memorize.yourTurn")}</h2>
      <div style={styles.bigText}>{countdown > 0 ? countdown : ""}</div>
    </div>
  );

  const renderInput = () => (
    <div style={styles.centered}>
      <div style={styles.bigText}>{feedback}</div>
      <div style={styles.progress}>
        {currentIndex}/{combo.length}
      </div>
    </div>
  );

  const renderFail = () => (
    <div style={styles.centered}>
      <h2 style={{ ...styles.title, ...styles.fail }}>{t("memorize.wrongPunch")}</h2>
      <button style={styles.button} onClick={resetGame}>{t("memorize.tryAgain")}</button>
    </div>
  );

  const renderWin = () => (
    <div style={styles.centered}>
      <h1 style={styles.title}>{t("memorize.completed")}</h1>
      <button style={styles.button} onClick={resetGame}>{t("memorize.playAgain")}</button>
    </div>
  );

  if (showInfo) return <div style={styles.container}>{renderInfoPopup()}</div>;
  if (phase === "menu") return <div style={styles.container}>{renderMenu()}</div>;
  if (phase === "show") return <div style={styles.container}>{renderShow()}</div>;
  if (phase === "wait") return <div style={styles.container}>{renderWait()}</div>;
  if (phase === "input") return <div style={styles.container}>{renderInput()}</div>;
  if (phase === "fail") return <div style={styles.container}>{renderFail()}</div>;
  if (phase === "win") return <div style={styles.container}>{renderWin()}</div>;

  return null;
}

export default Memorize;