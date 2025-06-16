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
  },
  roundsSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  restSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
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
  const [fightState, setFightState] = useState("config");
  const [roundTime, setRoundTime] = useState(3);
  const [numRounds, setNumRounds] = useState(1);
  const [restTime, setRestTime] = useState(1);
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(0);
  const [punchCount, setPunchCount] = useState(0);
  const [hidePunches, setHidePunches] = useState(false);
  const [flipLayout, setFlipLayout] = useState(false);
  const [punchesByType, setPunchesByType] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tripleTapRef = useRef(null);
  const tripleBellRef = useRef(null);

  // For deduplication: store last punch time for each logical type
  const lastPunchTimeRef = useRef({
    straights: 0,
    hook: 0,
    uppercut: 0,
  });

  const PUNCH_COOLDOWN = 400; // ms

  const resetFight = () => {
    setFightState("config");
    setTimeLeft(0);
    setPunchCount(0);
    setPunchesByType({});
    setHidePunches(false);
    setFlipLayout(false);
    setCurrentRound(1);
  };

  useEffect(() => {
    if (!socket) return;

    const punchHandler = (data) => {
      if (!data?.type) return;
      const punchType = data.type.toLowerCase();

      // Map all straights (jab/cross) to "straights", all uppercuts to "uppercut", hooks to "hook"
      let logicalType = "";
      if (punchType === "jab" || punchType === "cross") {
        logicalType = "straights";
      } else if (punchType === "left uppercut" || punchType === "right uppercut") {
        logicalType = "uppercut";
      } else if (punchType === "left hook" || punchType === "right hook") {
        logicalType = "hook";
      } else {
        return; // ignore unknown types
      }

      // Deduplicate: only count if enough time has passed since last of this logical type
      const now = Date.now();
      if (now - lastPunchTimeRef.current[logicalType] < PUNCH_COOLDOWN) return;
      lastPunchTimeRef.current[logicalType] = now;

      setPunchCount(c => c + 1);
      setPunchesByType(prev => ({
        ...prev,
        [logicalType]: (prev[logicalType] || 0) + 1
      }));
    };

    socket.on("punch", punchHandler);
    return () => socket.off("punch", punchHandler);
  }, [socket]);

  useEffect(() => {
    if (!["countdown", "fighting", "rest"].includes(fightState) || timeLeft <= 0) return;

    if (timeLeft === 10 && tripleTapRef.current) {
      tripleTapRef.current.currentTime = 0;
      tripleTapRef.current.play();
    }

    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [fightState, timeLeft]);

  useEffect(() => {
    // Pre-first round bell
    if (fightState === "countdown" && timeLeft === 0) {
      if (tripleBellRef.current) {
        tripleBellRef.current.currentTime = 0;
        tripleBellRef.current.play();
      }
      setFightState("fighting");
      setTimeLeft(roundTime * 60);
    }

    // End-of-round bell + transition
    if (fightState === "fighting" && timeLeft === 0) {
      if (tripleBellRef.current) {
        tripleBellRef.current.currentTime = 0;
        tripleBellRef.current.play();
      }
      if (currentRound < numRounds) {
        if (restTime > 0) {
          setFightState("rest");
          setTimeLeft(restTime * 60);
        } else {
          setCurrentRound(r => r + 1);
          setFightState("fighting");
          setTimeLeft(roundTime * 60);
        }
      } else {
        const totalSec = roundTime * 60 * numRounds;
        const ppm = totalSec ? Math.round((punchCount / totalSec) * 60) : 0;
        navigate("/score", { state: { timeChosen: roundTime * 60, numRounds, restTime, punchesPerMinute: ppm, punchesByType } });
      }
    }

    // End-of-rest bell + next round start
    if (fightState === "rest" && timeLeft === 0) {
      if (tripleBellRef.current) {
        tripleBellRef.current.currentTime = 0;
        tripleBellRef.current.play();
      }
      setCurrentRound(r => r + 1);
      setFightState("fighting");
      setTimeLeft(roundTime * 60);
    }
  }, [fightState, timeLeft, currentRound, numRounds, restTime, roundTime, punchCount, punchesByType, navigate]);

  const startCountdown = () => {
    setPunchCount(0);
    setPunchesByType({});
    setCurrentRound(1);
    setFightState("countdown");
    setTimeLeft(10);
    lastPunchTimeRef.current = { straights: 0, hook: 0, uppercut: 0 }; // reset deduplication
  };

  const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const renderConfig = () => (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/home")}>↩</button>
      <div style={styles.header}><div/><h1 style={styles.title}>{t("fight.roundTime")}</h1><div/></div>
      <div style={styles.timeSelector}>
        <button style={styles.smallButton} onClick={() => setRoundTime(t => Math.max(1, t-1))}>-</button>
        <span style={{fontSize:'1.5rem',fontWeight:'700'}}>{roundTime} {t("fight.minutes")}</span>
        <button style={styles.smallButton} onClick={() => setRoundTime(t => Math.min(10, t+1))}>+</button>
      </div>
      <div style={styles.roundsSelector}>
        <button style={styles.smallButton} onClick={() => setNumRounds(n => Math.max(1, n-1))}>-</button>
        <span style={{fontSize:'1.5rem',fontWeight:'700'}}>{numRounds} {t("fight.rounds", "Rounds")}</span>
        <button style={styles.smallButton} onClick={() => setNumRounds(n => Math.min(12, n+1))}>+</button>
      </div>
      <div style={styles.restSelector}>
        <button style={styles.smallButton} onClick={() => setRestTime(r => Math.max(0, r-1))}>-</button>
        <span style={{fontSize:'1.5rem',fontWeight:'700'}}>{restTime} {t("fight.rest", "Rest (min)")}</span>
        <button style={styles.smallButton} onClick={() => setRestTime(r => Math.min(5, r+1))}>+</button>
      </div>
      <button style={styles.button} onClick={startCountdown}>{t("fight.start")}</button>
    </div>
  );

  const renderCountdown = () => (
    <div style={styles.container}>
      <h2 style={{fontSize:'2rem',fontWeight:'700',marginBottom:0}}>{t("fight.round", "Round")} {currentRound}/{numRounds}</h2>
      <h1 style={{fontSize:'6rem',fontWeight:'900'}}>{timeLeft}</h1>
    </div>
  );

  const renderFighting = () => (
    <div style={styles.container}>
      <h2 style={{fontSize:'2rem',fontWeight:'700',marginBottom:0}}>{t("fight.round", "Round")} {currentRound}/{numRounds}</h2>
      <div style={styles.fighting}>
        <div style={{order: flipLayout? 2 : 1}}>{formatTime(timeLeft)}</div>
        {!hidePunches && <div style={{order: flipLayout?1:2}}>{punchCount}</div>}
        <button style={styles.button} onClick={() => setFightState("paused")}>{t("fight.pause")}</button>
      </div>
    </div>
  );

  const renderRest = () => (
    <div style={styles.container}>
      <h2 style={{fontSize:'2rem',fontWeight:'700',marginBottom:0}}>{t("fight.restBetween", "Rest Between Rounds")}</h2>
      <h1 style={{fontSize:'6rem',fontWeight:'900'}}>{formatTime(timeLeft)}</h1>
      <div style={{fontSize:'1.5rem',marginTop:20}}>{t("fight.nextRound", "Next round starts soon...")}</div>
    </div>
  );

  const renderPaused = () => (
    <div style={styles.container}>
      <h2 style={{fontSize:'2rem',fontWeight:'700',marginBottom:0}}>{t("fight.round", "Round")} {currentRound}/{numRounds}</h2>
      <div style={styles.paused}>
        <div style={{order: flipLayout?2:1}}>{formatTime(timeLeft)}</div>
        {!hidePunches && <div style={{order: flipLayout?1:2}}>{punchCount}</div>}
      </div>
      <div style={styles.buttonGroup}>
        <button style={styles.button} onClick={() => setHidePunches(v => !v)}>{t("fight.hide")}</button>
        <button style={styles.button} onClick={() => setFightState("fighting")}>▶</button>
        {/* <button style={styles.button} onClick={() => setFlipLayout(v => !v)}>{t("fight.switch")}</button> */}
        <button style={styles.button} onClick={resetFight}>{t("fight.stop")}</button>
      </div>
    </div>
  );

  return (
    <>
      <audio ref={tripleTapRef} src="/sounds/triple-tap.mp3" preload="auto" />
      <audio ref={tripleBellRef} src="/sounds/boxing-bell.mp3" preload="auto" />
      {fightState === "config" && renderConfig()}
      {fightState === "countdown" && renderCountdown()}
      {fightState === "fighting" && renderFighting()}
      {fightState === "rest" && renderRest()}
      {fightState === "paused" && renderPaused()}
    </>
  );
}

export default Fight;