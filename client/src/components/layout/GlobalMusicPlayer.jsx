import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music, ChevronLeft, ChevronRight, Maximize2, Minimize2, ExternalLink } from 'lucide-react';
import { useMusicStore } from '../../store/musicStore';
import { useAuthStore } from '../../store/authStore';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === null) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function GlobalMusicPlayer() {
  const {
    tracks,
    playingTrackId,
    playerState,
    player,
    userId,
    initTracks,
    setPlayer,
    setPlayerState,
    playTrack,
    togglePlayPause,
    currentTime,
    duration,
    isMuted,
    setCurrentTime,
    setDuration,
    setIsMuted,
    seekTo,
    toggleMute
  } = useMusicStore();

  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();
  const [isMinimized, setIsMinimized] = useState(true);
  const iframeTargetRef = useRef(null);

  // Initialize tracks when userId switches
  useEffect(() => {
    if (isAuthenticated && userId) {
      initTracks(userId);
    }
  }, [userId, isAuthenticated]);

  // Load YouTube IFrame API script once globally
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize YT Player on the hidden target element
  useEffect(() => {
    let checkInterval;
    let localPlayer = null;

    const setupPlayer = () => {
      if (window.YT && window.YT.Player && document.getElementById('global-youtube-player-target')) {
        clearInterval(checkInterval);
        
        try {
          localPlayer = new window.YT.Player('global-youtube-player-target', {
            height: '0',
            width: '0',
            playerVars: {
              autoplay: 0,
              controls: 0,
              showinfo: 0,
              rel: 0,
              loop: 0
            },
            events: {
              onReady: (event) => {
                setPlayer(event.target);
                // Sync store's isMuted with the player initially
                if (typeof event.target.isMuted === 'function') {
                  setIsMuted(event.target.isMuted());
                }
                // If there's an active track, load it (muted/cued)
                if (playingTrackId) {
                  const track = tracks.find(t => t.id === playingTrackId);
                  if (track) {
                    event.target.cueVideoById(track.videoId);
                  }
                }
              },
              onStateChange: (event) => {
                setPlayerState(event.data);
              },
              onError: (error) => {
                console.error('Global YT Player Error:', error.data);
                setPlayerState(-1);
              }
            }
          });
        } catch (err) {
          console.error('Failed to instantiate YouTube player:', err);
        }
      }
    };

    checkInterval = setInterval(setupPlayer, 1000);

    return () => {
      clearInterval(checkInterval);
      // Clean up player on unmount
      if (localPlayer && typeof localPlayer.destroy === 'function') {
        localPlayer.destroy();
      }
    };
  }, [setPlayer, setPlayerState]);

  // Poll player current time and duration when playing
  useEffect(() => {
    let timer;
    if (player && playerState === 1) { // 1 is playing
      timer = setInterval(() => {
        if (typeof player.getCurrentTime === 'function') {
          setCurrentTime(player.getCurrentTime());
        }
        if (typeof player.getDuration === 'function') {
          setDuration(player.getDuration());
        }
      }, 500);
    } else if (player && (playerState === 2 || playerState === 0)) { // paused or ended
      if (typeof player.getCurrentTime === 'function') {
        setCurrentTime(player.getCurrentTime());
      }
    }
    return () => clearInterval(timer);
  }, [player, playerState, setCurrentTime, setDuration]);

  // Find playing track details
  const playingTrack = tracks.find(t => t.id === playingTrackId);

  // If user is not logged in or they are on landing/login/signup/forgot-password pages, keep player hidden but running
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  const shouldShowFloatingWidget = isAuthenticated && isDashboardRoute && playingTrackId;

  return (
    <>
      {/* Hidden container for YouTube Player Iframe */}
      <div style={{ width: 0, height: 0, opacity: 0, pointerEvents: 'none', position: 'absolute' }}>
        <div id="global-youtube-player-target" ref={iframeTargetRef}></div>
      </div>

      {/* Floating Control Widget */}
      <AnimatePresence>
        {shouldShowFloatingWidget && playingTrack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed z-40 bottom-4 right-4 md:right-6 md:bottom-6 overflow-hidden rounded-2xl border border-primary/20 shadow-2xl glass-card transition-all duration-300 ${
              isMinimized ? 'w-14 h-14 rounded-full' : 'w-72 p-4'
            }`}
          >
            {isMinimized ? (
              // Minimized view: Pulsing disc
              <button
                onClick={() => setIsMinimized(false)}
                className="w-full h-full flex items-center justify-center relative cursor-pointer group"
                title="Expand Music Player"
              >
                <div className={`absolute inset-0.5 rounded-full border border-primary/30 flex items-center justify-center bg-gradient-to-tr from-primary/10 to-secondary/15 ${
                  playerState === 1 ? 'animate-spin' : ''
                }`} style={{ animationDuration: '6s' }}>
                  <Music size={18} className="text-primary" />
                </div>
                {/* Pulse ring when playing */}
                {playerState === 1 && (
                  <span className="absolute inset-0 rounded-full border border-primary bg-primary/10 animate-ping opacity-40 pointer-events-none" />
                )}
              </button>
            ) : (
              // Expanded detailed view
              <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-primary/10 pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                    <Music size={14} className={playerState === 1 ? 'animate-bounce' : ''} />
                    <span>Mindful Audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/dashboard/mental"
                      className="text-muted hover:text-primary transition-colors"
                      title="Manage playlist in Mental Wellness"
                    >
                      <ExternalLink size={13} />
                    </Link>
                    <button
                      onClick={() => setIsMinimized(true)}
                      className="text-muted hover:text-primary transition-colors cursor-pointer"
                      title="Minimize"
                    >
                      <Minimize2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Track Info */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-[2px] shadow flex-shrink-0 ${
                    playerState === 1 ? 'animate-spin' : ''
                  }`} style={{ animationDuration: '8s' }}>
                    <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
                      <Music size={16} className="text-primary" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs font-bold text-textMain truncate leading-tight">{playingTrack.name}</p>
                    <p className="text-[10px] text-muted font-medium mt-0.5">
                      {playerState === 1 ? 'Playing now' : playerState === 3 ? 'Buffering...' : 'Paused'}
                    </p>
                  </div>
                </div>

                {/* Seekbar */}
                <div className="flex flex-col gap-1 mt-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime || 0}
                    onChange={(e) => seekTo(parseFloat(e.target.value))}
                    className="w-full h-1 bg-primary/15 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                    style={{
                      background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${duration ? (currentTime / duration) * 100 : 0}%, #e2e8f0 ${duration ? (currentTime / duration) * 100 : 0}%, #e2e8f0 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[9px] text-muted font-semibold">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-primary/5">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-full hover:bg-primary/5 text-muted hover:text-primary transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayPause}
                      className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center hover:opacity-95 shadow-md active:scale-90 transition-all cursor-pointer"
                      title={playerState === 1 ? 'Pause' : 'Play'}
                    >
                      {playerState === 1 ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                    </button>
                  </div>

                  <div className="w-16 h-1 bg-primary/10 rounded-full overflow-hidden relative" title="YouTube Stream Active">
                    <div className={`absolute top-0 bottom-0 left-0 bg-primary w-full ${playerState === 1 ? 'opacity-100' : 'opacity-50'}`} />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
