import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, ClipboardList, HelpCircle, Save, Sparkles, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function PCOSManager() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';
  const [isLoaded, setIsLoaded] = useState(false);

  // Screener state
  const [screenerStep, setScreenerStep] = useState(0); // 0 = start, 1 = Q1, 2 = Q2, 3 = Q3, 4 = Q4, 5 = Q5, 6 = result
  const [answers, setAnswers] = useState({});
  const [report, setReport] = useState(null);

  // Habits state
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-pcos-habits`);
    return saved ? JSON.parse(saved) : {
      lowGI: false,
      resistance: false,
      spearmint: false,
      cortisol: false,
      sleep8: false
    };
  });

  // Symptom logger state
  const [symptoms, setSymptoms] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-pcos-symptoms`);
    return saved ? JSON.parse(saved) : [
      { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), fatigue: 'Medium', acne: 'High', bloating: 'Low' }
    ];
  });

  const [fatigue, setFatigue] = useState('Low');
  const [acne, setAcne] = useState('Low');
  const [bloating, setBloating] = useState('Low');

  // Reload user data when userId changes
  useEffect(() => {
    setIsLoaded(false);
    const savedHabits = localStorage.getItem(`herverse-${userId}-pcos-habits`);
    setHabits(savedHabits ? JSON.parse(savedHabits) : {
      lowGI: false,
      resistance: false,
      spearmint: false,
      cortisol: false,
      sleep8: false
    });

    const savedSymptoms = localStorage.getItem(`herverse-${userId}-pcos-symptoms`);
    if (savedSymptoms) {
      setSymptoms(JSON.parse(savedSymptoms));
    } else {
      setSymptoms([
        { id: '1', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), fatigue: 'Medium', acne: 'High', bloating: 'Low' }
      ]);
    }
    setIsLoaded(true);
  }, [userId]);

  // Sync state changes with local storage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-pcos-habits`, JSON.stringify(habits));
    }
  }, [habits, userId, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-pcos-symptoms`, JSON.stringify(symptoms));
    }
  }, [symptoms, userId, isLoaded]);

  const questions = [
    {
      id: 'cycle',
      text: "How regular are your menstrual cycles?",
      options: [
        { text: "Very Regular (21-35 days)", score: 0 },
        { text: "Occasionally irregular or missed", score: 1 },
        { text: "Highly irregular or absent for months", score: 3 }
      ]
    },
    {
      id: 'acne',
      text: "Are you experiencing persistent acne or oily skin?",
      options: [
        { text: "No/Rarely", score: 0 },
        { text: "Mild/Seasonal", score: 1 },
        { text: "Moderate to severe cystic acne", score: 2 }
      ]
    },
    {
      id: 'hair',
      text: "Do you notice excess hair growth (facial, chest, or stomach) or thinning hair on the scalp?",
      options: [
        { text: "No", score: 0 },
        { text: "Yes, mild facial or body hair growth", score: 1 },
        { text: "Yes, notable facial hair or male-pattern scalp hair loss", score: 3 }
      ]
    },
    {
      id: 'weight',
      text: "Have you experienced sudden weight gain or extreme difficulty losing weight?",
      options: [
        { text: "No, weight is stable", score: 0 },
        { text: "Yes, hard to manage but controllable", score: 1 },
        { text: "Yes, rapid gain around the abdomen and highly resistant to dieting", score: 2 }
      ]
    },
    {
      id: 'cravings',
      text: "Do you experience fatigue, brain fog, or sweet cravings after high-carb meals?",
      options: [
        { text: "No, stable energy", score: 0 },
        { text: "Yes, occasional fatigue or sugar crashes", score: 1 },
        { text: "Yes, constant crashes indicating high insulin resistance", score: 2 }
      ]
    }
  ];

  const handleSelectOption = (qId, score) => {
    const updatedAnswers = { ...answers, [qId]: score };
    setAnswers(updatedAnswers);
    if (screenerStep < 5) {
      setScreenerStep(screenerStep + 1);
    } else {
      // Calculate score
      const totalScore = Object.values(updatedAnswers).reduce((a, b) => a + b, 0);
      let risk = "Low Risk";
      let recs = [];
      
      if (totalScore >= 7) {
        risk = "High Risk Indicator";
        recs = [
          "Schedule a consultation with an endocrinologist or OBGYN for blood panels (free/total testosterone, fasting insulin).",
          "Adopt a low glycemic load diet containing lean proteins and complex fiber to stabilize glucose spikes.",
          "Prioritize resistance exercise over long chronic cardio to preserve joint health and clear intramuscular glycogen."
        ];
      } else if (totalScore >= 3) {
        risk = "Moderate Risk Indicator";
        recs = [
          "Monitor cycle patterns over 60 days using the HerVerse Calendar.",
          "Integrate herbal support such as spearmint tea or inositol supplements.",
          "Focus on daily stress reduction habits like deep breathing to lower cortisol."
        ];
      } else {
        risk = "Low Risk Indicator";
        recs = [
          "Continue monitoring cycles annually.",
          "Maintain a balanced diet rich in leafy greens and regular physical movement."
        ];
      }

      setReport({ risk, score: totalScore, recommendations: recs });
      setScreenerStep(6);
    }
  };

  const handleResetScreener = () => {
    setAnswers({});
    setReport(null);
    setScreenerStep(0);
  };

  const handleLogSymptom = (e) => {
    e.preventDefault();
    const newLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      fatigue,
      acne,
      bloating
    };
    setSymptoms([newLog, ...symptoms]);
  };

  const toggleHabit = (key) => {
    setHabits({ ...habits, [key]: !habits[key] });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">PCOS/PCOD Manager</h2>
        <p className="text-muted text-sm">Understand and manage Polycystic Ovary Syndrome through smart indicators, wellness checklists, and symptom screeners.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Screener Quiz (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md min-h-[380px] flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ClipboardList className="text-primary" size={22} /> PCOS Risk Indicator Screener
              </h3>

              {screenerStep === 0 && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-textMain leading-relaxed">
                    This scientific questionnaire screens for potential signs of Polycystic Ovary Syndrome based on cycles, insulin response, and androgenic symptoms.
                  </p>
                  <p className="text-xs text-muted font-semibold bg-primary/5 p-3.5 rounded-xl border border-primary/10">
                    💡 *Note: This tool is for educational purposes and is not a medical diagnosis. Please consult a qualified endocrinologist.*
                  </p>
                  <button 
                    onClick={() => setScreenerStep(1)} 
                    className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth"
                  >
                    Start Screener
                  </button>
                </div>
              )}

              {screenerStep >= 1 && screenerStep <= 5 && (
                <div className="space-y-6">
                  <div className="w-full bg-primary/10 h-1.5 rounded-full">
                    <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${(screenerStep / 5) * 100}%` }} />
                  </div>
                  <h4 className="text-lg font-bold text-textMain">{questions[screenerStep - 1].text}</h4>
                  <div className="space-y-2">
                    {questions[screenerStep - 1].options.map((opt, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleSelectOption(questions[screenerStep - 1].id, opt.score)}
                        className="w-full text-left p-4 rounded-xl border border-primary/10 bg-white hover:bg-primary/5 hover:border-primary/25 transition-all-smooth text-sm font-semibold text-textMain"
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {screenerStep === 6 && report && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 bg-primary/10 border border-primary/30 p-4 rounded-2xl">
                    <ShieldAlert className="text-primary animate-pulse" size={28} />
                    <div>
                      <h4 className="font-bold text-primary">{report.risk}</h4>
                      <p className="text-xs text-muted">Screener Score: {report.score} / 12</p>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-sm text-textMain mb-2">Recommended Steps:</h5>
                    <ul className="space-y-2">
                      {report.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-textMain leading-relaxed">• {rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {screenerStep === 6 && (
              <button 
                onClick={handleResetScreener}
                className="w-full mt-6 py-2 bg-white border border-primary/25 rounded-xl text-primary font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw size={14} /> Retake Questionnaire
              </button>
            )}
          </div>

          {/* Daily habit list */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-primary animate-pulse" size={22} /> Daily PCOS Wellness Habits
            </h3>
            <div className="space-y-3">
              {[
                { id: 'lowGI', label: "Low GI Breakfast", desc: "Prioritize fats/protein in the morning to prevent glucose spikes." },
                { id: 'resistance', label: "Resistance Training (25m)", desc: "Build strength and burn glycogen to regulate insulin." },
                { id: 'spearmint', label: "Spearmint Tea (2 Cups)", desc: "Natural helper that clinical trials suggest reduces free testosterone." },
                { id: 'cortisol', label: "Cortisol-Reducing Breathwork", desc: "Lower stress triggers that aggravate ovarian cyst cycles." },
                { id: 'sleep8', label: "8-Hours Consistent Sleep", desc: "Regulate hormonal spikes and reduce brain fatigue." }
              ].map((habit) => (
                <button 
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full p-4 rounded-xl border text-left flex items-start gap-4 transition-all-smooth ${habits[habit.id] ? 'bg-primary/5 border-primary/30 shadow-inner' : 'bg-white/95 border-primary/10 hover:bg-primary/5'}`}
                >
                  <input 
                    type="checkbox" 
                    checked={habits[habit.id]} 
                    readOnly
                    className="rounded border-primary/30 text-primary mt-1 focus:ring-primary"
                  />
                  <div>
                    <p className={`text-sm font-bold ${habits[habit.id] ? 'line-through text-textMain/40' : 'text-textMain'}`}>{habit.label}</p>
                    <p className="text-xs text-muted leading-tight mt-0.5">{habit.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Symptom log (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ClipboardList className="text-primary" size={22} /> Daily Symptom Severity Log
            </h3>
            
            <form onSubmit={handleLogSymptom} className="space-y-4">
              {['Fatigue', 'Acne', 'Bloating'].map((sym) => {
                const val = sym === 'Fatigue' ? fatigue : sym === 'Acne' ? acne : bloating;
                const setVal = sym === 'Fatigue' ? setFatigue : sym === 'Acne' ? setAcne : setBloating;
                return (
                  <div key={sym}>
                    <label className="block text-xs uppercase font-bold text-muted mb-1.5">{sym} Level</label>
                    <div className="flex gap-2">
                      {['Low', 'Medium', 'High'].map((level) => (
                        <button 
                          key={level} 
                          type="button" 
                          onClick={() => setVal(level)}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all-smooth ${val === level ? 'bg-primary border-primary text-white shadow-sm' : 'bg-white border-primary/15 text-muted hover:bg-primary/5'}`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Daily Log
              </button>
            </form>
          </div>

          {/* Logs lists */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-textMain mb-4">Logged PCOS Indicators</h3>
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {symptoms.map((log, idx) => (
                <div key={log.id || idx} className="bg-white/95 border border-primary/10 rounded-xl p-3 shadow-sm text-xs">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-primary">
                      {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-primary/5 p-1 rounded border border-primary/10">
                      <p className="text-muted font-bold">Fatigue</p>
                      <p className="font-bold text-textMain mt-0.5">{log.fatigue}</p>
                    </div>
                    <div className="bg-primary/5 p-1 rounded border border-primary/10">
                      <p className="text-muted font-bold">Acne</p>
                      <p className="font-bold text-textMain mt-0.5">{log.acne}</p>
                    </div>
                    <div className="bg-primary/5 p-1 rounded border border-primary/10">
                      <p className="text-muted font-bold">Bloating</p>
                      <p className="font-bold text-textMain mt-0.5">{log.bloating}</p>
                    </div>
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
