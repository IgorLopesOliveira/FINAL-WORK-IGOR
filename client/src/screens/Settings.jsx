import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  // Change language handler
  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  // Theme toggle handler
  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.body.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  // Reset progress handler
  const handleReset = () => {
    if (window.confirm(t("settings.confirmReset", "Are you sure you want to reset your progress?"))) {
      localStorage.removeItem("fightScores");
      window.location.reload();
    }
  };

  return (
    <div className="settings-container">
      <button className="back-button" onClick={() => navigate("/home")}>↩</button>
      <h1>{t("settings.title", "Settings")}</h1>
      <div className="settings-group">
        <label>{t("settings.language", "Language")}</label>
        <select value={i18n.language} onChange={handleLanguageChange}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="nl">Nederlands</option>
          {/* Add more languages as needed */}
        </select>
      </div>
      <div className="settings-group">
        <label>{t("settings.theme", "Theme")}</label>
        <button onClick={handleThemeToggle}>
          {theme === "light" ? t("settings.darkMode", "Dark Mode") : t("settings.lightMode", "Light Mode")}
        </button>
      </div>
      <div className="settings-group">
        <button className="reset-btn" onClick={handleReset}>
          {t("settings.reset", "Reset Progress")}
        </button>
      </div>
      <style>{`
        .settings-container {
          min-height: 100vh;
          background: var(--bg, #EFEFEF);
          font-family: 'Lexend', sans-serif;
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
        .settings-group {
          margin-bottom: 2rem;
        }
        label {
          font-size: 1.2rem;
          font-weight: 600;
          margin-right: 1rem;
        }
        select, button {
          font-size: 1.1rem;
          padding: 0.5rem 1.5rem;
          border-radius: 8px;
          border: 2px solid #2C2C2C;
          background: #fff;
          color: #2C2C2C;
          margin-top: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .reset-btn {
          background: #B44;
          color: #fff;
          border: none;
          margin-top: 1rem;
        }
        .reset-btn:hover {
          background: #D55;
        }
        .back-button {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 2rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        /* Remove hover effect for back button */
        .back-button:hover {
          background: none;
        }
        [data-theme="dark"] {
          --bg: #232323;
          color: #EFEFEF;
        }
        [data-theme="dark"] .settings-container {
          background: #232323;
          color: #EFEFEF;
        }
        [data-theme="dark"] select, [data-theme="dark"] button {
          background: #2C2C2C;
          color: #EFEFEF;
          border-color: #EFEFEF;
        }
      `}</style>
    </div>
  );
}