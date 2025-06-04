import { useSocket } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const punches = ["Jab", "Left hook", "Uppercut"];
const INITIAL_TIME = 2000; // ms
const TIME_DECREMENT = 200; // ms

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
    <div className="centered">
      <button
        className="back-button"
        style={{ position: "absolute", top: 20, right: 20 }}
        onClick={() => navigate("/minimenu")}
      >
        ↩
      </button>
      <h1>{t("accuracy.title", "Accuracy Game")}</h1>
      <button onClick={startGame}>{t("accuracy.start", "Start")}</button>
    </div>
  );

  const renderInput = () => (
    <div className="centered">
      <h2>{t("accuracy.hit", "Hit this punch!")}</h2>
      <div  style={{ fontSize: "5rem", fontWeight: 900 }} className="big-text">{currentPunch}</div>
      <div style={{ fontSize: "1.2rem", marginTop: "1rem" }}>
        {currentIndex + 1}/10
      </div>
      <div style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
        {t("accuracy.timeLeft", "Time left")}: {(timer / 1000).toFixed(1)}s
      </div>
    </div>
  );

  const renderFail = () => (
    <div className="centered">
      <h2 style={{ color: "#B44" }}>{t("accuracy.wrongPunch", "Wrong Punch")}</h2>
      <button onClick={resetGame}>{t("accuracy.backToMenu", "Back to Accuracy Menu")}</button>
    </div>
  );

  const renderWin = () => (
    <div className="centered">
      <h1>{t("accuracy.completed", "You completed all 10 punches!")}</h1>
      <button onClick={resetGame}>{t("accuracy.playAgain", "Play Again")}</button>
    </div>
  );

  if (phase === "menu") return renderMenu();
  if (phase === "input") return renderInput();
  if (phase === "fail") return renderFail();
  if (phase === "win") return renderWin();

  return null;
}
<style>{`
  .big-text {
    font-size: 3rem;
    font-weight: bold;
    margin: 1rem 0;
  }
`}
</style>

export default Accuracy;