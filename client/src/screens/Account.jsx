import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Account() {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("fightScores") || "[]");
    setScores(storedScores.reverse()); // Show latest first
  }, []);

  return (
    <div className="account-container">
      <button className="back-button" onClick={() => navigate("/home")}>↩</button>
      <h1>{t("account.title", "Your Fight Scores")}</h1>
      {scores.length === 0 ? (
        <div>{t("account.noScores", "No scores yet.")}</div>
      ) : (
        <ul className="score-list">
          {scores.map((score, idx) => (
            <li key={idx} className="score-item">
              <div>
                <strong>{t("score.timeChosen")}:</strong> {score.timeChosen} {t("score.seconds")}
              </div>
              <div>
                <strong>{t("score.punchesPerMinute")}:</strong> {score.punchesPerMinute}
              </div>
              <div>
                <strong>{t("score.punchesByType")}:</strong>
                <ul>
                  {score.punchesByType &&
                    Object.entries(score.punchesByType).map(([type, count]) => (
                      <li key={type}>
                        {type}: {count}
                      </li>
                    ))}
                </ul>
              </div>
              <div>
                <strong>{t("account.date", "Date")}:</strong>{" "}
                {new Date(score.date).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .account-container {
          min-height: 100vh;
          background: #EFEFEF;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          text-align: center;
          position: relative;
          padding-top: 60px;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
        }
        .score-list {
          width: 100%;
          max-width: 600px;
          list-style: none;
          padding: 0;
        }
        .score-item {
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          margin-bottom: 1.5rem;
          padding: 1.5rem;
          text-align: left;
        }
        .score-item ul {
          margin: 0.5rem 0 0 1rem;
          padding: 0;
        }
        .score-item li {
          font-size: 1.1rem;
        }
        .back-button {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 2rem;
          background: none;
          border: none;
          cursor: pointer;
          color: #2C2C2C;
          transition: transform 0.2s ease;
        }
      `}</style>
    </div>
  );
}