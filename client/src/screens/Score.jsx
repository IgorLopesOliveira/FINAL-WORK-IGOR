import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Score() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { timeChosen, punchesPerMinute, punchesByType } = location.state || {
    timeChosen: 0,
    punchesPerMinute: 0,
    punchesByType: {},
  };

  return (
    <div className="score-container">
      <button className="back-button" onClick={() => navigate("/fight")}>↩</button>
      <h1>{t("score.results")}</h1>
      <div>
        <strong>{t("score.timeChosen")}:</strong> {timeChosen} {t("score.seconds")}
      </div>
      <div>
        <strong>{t("score.punchesPerMinute")}:</strong> {punchesPerMinute}
      </div>
      <div>
        <strong>{t("score.punchesByType")}:</strong>
        <ul>
          {Object.entries(punchesByType).map(([type, count]) => (
            <li key={type}>
              {type}: {count}
            </li>
          ))}
        </ul>
      </div>
      <button className="main-btn" onClick={() => navigate("/fight")}>
        {t("score.backToFight")}
      </button>
      <style>{`
        .score-container {
          height: 100vh;
          background: #EFEFEF;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
        }
        .score-container div {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0 1.5rem 0;
        }
        li {
          font-size: 1.2rem;
          margin: 0.2rem 0;
        }
        .main-btn {
          font-size: 1.2rem;
          padding: 0.7rem 2rem;
          background: #2C2C2C;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          margin-top: 1.5rem;
          transition: background 0.2s;
        }
        .main-btn:hover {
          background: #444;
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

export default Score;