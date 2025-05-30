import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function Fight() {
  const socket = useSocket();
  const [fightState, setFightState] = useState("config"); // config, countdown, fighting, paused
  const [roundTime, setRoundTime] = useState(3); // in minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [punchCount, setPunchCount] = useState(0);
  const [hidePunches, setHidePunches] = useState(false);
  const [flipLayout, setFlipLayout] = useState(false);
  const resetFight = () => {
    setFightState("config");
    setTimeLeft(0);
    setPunchCount(0);
    setHidePunches(false);
    setFlipLayout(false);
  };


  useEffect(() => {
    if (!socket) return;
    socket.on("punch", () => {
      setPunchCount((c) => c + 1);
    });
    return () => socket.off("punch");
  }, [socket]);

  useEffect(() => {
    if (fightState !== "fighting" || timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [fightState, timeLeft]);

  const startCountdown = () => {
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
      <h1>Round time</h1>
      <div className="time-selector">
        <button onClick={() => setRoundTime((t) => Math.max(1, t - 1))}>-</button>
        <span>{roundTime} minutes</span>
        <button onClick={() => setRoundTime((t) => Math.min(10, t + 1))}>+</button>
      </div>
      <button onClick={startCountdown}>Start</button>
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
        <button onClick={() => setFightState("paused")}>Pause</button>
      </div>
      <div className="bottom-bar" />
    </div>
  );


  const renderPaused = () => (
    <div className="centered" style={{ fontSize: "3rem", gap: "1.5rem" }}>
      <div style={{ order: flipLayout ? 2 : 1 }}>{formatTime(timeLeft)}</div>
      {!hidePunches && <div style={{ order: flipLayout ? 1 : 2 }}>{punchCount}</div>}
      <div className="button-group">
        <button onClick={() => setHidePunches((v) => !v)}>Hide</button>
        <button onClick={() => setFightState("fighting")}>▶</button>
        <button onClick={() => setFlipLayout((v) => !v)}>Switch</button>
        <button onClick={resetFight}>Stop</button>
      </div>
    </div>
  );


  if (fightState === "config") return renderConfig();
  if (fightState === "countdown") return renderCountdown();
  if (fightState === "paused") return renderPaused();
  return renderFighting();
}

export default Fight;
