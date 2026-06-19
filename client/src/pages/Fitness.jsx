import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Flame, CheckCircle, Plus, Calendar, Save, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Fitness() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';
  const [isLoaded, setIsLoaded] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('Follicular');
  const [completedExercises, setCompletedExercises] = useState({});
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-fitness-streak`);
    return saved ? Number(saved) : 3;
  });

  const [customType, setCustomType] = useState('Yoga');
  const [customDuration, setCustomDuration] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-workout-logs`);
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: 'Steady State Pilates', duration: 35, category: 'Luteal' },
      { id: '2', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), type: 'Bodyweight HIIT Circuit', duration: 25, category: 'Ovulation' }
    ];
  });

  // Reload user data when userId changes
  useEffect(() => {
    setIsLoaded(false);
    const savedStreak = localStorage.getItem(`herverse-${userId}-fitness-streak`);
    setStreak(savedStreak ? Number(savedStreak) : 3);

    const savedLogs = localStorage.getItem(`herverse-${userId}-workout-logs`);
    if (savedLogs) {
      setWorkoutLogs(JSON.parse(savedLogs));
    } else {
      setWorkoutLogs([
        { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), type: 'Steady State Pilates', duration: 35, category: 'Luteal' },
        { id: '2', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), type: 'Bodyweight HIIT Circuit', duration: 25, category: 'Ovulation' }
      ]);
    }
    setIsLoaded(true);
  }, [userId]);

  // Sync state changes with local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-workout-logs`, JSON.stringify(workoutLogs));
    }
  }, [workoutLogs, userId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-fitness-streak`, streak.toString());
    }
  }, [streak, userId, isLoaded]);

  const routines = {
    Menstrual: {
      title: "Restorative Flow & Stretching",
      intensity: "Low Intensity",
      duration: "20 Mins",
      focus: "Relieve cramping, lower back tension, and restore energy.",
      exercises: [
        { name: "Child's Pose Stretch", sets: "1 set", reps: "2 mins hold" },
        { name: "Cat-Cow Flow", sets: "2 sets", reps: "10 reps" },
        { name: "Supta Baddha Konasana (Reclined Butterfly)", sets: "1 set", reps: "5 mins" },
        { name: "Gentle Hamstring Stretch", sets: "2 sets", reps: "30s per leg" }
      ]
    },
    Follicular: {
      title: "HIIT & Muscle Building Interval",
      intensity: "High Intensity",
      duration: "30 Mins",
      focus: "Leverage rising estrogen to build lean muscle and burn fat.",
      exercises: [
        { name: "Goblet Squats", sets: "3 sets", reps: "12 reps" },
        { name: "Bodyweight Push-Ups", sets: "3 sets", reps: "10 reps" },
        { name: "Dumbbell Shoulder Press", sets: "3 sets", reps: "12 reps" },
        { name: "Mountain Climbers", sets: "3 sets", reps: "30 seconds" }
      ]
    },
    Ovulation: {
      title: "Peak Energy HIIT & Cardio Burn",
      intensity: "Max Intensity",
      duration: "25 Mins",
      focus: "Your strength and stamina are at their peak. Push your cardiovascular limits.",
      exercises: [
        { name: "Jump Squats", sets: "3 sets", reps: "45 seconds" },
        { name: "Kettlebell Swings", sets: "3 sets", reps: "15 reps" },
        { name: "Burpees", sets: "3 sets", reps: "10 reps" },
        { name: "Plank Jacks", sets: "3 sets", reps: "45 seconds" }
      ]
    },
    Luteal: {
      title: "Steady Sculpt & Core Pilates",
      intensity: "Moderate Intensity",
      duration: "35 Mins",
      focus: "Support recovery, burn fats as fuel, and build deep core strength.",
      exercises: [
        { name: "Pilates Hundred", sets: "1 set", reps: "100 pump breaths" },
        { name: "Donkey Kicks & Fire Hydrants", sets: "3 sets", reps: "15 per side" },
        { name: "Single Leg Stretch", sets: "3 sets", reps: "12 reps" },
        { name: "Side Plank Hold", sets: "2 sets", reps: "30s per side" }
      ]
    }
  };

  const handleToggleExercise = (routine, name) => {
    setCompletedExercises(prev => ({
      ...prev,
      [`${routine}-${name}`]: !prev[`${routine}-${name}`]
    }));
  };

  const handleLogRoutine = () => {
    const routineEx = routines[selectedCategory].exercises;
    const currentCategoryLogs = routineEx.map(ex => completedExercises[`${selectedCategory}-${ex.name}`]);
    const allDone = currentCategoryLogs.every(val => val === true);

    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: routines[selectedCategory].title,
      duration: parseInt(routines[selectedCategory].duration),
      category: selectedCategory
    };

    setWorkoutLogs([newLog, ...workoutLogs]);
    if (allDone) {
      setStreak(s => s + 1);
    }
    // Reset checks
    const cleaned = { ...completedExercises };
    routineEx.forEach(ex => {
      delete cleaned[`${selectedCategory}-${ex.name}`];
    });
    setCompletedExercises(cleaned);
  };

  const handleAddCustomWorkout = (e) => {
    e.preventDefault();
    if (!customDuration) return;
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      type: customType + (customNotes ? ` (${customNotes})` : ''),
      duration: Number(customDuration),
      category: 'Custom'
    };
    setWorkoutLogs([newLog, ...workoutLogs]);
    setCustomDuration('');
    setCustomNotes('');
  };

  const handleDeleteLog = (id) => {
    setWorkoutLogs(workoutLogs.filter(w => w.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Fitness & Workouts</h2>
          <p className="text-muted text-sm">Align workouts with your cycle phases to protect joints, regulate hormones, and optimize progress.</p>
        </div>
        <div className="glass-card px-6 py-3 rounded-full flex items-center gap-3 border-primary/20 shadow-sm animate-pulse">
          <Flame className="text-primary fill-primary" size={24} />
          <div>
            <p className="text-[10px] text-muted uppercase font-bold">Fitness Streak</p>
            <p className="font-extrabold text-primary text-lg">{streak} Days Active</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Routine Selector (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <div className="flex justify-between items-center mb-6 border-b border-primary/10 pb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Dumbbell className="text-primary" size={22} /> Cycle-Synced Routines
              </h3>
              <div className="flex bg-primary/5 p-1 rounded-full border border-primary/10">
                {['Menstrual', 'Follicular', 'Ovulation', 'Luteal'].map(ph => (
                  <button 
                    key={ph} 
                    onClick={() => setSelectedCategory(ph)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all-smooth ${selectedCategory === ph ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                  >
                    {ph}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xl font-bold text-primary">{routines[selectedCategory].title}</h4>
                  <p className="text-sm text-textMain/80 font-semibold mb-2">{routines[selectedCategory].focus}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs uppercase bg-primary/10 text-primary font-bold px-3 py-1 rounded-full block mb-1">{routines[selectedCategory].intensity}</span>
                  <span className="text-xs text-muted block font-semibold">{routines[selectedCategory].duration}</span>
                </div>
              </div>

              {/* Exercises check list */}
              <div className="space-y-2 pt-2">
                {routines[selectedCategory].exercises.map((ex, idx) => {
                  const checkKey = `${selectedCategory}-${ex.name}`;
                  const isChecked = !!completedExercises[checkKey];
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleToggleExercise(selectedCategory, ex.name)}
                      className={`w-full p-4 rounded-xl border flex items-center justify-between text-left transition-all-smooth ${isChecked ? 'bg-primary/5 border-primary/30 shadow-inner' : 'bg-white/90 border-primary/10 hover:bg-primary/5'}`}
                    >
                      <div>
                        <p className={`text-sm font-bold ${isChecked ? 'line-through text-textMain/40' : 'text-textMain'}`}>{ex.name}</p>
                        <p className="text-xs text-muted font-bold mt-0.5">{ex.sets} • {ex.reps}</p>
                      </div>
                      <CheckCircle size={20} className={isChecked ? 'text-primary fill-primary/10' : 'text-primary/20'} />
                    </button>
                  );
                })}
              </div>

              <button 
                onClick={handleLogRoutine}
                className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth"
              >
                Log Routine & Track Streak
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Workouts & Logs (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Calendar className="text-primary" size={22} /> Log a Custom Workout
            </h3>

            <form onSubmit={handleAddCustomWorkout} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-bold text-muted mb-1">Workout Type</label>
                  <select 
                    value={customType} 
                    onChange={e => setCustomType(e.target.value)}
                    className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain font-medium cursor-pointer"
                  >
                    <option>Yoga</option>
                    <option>Pilates</option>
                    <option>HIIT</option>
                    <option>Cardio Walk</option>
                    <option>Strength</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase font-bold text-muted mb-1">Duration (Mins)</label>
                  <input 
                    type="number" 
                    value={customDuration} 
                    onChange={e => setCustomDuration(e.target.value)}
                    placeholder="e.g. 30"
                    required
                    className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Notes (Optional)</label>
                <input 
                  type="text" 
                  value={customNotes} 
                  onChange={e => setCustomNotes(e.target.value)}
                  placeholder="e.g. Felt powerful, tracked high energy"
                  className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-2"
              >
                <Save size={18} /> Log Workout
              </button>
            </form>
          </div>

          {/* Workout History */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-textMain mb-4">Workout Log History</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {workoutLogs.map((log) => (
                <div key={log.id} className="bg-white/95 border border-primary/10 rounded-xl p-3 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mr-2 bg-primary/10 text-primary">{log.category}</span>
                    <span className="text-sm font-semibold text-textMain">{log.type}</span>
                    <p className="text-[10px] text-muted font-bold mt-1">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {log.duration} Mins
                    </p>
                  </div>
                  <button onClick={() => handleDeleteLog(log.id)} className="text-muted hover:text-red-500 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
