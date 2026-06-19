import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Droplet, Plus, RefreshCw, Trash2, Award, Sun, Moon, CalendarRange } from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import OnboardingShell from '../components/nutrition/onboarding/OnboardingShell';
import PlanHeader from '../components/nutrition/PlanHeader';
import WeekTabNav from '../components/nutrition/WeekTabNav';
import DayView from '../components/nutrition/DayView';
import MacroRing from '../components/nutrition/MacroRing';
import DownloadPlanButton from '../components/nutrition/DownloadPlanButton';
import LoadingOverlay from '../components/nutrition/LoadingOverlay';

export default function Nutrition() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';

  // Tab State: 'tracker' or 'plan'
  const [activeTab, setActiveTab] = useState('tracker');
  
  // AI Plan states
  const [activePlan, setActivePlan] = useState(() => {
    const saved = localStorage.getItem('herverse-cached-diet-plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeDayNumber, setActiveDayNumber] = useState(1);

  // Dark Mode state (synced with localStorage & document.documentElement)
  const [darkMode, setDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Calorie tracking states (original states preserved for compatibility)
  const calorieGoal = 1800;
  const [mealCategory, setMealCategory] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [foodLogs, setFoodLogs] = useState(() => {
    const saved = localStorage.getItem('herverse-food-logs');
    let logs = saved ? JSON.parse(saved) : [
      { id: '1', category: 'Breakfast', name: 'Avocado Toast with Egg', kcal: 320 },
      { id: '2', category: 'Lunch', name: 'Mediterranean Chickpea Salad', kcal: 480 }
    ];
    // Force migrate legacy items
    logs = logs.map(log => {
      if (log.name === 'Grilled Chicken Quinoa Salad') {
        return { ...log, name: 'Mediterranean Chickpea Salad', kcal: 480 };
      }
      return log;
    });
    return logs;
  });

  // Water tracking states (original states preserved)
  const waterGoal = 2500; // in ml
  const [waterLogged, setWaterLogged] = useState(() => {
    const saved = localStorage.getItem('herverse-water-logged');
    return saved ? Number(saved) : 1000;
  });

  // Fetch active plan on load
  useEffect(() => {
    const fetchActivePlan = async () => {
      setIsLoading(true);
      setLoadingMessage('Retrieving active cycle synced plan...');
      try {
        const response = await fetch(`/api/nutrition/get-active-plan?userId=${encodeURIComponent(userId)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.plan) {
            setActivePlan(data.plan);
            localStorage.setItem('herverse-cached-diet-plan', JSON.stringify(data.plan));
            setActiveTab('plan');
          }
        }
      } catch (err) {
        console.error('Failed to fetch plan:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivePlan();
  }, [userId]);

  // Sync state changes with local storage
  useEffect(() => {
    localStorage.setItem('herverse-food-logs', JSON.stringify(foodLogs));
  }, [foodLogs]);

  useEffect(() => {
    localStorage.setItem('herverse-water-logged', waterLogged.toString());
  }, [waterLogged]);

  const totalCalories = foodLogs.reduce((sum, log) => sum + log.kcal, 0);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('herverse-dark-mode', next.toString());
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    const newFood = {
      id: Date.now().toString(),
      category: mealCategory,
      name: foodName,
      kcal: Number(calories)
    };

    setFoodLogs([newFood, ...foodLogs]);
    setFoodName('');
    setCalories('');
  };

  const handleDeleteFood = (id) => {
    setFoodLogs(foodLogs.filter(f => f.id !== id));
  };

  const handleWaterClick = (amount) => {
    setWaterLogged(prev => Math.min(prev + amount, 4000));
  };

  const handleOnboardingComplete = async (formData, cyclePhase) => {
    setIsLoading(true);
    setLoadingMessage('Saving metrics and computing cycle-synced targets...');
    try {
      // 1. Save profile
      const saveResponse = await fetch('/api/nutrition/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profileData: formData })
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save nutrition profile metrics.');
      }

      setLoadingMessage('Compiling meal recommendations using smart references...');
      
      // 2. Generate plan
      const clientApiKey = localStorage.getItem('herverse-gemini-key') || '';
      const genResponse = await fetch('/api/nutrition/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cyclePhase, clientApiKey })
      });

      if (!genResponse.ok) {
        throw new Error('Failed to compile cycle synced diet plan.');
      }

      const genData = await genResponse.json();
      if (genData.success && genData.plan) {
        setActivePlan(genData.plan);
        localStorage.setItem('herverse-cached-diet-plan', JSON.stringify(genData.plan));
        setIsOnboardingOpen(false);
        setActiveTab('plan');
      } else {
        throw new Error(genData.message || 'Generation failed.');
      }
    } catch (err) {
      console.error('Onboarding flow error:', err);
      alert(err.message || 'Something went wrong, let\'s try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapMeal = async (mealId) => {
    try {
      const clientApiKey = localStorage.getItem('herverse-gemini-key') || '';
      const response = await fetch('/api/nutrition/regenerate-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mealId, clientApiKey })
      });

      if (!response.ok) {
        throw new Error('Meal swap failed on server.');
      }

      const data = await response.json();
      if (data.success && data.meal) {
        // Update local plan state
        const updatedDays = activePlan.days.map(day => {
          const updatedMeals = day.meals.map(m => {
            if (m.id === mealId || m._id === mealId || m._id?.toString() === mealId) {
              return { ...m, ...data.meal };
            }
            return m;
          });
          return { ...day, meals: updatedMeals };
        });

        const newPlan = {
          ...activePlan,
          days: updatedDays
        };

        setActivePlan(newPlan);
        localStorage.setItem('herverse-cached-diet-plan', JSON.stringify(newPlan));
      }
    } catch (err) {
      console.error('Swap meal error:', err);
      alert('Could not swap meal. Please try again.');
    }
  };

  const handleResetPlan = () => {
    setActivePlan(null);
    localStorage.removeItem('herverse-cached-diet-plan');
    setIsOnboardingOpen(true);
    setActiveTab('plan');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Loading Overlay */}
      {isLoading && <LoadingOverlay message={loadingMessage} />}

      {/* Title & Theme Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Nutrition & Meal Planner</h2>
          <p className="text-muted text-sm">Fuel your body intelligently. Track calories, hydrate, and align meals with your biological cycle.</p>
        </div>
        
        {/* Sun/Moon Theme Toggle */}
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 text-muted hover:text-primary transition-all-smooth flex items-center gap-2 text-xs font-bold shadow-sm"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} />}
          <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Top Tab Bar Switcher */}
      <div className="flex border-b border-primary/10 gap-6">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`pb-3 text-sm font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${
            activeTab === 'tracker' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'
          }`}
        >
          Daily Logs & Hydration
        </button>
        <button
          onClick={() => {
            setActiveTab('plan');
            if (!activePlan) {
              setIsOnboardingOpen(true);
            }
          }}
          className={`pb-3 text-sm font-bold border-b-2 transition-all-smooth uppercase tracking-wider ${
            activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-primary'
          }`}
        >
          AI Cycle synced Diet Plan
        </button>
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {activeTab === 'tracker' ? (
          <>
            {/* Left Column: Calorie Logger (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-card p-6 border-primary/20 shadow-md">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Apple className="text-primary" size={22} /> Daily Calorie Budget
                </h3>

                {/* Progress Meters */}
                <div className="grid grid-cols-3 gap-4 items-center mb-6 text-center">
                  <div>
                    <p className="text-2xl font-bold text-textMain">{calorieGoal}</p>
                    <p className="text-xs text-muted">Daily Target</p>
                  </div>
                  <div className="relative flex justify-center items-center">
                    <div className="w-28 h-28 rounded-full border-[8px] border-primary/10 border-t-primary border-r-primary flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gradient">{totalCalories}</span>
                      <span className="text-[10px] text-muted uppercase">Logged</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{Math.max(calorieGoal - totalCalories, 0)}</p>
                    <p className="text-xs text-muted">Calories Left</p>
                  </div>
                </div>

                {/* Add Food Form */}
                <form onSubmit={handleAddFood} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10 mb-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Meal</label>
                    <select 
                      value={mealCategory} 
                      onChange={e => setMealCategory(e.target.value)}
                      className="w-full bg-white border border-primary/15 rounded-xl px-2 py-2 text-sm text-textMain font-medium cursor-pointer"
                    >
                      <option>Breakfast</option>
                      <option>Lunch</option>
                      <option>Dinner</option>
                      <option>Snacks</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Food Item</label>
                    <input 
                      type="text" 
                      value={foodName} 
                      onChange={e => setFoodName(e.target.value)}
                      placeholder="e.g. Banana, Oats, Tofu"
                      className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-sm text-textMain"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-muted mb-1">Calories</label>
                    <div className="flex gap-2">
                      <input 
                        type="number" 
                        value={calories} 
                        onChange={e => setCalories(e.target.value)}
                        placeholder="kcal"
                        className="w-20 bg-white border border-primary/20 rounded-xl px-2 py-2 text-sm text-textMain"
                        required
                      />
                      <button type="submit" className="p-2 rounded-xl bg-primary text-white hover:opacity-95 shadow-sm active:scale-95 transition-all-smooth">
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </form>

                {/* Food Logs List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {foodLogs.length === 0 ? (
                    <p className="text-center text-sm text-muted py-6">No foods logged today yet.</p>
                  ) : (
                    foodLogs.map((log) => (
                      <div key={log.id} className="bg-white/95 border border-primary/10 rounded-xl p-3 flex justify-between items-center shadow-sm">
                        <div>
                          <span className="text-[10px] uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full mr-2">{log.category}</span>
                          <span className="text-sm font-semibold text-textMain">{log.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-textMain">{log.kcal} kcal</span>
                          <button onClick={() => handleDeleteFood(log.id)} className="text-muted hover:text-red-500 transition-colors p-1">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Hydration Widget (lg:col-span-5) */}
            <div className="lg:col-span-5">
              <div className="glass-card p-6 border-primary/20 shadow-md h-full flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[460px]">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 self-start">
                  <Droplet className="text-secondary animate-bounce" size={22} /> Water Intake Tracker
                </h3>
                <p className="text-xs text-muted max-w-xs mb-8 self-start text-left">Stay hydrated to combat fluid retention, support skin health, and smooth digestive cycles.</p>

                {/* Glass Visual */}
                <div className="relative w-36 h-56 border-[6px] border-primary/20 rounded-b-3xl border-t-0 flex flex-col justify-end overflow-hidden mb-8 shadow-inner bg-white/30">
                  <motion.div 
                    className="bg-secondary w-full rounded-b-2xl"
                    animate={{ height: `${Math.min((waterLogged / waterGoal) * 100, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center font-display font-extrabold z-10 text-textMain drop-shadow-sm">
                    <span className="text-3xl">{waterLogged}</span>
                    <span className="text-[10px] text-muted tracking-wider uppercase font-sans">/ {waterGoal} ml</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mb-6 w-full max-w-sm">
                  <button 
                    onClick={() => handleWaterClick(250)}
                    className="flex-1 py-3 rounded-xl bg-white border border-primary/20 text-sm font-bold text-primary hover:bg-primary/5 shadow-sm transition-all-smooth"
                  >
                    + 250ml
                  </button>
                  <button 
                    onClick={() => handleWaterClick(500)}
                    className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-95 shadow-md transition-all-smooth"
                  >
                    + 500ml
                  </button>
                </div>

                {/* Reset button */}
                <button 
                  onClick={() => setWaterLogged(0)}
                  className="text-xs text-muted hover:text-primary transition-colors flex items-center gap-1.5 font-semibold"
                >
                  <RefreshCw size={12} /> Reset Hydration Log
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Diet Plan Maker Tab */
          <div className="lg:col-span-12 w-full space-y-6">
            {isOnboardingOpen ? (
              <OnboardingShell onComplete={handleOnboardingComplete} />
            ) : activePlan ? (
              <div className="space-y-6">
                {/* PDF Container Wrapper */}
                <div id="nutrition-plan-pdf" className="space-y-6 p-4 rounded-3xl">
                  {/* Header info */}
                  <PlanHeader plan={activePlan} onReset={handleResetPlan} />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    {/* Donut Macro Charts */}
                    <div className="md:col-span-2">
                      <MacroRing
                        targetCalories={activePlan.targetCalories}
                        proteinG={activePlan.proteinG}
                        carbG={activePlan.carbG}
                        fatG={activePlan.fatG}
                      />
                    </div>

                    {/* Quick Cycle Syncing tips */}
                    <div className="glass-card p-6 border-primary/20 shadow-md flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Award size={14} />
                          <span>Cycle Synced Science</span>
                        </h4>
                        <p className="text-xs text-textMain leading-relaxed font-medium">
                          Your metabolic demands shift dynamically across phases. Estrogen levels modulate fat metabolism, while progesterone requires higher protein and steady complex starches.
                        </p>
                      </div>
                      <div className="pt-4 mt-4 border-t border-primary/5 flex items-center justify-between text-[10px] text-muted font-bold uppercase">
                        <span>Phase focused nutrition</span>
                        <CalendarRange size={14} className="text-secondary" />
                      </div>
                    </div>
                  </div>

                  {/* Day Navigation Tabs */}
                  <div className="flex justify-center md:justify-start pt-2">
                    <WeekTabNav activeDay={activeDayNumber} onChange={setActiveDayNumber} />
                  </div>

                  {/* Single Day meals list display */}
                  <DayView
                    day={activePlan.days.find(d => d.dayNumber === activeDayNumber)}
                    onSwapMeal={handleSwapMeal}
                  />
                </div>

                {/* PDF Download Button */}
                <div className="flex justify-end pr-4">
                  <DownloadPlanButton targetId="nutrition-plan-pdf" filename={`herverse-diet-${activePlan.cyclePhase}-plan.pdf`} />
                </div>
              </div>
            ) : (
              /* Onboarding CTA */
              <div className="max-w-2xl mx-auto glass-card p-8 border-primary/20 shadow-md text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-3xl">🌸</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-display font-extrabold text-gradient">AI Cycle-Synced Diet Plan Maker</h3>
                  <p className="text-sm text-muted leading-relaxed max-w-lg mx-auto">
                    Generate a personalized 7-day meal plan tailored to your biological cycle phase, physical metrics, weight goals, allergies, and diagnosed health conditions.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4">
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Cycle Syncing</h4>
                    <p className="text-[11px] text-muted leading-normal">Optimizes calories, macros, and micro-nutrients according to hormonal shifts.</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Condition Overrides</h4>
                    <p className="text-[11px] text-muted leading-normal">Supports management of diagnosed PCOS, Thyroid, or Endometriosis.</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-xl border border-primary/5">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Meal Swaps</h4>
                    <p className="text-[11px] text-muted leading-normal">Dynamically swap individual meals to generate fresh, nutritious alternatives.</p>
                  </div>
                </div>

                <div className="pt-6">
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-95 shadow-md shadow-primary/10 active:scale-95 transition-all cursor-pointer"
                  >
                    Start Diet Profile Onboarding
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
