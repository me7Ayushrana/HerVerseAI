import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useHealthStore } from '../store/healthStore';
import { getCyclePhase } from '../utils/periodCalc';
import { format, isValid, parseISO } from 'date-fns';

const SYMPTOMS_LIST = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood Swings', 'Acne', 'Back Pain', 'Nausea', 'Cravings', 'Tender Breasts'];

export default function PeriodTracker() {
  const { periodLogs, addPeriodLog, getCycleStats } = useHealthStore();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    flow: 'Moderate',
    symptoms: [],
    notes: ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom) 
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.startDate) return;
    addPeriodLog(formData);
    setFormData({ startDate: '', endDate: '', flow: 'Moderate', symptoms: [], notes: '' });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const latestPeriod = periodLogs.length > 0 ? periodLogs[0].startDate : null;
  const { averageLength, cycleHistory } = getCycleStats();
  const cycleInfo = getCyclePhase(latestPeriod, averageLength);

  // AI Insights Generation
  const aiInsights = useMemo(() => {
    if (periodLogs.length === 0) return "Log your first period to start receiving insights.";
    let msg = cycleInfo.description;
    
    if (cycleHistory.length > 0) {
      const latestCycleLen = cycleHistory[cycleHistory.length - 1].length;
      if (latestCycleLen >= 21 && latestCycleLen <= 35) {
        msg += " Your cycle is currently regular and falls within a healthy range! Keep up the good work.";
      } else {
        msg += ` Your latest cycle was ${latestCycleLen} days, which is slightly irregular. If this persists, consider consulting a healthcare provider.`;
      }
    }
    return msg;
  }, [periodLogs.length, cycleInfo.description, cycleHistory]);

  // Dynamic 3D properties
  const get3DProps = () => {
    switch(cycleInfo.phase) {
      case 'Menstrual': return { distort: 0.6, speed: 3, color: '#F472B6', wireframe: true }; // High activity, shedding
      case 'Follicular': return { distort: 0.3, speed: 2, color: '#818CF8', wireframe: false }; // Growing, calmer
      case 'Ovulation': return { distort: 0.2, speed: 4, color: '#FBBF24', wireframe: false }; // Pulsing fast
      case 'Luteal': return { distort: 0.4, speed: 1.5, color: '#C084FC', wireframe: false }; // Stable but slightly distorted
      default: return { distort: 0.3, speed: 2, color: '#C084FC', wireframe: false };
    }
  };

  const modelProps = get3DProps();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8"
    >
      <h2 className="text-3xl font-display font-bold mb-6">Period Tracker</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form & History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold mb-4">Log Your Period</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-textMain font-medium mb-1">Start Date *</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm text-textMain font-medium mb-1">End Date (Optional)</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-2 text-textMain focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm text-textMain font-medium mb-2">Flow Intensity</label>
                <div className="flex gap-2">
                  {['Spotting', 'Light', 'Moderate', 'Heavy'].map(flow => (
                    <button key={flow} type="button" onClick={() => setFormData({...formData, flow})} className={`px-4 py-2 rounded-xl text-sm transition-all-smooth border ${formData.flow === flow ? 'bg-primary text-white font-bold border-primary shadow-sm' : 'bg-white/80 text-muted hover:bg-primary/5 hover:text-primary border-primary/20'}`}>
                      {flow}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-textMain font-medium mb-2">Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS_LIST.map(s => (
                    <button key={s} type="button" onClick={() => handleSymptomToggle(s)} className={`px-3 py-1 rounded-full text-xs border transition-all-smooth ${formData.symptoms.includes(s) ? 'bg-primary border-primary text-white shadow-sm font-semibold' : 'border-primary/25 bg-white/80 text-muted hover:bg-primary/5 hover:text-primary'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-textMain font-medium mb-1">Notes</label>
                <textarea rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-white border border-primary/20 rounded-xl px-4 py-2 text-textMain focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none resize-none transition-all" placeholder="How are you feeling today?"></textarea>
              </div>

              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-[0.99] glow-hover transition-all-smooth relative overflow-hidden">
                {saveSuccess ? 'Log Saved Successfully!' : 'Save Log'}
              </button>
            </form>
          </div>
          
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold mb-4 text-primary text-lg">AI Insights & Cycle Health</h3>
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/25 shadow-inner">
              <p className="text-sm leading-relaxed text-textMain">
                {aiInsights}
              </p>
              {cycleInfo.nextPeriod && isValid(cycleInfo.nextPeriod) && (
                <p className="mt-2 text-sm font-bold text-textMain">
                  Next predicted start: <span className="text-primary font-extrabold">{format(cycleInfo.nextPeriod, 'MMMM d, yyyy')}</span>
                </p>
              )}
            </div>
          </div>

          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold mb-4 text-textMain">Recent Logs</h3>
            {periodLogs.length === 0 ? (
              <p className="text-sm text-muted">No periods logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {periodLogs.slice(0, 3).map((log, index) => (
                  <li key={log.id || index} className="bg-white/95 border border-primary/15 shadow-sm rounded-xl p-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-primary">
                        {log.startDate && isValid(parseISO(log.startDate)) 
                          ? format(parseISO(log.startDate), 'MMM d, yyyy') 
                          : 'Unknown Date'}
                      </span>
                      <span className="text-muted ml-2">({log.flow || 'Moderate'} flow)</span>
                    </div>
                    {log.symptoms && log.symptoms.length > 0 && (
                      <span className="text-xs text-muted truncate max-w-[150px] font-medium">{log.symptoms.join(', ')}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Column: 3D Visuals & Charts */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 h-80 flex flex-col relative overflow-hidden border-primary/20 shadow-sm">
            <h3 className="font-bold text-textMain mb-2 z-10">3D Cycle Visualization</h3>
            <div className="absolute inset-0 top-12 z-0">
              <Canvas camera={{ position: [0, 0, 4] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} color={modelProps.color} />
                <Sphere key={cycleInfo.phase} args={[1.2, 64, 64]}>
                  <MeshDistortMaterial color={modelProps.color} attach="material" distort={modelProps.distort} speed={modelProps.speed} roughness={0.2} wireframe={modelProps.wireframe} />
                </Sphere>
                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
              </Canvas>
            </div>
            <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-xl bg-white/90 backdrop-blur-md border border-primary/20 text-center text-sm text-textMain flex justify-between items-center shadow-md">
              <span className="font-medium">Phase: <span className="font-bold" style={{color: cycleInfo.color}}>{cycleInfo.phase}</span></span>
              <span className="font-bold text-primary">Day {cycleInfo.dayOfCycle}</span>
            </div>
          </div>

          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <h3 className="font-bold text-textMain mb-4">Cycle Length History (Days)</h3>
            <div className="h-60 w-full text-xs">
              {cycleHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.15)" />
                    <XAxis dataKey="name" stroke="#8E6D8A" />
                    <YAxis stroke="#8E6D8A" domain={[15, 50]} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(236, 72, 153, 0.25)', borderRadius: '16px', color: '#2D112E' }} />
                    <ReferenceLine y={28} stroke="#10B981" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg 28', fill: '#10B981', fontSize: 10, fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="length" stroke="#EC4899" strokeWidth={3} activeDot={{ r: 8 }} animationDuration={1500} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted">
                  Log at least two periods to see your cycle trends.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
