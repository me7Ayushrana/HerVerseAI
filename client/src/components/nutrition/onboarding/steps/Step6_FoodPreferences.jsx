import React from 'react';

const ALLERGY_OPTIONS = [
  { id: 'nuts', label: 'Nuts' },
  { id: 'gluten', label: 'Gluten' },
  { id: 'soy', label: 'Soy' },
  { id: 'dairy', label: 'Dairy' },
  { id: 'eggs', label: 'Eggs' },
  { id: 'seafood', label: 'Seafood' }
];

const INTOLERANCE_OPTIONS = [
  { id: 'lactose', label: 'Lactose' },
  { id: 'fructose', label: 'Fructose' },
  { id: 'histamine', label: 'Histamine' }
];

export default function Step6_FoodPreferences({ formData, updateFields }) {
  const selectedAllergies = formData.allergies || [];
  const selectedIntolerances = formData.intolerances || [];

  const supplements = formData.supplements || {
    proteinPowder: {
      active: false,
      name: '',
      proteinPer100g: '',
      carbsPer100g: '',
      fatPer100g: '',
      gramsPerDay: '',
      timing: 'Morning'
    },
    others: []
  };

  const handleToggleAllergy = (id) => {
    let next;
    if (selectedAllergies.includes(id)) {
      next = selectedAllergies.filter(a => a !== id);
    } else {
      next = [...selectedAllergies, id];
    }
    updateFields({ allergies: next });
  };

  const handleToggleIntolerance = (id) => {
    let next;
    if (selectedIntolerances.includes(id)) {
      next = selectedIntolerances.filter(i => i !== id);
    } else {
      next = [...selectedIntolerances, id];
    }
    updateFields({ intolerances: next });
  };

  const updateSupplements = (fields) => {
    updateFields({
      supplements: {
        ...supplements,
        ...fields
      }
    });
  };

  const updateProteinPowder = (fields) => {
    updateFields({
      supplements: {
        ...supplements,
        proteinPowder: {
          ...supplements.proteinPowder,
          ...fields
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Allergies & Food Exclusions</h3>
        <p className="text-xs text-muted">Exclude ingredients you cannot tolerate or prefer to avoid in your meals.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted uppercase mb-3">Allergies</label>
        <div className="grid grid-cols-3 gap-2">
          {ALLERGY_OPTIONS.map((opt) => {
            const isSelected = selectedAllergies.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleToggleAllergy(opt.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-white/60 border-primary/15 text-muted hover:border-primary/30 hover:bg-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted uppercase mb-3">Intolerances</label>
        <div className="grid grid-cols-3 gap-2">
          {INTOLERANCE_OPTIONS.map((opt) => {
            const isSelected = selectedIntolerances.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleToggleIntolerance(opt.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary border-primary text-white shadow-sm'
                    : 'bg-white/60 border-primary/15 text-muted hover:border-primary/30 hover:bg-white'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Foods to Avoid</label>
          <input
            type="text"
            value={(formData.avoidFoods || []).join(', ')}
            onChange={e => updateFields({ avoidFoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="e.g. eggplants, bell peppers"
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Preferred Foods</label>
          <input
            type="text"
            value={(formData.preferredFoods || []).join(', ')}
            onChange={e => updateFields({ preferredFoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="e.g. spinach, paneer, oats"
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain"
          />
        </div>
      </div>

      {/* Supplements Section */}
      <div className="pt-4 border-t border-primary/10 space-y-4">
        <div>
          <h4 className="font-bold text-sm text-textMain">Do you take any supplements?</h4>
          <p className="text-xs text-muted">Include any protein powders or daily pills so we can adjust your macros and timing.</p>
        </div>

        {/* Protein Powder Toggle */}
        <label className="flex items-center gap-3 bg-white/60 p-3.5 rounded-xl border border-primary/10 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={supplements.proteinPowder?.active || false}
            onChange={e => updateProteinPowder({ active: e.target.checked })}
            className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-primary/30"
          />
          <span className="text-xs font-bold text-textMain">I use protein powder / high-protein oats</span>
        </label>

        {/* Protein Powder Details */}
        {supplements.proteinPowder?.active && (
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 space-y-3 animate-fadeIn">
            <div>
              <label className="block text-[10px] uppercase font-bold text-muted mb-1">Brand or product name</label>
              <input
                type="text"
                value={supplements.proteinPowder.name || ''}
                onChange={e => updateProteinPowder({ name: e.target.value })}
                placeholder="e.g. MyFitness Peanut Butter Whey"
                className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain"
                required
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Protein per 100g</label>
                <input
                  type="number"
                  value={supplements.proteinPowder.proteinPer100g || ''}
                  onChange={e => updateProteinPowder({ proteinPer100g: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 26"
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Carbs per 100g</label>
                <input
                  type="number"
                  value={supplements.proteinPowder.carbsPer100g || ''}
                  onChange={e => updateProteinPowder({ carbsPer100g: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 12"
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">Fat per 100g</label>
                <input
                  type="number"
                  value={supplements.proteinPowder.fatPer100g || ''}
                  onChange={e => updateProteinPowder({ fatPer100g: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 3"
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">How many scoops / grams do you take per day?</label>
                <input
                  type="number"
                  value={supplements.proteinPowder.gramsPerDay || ''}
                  onChange={e => updateProteinPowder({ gramsPerDay: parseFloat(e.target.value) || '' })}
                  placeholder="e.g. 30"
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-muted mb-1">When do you take it?</label>
                <select
                  value={supplements.proteinPowder.timing || 'Morning'}
                  onChange={e => updateProteinPowder({ timing: e.target.value })}
                  className="w-full bg-white border border-primary/20 rounded-xl px-3 py-2 text-xs text-textMain font-semibold cursor-pointer"
                >
                  <option>Morning</option>
                  <option>Post-workout</option>
                  <option>Evening</option>
                  <option>Before bed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Other Daily Supplements */}
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Other daily pills / supplements</label>
          <div className="flex flex-wrap gap-1.5">
            {['Iron tablets', 'Vitamin D', 'B12', 'Calcium', 'Omega-3', 'Multivitamin', 'None'].map(s => {
              const others = supplements.others || [];
              const isSelected = others.includes(s) || (s === 'None' && others.length === 0);

              const handleToggleOther = () => {
                let next;
                if (s === 'None') {
                  next = [];
                } else {
                  const filtered = others.filter(o => o !== 'None');
                  if (filtered.includes(s)) {
                    next = filtered.filter(o => o !== s);
                  } else {
                    next = [...filtered, s];
                  }
                }
                updateSupplements({ others: next });
              };

              return (
                <button
                  key={s}
                  type="button"
                  onClick={handleToggleOther}
                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary border-primary text-white shadow-sm'
                      : 'bg-white/60 border-primary/10 text-muted hover:border-primary/20'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
