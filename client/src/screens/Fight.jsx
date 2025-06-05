import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useTranslation } from "react-i18next";

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    maxWidth: '852px',
    maxHeight: '393px',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontFamily: "'Neue Montreal', sans-serif",
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
  backButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    fontSize: '2rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#2C2C2C',
    transition: 'transform 0.2s ease',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
    marginBottom: '20px',
  },
  timeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
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
  smallButton: {
    padding: '8px 18px',
    borderRadius: '50px',
    border: '2px solid #2C2C2C',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '40px',
    transition: 'all 0.2s ease',
    margin: '10px',
  },
  fighting: {
    fontSize: '4rem',
    fontWeight: '900',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  paused: {
    fontSize: '3rem',
    fontWeight: '900',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
  },
};

function Fight() {
  const socket = useSocket();
  const [fightState, setFightState] = useState("config"); // config, countdown, fighting, paused
  const [prevFightState, setPrevFightState] = useState(null); // Track previous state
  const [roundTime, setRoundTime] = useState(3); // in minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [punchCount, setPunchCount] = useState(0);
  const [hidePunches, setHidePunches] = useState(false);
  const [flipLayout, setFlipLayout] = useState(false);
  const [punchesByType, setPunchesByType] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Sound refs
  const tripleTapRef = useRef(null);
  const tripleBellRef = useRef(null);

  const resetFight = () => {
    setFightState("config");
    setTimeLeft(0);
    setPunchCount(0);
    setPunchesByType({});
    setHidePunches(false);
    setFlipLayout(false);
  };

  // Listen for punches and count by type
  useEffect(() => {
    if (!socket) return;
    const punchHandler = (data) => {
      setPunchCount((c) => c + 1);
      if (data && data.type) {
        setPunchesByType((prev) => ({
          ...prev,
          [data.type]: (prev[data.type] || 0) + 1,
        }));
      }
    };
    socket.on("punch", punchHandler);
    return () => socket.off("punch", punchHandler);
  }, [socket]);

  // Timer countdown for fighting phase
  useEffect(() => {
    if (fightState !== "fighting" || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [fightState, timeLeft]);

  // When fight ends, navigate to score page with stats
  useEffect(() => {
    if (fightState === "fighting" && timeLeft === 0) {
      const totalSeconds = roundTime * 60;
      const punchesPerMinute = totalSeconds > 0 ? Math.round((punchCount / totalSeconds) * 60) : 0;
      navigate("/score", {
        state: {
          timeChosen: totalSeconds,
          punchesPerMinute,
          punchesByType,
        },
      });
    }
  }, [fightState, timeLeft, roundTime, punchCount, punchesByType, navigate]);

  // Track previous fightState
  useEffect(() => {
    setPrevFightState(fightState);
  }, [fightState]);

  // Play sounds at correct moments
  useEffect(() => {
    if (fightState === "countdown" && tripleTapRef.current) {
      tripleTapRef.current.currentTime = 0;
      tripleTapRef.current.play();
    }
    // Only play bell if coming from countdown
    if (
      fightState === "fighting" &&
      prevFightState === "countdown" &&
      tripleBellRef.current
    ) {
      tripleBellRef.current.currentTime = 0;
      tripleBellRef.current.play();
    }
  }, [fightState, prevFightState]);

  const startCountdown = () => {
    setPunchesByType({});
    setPunchCount(0);
    setFightState("countdown");
    setTimeLeft(10);
    const countdown = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdown);
          setFightState("fighting");
          setTimeLeft(roundTime * 60);
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  // UI Renders
  const renderConfig = () => (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/home")}>↩</button>
      <div style={styles.header}>
        <div />
        <h1 style={styles.title}>{t("fight.roundTime")}</h1>
        <div />
      </div>
      <div style={styles.timeSelector}>
        <button style={styles.smallButton} onClick={() => setRoundTime((t) => Math.max(1, t - 1))}>-</button>
        <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{roundTime} {t("fight.minutes")}</span>
        <button style={styles.smallButton} onClick={() => setRoundTime((t) => Math.min(10, t + 1))}>+</button>
      </div>
      <button style={styles.button} onClick={startCountdown}>{t("fight.start")}</button>
    </div>
  );

  const renderCountdown = () => (
    <div style={styles.container}>
      <h1 style={{ fontSize: '6rem', fontWeight: '900' }}>{timeLeft}</h1>
    </div>
  );

  const renderFighting = () => (
    <div style={styles.container}>
      <div style={styles.fighting}>
        <div style={{ order: flipLayout ? 2 : 1 }}>{formatTime(timeLeft)}</div>
        {!hidePunches && <div style={{ order: flipLayout ? 1 : 2 }}>{punchCount}</div>}
        <button style={styles.button} onClick={() => setFightState("paused")}>{t("fight.pause")}</button>
      </div>
    </div>
  );

  const renderPaused = () => (
    <div style={styles.container}>
      <div style={styles.paused}>
        <div style={{ order: flipLayout ? 2 : 1 }}>{formatTime(timeLeft)}</div>
        {!hidePunches && <div style={{ order: flipLayout ? 1 : 2 }}>{punchCount}</div>}
      </div>
      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => setHidePunches((v) => !v)}>{t("fight.hide")}</button>
        <button style={styles.button} onClick={() => setFightState("fighting")}>▶</button>
        <button style={styles.button} onClick={() => setFlipLayout((v) => !v)}>{t("fight.switch")}</button>
        <button style={styles.button} onClick={resetFight}>{t("fight.stop")}</button>
      </div>
    </div>
  );

  return (
    <>
      {/* Audio elements for sounds */}
      <audio ref={tripleTapRef} src="/sounds/triple-tap.mp3" preload="auto" />
      <audio ref={tripleBellRef} src="/sounds/boxing-bell.mp3" preload="auto" />
      {fightState === "config" && renderConfig()}
      {fightState === "countdown" && renderCountdown()}
      {fightState === "paused" && renderPaused()}
      {fightState === "fighting" && renderFighting()}
    </>
  );
}

export default Fight;