import { useState, useRef, useCallback, useEffect } from 'react';
import { MEDIA_SRC, MEDIA_TYPE } from './mediaConfig';
import './App.css';

function App() {
  const [playing, setPlaying] = useState(false);
  const mediaRef = useRef(null);
  const wakeLockRef = useRef(null);

  const isVideo = MEDIA_TYPE === 'video';

  const buttonText = isVideo
    ? 'Watch the most important thing in life'
    : 'Listen to the most important thing in life';

  // Prevent accidental tab close while audio is playing
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (playing) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [playing]);

  // Request screen/audio wake lock if supported
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
      }
    } catch {
      // WakeLock not critical if denied
    }
  };

  // Setup MediaSession API for OS lockscreen & background audio controls
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
    requestWakeLock();

    setTimeout(() => {
      const el = mediaRef.current;
      if (el) {
        el.muted = false;
        el.volume = 1.0;
        
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
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
    }
    setPlaying(false);
  }, []);

  const handleEnded = useCallback(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
    if (wakeLockRef.current) {
      wakeLockRef.current.release().catch(() => {});
      wakeLockRef.current = null;
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
        Persistent audio element with preload, playsInline & system media hooks.
        Works across app switching, home button, and screen lock.
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
