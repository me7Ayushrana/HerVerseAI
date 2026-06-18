import React from 'react';

const ACTIVITY_OPTIONS = [
  { id: 'sedentary', title: 'Sedentary', desc: 'Minimal physical activity, mostly sitting (desk job).' },
  { id: 'lightly_active', title: 'Lightly Active', desc: 'Light daily motion or structured exercise 1-3 times a week.' },
  { id: 'moderately_active', title: 'Moderately Active', desc: 'Active lifestyle or moderate training 3-5 times a week.' },
  { id: 'very_active', title: 'Very Active', desc: 'High physical output or intensive training 6-7 times a week.' }
];

export default function Step3_Activity({ formData, updateFields }) {
  const currentLevel = formData.activityLevel || 'sedentary';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Activity & Workouts</h3>
        <p className="text-xs text-muted">Tell us about your daily activity output to calibrate baseline metabolic energy.</p>
      </div>

      <div className="space-y-3">
        {ACTIVITY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => updateFields({ activityLevel: opt.id })}
            className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-1 cursor-pointer ${
              currentLevel === opt.id
                ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-sm'
                : 'bg-white/60 border-primary/10 hover:border-primary/30 hover:bg-white/90'
            }`}
          >
            <span className="font-bold text-sm text-textMain">{opt.title}</span>
            <span className="text-xs text-muted leading-relaxed">{opt.desc}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <label className="block text-xs font-bold text-muted uppercase mb-2">How many days a week do you intentionally exercise?</label>
        <select
          value={formData.exerciseDaysPerWeek || 0}
          onChange={e => updateFields({ exerciseDaysPerWeek: parseInt(e.target.value) || 0 })}
          className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain font-medium cursor-pointer"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map(day => (
            <option key={day} value={day}>{day} {day === 1 ? 'day' : 'days'} per week</option>
          ))}
        </select>
      </div>
    </div>
  );
}
