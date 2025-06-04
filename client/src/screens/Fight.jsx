import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useTranslation } from "react-i18next";

function Fight() {
  const socket = useSocket();
  const [fightState, setFightState] = useState("config"); // config, countdown, fighting, paused
  const [roundTime, setRoundTime] = useState(3); // in minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [punchCount, setPunchCount] = useState(0);
  const [hidePunches, setHidePunches] = useState(false);
  const [flipLayout, setFlipLayout] = useState(false);
  const [punchesByType, setPunchesByType] = useState({});
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  const renderConfig = () => (
    <div className="centered">
      <div style={{ position: "absolute", top: 20, right: 20 }}>
        <button onClick={() => navigate("/home")}>↩</button>
      </div>
      <h1>{t("fight.roundTime")}</h1>
      <div className="time-selector">
        <button onClick={() => setRoundTime((t) => Math.max(1, t - 1))}>-</button>
        <span>{roundTime} {t("fight.minutes")}</span>
        <button onClick={() => setRoundTime((t) => Math.min(10, t + 1))}>+</button>
      </div>
      <button onClick={startCountdown}>{t("fight.start")}</button>
    </div>
  );

  const renderCountdown = () => (
    <div className="centered">
      <h1>{timeLeft}</h1>
    </div>
  );

  const renderFighting = () => (
    <div className={fightState === "fighting" ? "focus-mode" : ""}>
      <div className="top-bar" />
      <div className="centered" style={{ fontSize: "4rem", gap: "1.5rem" }}>
        <div style={{ order: flipLayout ? 2 : 1 }}>{formatTime(timeLeft)}</div>
        {!hidePunches && <div style={{ order: flipLayout ? 1 : 2 }}>{punchCount}</div>}
        <button onClick={() => setFightState("paused")}>{t("fight.pause")}</button>
      </div>
      <div className="bottom-bar" />
    </div>
  );

  const renderPaused = () => (
    <div className="centered" style={{ fontSize: "3rem", gap: "1.5rem" }}>
      <div style={{ order: flipLayout ? 2 : 1 }}>{formatTime(timeLeft)}</div>
      {!hidePunches && <div style={{ order: flipLayout ? 1 : 2 }}>{punchCount}</div>}
      <div className="button-group">
        <button onClick={() => setHidePunches((v) => !v)}>{t("fight.hide")}</button>
        <button onClick={() => setFightState("fighting")}>▶</button>
        <button onClick={() => setFlipLayout((v) => !v)}>{t("fight.switch")}</button>
        <button onClick={resetFight}>{t("fight.stop")}</button>
      </div>
    </div>
  );

  if (fightState === "config") return renderConfig();
  if (fightState === "countdown") return renderCountdown();
  if (fightState === "paused") return renderPaused();
  return renderFighting();
}

export default Fight;