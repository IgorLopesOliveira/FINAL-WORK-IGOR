import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  icon: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#2C2C2C',
    color: '#EFEFEF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    cursor: 'pointer',
  },
  iconSymbol: {
    fontSize: '20px',
    lineHeight: '1',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900',
  },
  scoreList: {
    flex: 1,
    overflowY: 'auto',
    padding: 0,
    margin: 0,
    listStyle: 'none',
  },
  scoreItem: {
    background: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    textAlign: 'left',
  },
  punchesList: {
    margin: '0.5rem 0 0 1rem',
    padding: 0,
    listStyle: 'none',
  },
  punchesItem: {
    fontSize: '1.1rem',
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
};

export default function Account() {
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem("fightScores") || "[]");
    setScores(storedScores.reverse());
  }, []);

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/home")}>↩</button>
      <div style={styles.header}>
        <div />
        <h1 style={styles.title}>{t("account.title", "Your Fight Scores")}</h1>
        <div />
      </div>
      {scores.length === 0 ? (
        <div>{t("account.noScores", "No scores yet.")}</div>
      ) : (
        <ul style={styles.scoreList}>
          {scores.map((score, idx) => (
            <li key={idx} style={styles.scoreItem}>
              <div>
                <strong>{t("score.timeChosen")}:</strong> {score.timeChosen} {t("score.seconds")}
              </div>
              <div>
                <strong>{t("score.punchesPerMinute")}:</strong> {score.punchesPerMinute}
              </div>
              <div>
                <strong>{t("score.punchesByType")}:</strong>
                <ul style={styles.punchesList}>
                  {score.punchesByType &&
                    Object.entries(score.punchesByType).map(([type, count]) => (
                      <li key={type} style={styles.punchesItem}>
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
    </div>
  );
}