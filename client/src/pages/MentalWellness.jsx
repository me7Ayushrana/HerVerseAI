import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Brain, Volume2, VolumeX, Play, Pause, Save, Heart, Sparkles, Moon, Plus, Trash2, Edit3, Check, X, Music, Loader2 } from 'lucide-react';
import { classifySentiment } from '../utils/sentimentClassifier';
import { useAuthStore } from '../store/authStore';

export default function MentalWellness() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';
  const [isLoaded, setIsLoaded] = useState(false);

  // Breathing visualizer states
  const [breathingState, setBreathingState] = useState('Idle'); // Idle, Inhale, Hold, Exhale
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Mood tracker states
  const [mood, setMood] = useState('😌');
  const [notes, setNotes] = useState('');
  const [moodLogs, setMoodLogs] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-mood-logs`);
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), mood: '😌', notes: 'Had a quiet and productive yoga session.' },
      { id: '2', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), mood: '😇', notes: 'Felt very energized today!' }
    ];
  });

  // YouTube player and tracks state
  const [tracks, setTracks] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-custom-tracks`);
    return saved ? JSON.parse(saved) : [
      { id: 'default-1', name: 'Relaxing Zen Soundscape (Pre-Added)', url: 'https://youtu.be/D1f2dSi7kG4?si=k9cMfhtvzsqBME4o', videoId: 'D1f2dSi7kG4' }
    ];
  });
  const [newTrackName, setNewTrackName] = useState('');
  const [newTrackUrl, setNewTrackUrl] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState(null);
  const [editingTrackName, setEditingTrackName] = useState('');
  
  const [player, setPlayer] = useState(null);
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const [playerState, setPlayerState] = useState(-1); // -1: unstarted, 0: ended, 1: playing, 2: paused, 3: buffering

  // Affirmation state
  const affirmations = [
    "I honor my body's natural phases, allowing myself to rest when needed and shine when energized.",
    "I am worthy of peace, gentle moments, and self-compassion throughout my wellness journey.",
    "My breath is my anchor. With every exhale, I release anxiety; with every inhale, I welcome calm.",
    "I embrace my unique strength and give myself permission to grow at my own organic pace.",
    "My mind is clear, my body is strong, and my spirit is resilient.",
    "I feed my body with wholesome nutrients and feed my mind with positive, life-giving thoughts.",
    "Every phase of my cycle is a gift of self-awareness and power. I flow with ease.",
    "I choose to release what I cannot control and focus on breathing light into this present moment.",
    "I surround myself with soft energies, healthy boundaries, and loving kindness.",
    "I am building a healthy, vibrant life, one intentional breath and positive choice at a time."
  ];
  const [currentAffirmation, setCurrentAffirmation] = useState(() => {
    return affirmations[Math.floor(Math.random() * affirmations.length)];
  });
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Gratitude Jar state
  const [gratitudes, setGratitudes] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-gratitudes`);
    return saved ? JSON.parse(saved) : [
      { id: 'grat-1', text: 'My morning cup of warm chamomile tea', date: new Date().toISOString() },
      { id: 'grat-2', text: 'Having a supportive sisterhood network', date: new Date().toISOString() },
      { id: 'grat-3', text: 'A slow gentle stretch after a busy day', date: new Date().toISOString() }
    ];
  });
  const [newGratitude, setNewGratitude] = useState('');
  const [recalledGratitude, setRecalledGratitude] = useState(null);

  // Reload user data when userId changes
  useEffect(() => {
    setIsLoaded(false);
    const savedMood = localStorage.getItem(`herverse-${userId}-mood-logs`);
    if (savedMood) {
      setMoodLogs(JSON.parse(savedMood));
    } else {
      setMoodLogs([
        { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), mood: '😌', notes: 'Had a quiet and productive yoga session.' },
        { id: '2', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), mood: '😇', notes: 'Felt very energized today!' }
      ]);
    }

    const savedTracks = localStorage.getItem(`herverse-${userId}-custom-tracks`);
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    } else {
      setTracks([
        { id: 'default-1', name: 'Relaxing Zen Soundscape (Pre-Added)', url: 'https://youtu.be/D1f2dSi7kG4?si=k9cMfhtvzsqBME4o', videoId: 'D1f2dSi7kG4' }
      ]);
    }

    const savedGratitudes = localStorage.getItem(`herverse-${userId}-gratitudes`);
    if (savedGratitudes) {
      setGratitudes(JSON.parse(savedGratitudes));
    } else {
      setGratitudes([
        { id: 'grat-1', text: 'My morning cup of warm chamomile tea', date: new Date().toISOString() },
        { id: 'grat-2', text: 'Having a supportive sisterhood network', date: new Date().toISOString() },
        { id: 'grat-3', text: 'A slow gentle stretch after a busy day', date: new Date().toISOString() }
      ]);
    }
    setIsLoaded(true);
  }, [userId]);

  // Sync state changes with local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-mood-logs`, JSON.stringify(moodLogs));
    }
  }, [moodLogs, userId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-custom-tracks`, JSON.stringify(tracks));
    }
  }, [tracks, userId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-gratitudes`, JSON.stringify(gratitudes));
    }
  }, [gratitudes, userId, isLoaded]);

  // Breathing cycle timer effect
  useEffect(() => {
    let interval;
    if (isBreathingActive) {
      interval = setInterval(() => {
        setBreathTimer((prev) => {
          let nextTime = prev + 1;
          if (nextTime <= 4) {
            setBreathingState('Inhale 🌸');
          } else if (nextTime <= 8) {
            setBreathingState('Hold 🍃');
          } else if (nextTime <= 12) {
            setBreathingState('Exhale ✨');
          } else {
            nextTime = 1;
            setBreathingState('Inhale 🌸');
            setBreathCount((c) => c + 1);
          }
          return nextTime;
        });
      }, 1000);
    } else {
      setBreathingState('Idle');
      setBreathTimer(0);
    }
    return () => clearInterval(interval);
  }, [isBreathingActive]);

  const toggleBreathing = () => {
    setIsBreathingActive(!isBreathingActive);
    if (!isBreathingActive) {
      setBreathTimer(0);
      setBreathingState('Inhale 🌸');
    }
  };

  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const handleSaveMood = (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    // Run local Naive Bayes Sentiment Classifier
    const analysis = classifySentiment(notes);

    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood,
      notes,
      sentiment: analysis
    };
    
    const updated = [newLog, ...moodLogs];
    setMoodLogs(updated);
    localStorage.setItem(`herverse-${userId}-mood-logs`, JSON.stringify(updated));
    setLatestAnalysis(analysis);
    setNotes('');
  };

  const getBreathCircleScale = () => {
    if (!isBreathingActive) return 1;
    if (breathingState.includes('Inhale')) return 1.6;
    if (breathingState.includes('Hold')) return 1.6;
    return 1;
  };

  // Load YouTube API script on mount
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [player]);

  const saveTracks = (newTracks) => {
    setTracks(newTracks);
    localStorage.setItem(`herverse-${userId}-custom-tracks`, JSON.stringify(newTracks));
  };

  const extractVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAddTrack = (e) => {
    e.preventDefault();
    if (!newTrackName.trim() || !newTrackUrl.trim()) return;

    const videoId = extractVideoId(newTrackUrl);
    if (!videoId) {
      alert("Invalid YouTube Link. Please copy and paste a valid YouTube watch or share URL.");
      return;
    }

    const newTrack = {
      id: Date.now().toString(),
      name: newTrackName.trim(),
      url: newTrackUrl.trim(),
      videoId
    };

    const updated = [...tracks, newTrack];
    saveTracks(updated);
    setNewTrackName('');
    setNewTrackUrl('');
    setShowAddForm(false);
  };

  const handleDeleteTrack = (trackId, e) => {
    e.stopPropagation();
    const updated = tracks.filter(t => t.id !== trackId);
    saveTracks(updated);
    if (playingTrackId === trackId) {
      if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
      }
      setPlayingTrackId(null);
      setPlayerState(-1);
    }
  };

  const handleStartRename = (track, e) => {
    e.stopPropagation();
    setEditingTrackId(track.id);
    setEditingTrackName(track.name);
  };

  const handleSaveRename = (trackId, e) => {
    if (e) e.stopPropagation();
    if (!editingTrackName.trim()) return;

    const updated = tracks.map(t => t.id === trackId ? { ...t, name: editingTrackName.trim() } : t);
    saveTracks(updated);
    setEditingTrackId(null);
  };

  const handlePlayPause = (track) => {
    if (playingTrackId === track.id) {
      if (player && typeof player.getPlayerState === 'function') {
        const state = player.getPlayerState();
        if (state === 1) { // playing
          player.pauseVideo();
          setPlayerState(2);
        } else {
          player.playVideo();
          setPlayerState(1);
        }
      }
    } else {
      setPlayingTrackId(track.id);
      setPlayerState(3); // buffering

      if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(track.videoId);
        player.playVideo();
      } else {
        const initPlayer = () => {
          const ytPlayer = new window.YT.Player('youtube-player-target', {
            height: '0',
            width: '0',
            videoId: track.videoId,
            playerVars: {
              autoplay: 1,
              controls: 0,
              showinfo: 0,
              rel: 0,
              loop: 0
            },
            events: {
              onReady: (event) => {
                event.target.playVideo();
                setPlayer(event.target);
                setPlayerState(1);
              },
              onStateChange: (event) => {
                setPlayerState(event.data);
              },
              onError: (event) => {
                console.error("YouTube Player Error:", event.data);
                setPlayerState(-1);
                alert("Failed to load this YouTube audio stream. Ensure the video allows embedding and is not restricted.");
              }
            }
          });
        };

        if (window.YT && window.YT.Player) {
          initPlayer();
        } else {
          window.onYouTubeIframeAPIReady = () => {
            initPlayer();
          };
        }
      }
    }
  };

  // Affirmation voice reader
  const handleSpeakAffirmation = () => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentAffirmation);
    utterance.rate = 0.85; // slow calming rate
    utterance.pitch = 1.0;

    // Try selecting female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => 
      v.name.toLowerCase().includes('female') || 
      v.name.toLowerCase().includes('google us english') || 
      v.name.toLowerCase().includes('samantha')
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleRotateAffirmation = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    let nextIdx = Math.floor(Math.random() * affirmations.length);
    while (affirmations[nextIdx] === currentAffirmation) {
      nextIdx = Math.floor(Math.random() * affirmations.length);
    }
    setCurrentAffirmation(affirmations[nextIdx]);
  };

  // Gratitude Jar drop handler
  const handleAddGratitude = (e) => {
    e.preventDefault();
    if (!newGratitude.trim()) return;

    const newGrat = {
      id: Date.now().toString(),
      text: newGratitude.trim(),
      date: new Date().toISOString()
    };

    const updated = [newGrat, ...gratitudes];
    setGratitudes(updated);
    localStorage.setItem(`herverse-${userId}-gratitudes`, JSON.stringify(updated));
    setNewGratitude('');
    
    // Play a soft text-to-speech visual drop cue or flash
    setRecalledGratitude(newGrat);
  };

  const handleRecallGratitude = (grat) => {
    setRecalledGratitude(grat);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Mental Wellness</h2>
        <p className="text-muted text-sm">Nurture your mind with breathing exercises, journals, and soothing sounds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Breathing Tool (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden border-primary/20 shadow-md min-h-[420px]">
            <div className="absolute top-4 right-4 bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs">
              Sessions: {breathCount}
            </div>
            
            <h3 className="font-display font-bold text-xl mb-2 flex items-center gap-2">
              <Brain className="text-primary animate-pulse" size={24} /> Guided Breathing Bubble
            </h3>
            <p className="text-muted text-sm max-w-sm mb-10">Use this guided box breathing technique (4s Inhale, 4s Hold, 4s Exhale) to ground yourself.</p>

            {/* Breathing Bubble Graphic */}
            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
              {/* Outer expanding ring */}
              <AnimatePresence>
                {isBreathingActive && (
                  <motion.div 
                    className="absolute inset-0 rounded-full bg-primary/10 border border-primary/30"
                    animate={{ scale: getBreathCircleScale() }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                  />
                )}
              </AnimatePresence>

              {/* Inner bubble */}
              <motion.div 
                className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-secondary text-white flex flex-col items-center justify-center shadow-lg z-10"
                animate={{ scale: getBreathCircleScale() }}
                transition={{ duration: 4, ease: "easeInOut" }}
              >
                <span className="text-sm font-semibold">{breathingState}</span>
                {isBreathingActive && <span className="text-xs opacity-80 mt-1">{breathTimer % 4 || 4}s</span>}
              </motion.div>
            </div>

            <button 
              onClick={toggleBreathing} 
              className={`px-8 py-3 rounded-full font-bold shadow-md transition-all-smooth ${isBreathingActive ? 'bg-white/90 border border-primary text-primary hover:bg-primary/5' : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-95'}`}
            >
              {isBreathingActive ? 'Stop Session' : 'Breathe In'}
            </button>
          </div>

          {/* Mindful Music Player (YouTube Audio) */}
          <div className="glass-card p-6 border-primary/20 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Volume2 className="text-primary" size={22} /> Mindful Music Player
              </h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/25 text-primary text-xs font-bold transition-all flex items-center gap-1"
              >
                {showAddForm ? <X size={14} /> : <Plus size={14} />} Add Music
              </button>
            </div>

            {/* Hidden Div target for YouTube IFrame API */}
            <div style={{ width: 0, height: 0, opacity: 0, pointerEvents: 'none', position: 'absolute' }}>
              <div id="youtube-player-target"></div>
            </div>

            {/* Add Music Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTrack}
                  className="bg-white/80 p-4 rounded-2xl border border-primary/15 space-y-3 overflow-hidden text-left"
                >
                  <h4 className="text-xs font-bold text-textMain uppercase tracking-wider">Add YouTube Music Stream</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase">Track Title</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Peaceful Rain & Lofi"
                      value={newTrackName}
                      onChange={e => setNewTrackName(e.target.value)}
                      className="w-full bg-white border border-primary/15 rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted uppercase">YouTube Link</label>
                    <input 
                      type="url"
                      required
                      placeholder="e.g. https://youtu.be/..."
                      value={newTrackUrl}
                      onChange={e => setNewTrackUrl(e.target.value)}
                      className="w-full bg-white border border-primary/15 rounded-xl px-3 py-2 text-xs text-textMain focus:outline-none focus:border-primary"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2 rounded-xl bg-primary text-white font-bold text-xs hover:opacity-95 transition-all"
                  >
                    Add to Playlist
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Playlist Track rows */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {tracks.map((track) => (
                <div 
                  key={track.id}
                  onClick={() => handlePlayPause(track)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all-smooth ${playingTrackId === track.id ? 'bg-primary/5 border-primary/40 shadow-sm' : 'bg-white/80 border-primary/10 hover:bg-primary/5'}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      {playingTrackId === track.id && playerState === 1 ? (
                        <span className="flex gap-0.5 items-end h-3">
                          <span className="w-0.5 bg-primary animate-[bounce_0.8s_infinite_0.1s] h-3" style={{ animationDuration: '0.6s' }} />
                          <span className="w-0.5 bg-primary animate-[bounce_0.8s_infinite_0.3s] h-2" style={{ animationDuration: '0.4s' }} />
                          <span className="w-0.5 bg-primary animate-[bounce_0.8s_infinite_0.2s] h-3" style={{ animationDuration: '0.5s' }} />
                        </span>
                      ) : playingTrackId === track.id && playerState === 3 ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <Music size={16} />
                      )}
                    </div>

                    {editingTrackId === track.id ? (
                      <input 
                        type="text"
                        value={editingTrackName}
                        onChange={e => setEditingTrackName(e.target.value)}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSaveRename(track.id);
                          if (e.key === 'Escape') setEditingTrackId(null);
                        }}
                        className="bg-white border border-primary/30 rounded px-2.5 py-1 text-xs text-textMain focus:outline-none w-full max-w-[220px]"
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm font-semibold truncate text-textMain pr-2 text-left">
                        {track.name}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingTrackId === track.id ? (
                      <>
                        <button 
                          onClick={(e) => handleSaveRename(track.id, e)} 
                          className="p-1 rounded hover:bg-emerald-50 text-emerald-600 transition-colors"
                          title="Save Name"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingTrackId(null); }} 
                          className="p-1 rounded hover:bg-rose-50 text-rose-600 transition-colors"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={(e) => handleStartRename(track, e)}
                          className="p-1 rounded hover:bg-primary/10 text-muted hover:text-primary transition-colors"
                          title="Rename Track"
                        >
                          <Edit3 size={14} />
                        </button>
                        {track.id !== 'default-1' && (
                          <button 
                            onClick={(e) => handleDeleteTrack(track.id, e)}
                            className="p-1 rounded hover:bg-rose-50 text-muted hover:text-rose-600 transition-colors"
                            title="Delete Track"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Controller status bar */}
            {playingTrackId && (
              <div className="p-3 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    {playerState === 1 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${playerState === 1 ? 'bg-primary' : playerState === 3 ? 'bg-amber-400' : 'bg-muted'}`}></span>
                  </span>
                  <span className="font-semibold truncate text-textMain text-left">
                    {playerState === 1 ? 'Playing: ' : playerState === 3 ? 'Buffering: ' : 'Paused: '}
                    {tracks.find(t => t.id === playingTrackId)?.name}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    const activeTrack = tracks.find(t => t.id === playingTrackId);
                    if (activeTrack) handlePlayPause(activeTrack);
                  }}
                  className="px-3 py-1 rounded-lg bg-primary text-white hover:opacity-95 font-bold transition-all shadow-sm flex items-center gap-1 flex-shrink-0 scale-95"
                >
                  {playerState === 1 ? <Pause size={12} /> : <Play size={12} />}
                  {playerState === 1 ? 'Pause' : 'Play'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mood Log & History (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Sparkles className="text-primary" size={22} /> Daily Mood Journal
            </h3>
            
            <form onSubmit={handleSaveMood} className="space-y-4">
              <div>
                <label className="block text-sm text-textMain font-semibold mb-2">How is your spirit today?</label>
                <div className="flex justify-between gap-1 p-2 bg-white/90 rounded-2xl border border-primary/10 shadow-inner">
                  {['😇', '😌', '🥱', '🥺', '😡', '😢'].map((m) => (
                    <button 
                      key={m} 
                      type="button" 
                      onClick={() => setMood(m)} 
                      className={`text-2xl p-2 rounded-xl transition-all-smooth ${mood === m ? 'bg-primary/15 border border-primary/30 scale-110 shadow-sm' : 'hover:bg-primary/5'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-textMain font-semibold mb-1">Journal Thoughts</label>
                <textarea 
                  rows="3" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  required
                  placeholder="Record your mood triggers, sleep notes, or expressions..." 
                  className="w-full bg-white border border-primary/20 rounded-xl px-4 py-2.5 text-textMain focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all placeholder-muted/50"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Entry
              </button>
            </form>

            {/* Local Naive Bayes Sentiment Analysis Results */}
            {latestAnalysis && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`p-4 rounded-2xl border border-primary/20 ${latestAnalysis.bg} space-y-3 mt-4 text-left`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" /> Local Naive Bayes ML Analysis
                  </span>
                  <button 
                    onClick={() => setLatestAnalysis(null)} 
                    className="text-xs text-muted hover:text-textMain font-bold"
                  >
                    Clear
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{latestAnalysis.emoji}</span>
                  <div>
                    <h4 className={`font-bold text-sm ${latestAnalysis.color}`}>
                      {latestAnalysis.label}
                    </h4>
                    <p className="text-[9px] text-muted font-bold">PROCESSED {latestAnalysis.processedTokens} TOKENS</p>
                  </div>
                </div>

                <p className="text-xs font-medium leading-relaxed text-textMain">
                  {latestAnalysis.advice}
                </p>

                {/* Confidences breakdown */}
                <div className="space-y-1.5 pt-2 border-t border-primary/10">
                  {Object.entries(latestAnalysis.confidences).map(([className, percentage]) => {
                    const classLabels = {
                      happy: "Happy",
                      calm: "Calm",
                      anxious: "Anxious",
                      sad: "Sad"
                    };
                    const classColors = {
                      happy: "bg-emerald-400",
                      calm: "bg-sky-400",
                      anxious: "bg-amber-400",
                      sad: "bg-rose-400"
                    };
                    return (
                      <div key={className} className="text-[10px] font-bold text-textMain">
                        <div className="flex justify-between items-center mb-0.5">
                          <span>{classLabels[className]}</span>
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-black/5 rounded-full h-1">
                          <div className={`h-full ${classColors[className]} rounded-full`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>

          {/* Mood History Logs */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-textMain mb-4 flex items-center gap-2">
              <Heart className="text-primary" size={20} /> Past Mind Logs
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {moodLogs.map((log) => (
                <div key={log.id} className="bg-white/95 border border-primary/15 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
                  <span className="text-3xl p-1 bg-primary/10 rounded-xl">{log.mood}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted font-bold">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {log.sentiment && (
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border border-primary/10 ${log.sentiment.bg} ${log.sentiment.color}`}>
                          {log.sentiment.emoji} {log.sentiment.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-textMain leading-relaxed break-words">{log.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Grid for Affirmations & Gratitude Jar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">
        
        {/* Card 1: Soothing Daily Affirmations (With Audio Speaker) */}
        <div className="glass-card p-6 border-primary/20 shadow-sm flex flex-col justify-between min-h-[300px] text-left">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Moon className="text-primary" size={22} /> Mindful Affirmation
              </h3>
              <button 
                onClick={handleRotateAffirmation}
                className="px-3 py-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all"
              >
                Rotate Affirmation
              </button>
            </div>

            <div className="bg-white/80 p-6 rounded-2xl border border-primary/10 shadow-inner flex items-center justify-center min-h-[120px]">
              <p className="text-base md:text-lg italic font-medium leading-relaxed text-gradient text-center font-display">
                "{currentAffirmation}"
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary/5 p-3.5 rounded-2xl border border-primary/10">
            <div className="text-left">
              <div className="text-xs font-bold text-textMain">Listen to Affirmation Voice Reader</div>
              <div className="text-[10px] text-muted font-semibold">Uses natural, relaxing local SpeechSynthesis</div>
            </div>
            
            <button 
              onClick={handleSpeakAffirmation}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2 ${isSpeaking ? 'bg-rose-500 text-white animate-pulse' : 'bg-primary text-white hover:opacity-95'}`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX size={14} /> Stop Voice
                </>
              ) : (
                <>
                  <Volume2 size={14} /> Speak Soothingly
                </>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Interactive 2D Gratitude Jar */}
        <div className="glass-card p-6 border-primary/20 shadow-sm flex flex-col justify-between min-h-[300px] text-left">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Heart className="text-primary" size={22} /> Interactive Gratitude Jar
            </h3>
            
            <p className="text-muted text-xs leading-normal">
              Type something you are grateful for today and drop it into the jar! Click any glowing marble inside the glass jar to recall your reflections.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 items-center pt-2">
              
              {/* The CSS Glass Jar Representation */}
              <div 
                className="relative w-[150px] h-[190px] border-4 border-primary/30 rounded-t-[30px] rounded-b-[40px] bg-white/10 backdrop-blur-sm shadow-md flex items-center justify-center overflow-hidden flex-shrink-0"
                style={{ boxShadow: 'inset 0 0 20px rgba(236,72,153,0.1)' }}
              >
                {/* Lid */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90px] h-3.5 bg-primary/50 rounded-b-md border-b-2 border-primary/20" />
                
                {/* Floating Marbles representing gratitudes */}
                <div className="absolute inset-0 pt-6 px-3">
                  {gratitudes.map((g, idx) => (
                    <motion.div
                      key={g.id}
                      initial={{ y: -120, x: 50, scale: 0 }}
                      animate={{ 
                        // Lay out marbles in visual rows at the bottom of the jar
                        y: 130 - Math.floor(idx / 4) * 22 + (Math.sin(idx * 2) * 4), 
                        x: 10 + (idx % 4) * 28 + (Math.cos(idx * 2) * 5), 
                        scale: 1 
                      }}
                      whileHover={{ scale: 1.25 }}
                      transition={{ type: 'spring', stiffness: 90, damping: 12 }}
                      onClick={() => handleRecallGratitude(g)}
                      className="absolute w-[22px] h-[22px] rounded-full bg-gradient-to-tr from-primary to-accent shadow-md cursor-pointer flex items-center justify-center text-[10px] hover:glow-hover select-none"
                      title={g.text}
                    >
                      ✨
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Input Form & Recalled Text */}
              <div className="flex-1 w-full flex flex-col justify-between min-h-[190px] space-y-4">
                
                {/* Recall alert display */}
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3 min-h-[85px] flex items-center justify-center text-center">
                  {recalledGratitude ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-textMain italic">"{recalledGratitude.text}"</p>
                      <p className="text-[9px] text-muted font-bold">
                        LOGGED {new Date(recalledGratitude.date).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted font-medium italic">Click a glowing marble inside the jar to read a past reflection...</p>
                  )}
                </div>

                <form onSubmit={handleAddGratitude} className="flex gap-2">
                  <input 
                    type="text"
                    required
                    placeholder="I am grateful for..."
                    value={newGratitude}
                    onChange={e => setNewGratitude(e.target.value)}
                    className="flex-1 bg-white border border-primary/20 rounded-xl px-3.5 py-2 text-xs text-textMain focus:outline-none focus:border-primary placeholder-muted/50"
                  />
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs rounded-xl hover:opacity-95 shadow-sm flex items-center gap-1 shrink-0"
                  >
                    <Plus size={14} /> Drop
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
