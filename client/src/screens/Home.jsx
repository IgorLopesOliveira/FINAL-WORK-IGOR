import React from 'react';

export default function Home() {
  const handleClick = (msg) => alert(msg);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.icon} onClick={() => handleClick('User Profile')}>
          <span style={styles.iconSymbol}>👤</span>
        </div>
        <h1 style={styles.title}>Menu</h1>
        <div style={styles.icon} onClick={() => handleClick('Settings')}>
          <span style={styles.iconSymbol}>⚙️</span>
        </div>
      </div>

      <div style={styles.menu}>
        <button style={styles.button} onClick={() => handleClick('Free Fight')}>
          Free Fight
        </button>
        <button style={styles.button} onClick={() => handleClick('Mini-games')}>
          Mini-games
        </button>
        <button style={styles.button} onClick={() => handleClick('Tutorial')}>
          Tutorial
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
