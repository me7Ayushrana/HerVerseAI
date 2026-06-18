import React from 'react';

const DIET_TYPES = [
  { id: 'veg', label: 'Vegetarian', desc: 'No meat, seafood, or eggs. Dairy is fine.' },
  { id: 'vegan', label: 'Vegan', desc: 'Strictly plant-based. No meat, dairy, eggs, or honey.' },
  { id: 'non-veg', label: 'Non-Vegetarian', desc: 'Includes fish, chicken, eggs, and red meat.' },
  { id: 'jain', label: 'Jain', desc: 'Pure vegetarian. No root vegetables (potatoes, onions, garlic).' },
  { id: 'eggitarian', label: 'Eggitarian', desc: 'Vegetarian diet that includes eggs.' }
];

const COOKING_TIMES = [
  { id: 'quick', label: 'Quick (<15 mins)', desc: 'Minimal prep, rapid stir-fries, bowls, or smoothies.' },
  { id: 'moderate', label: 'Moderate (15-30 mins)', desc: 'Standard home-cooked meals.' },
  { id: 'elaborate', label: 'Elaborate (30+ mins)', desc: 'Gourmet, slow-cooked, or complex meal items.' }
];

export default function Step5_DietPreference({ formData, updateFields }) {
  const currentDiet = formData.dietType || 'veg';
  const currentCooking = formData.cookingTime || 'moderate';

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Diet & Cooking Choices</h3>
        <p className="text-xs text-muted">We will tailor your diet plan to align with these eating preferences.</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-muted uppercase mb-3">Diet Type</label>
        <div className="grid grid-cols-1 gap-2.5">
          {DIET_TYPES.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => updateFields({ dietType: opt.id })}
              className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-0.5 cursor-pointer ${
                currentDiet === opt.id
                  ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-sm'
                  : 'bg-white/60 border-primary/10 hover:border-primary/30 hover:bg-white/90'
              }`}
            >
              <span className="font-bold text-sm text-textMain">{opt.label}</span>
              <span className="text-xs text-muted leading-relaxed">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Meal Frequency</label>
          <select
            value={formData.mealFrequency || 5}
            onChange={e => updateFields({ mealFrequency: parseInt(e.target.value) || 5 })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain font-medium cursor-pointer"
          >
            <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
            <option value={4}>4 Meals (Breakfast, Lunch, Snack, Dinner)</option>
            <option value={5}>5 Meals (Early Morning, BF, Lunch, Snack, Dinner)</option>
            <option value={6}>6 Meals (Early Morning, BF, Mid-Morning, Lunch, Snack, Dinner)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted uppercase mb-2">Cooking Time</label>
          <select
            value={currentCooking}
            onChange={e => updateFields({ cookingTime: e.target.value })}
            className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain font-medium cursor-pointer"
          >
            {COOKING_TIMES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
