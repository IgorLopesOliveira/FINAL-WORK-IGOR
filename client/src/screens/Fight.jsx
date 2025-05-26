import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

function Fight() {
  const socket = useSocket();
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [lastPunch, setLastPunch] = useState("None");

  // Countdown timer logic
  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  // Listen for punches
  useEffect(() => {
    if (!socket) return;
    socket.on("punch", (data) => {
      setLastPunch(data.type); // data.type = "Left Hook" or "Right Hook"
    });

    return () => socket.off("punch");
  }, [socket]);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Fight Mode</h1>
      <h2>Time Left: {formatTime(timeLeft)}</h2>
      <h3>Last Punch: {lastPunch}</h3>
    </div>
  );
}

export default Fight;
