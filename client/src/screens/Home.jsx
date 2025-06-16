import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Show info box only once per session, unless user clicks info icon
  const [showInfo, setShowInfo] = useState(() => {
    return sessionStorage.getItem("homeInfoSeen") !== "true";
  });

  const handleCloseInfo = () => {
    setShowInfo(false);
    sessionStorage.setItem("homeInfoSeen", "true");
  };

  const handleShowInfo = () => setShowInfo(true);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon} onClick={() => navigate('/account')}>
          <span style={styles.iconSymbol}>👤</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={styles.title}>{t("home.menu")}</h1>
          <span
            style={styles.infoIcon}
            title={t("home.infoTitle", "Show info")}
            onClick={handleShowInfo}
            role="button"
            tabIndex={0}
          >ℹ️</span>
        </div>
        <div style={styles.icon} onClick={() => navigate('/settings')}>
          <span style={styles.iconSymbol}>⚙️</span>
        </div>
      </div>

      {showInfo && (
        <div style={styles.infoBox}>
          <div style={{ marginBottom: 8 }}>
            {t(
              "home.punchInfo",
              "You must throw a real punch for the sensors to detect it. Don't punch too hard or you might break the bag!"
            )}
          </div>
          <button style={styles.infoCloseBtn} onClick={handleCloseInfo}>
            {t("home.gotIt", "Got it!")}
          </button>
        </div>
      )}

      <div style={styles.menu}>
        <button style={styles.button} onClick={() => navigate('/fight')}>
          {t("home.freeFight")}
        </button>
        <button style={styles.button} onClick={() => navigate('/minimenu')}>
          {t("home.miniGames")}
        </button>
        <button style={styles.button} onClick={() => navigate('/tutorial')}>
          {t("home.tutorial")}
        </button>
      </div>
    </div>
  );
}

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
  infoIcon: {
    fontSize: '1.3rem',
    cursor: 'pointer',
    userSelect: 'none',
    marginLeft: 4,
  },
  infoBox: {
    background: '#fffbe6',
    color: '#b44',
    border: '2px solid #b44',
    borderRadius: '14px',
    padding: '16px 24px',
    maxWidth: 420,
    margin: '0 auto 24px auto',
    fontSize: '1.1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  infoCloseBtn: {
    marginTop: 8,
    padding: '6px 18px',
    borderRadius: '50px',
    border: 'none',
    background: '#b44',
    color: '#fff',
    fontWeight: 700,
    fontSize: '1rem',
    cursor: 'pointer',
  },
  menu: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    gap: '20px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    padding: '20px 30px',
    fontFamily: "'Lexend', sans-serif",
    borderRadius: '50px',
    border: '2px solid #2C2C2C',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontSize: '1.2rem',
    fontWeight: '700',
    cursor: 'pointer',
    minWidth: '140px',
    transition: 'all 0.2s ease',
  },
};