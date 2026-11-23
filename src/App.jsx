import { useState, useRef, useCallback } from 'react';
import { MEDIA_SRC, MEDIA_TYPE } from './mediaConfig';
import './App.css';

function App() {
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef(null);

  const isVideo = MEDIA_TYPE === 'video';

  const buttonText = isVideo
    ? 'Watch the most important thing in life'
    : 'Listen to the most important thing in life';

  const handlePlay = useCallback(() => {
    if (!MEDIA_SRC) {
      alert('No media file configured yet!\n\nAdd your audio/video to src/media/ and update src/mediaConfig.js');
      return;
    }

    setPlaying(true);

    // Small delay to let the element mount, then play unmuted at full volume
    setTimeout(() => {
      const el = mediaRef.current;
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        el.play().catch(() => {
          // Autoplay with sound blocked by browser — try muted first, then unmute
          el.muted = true;
          el.play().then(() => {
            el.muted = false;
          });
        });
      }
    }, 50);
  }, []);

  const handleClose = useCallback(() => {
    const el = mediaRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    setPlaying(false);
  }, []);

  // ---- Video fullscreen overlay ----
  if (playing && isVideo) {
    return (
      <div className="video-overlay">
        <button className="close-btn" onClick={handleClose} aria-label="Close">
          ✕
        </button>
        <video
          ref={mediaRef}
          src={MEDIA_SRC}
          autoPlay
          playsInline
          onEnded={handleEnded}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Hidden audio element */}
      {playing && !isVideo && (
        <audio
          ref={mediaRef}
          src={MEDIA_SRC}
          className="audio-hidden"
          onEnded={handleEnded}
        />
      )}

      <button className="play-button" onClick={handlePlay}>
        {buttonText}
      </button>
    </div>
  );
}

export default App;
