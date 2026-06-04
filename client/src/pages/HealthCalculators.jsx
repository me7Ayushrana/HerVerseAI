import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Award, Activity, Heart, Info, RefreshCw, Droplet } from 'lucide-react';

export default function HealthCalculators() {
  const [activeTab, setActiveTab] = useState('bmi'); // bmi, calorie, water

  // BMI States
  const [unitSystem, setUnitSystem] = useState('metric'); // metric, imperial
  const [heightCm, setHeightCm] = useState('165');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('5');
  const [weightKg, setWeightKg] = useState('60');
  const [weightLbs, setWeightLbs] = useState('130');
  const [age, setAge] = useState('25');
  const [bmiResult, setBmiResult] = useState(null);

  // Calorie States
  const [calWeight, setCalWeight] = useState('60');
  const [calHeight, setCalHeight] = useState('165');
  const [calAge, setCalAge] = useState('25');
  const [activity, setActivity] = useState('1.375'); // Multipliers: 1.2, 1.375, 1.55, 1.725
  const [fitnessGoal, setFitnessGoal] = useState('lose'); // lose, maintain, gain
  const [calorieResult, setCalorieResult] = useState(null);

  // Water States
  const [waterWeight, setWaterWeight] = useState('60');
  const [exerciseMin, setExerciseMin] = useState('30');
  const [waterResult, setWaterResult] = useState(null);

  // Calculations
  const calculateBMI = (e) => {
    e.preventDefault();
    let bmiVal = 0;
    let heightVal = 0;
    let weightVal = 0;

    if (unitSystem === 'metric') {
      heightVal = Number(heightCm) / 100;
      weightVal = Number(weightKg);
      if (heightVal > 0) {
        bmiVal = weightVal / (heightVal * heightVal);
      }
    } else {
      const inches = Number(heightFt) * 12 + Number(heightIn);
      weightVal = Number(weightLbs);
      if (inches > 0) {
        bmiVal = (weightVal * 703) / (inches * inches);
      }
    }

    let category = '';
    let recommendation = '';
    if (bmiVal < 18.5) {
      category = 'Underweight';
      recommendation = 'Focus on a nutrient-dense caloric surplus, high-quality proteins, and resistance training to safely build muscle mass.';
    } else if (bmiVal < 25) {
      category = 'Normal weight';
      recommendation = 'Perfect! Maintain your current balanced lifestyle, focusing on micro-nutrients and consistent cardiovascular wellness.';
    } else if (bmiVal < 30) {
      category = 'Overweight';
      recommendation = 'Consider a moderate caloric deficit, portion control, low-GI foods, and increasing active recovery walks (10,000 steps daily).';
    } else {
      category = 'Obese';
      recommendation = 'Consult a specialist for an integrated metabolic check. Focus on steady strength exercises, low glycemic nutrition, and tracking cardiovascular minutes.';
    }

    setBmiResult({
      score: bmiVal.toFixed(1),
      category,
      recommendation
    });
  };

  const calculateCalorie = (e) => {
    e.preventDefault();
    const w = Number(calWeight);
    const h = Number(calHeight);
    const a = Number(calAge);

    // Harris-Benedict Formula for Women
    const bmr = 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a);
    const tdee = bmr * Number(activity);

    let targetCal = tdee;
    if (fitnessGoal === 'lose') targetCal = tdee - 400;
    if (fitnessGoal === 'gain') targetCal = tdee + 300;

    // Macro breakdowns
    // Protein: 30%, Carbs: 45%, Fats: 25%
    const proteinG = (targetCal * 0.30) / 4;
    const carbsG = (targetCal * 0.45) / 4;
    const fatsG = (targetCal * 0.25) / 9;

    setCalorieResult({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      target: Math.round(targetCal),
      protein: Math.round(proteinG),
      carbs: Math.round(carbsG),
      fats: Math.round(fatsG)
    });
  };

  const calculateWater = (e) => {
    e.preventDefault();
    const w = Number(waterWeight);
    const ex = Number(exerciseMin);

    // Baseline hydration: weight in kg * 35 ml
    // Plus 350ml fluid replenishment for every 30 mins active exercise
    const ml = (w * 35) + (ex / 30) * 350;

    setWaterResult(Math.round(ml));
  };

  const resetBMI = () => {
    setBmiResult(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Health Calculators</h2>
        <p className="text-muted text-sm">Interactive health tools to compute BMI indices, daily energy budgets, and fluid requirements.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-primary/10 overflow-x-auto scrollbar-hide text-xs">
        {[
          { id: 'bmi', name: 'BMI Calculator', icon: Calculator },
          { id: 'calorie', name: 'Calorie & BMR', icon: Activity },
          { id: 'water', name: 'Water Intake', icon: Droplet }
        ].map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setActiveTab(tab.id)} 
            className={`flex-1 py-4 px-2 font-bold uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === tab.id ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted hover:text-primary'}`}
          >
            <tab.icon size={16} />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* BMI Tab */}
          {activeTab === 'bmi' && (
            <motion.div key="bmi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="glass-card p-6 border-primary/20 shadow-md">
                <h3 className="font-bold text-lg mb-4 text-gradient">Body Mass Index (BMI)</h3>
                
                {!bmiResult ? (
                  <form onSubmit={calculateBMI} className="space-y-4">
                    {/* Unit System */}
                    <div className="flex bg-primary/5 p-1 rounded-full border border-primary/10 max-w-xs mb-4">
                      <button 
                        type="button"
                        onClick={() => setUnitSystem('metric')}
                        className={`flex-1 py-1 rounded-full text-xs font-bold transition-all-smooth ${unitSystem === 'metric' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                      >
                        Metric (cm/kg)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setUnitSystem('imperial')}
                        className={`flex-1 py-1 rounded-full text-xs font-bold transition-all-smooth ${unitSystem === 'imperial' ? 'bg-primary text-white shadow-sm' : 'text-muted'}`}
                      >
                        Imperial (ft/in/lb)
                      </button>
                    </div>

                    {unitSystem === 'metric' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs uppercase font-bold text-muted mb-1">Height (cm)</label>
                          <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-muted mb-1">Weight (kg)</label>
                          <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs uppercase font-bold text-muted mb-1">Height (Feet)</label>
                            <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                          </div>
                          <div>
                            <label className="block text-xs uppercase font-bold text-muted mb-1">Height (Inches)</label>
                            <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase font-bold text-muted mb-1">Weight (lbs)</label>
                          <input type="number" value={weightLbs} onChange={e => setWeightLbs(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs uppercase font-bold text-muted mb-1">Age (Years)</label>
                      <input type="number" value={age} onChange={e => setAge(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain max-w-xs" />
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth">
                      Calculate BMI Index
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-display font-extrabold text-3xl shadow-inner border border-primary/20">
                      {bmiResult.score}
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-textMain">{bmiResult.category}</h4>
                      <p className="text-xs text-muted font-semibold mt-1">Classification Range</p>
                    </div>

                    <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-sm text-textMain leading-relaxed text-left flex gap-3 max-w-lg mx-auto">
                      <Info className="text-primary flex-shrink-0 mt-0.5" size={18} />
                      <p>{bmiResult.recommendation}</p>
                    </div>

                    <button 
                      onClick={resetBMI}
                      className="py-2.5 px-6 bg-white border border-primary/25 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 mx-auto text-xs"
                    >
                      <RefreshCw size={12} /> Recalculate BMI
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Calorie/BMR Tab */}
          {activeTab === 'calorie' && (
            <motion.div key="calorie" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="glass-card p-6 border-primary/20 shadow-md">
                <h3 className="font-bold text-lg mb-4 text-gradient">Calorie & BMR Budget</h3>

                {!calorieResult ? (
                  <form onSubmit={calculateCalorie} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-muted mb-1">Weight (kg)</label>
                        <input type="number" value={calWeight} onChange={e => setCalWeight(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold text-muted mb-1">Height (cm)</label>
                        <input type="number" value={calHeight} onChange={e => setCalHeight(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold text-muted mb-1">Age</label>
                        <input type="number" value={calAge} onChange={e => setCalAge(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-muted mb-1">Activity Level</label>
                      <select 
                        value={activity} 
                        onChange={e => setActivity(e.target.value)}
                        className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain font-medium cursor-pointer"
                      >
                        <option value="1.2">Sedentary (Little/no exercise)</option>
                        <option value="1.375">Lightly Active (Exercise 1-3 days/wk)</option>
                        <option value="1.55">Moderately Active (Exercise 3-5 days/wk)</option>
                        <option value="1.725">Very Active (Hard exercise 6-7 days/wk)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-bold text-muted mb-1">Fitness Goal</label>
                      <select 
                        value={fitnessGoal} 
                        onChange={e => setFitnessGoal(e.target.value)}
                        className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain font-medium cursor-pointer"
                      >
                        <option value="lose">Fat Loss (Moderate Calorie Deficit)</option>
                        <option value="maintain">Maintain Weight (TDEE budget)</option>
                        <option value="gain">Lean Bulking (Calorie Surplus)</option>
                      </select>
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth">
                      Calculate Calorie Needs
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center items-center">
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <p className="text-xl font-bold text-textMain">{calorieResult.bmr}</p>
                        <p className="text-[10px] text-muted uppercase font-bold">BMR (Rest kcal)</p>
                      </div>
                      <div className="bg-primary/10 p-5 rounded-2xl border border-primary/25 shadow-sm scale-105">
                        <p className="text-2xl font-extrabold text-primary">{calorieResult.target}</p>
                        <p className="text-[10px] text-primary uppercase font-extrabold mt-0.5">Target Daily kcal</p>
                      </div>
                      <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                        <p className="text-xl font-bold text-textMain">{calorieResult.tdee}</p>
                        <p className="text-[10px] text-muted uppercase font-bold">TDEE (Active kcal)</p>
                      </div>
                    </div>

                    {/* Macro splits */}
                    <div className="border-t border-primary/10 pt-6">
                      <h4 className="font-bold text-sm text-textMain mb-4 flex items-center gap-1.5"><Heart size={16} className="text-primary" /> Daily Macro Breakdown:</h4>
                      
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-white border border-primary/15 rounded-2xl shadow-sm">
                          <p className="text-lg font-bold text-primary">{calorieResult.protein}g</p>
                          <p className="text-[10px] text-muted uppercase font-bold">Protein (30%)</p>
                        </div>
                        <div className="p-3 bg-white border border-primary/15 rounded-2xl shadow-sm">
                          <p className="text-lg font-bold text-secondary">{calorieResult.carbs}g</p>
                          <p className="text-[10px] text-muted uppercase font-bold">Carbs (45%)</p>
                        </div>
                        <div className="p-3 bg-white border border-primary/15 rounded-2xl shadow-sm">
                          <p className="text-lg font-bold text-accent">{calorieResult.fats}g</p>
                          <p className="text-[10px] text-muted uppercase font-bold">Fats (25%)</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setCalorieResult(null)}
                      className="py-2.5 px-6 bg-white border border-primary/25 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 mx-auto text-xs"
                    >
                      <RefreshCw size={12} /> Recalculate Calories
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Water Intake Tab */}
          {activeTab === 'water' && (
            <motion.div key="water" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="glass-card p-6 border-primary/20 shadow-md">
                <h3 className="font-bold text-lg mb-4 text-gradient font-display">Fluid Requirements</h3>

                {!waterResult ? (
                  <form onSubmit={calculateWater} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs uppercase font-bold text-muted mb-1">Body Weight (kg)</label>
                        <input type="number" value={waterWeight} onChange={e => setWaterWeight(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                      </div>
                      <div>
                        <label className="block text-xs uppercase font-bold text-muted mb-1">Daily Exercise (Mins)</label>
                        <input type="number" value={exerciseMin} onChange={e => setExerciseMin(e.target.value)} required className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain" />
                      </div>
                    </div>

                    <button type="submit" className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth">
                      Calculate Water Target
                    </button>
                  </form>
                ) : (
                  <div className="space-y-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-secondary/15 flex items-center justify-center mx-auto text-secondary font-display font-extrabold text-2xl shadow-inner border border-secondary/20">
                      {waterResult} ml
                    </div>

                    <div>
                      <h4 className="text-xl font-bold text-textMain">Ideal Daily Hydration</h4>
                      <p className="text-xs text-muted font-semibold mt-1">Based on weight & active exercise minutes</p>
                    </div>

                    <button 
                      onClick={() => setWaterResult(null)}
                      className="py-2.5 px-6 bg-white border border-primary/25 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5 mx-auto text-xs"
                    >
                      <RefreshCw size={12} /> Recalculate Water
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}
