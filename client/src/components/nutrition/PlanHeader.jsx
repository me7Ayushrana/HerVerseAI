import React from 'react';
import { RefreshCw, CalendarRange } from 'lucide-react';

export default function PlanHeader({ plan, onReset }) {
  if (!plan) return null;

  const getPhaseName = (phase) => {
    const phases = {
      menstrual: 'Menstrual Phase (Bleeding)',
      follicular: 'Follicular Phase (Preparation)',
      ovulatory: 'Ovulatory Phase (Peak)',
      luteal: 'Luteal Phase (PMS)'
    };
    return phases[phase.toLowerCase()] || phase;
  };

  return (
    <div className="glass-card p-6 border-primary/20 shadow-md space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full tracking-wider border border-primary/10">
              Active Diet Plan
            </span>
            <span className="text-[10px] uppercase bg-secondary/15 text-secondary font-bold px-2.5 py-0.5 rounded-full tracking-wider border border-secondary/10">
              Synced with {getPhaseName(plan.cyclePhase)}
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-extrabold text-gradient leading-tight">{plan.weekLabel || 'Cycle Balanced Plan'}</h2>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-bold text-muted hover:text-primary hover:bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5 flex items-center gap-1.5 transition-all-smooth"
        >
          <RefreshCw size={14} />
          <span>Reset & Rebuild Plan</span>
        </button>
      </div>

      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 space-y-2.5">
        <div>
          <h4 className="text-[10px] uppercase font-bold text-primary tracking-wider mb-0.5">Key Dietary Focus</h4>
          <p className="text-xs text-textMain leading-relaxed font-medium">{plan.keyFocusNote}</p>
        </div>
        {plan.cycleBenefitNote && (
          <div className="pt-2 border-t border-primary/5">
            <h4 className="text-[10px] uppercase font-bold text-secondary tracking-wider mb-0.5">Cycle Benefits</h4>
            <p className="text-xs text-textMain leading-relaxed font-medium">{plan.cycleBenefitNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
