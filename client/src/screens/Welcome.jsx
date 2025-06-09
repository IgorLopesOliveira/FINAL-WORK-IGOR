import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

function Welcome() {
  const { t, i18n } = useTranslation();
  const [stage, setStage] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setStage(2);
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  const handleConfirm = () => {
    const language = document.getElementById("languageSelect").value;
    const age = document.getElementById("ageSelect").value;

    if (!language || !age) {
      const btn = document.getElementById("confirmBtn");
      btn.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => (btn.style.animation = ""), 500);
      return;
    }

    i18n.changeLanguage(language); // Change app language
    setStage(3);
  };

  const handleTutorial = () => {
    window.location.href = "/tutorial"; // Example: use translation for alert
  };

  const handleSkip = () => {
    window.location.href = "/home";
  };

  return (
    <div ref={containerRef} style={styles.root}>
      <style>{cssStyles}</style>
      <div style={styles.container}>
        {/* Stage 1 */}
        {stage === 1 && (
          <div className="welcome-stage">
            <h1 className="welcome-title">{t("welcome")}</h1>
            <h2 className="sparx-subtitle">{t("toSparx")}</h2>
          </div>
        )}

        {/* Stage 2 */}
        {stage === 2 && (
          <div className="selection-stage show">
            <div className="selection-row">
              <div className="selection-group">
                <label className="selection-label">{t("selectLanguage")}</label>
                <select id="languageSelect" defaultValue="">
                  <option value="">{t("chooseLanguage")}</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="nl">Nederlands</option>
                </select>
              </div>
              <div className="selection-group">
                <label className="selection-label">{t("selectAge")}</label>
                <select id="ageSelect" defaultValue="">
                  <option value="">{t("chooseAge")}</option>
                  <option value="13-17">13-17</option>
                  <option value="18-25">18-25</option>
                  <option value="26-35">26-35</option>
                  <option value="36-50">36-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
            </div>
            <button id="confirmBtn" className="confirm-btn" onClick={handleConfirm}>
              {t("confirm")}
            </button>
          </div>
        )}

        {/* Stage 3 */}
        {stage === 3 && (
          <div className="tutorial-stage show">
            <div className="tutorial-buttons">
              <button className="tutorial-btn" onClick={handleTutorial}>
                {t("tutorial")}
              </button>
              <button className="tutorial-btn" onClick={handleSkip}>
                {t("skip")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Welcome;

const styles = {
  root: {
    width: "852px",
    height: "393px",
    backgroundColor: "#EFEFEF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Lexend', sans-serif",
    color: "#2C2C2C",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    padding: "20px",
    textAlign: "center",
  },
};

const cssStyles = `
@import url('https://fonts.googleapis.com/css2?family=Boldonse&family=Bungee&family=Lato:wght@700&family=Lexend:wght@100..900&family=M+PLUS+Rounded+1c&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.welcome-title {
  font-size: 6rem;
  font-weight: 900;
  margin-bottom: 20px;
  animation: slideInDown 1s ease-out;
  letter-spacing: -0.02em;
}

.sparx-subtitle {
  font-size: 3.5rem;
  font-weight: 900;
  opacity: 0;
  animation: slideInUp 1s ease-out 2s forwards;
  letter-spacing: -0.02em;
}

.selection-stage,
.tutorial-stage {
  transform: translateY(30px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.selection-stage.show,
.tutorial-stage.show {
  opacity: 1;
  transform: translateY(0);
}

.selection-row {
  display: flex;
  gap: 30px;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.selection-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 200px;
}

.selection-label {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #2C2C2C;
}

select {
  padding: 16px 24px;
  border: 2px solid #2C2C2C;
  border-radius: 50px;
  background: #EFEFEF;
  color: #2C2C2C;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  outline: none;
  min-width: 200px;
}

select:hover {
  background: #2C2C2C;
  color: #EFEFEF;
}

.confirm-btn {
  padding: 16px 48px;
  border: 2px solid #2C2C2C;
  border-radius: 50px;
  background: #2C2C2C;
  color: #EFEFEF;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
  outline: none;
}

.confirm-btn:hover {
  background: #EFEFEF;
  color: #2C2C2C;
}

.tutorial-buttons {
  display: flex;
  gap: 30px;
  justify-content: center;
  flex-wrap: wrap;
}

.tutorial-btn {
  padding: 16px 40px;
  border: 2px solid #2C2C2C;
  border-radius: 50px;
  background: #EFEFEF;
  color: #2C2C2C;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
  min-width: 160px;
  outline: none;
}

.tutorial-btn:hover {
  background: #2C2C2C;
  color: #EFEFEF;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
`;