import React from 'react';

const CONDITION_OPTIONS = [
  { id: 'pcos', label: 'PCOS / PCOD', desc: 'Addresses insulin resistance and high androgen levels.' },
  { id: 'thyroid', label: 'Hypothyroidism', desc: 'Supports metabolic energy conversion and iodine/selenium intake.' },
  { id: 'endometriosis', label: 'Endometriosis', desc: 'Focuses on highly anti-inflammatory, estrogen-balancing foods.' },
  { id: 'diabetes', label: 'Pre-Diabetes / Diabetes', desc: 'Maintains flat glycemic levels and stable insulin response.' },
  { id: 'none', label: 'No Specific Conditions', desc: 'Standard cycle-syncing support without endocrine overrides.' }
];

export default function Step7_HealthConditions({ formData, updateFields }) {
  const selectedConditions = formData.healthConditions || [];

  const handleToggle = (id) => {
    let next;
    if (id === 'none') {
      next = ['none'];
    } else {
      const active = selectedConditions.filter(c => c !== 'none');
      if (active.includes(id)) {
        next = active.filter(c => c !== id);
      } else {
        next = [...active, id];
      }
      if (next.length === 0) {
        next = ['none'];
      }
    }
    updateFields({ healthConditions: next });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Health & Endocrine Profile</h3>
        <p className="text-xs text-muted">Select any diagnosed conditions. We will adjust macros, micronutrient targets, and ingredients dynamically.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CONDITION_OPTIONS.map((opt) => {
          const isSelected = selectedConditions.includes(opt.id) || (opt.id === 'none' && selectedConditions.length === 0);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleToggle(opt.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-sm'
                  : 'bg-white/60 border-primary/10 hover:border-primary/30 hover:bg-white/90'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-sm text-textMain">{opt.label}</span>
                <span className="text-xs text-muted leading-relaxed">{opt.desc}</span>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'border-primary bg-primary text-white' : 'border-primary/35'
              }`}>
                {isSelected && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
