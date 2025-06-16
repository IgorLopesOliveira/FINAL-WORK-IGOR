import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const tutorialSteps = [
  {
    type: "intro",
    titleKey: "tutorialP.title",
    textKey: "tutorialP.intro1",
  },
  {
    type: "intro",
    titleKey: "tutorialP.stanceTitle",
    textKey: "tutorialP.stanceText",
  },
  {
    type: "video",
    titleKey: "tutorialP.jabTitle",
    textKey: "tutorialP.jabText",
    video: "/videos/jab_1.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.crossTitle",
    textKey: "tutorialP.crossText",
    video: "/videos/cross_2.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.leftHookTitle",
    textKey: "tutorialP.leftHookText",
    video: "/videos/left-hook_3.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.rightHookTitle",
    textKey: "tutorialP.rightHookText",
    video: "/videos/right-hook_4.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.leftUppercutTitle",
    textKey: "tutorialP.leftUppercutText",
    video: "/videos/left-uppercut_5.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.rightUppercutTitle",
    textKey: "tutorialP.rightUppercutText",
    video: "/videos/right-uppercut_6.mp4",
  },
  {
    type: "video",
    titleKey: "tutorialP.jabCrossTitle",
    textKey: "tutorialP.jabCrossText",
    video: "/videos/left-cross_1-2.mp4",
  },
  {
    type: "sound-intro",
    titleKey: "tutorialP.soundsTitle",
    textKey: "tutorialP.soundsText",
  },
  {
    type: "audio",
    titleKey: "tutorialP.tripleTapTitle",
    textKey: "tutorialP.tripleTapText",
    audio: "/sounds/triple-tap.mp3",
  },
  {
    type: "audio",
    titleKey: "tutorialP.tripleBellTitle",
    textKey: "tutorialP.tripleBellText",
    audio: "/sounds/boxing-bell.mp3",
  },
  {
    type: "end",
    titleKey: "tutorialP.endTitle",
    textKey: "tutorialP.endText",
  },
];

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const audioTimeoutRef = useRef(null);

  useEffect(() => {
    if (tutorialSteps[step].type === "intro" || tutorialSteps[step].type === "sound-intro") {
      const timeout = setTimeout(() => {
        setStep((s) => Math.min(s + 1, tutorialSteps.length - 1));
      }, 4000);
      return () => clearTimeout(timeout);
    }
    if (tutorialSteps[step].type === "end") {
      const timeout = setTimeout(() => {
        navigate("/home");
      }, 4000);
      return () => clearTimeout(timeout);
    }
    // Cleanup any pending audio timeout when step changes
    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
      }
    };
  }, [step, navigate]);

  // Advance to next step after video/audio ends
  const handleMediaEnd = () => {
    if (tutorialSteps[step].type === "audio") {
      // Wait 3 more seconds after audio ends before advancing
      audioTimeoutRef.current = setTimeout(() => {
        setStep((s) => Math.min(s + 1, tutorialSteps.length - 1));
      }, 3000);
    } else {
      setStep((s) => Math.min(s + 1, tutorialSteps.length - 1));
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate("/home")}>↩</button>
      <div style={styles.content}>
        <h1 style={styles.title}>{t(tutorialSteps[step].titleKey)}</h1>
        <p style={styles.text}>{t(tutorialSteps[step].textKey)}</p>
        {tutorialSteps[step].type === "video" && (
          <video
            key={tutorialSteps[step].video}
            src={tutorialSteps[step].video}
            style={styles.video}
            controls={false}
            autoPlay
            onEnded={handleMediaEnd}
          />
        )}
        {tutorialSteps[step].type === "audio" && (
          <audio
            key={tutorialSteps[step].audio}
            src={tutorialSteps[step].audio}
            style={styles.audio}
            autoPlay
            onEnded={handleMediaEnd}
          />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100vw',
    height: '100vh',
    maxWidth: '852px',
    background: '#EFEFEF',
    color: '#2C2C2C',
    fontFamily: "'Lexend', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    padding: '0px',
    boxSizing: 'border-box',
    margin: '0 auto',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
    zIndex: 2,
  },
  content: {
    width: '100%',
    maxWidth: '600px',
    minHeight: '400px',
    margin: '0 auto',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    padding: '32px 0',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '900'
  },
  text: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    marginTop: 0,
  },
  video: {
    width: '100%',
    maxWidth: '400px',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
    marginBottom: '1rem',
    background: '#fff',
  },
  audio: {
    marginTop: '1.5rem',
    width: '100%',
    maxWidth: '400px',
  },
};