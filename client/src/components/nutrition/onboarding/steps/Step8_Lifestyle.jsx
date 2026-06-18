import React from 'react';

const STRESS_LEVELS = [
  { id: 'low', label: 'Low Stress', desc: 'Calm, balanced routine, or effective coping strategies.' },
  { id: 'moderate', label: 'Moderate Stress', desc: 'Standard work/life load. Occasionally busy or tired.' },
  { id: 'high', label: 'High Stress', desc: 'Frequent pressure, low energy, or sleep disruption.' }
];

export default function Step8_Lifestyle({ formData, updateFields }) {
  const currentStress = formData.stressLevel || 'moderate';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Lifestyle & Circadian Sleep</h3>
        <p className="text-xs text-muted">Synchronizing eating times with your wake/sleep cycle optimizes digestion and endocrine stability.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Wake Up Time</label>
          <input
            type="time"
            value={formData.wakeTime || '07:00'}
            onChange={e => updateFields({ wakeTime: e.target.value })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Sleep Time</label>
          <input
            type="time"
            value={formData.sleepTime || '23:00'}
            onChange={e => updateFields({ sleepTime: e.target.value })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Daily Water Target (Liters)</label>
          <input
            type="number"
            min="1"
            max="10"
            step="0.5"
            value={formData.waterLiters || 2.0}
            onChange={e => updateFields({ waterLiters: parseFloat(e.target.value) || 2.0 })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Perceived Stress Level</label>
          <select
            value={currentStress}
            onChange={e => updateFields({ stressLevel: e.target.value })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain font-medium cursor-pointer"
          >
            {STRESS_LEVELS.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
