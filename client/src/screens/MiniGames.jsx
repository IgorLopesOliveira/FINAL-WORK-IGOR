import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const punches = ["Jab", "Left hook", "Uppercut"];

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
  const punchCooldown = 1000;

  // Use ref for lastPunchTime to avoid async state issues
  const lastPunchTimeRef = useRef(0);

  // Handle punch input
  useEffect(() => {
    if (!socket || phase !== "input") return;

    const handlePunch = (data) => {
      const now = Date.now();

      // Ignore if still within cooldown
      if (now - lastPunchTimeRef.current < punchCooldown) return;

      // Normalize both punch and combo for comparison
      const punch = (data.type || "").toLowerCase().trim();
      const expected = (combo[currentIndex] || "").toLowerCase().trim();

      lastPunchTimeRef.current = now;

      if (punch === expected) {
        setFeedback(combo[currentIndex]); // Show original case for feedback
        setCurrentIndex((prev) => prev + 1);
      } else {
        setFeedback(data.type); // Show what was received
        setPhase("fail");
      }
    };

    socket.on("punch", handlePunch);
    return () => socket.off("punch", handlePunch);
  }, [socket, combo, currentIndex, phase, punchCooldown]);

  // Advance to next round or win after completing combo
  useEffect(() => {
    if (phase === "input" && currentIndex === combo.length && combo.length > 0) {
      setTimeout(() => {
        if (combo.length === 10) {
          setPhase("win");
        } else {
          setTimeout(() => {
            nextRound();
          }, 2000); // 2s delay before next combo
        }
      }, 500); // short delay to display last correct punch
    }
  }, [currentIndex, phase, combo.length]);

  // Show combo when phase is "show"
  useEffect(() => {
    if (phase === "show" && combo.length > 0) {
      showCombo(combo);
    }
    // eslint-disable-next-line
  }, [phase, combo]);

  // Add a new punch to the combo, ensuring no repeats
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

  // Start the game with the first punch
  const startGame = () => {
    const first = punches[Math.floor(Math.random() * punches.length)];
    setCombo([first]);
    setCurrentIndex(0);
    setFeedback("");
    setPhase("show");
  };

  // Show the combo sequence to the user
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

  // Countdown before user input
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
        lastPunchTimeRef.current = 0; // Reset cooldown for new input phase
      }
    }, 1000);
  };

  // Reset the game to the menu
  const resetGame = () => {
    setCombo([]);
    setCurrentIndex(0);
    setCurrentDisplay("");
    setPhase("menu");
    setFeedback("");
    lastPunchTimeRef.current = 0;
  };

  // Render functions for each phase
  const renderMenu = () => (
    <div className="centered">
      <h1>{t("minigames.memorizeTitle")}</h1>
      <button onClick={startGame}>{t("minigames.start")}</button>
    </div>
  );

  const renderShow = () => (
    <div className="focus-mode centered">
      <h2 style={{ marginBottom: "1rem" }}>{t("minigames.memorizeTitle")}</h2>
      <div className="big-text">{currentDisplay}</div>
    </div>
  );

  const renderWait = () => (
    <div className="centered">
      <h2>{t("minigames.yourTurn")}</h2>
      <div className="big-text">{countdown > 0 ? countdown : ""}</div>
    </div>
  );

  const renderInput = () => (
    <div className="focus-mode centered">
      <div className="big-text">
        {feedback}
      </div>
      <div style={{ fontSize: "1.5rem", marginTop: "1rem" }}>
        {currentIndex}/{combo.length}
      </div>
    </div>
  );

  const renderFail = () => (
    <div className="centered">
      <h2 style={{ color: "#B44" }}>{t("minigames.wrongPunch")}</h2>
      <button onClick={resetGame}>{t("minigames.tryAgain")}</button>
    </div>
  );

  const renderWin = () => (
    <div className="centered">
      <h1>{t("minigames.completed")}</h1>
      <button onClick={resetGame}>{t("minigames.playAgain")}</button>
    </div>
  );

  // Main render logic
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
          font-size: 4rem;
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
        }
      `}
      </style>
    </div>
  );
}

export default Memorize;