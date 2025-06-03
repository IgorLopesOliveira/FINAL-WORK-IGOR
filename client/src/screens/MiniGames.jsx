import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const punches = ["Jab", "Left hook", "Uppercut"];

function Memorize() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("menu"); // menu, show, wait, input, success, fail, win
  const [combo, setCombo] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDisplay, setCurrentDisplay] = useState("");
  const [countdown, setCountdown] = useState(3);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
  if (!socket || phase !== "input") return;

  const lastPunchTimes = {};

  const handlePunch = (data) => {
    const punch = data.type?.trim().toLowerCase();
    const expected = combo[currentIndex]?.trim().toLowerCase();
    const now = Date.now();

    // Debounce logic: only accept new punch type if 1000ms passed
    if (lastPunchTimes[punch] && now - lastPunchTimes[punch] < 1000) {
      return; // Ignore repeated fast triggers
    }

    lastPunchTimes[punch] = now;

    if (punch === expected) {
      setFeedback(combo[currentIndex]); // Show clean display
      setCurrentIndex((prev) => prev + 1);
    } else {
      setFeedback(data.type);
      setPhase("fail");
    }
  };

  socket.on("punch", handlePunch);
  return () => socket.off("punch", handlePunch);
}, [socket, combo, currentIndex, phase]);


  useEffect(() => {
    if (phase === "input" && currentIndex === combo.length && combo.length > 0) {
      setTimeout(() => {
        if (combo.length === 10) {
          setPhase("win");
        } else {
          nextRound();
        }
      }, 1000);
    }
  }, [currentIndex]);

  const nextRound = () => {
    const newPunch = punches[Math.floor(Math.random() * punches.length)];
    const newCombo = [...combo, newPunch];
    setCombo(newCombo);
    setCurrentIndex(0);
    setFeedback("");
    showCombo(newCombo);
  };

  const startGame = () => {
    const first = punches[Math.floor(Math.random() * punches.length)];
    setCombo([first]);
    setCurrentIndex(0);
    setFeedback("");
    showCombo([first]);
  };

  const showCombo = (comboList) => {
    setPhase("show");
    let i = 0;
    const interval = setInterval(() => {
      setCurrentDisplay(comboList[i]);
      i++;
      if (i >= comboList.length) {
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
      }
    }, 1000);
  };

  const resetGame = () => {
    setCombo([]);
    setCurrentIndex(0);
    setCurrentDisplay("");
    setPhase("menu");
    setFeedback("");
  };

  const renderMenu = () => (
    <div className="centered">
      <h1>Memorize the combination</h1>
      <button onClick={startGame}>Start</button>
    </div>
  );

  const renderShow = () => (
    <div className="focus-mode centered">
      <h2 style={{ marginBottom: "1rem" }}>Memorize the combination</h2>
      <div className="big-text">{currentDisplay}</div>
    </div>
  );

  const renderWait = () => (
    <div className="centered">
      <h2>Your turn</h2>
      <div className="big-text">{countdown > 0 ? countdown : ""}</div>
    </div>
  );

  const renderInput = () => (
    <div className="focus-mode centered">
      <div
        className="big-text"
        style={{
          color: feedback?.trim().toLowerCase() === combo[currentIndex - 1]?.trim().toLowerCase()
            ? "#2C2C2C"
            : "#B44",
        }}
      >
        {feedback}
      </div>
    </div>
  );

  const renderFail = () => (
    <div className="centered">
      <h2 style={{ color: "#B44" }}>Wrong Punch</h2>
      <button onClick={resetGame}>Try Again</button>
    </div>
  );

  const renderWin = () => (
    <div className="centered">
      <h1>You completed all 10 punches!</h1>
      <button onClick={resetGame}>Play Again</button>
    </div>
  );

  if (phase === "menu") return renderMenu();
  if (phase === "show") return renderShow();
  if (phase === "wait") return renderWait();
  if (phase === "input") return renderInput();
  if (phase === "fail") return renderFail();
  if (phase === "win") return renderWin();


  return (
    <div className="memorize-container">
      <button className="back-button" onClick={() => navigate("/minigames")}>↩</button>
      {phase === "menu" && renderMenu()}
      {phase === "show" && renderShow()}
      {phase === "wait" && renderWait()}
      {phase === "input" && renderInput()}
      {phase === "fail" && renderFail()}
      {phase === "win" && renderWin()}
      <style>{`
        .memorize-container {
          height: 852px;
          background: #EFEFEF;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
          position: relative;
        }
        .centered {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 0 1rem;
        }
        .big-text {
          font-size: 12rem;
          font-weight: 900;
        }
        .focus-mode::before,
        .focus-mode::after {
          content: '';
          position: absolute;
          left: 0;
          width: 100%;
          height: 80px;
          background: #2C2C2C;
          z-index: 1;
        }
        .focus-mode::before {
          top: 0;
        }
        .focus-mode::after {
          bottom: 0;
        }
        .back-button {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 2rem;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 2;
        color: #2C2C2C;
        transition: transform 0.2s ease;
        } `}
        </style>
    </div>
    );
}
export default Memorize;
