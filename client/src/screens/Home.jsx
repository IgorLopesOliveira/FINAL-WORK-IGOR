import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon} onClick={() => alert(t("home.userProfile"))}>
          <span style={styles.iconSymbol}>👤</span>
        </div>
        <h1 style={styles.title}>{t("home.menu")}</h1>
        <div style={styles.icon} onClick={() => alert(t("home.settings"))}>
          <span style={styles.iconSymbol}>⚙️</span>
        </div>
      </div>

      <div style={styles.menu}>
        <button style={styles.button} onClick={() => navigate('/fight')}>
          {t("home.freeFight")}
        </button>
        <button style={styles.button} onClick={() => navigate('/minimenu')}>
          {t("home.miniGames")}
        </button>
        <button style={styles.button} onClick={() => alert(t("home.tutorial"))}>
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
    fontFamily: "'Inter', sans-serif",
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
