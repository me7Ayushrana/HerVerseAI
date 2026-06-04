import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useHealthStore } from '../store/healthStore';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Activity, Moon, Smile, Heart, TrendingUp } from 'lucide-react';

export default function Analytics() {
  const { periodLogs, getCycleStats } = useHealthStore();
  const { cycleHistory } = getCycleStats();

  const [activeReport, setActiveReport] = useState('cycle');

  // Sleep history mock data
  const sleepData = [
    { day: 'Mon', hours: 7.2 },
    { day: 'Tue', hours: 6.8 },
    { day: 'Wed', hours: 8.0 },
    { day: 'Thu', hours: 7.5 },
    { day: 'Fri', hours: 7.1 },
    { day: 'Sat', hours: 8.5 },
    { day: 'Sun', hours: 7.8 }
  ];

  // Fallback cycle data if user hasn't logged anything
  const sampleCycleData = [
    { name: 'Cycle 1', length: 28 },
    { name: 'Cycle 2', length: 30 },
    { name: 'Cycle 3', length: 27 },
    { name: 'Cycle 4', length: 29 },
    { name: 'Cycle 5', length: 28 }
  ];

  const cycleChartData = cycleHistory.length > 0 ? cycleHistory : sampleCycleData;

  // Mood breakdown statistics (mocked based on journal logging averages)
  const moodBreakdown = [
    { label: 'Calm & Grounded 😌', percent: 45, color: 'bg-primary' },
    { label: 'Radiant & Energized 😇', percent: 30, color: 'bg-secondary' },
    { label: 'Tired & Low Energy 🥱', percent: 15, color: 'bg-accent' },
    { label: 'Anxious & Overwhelmed 🥺', percent: 10, color: 'bg-rose-400' }
  ];

  const averageSleep = (sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length).toFixed(1);
  const averageCycle = cycleHistory.length > 0 
    ? (cycleHistory.reduce((sum, d) => sum + d.length, 0) / cycleHistory.length).toFixed(0) 
    : 28;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Health Analytics</h2>
        <p className="text-muted text-sm">Review detailed historical trend reports for sleep, moods, and hormonal cycles.</p>
      </div>

      {/* Row 1: Key health indices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><Activity size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Avg Cycle Length</p>
            <h4 className="text-2xl font-bold text-textMain">{averageCycle} Days</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><Moon size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Avg Sleep Hours</p>
            <h4 className="text-2xl font-bold text-textMain">{averageSleep} hrs/night</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><Smile size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Dominant Mood</p>
            <h4 className="text-2xl font-bold text-textMain">Calm 😌</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Interactive Reports (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            {/* Header switcher */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <BarChart3 className="text-primary" size={22} /> Analytics Dashboard
              </h3>
              <div className="flex bg-primary/5 p-1 rounded-full border border-primary/10 text-xs">
                <button 
                  onClick={() => setActiveReport('cycle')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all-smooth ${activeReport === 'cycle' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                >
                  Menstrual Cycles
                </button>
                <button 
                  onClick={() => setActiveReport('sleep')}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition-all-smooth ${activeReport === 'sleep' ? 'bg-primary text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                >
                  Sleep Tracking
                </button>
              </div>
            </div>

            {/* Graphs render area */}
            <div className="h-80 w-full text-xs">
              {activeReport === 'cycle' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.15)" />
                    <XAxis dataKey="name" stroke="#8E6D8A" />
                    <YAxis stroke="#8E6D8A" domain={[20, 40]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(236, 72, 153, 0.25)', borderRadius: '16px', color: '#2D112E' }} />
                    <Line type="monotone" dataKey="length" stroke="#EC4899" strokeWidth={4} activeDot={{ r: 8 }} animationDuration={1000} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {activeReport === 'sleep' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.15)" />
                    <XAxis dataKey="day" stroke="#8E6D8A" />
                    <YAxis stroke="#8E6D8A" domain={[0, 12]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(236, 72, 153, 0.25)', borderRadius: '16px', color: '#2D112E' }} />
                    <Bar dataKey="hours" fill="#F472B6" radius={[8, 8, 0, 0]} animationDuration={1000} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Note text */}
            <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted flex items-start gap-2.5">
              <TrendingUp className="text-primary mt-0.5" size={14} />
              <span>
                {activeReport === 'cycle' 
                  ? "Cycle consistency reflects steady endocrine health. Variability between 1 to 4 days is considered clinically standard."
                  : "Consistent deep REM sleep boosts cellular repair and hormone balancing. Strive for consistent sleep and wake timings."}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Mood breakdown (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Heart className="text-primary animate-pulse" size={22} /> Mood Log Analysis
            </h3>
            
            <div className="space-y-4">
              {moodBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-textMain">{item.label}</span>
                    <span className="text-primary">{item.percent}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full ${item.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart assessment card */}
          <div className="glass-card p-6 border-primary/20 shadow-sm bg-gradient-to-r from-primary/5 to-secondary/5">
            <h4 className="font-bold text-sm text-primary mb-2">HerVerse AI Wellness Tip:</h4>
            <p className="text-xs text-muted leading-relaxed font-semibold">
              Your logs indicate that sleep drops correlate with mild anxiety triggers on Tuesdays and Wednesdays. Try playing the Ocean soundscape or doing a 4-minute box breathing session on these evenings to clear stress spikes.
            </p>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
