import React from 'react';

const GOAL_OPTIONS = [
  { id: 'hormone_balance', title: 'Hormone Balance', desc: 'Optimize nutrition for PCOS, thyroid health, or cycle regularity.' },
  { id: 'weight_loss', title: 'Healthy Weight Management (Loss)', desc: 'Gradually drop fat while maintaining muscular energy.' },
  { id: 'weight_gain', title: 'Nourish & Build (Gain)', desc: 'Increase healthy body mass and lean muscle structure.' },
  { id: 'metabolic_reset', title: 'Metabolic Reset', desc: 'Improve insulin sensitivity and steady blood glucose levels.' },
  { id: 'fertility_support', title: 'Fertility Support', desc: 'Enrich egg quality and prep the endometrial lining.' }
];

export default function Step2_Goal({ formData, updateFields }) {
  const currentGoal = formData.goal || 'hormone_balance';
  const showWeightTarget = currentGoal === 'weight_loss' || currentGoal === 'weight_gain';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Select Your Goal</h3>
        <p className="text-xs text-muted">Choose the primary focus area for your custom nutrition strategy.</p>
      </div>

      <div className="space-y-3">
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => updateFields({ goal: opt.id })}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-1 cursor-pointer ${
              currentGoal === opt.id
                ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-sm'
                : 'bg-white/60 border-primary/10 hover:border-primary/30 hover:bg-white/90'
            }`}
          >
            <span className="font-bold text-sm text-textMain">{opt.title}</span>
            <span className="text-xs text-muted leading-relaxed">{opt.desc}</span>
          </button>
        ))}
      </div>

      {showWeightTarget && (
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Target Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={formData.targetWeightKg || ''}
              onChange={e => updateFields({ targetWeightKg: parseFloat(e.target.value) || '' })}
              placeholder="e.g. 58.0"
              className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
              required={showWeightTarget}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Timeline (Weeks)</label>
            <input
              type="number"
              min="2"
              max="52"
              value={formData.timelineWeeks || ''}
              onChange={e => updateFields({ timelineWeeks: parseInt(e.target.value) || '' })}
              placeholder="e.g. 12"
              className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
              required={showWeightTarget}
            />
          </div>
        </div>
      )}
    </div>
  );
}
