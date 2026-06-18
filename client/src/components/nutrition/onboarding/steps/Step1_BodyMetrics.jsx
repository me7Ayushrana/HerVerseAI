import React from 'react';

export default function Step1_BodyMetrics({ formData, updateFields }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Body Metrics</h3>
        <p className="text-xs text-muted">Please provide your basic physical details to help calculate your energy requirements.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Age (years)</label>
          <input
            type="number"
            min="10"
            max="120"
            value={formData.age || ''}
            onChange={e => updateFields({ age: parseInt(e.target.value) || '' })}
            placeholder="e.g. 28"
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="250"
              step="0.1"
              value={formData.weightKg || ''}
              onChange={e => updateFields({ weightKg: parseFloat(e.target.value) || '' })}
              placeholder="e.g. 62.5"
              className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted uppercase mb-2">Height (cm)</label>
            <input
              type="number"
              min="100"
              max="250"
              value={formData.heightCm || ''}
              onChange={e => updateFields({ heightCm: parseInt(e.target.value) || '' })}
              placeholder="e.g. 165"
              className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
}
