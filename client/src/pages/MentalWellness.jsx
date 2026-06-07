import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Brain, Volume2, VolumeX, Play, Pause, Save, Heart, Sparkles, Moon } from 'lucide-react';
import { classifySentiment } from '../utils/sentimentClassifier';

export default function MentalWellness() {
  // Breathing visualizer states
  const [breathingState, setBreathingState] = useState('Idle'); // Idle, Inhale, Hold, Exhale
  const [breathCount, setBreathCount] = useState(0);
  const [breathTimer, setBreathTimer] = useState(0);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Mood tracker states
  const [mood, setMood] = useState('😌');
  const [notes, setNotes] = useState('');
  const [moodLogs, setMoodLogs] = useState(() => {
    const saved = localStorage.getItem('herverse-mood-logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), mood: '😌', notes: 'Had a quiet and productive yoga session.' },
      { id: '2', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), mood: '😇', notes: 'Felt very energized today!' }
    ];
  });

  // Sound board states
  const [playingSound, setPlayingSound] = useState(null); // ocean, rain, forest, white

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
    localStorage.setItem('herverse-mood-logs', JSON.stringify(updated));
    setLatestAnalysis(analysis);
    setNotes('');
  };

  const getBreathCircleScale = () => {
    if (!isBreathingActive) return 1;
    if (breathingState.includes('Inhale')) return 1.6;
    if (breathingState.includes('Hold')) return 1.6;
    return 1;
  };

  const sounds = [
    { id: 'ocean', name: 'Ocean Waves', description: 'Calming shore tides', icon: '🌊' },
    { id: 'rain', name: 'Deep Rainfall', description: 'Gentle storm showers', icon: '🌧️' },
    { id: 'forest', name: 'Zen Forest', description: 'Rustling trees & birds', icon: '🌳' },
    { id: 'white', name: 'White Noise', description: 'Steady static hum', icon: '💨' }
  ];

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

          {/* Sound Board */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Volume2 className="text-primary" size={22} /> Mindful Sound Board
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {sounds.map((sound) => (
                <button 
                  key={sound.id}
                  onClick={() => setPlayingSound(playingSound === sound.id ? null : sound.id)}
                  className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all-smooth ${playingSound === sound.id ? 'bg-primary/10 border-primary shadow-sm' : 'bg-white/80 border-primary/15 hover:bg-primary/5'}`}
                >
                  <span className="text-3xl">{sound.icon}</span>
                  <div className="text-sm font-bold">{sound.name}</div>
                  <div className="text-xs text-muted leading-tight">{sound.description}</div>
                  <div className="mt-2 text-primary">
                    {playingSound === sound.id ? <Pause size={18} /> : <Play size={18} />}
                  </div>
                </button>
              ))}
            </div>
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
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
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
    </motion.div>
  );
}
