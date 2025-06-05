import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MiniMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="mini-menu-container">
      <button className="back-button" onClick={() => navigate("/home")}>↩</button>
      <h1>{t("minimenu.menuTitle", "Mini-Games")}</h1>
      <div className="mini-menu-buttons">
        <button className="mini-btn" onClick={() => navigate("/memorize")}>
          {t("minimenu.memorize", "Memorize")}
        </button>
        <button className="mini-btn" onClick={() => navigate("/accuracy")}>
          {t("minimenu.accuracy", "Accuracy")}
        </button>
      </div>
      <style>{`
        .mini-menu-container {
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
        .mini-menu-buttons {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .mini-btn {
          font-size: 1.5rem;
          padding: 1rem 3rem;
          background: #2C2C2C;
          color: #fff;
          border: none;
          border-radius: 12px;
          cursor: pointer;
        }
        .mini-btn:hover {
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
        }
      `}</style>
    </div>
  );
}