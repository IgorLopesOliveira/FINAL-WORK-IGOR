import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

// Game asks for these:
const punches = [
  "Jab",
  "Cross",
  "Left hook",
  "Right hook",
  "Left uppercut",
  "Right uppercut",
];

const INITIAL_TIME = 3000; // ms
const TIME_DECREMENT = 200; // ms

// Mapping: which sensor events are valid for each game punch
const punchGroups = {
  "jab": ["jab", "cross"],                           // straight sensor
  "cross": ["jab", "cross"],                         // straight sensor
  "left uppercut": ["left uppercut", "right uppercut"],   // uppercut sensor
  "right uppercut": ["left uppercut", "right uppercut"],  // uppercut sensor
  "left hook": ["left hook"],                        // left hook sensor
  "right hook": ["right hook"],                      // right hook sensor
};

// Styles (unchanged)
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

// Utility to normalize everything to lowercase + spaces
function normalize(str) {
  return str.toLowerCase().replace(/_/g, " ").trim();
}

function Accuracy() {
  const socket = useSocket();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [phase, setPhase] = useState("menu"); // menu, show, input, fail, win, slow
  const [currentPunch, setCurrentPunch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timer, setTimer] = useState(INITIAL_TIME);
  const [feedback, setFeedback] = useState("");
  const [showInfo, setShowInfo] = useState(true);
  const timeoutRef = useRef(null);

  // Buffer for punch events in the same tick
  const punchBufferRef = useRef([]);

  // Listen for punches and buffer them for each input phase
  useEffect(() => {
    if (!socket) return;

    const handlePunch = (data) => {
      const punch = normalize(data.type || "");
      // Only buffer during input phase
      if (phase === "input") {
        punchBufferRef.current.push(punch);
      }
      // Start game from menu
      if (phase === "menu" && (punch === "jab" || punch === "cross")) {
        startGame();
      }
    };

    socket.on("punch", handlePunch);
    return () => socket.off("punch", handlePunch);
    // eslint-disable-next-line
  }, [socket, phase]);

  // When phase changes to input, clear buffer and set up timer
  useEffect(() => {
    if (phase !== "input") return;
    punchBufferRef.current = [];

    timeoutRef.current = setTimeout(() => {
      setPhase("slow");
    }, timer);

    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line
  }, [phase, timer, currentPunch, currentIndex]);

  // When a punch is received, check if any in buffer match expected
  useEffect(() => {
    if (phase !== "input") return;
    // Listen for punch events and check buffer after each punch
    const checkPunch = () => {
      const expected = normalize(currentPunch);
      const validGroup = punchGroups[expected] || [];
      // Accept if ANY punch in buffer matches the valid group
      const matched = punchBufferRef.current.some((p) => validGroup.includes(p));
      if (matched) {
        clearTimeout(timeoutRef.current);
        if (currentIndex === 4) {
          setPhase("win");
        } else {
          setCurrentIndex(idx => idx + 1);
          setTimer(t => Math.max(200, t - TIME_DECREMENT));
          setPhase("show");
        }
      } else if (punchBufferRef.current.length > 0) {
        clearTimeout(timeoutRef.current);
        setFeedback(punchBufferRef.current.join(", "));
        setPhase("fail");
      }
    };

    // Listen for punch events
    const interval = setInterval(checkPunch, 50);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [phase, timer, currentPunch, currentIndex]);

  // Show next punch
  useEffect(() => {
    if (phase !== "show") return;
    const next = punches[Math.floor(Math.random() * punches.length)];
    setCurrentPunch(next);
    setPhase("input");
  }, [phase]);

  const startGame = () => {
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setPhase("show");
    setFeedback("");
    setShowInfo(false);
  };

  const resetGame = () => {
    setPhase("menu");
    setCurrentIndex(0);
    setTimer(INITIAL_TIME);
    setFeedback("");
    setCurrentPunch("");
    setShowInfo(true);
    clearTimeout(timeoutRef.current);
  };

  // -- Render --
  if (showInfo) {
    return (
      <div style={styles.popupOverlay}>
        <div style={styles.popup}>
          <div style={styles.popupTitle}>
            {t("accuracy.infoTitle", "How the game works")}
          </div>
          <div style={styles.popupText}>
            {t(
              "accuracy.infoText",
              "You will see a punch type on the screen. You must hit the correct punch as quickly as possible before the timer runs out. Each time you get it right, the time to react gets shorter. Complete 10 punches in a row to win!"
            )}
          </div>
          <button
            style={styles.popupButton}
            onClick={() => setShowInfo(false)}
          >
            {t("accuracy.understood", "Understood")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {phase === "menu" && (
        <MenuScreen navigate={navigate} t={t} />
      )}
      {phase === "input" && (
        <InputScreen
          currentPunch={currentPunch}
          currentIndex={currentIndex}
          timer={timer}
          t={t}
          styles={styles}
        />
      )}
      {phase === "fail" && (
        <FailScreen resetGame={resetGame} t={t} styles={styles} />
      )}
      {phase === "slow" && (
        <TooSlowScreen resetGame={resetGame} t={t} styles={styles} />
      )}
      {phase === "win" && (
        <WinScreen resetGame={resetGame} t={t} styles={styles} />
      )}
    </div>
  );
}

function MenuScreen({ navigate, t }) {
  return (
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
        }}
        onClick={() => navigate("/minimenu")}
        aria-label="Back"
      >
        ↩
      </button>
      <h1 style={styles.title}>{t("accuracy.title", "Accuracy Game")}</h1>
      <div style={{ marginTop: "2rem", fontSize: "1.3rem", fontWeight: 700 }}>
        {t("accuracy.jabToStart", "Put your gloves on and throw a jab to start")}
      </div>
    </div>
  );
}

function InputScreen({ currentPunch, currentIndex, timer, t, styles }) {
  return (
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
}

function FailScreen({ resetGame, t, styles }) {
  return (
    <div style={styles.centered}>
      <h2 style={{ ...styles.title, ...styles.fail }}>
        {t("accuracy.wrongPunch", "Wrong Punch")}
      </h2>
      <button style={styles.button} onClick={resetGame}>
        {t("accuracy.backToMenu", "Back to Accuracy Menu")}
      </button>
    </div>
  );
}

function TooSlowScreen({ resetGame, t, styles }) {
  return (
    <div style={styles.centered}>
      <h2 style={{ ...styles.title, ...styles.slow }}>
        {t("accuracy.tooSlow", "Too Slow!")}
      </h2>
      <button style={styles.button} onClick={resetGame}>
        {t("accuracy.backToMenu", "Back to Accuracy Menu")}
      </button>
    </div>
  );
}

function WinScreen({ resetGame, t, styles }) {
  return (
    <div style={styles.centered}>
      <h1 style={styles.title}>
        {t("accuracy.completed", "You completed all 10 punches!")}
      </h1>
      <button style={styles.button} onClick={resetGame}>
        {t("accuracy.playAgain", "Play Again")}
      </button>
    </div>
  );
}

export default Accuracy;