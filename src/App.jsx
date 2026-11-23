import { useState, useRef, useCallback, useEffect } from 'react';
import { MEDIA_SRC, MEDIA_TYPE } from './mediaConfig';
import './App.css';

function App() {
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef(null);

  const isVideo = MEDIA_TYPE === 'video';

  const buttonText = isVideo
    ? 'Watch the most important thing in life'
    : 'Listen to the most important thing in life';

  // Setup MediaSession API for OS lockscreen & background controls
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'The Most Important Thing in Life',
        artist: 'Important Message',
        album: 'Life Lessons',
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (mediaRef.current) {
          mediaRef.current.play();
          setPlaying(true);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (mediaRef.current) {
          mediaRef.current.pause();
          setPlaying(false);
        }
      });
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!MEDIA_SRC) {
      alert('No media file configured yet!\n\nAdd your audio/video to src/media/ and update src/mediaConfig.js');
      return;
    }

    setPlaying(true);

    setTimeout(() => {
      const el = mediaRef.current;
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        
        // Notify OS media session
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }

        el.play().catch(() => {
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
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
    setPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
    setPlaying(false);
  }, []);

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
      {/* 
        Always keep audio element mounted in DOM with preload="auto",
        playsInline, and proper attributes so mobile browsers (Chrome / Safari / Firefox)
        recognize it as system background media and keep playing when app is switched or screen locked.
      */}
      {!isVideo && (
        <audio
          ref={mediaRef}
          src={MEDIA_SRC || undefined}
          preload="auto"
          playsInline
          onEnded={handleEnded}
          onPlay={() => {
            setPlaying(true);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          }}
          onPause={() => {
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'paused';
            }
          }}
          className="audio-hidden"
        />
      )}

      <button className="play-button" onClick={handlePlay}>
        <span className="play-icon">{isVideo ? '▶' : '🎧'}</span>
        <span>{buttonText}</span>
        {playing && <span className="playing-pulse" />}
      </button>
    </div>
  );
}

export default App;
