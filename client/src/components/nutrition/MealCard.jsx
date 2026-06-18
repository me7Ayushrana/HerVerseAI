import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

const MEAL_TYPE_LABELS = {
  early_morning: 'Early Morning',
  breakfast: 'Breakfast',
  mid_morning: 'Mid Morning',
  lunch: 'Lunch',
  evening_snack: 'Evening Snack',
  dinner: 'Dinner'
};

export default function MealCard({ meal, onSwap }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const handleSwap = async (e) => {
    e.stopPropagation();
    setIsSwapping(true);
    try {
      await onSwap(meal.id || meal._id);
    } catch (err) {
      console.error('Swap failed:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-white/5 border border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all-smooth relative overflow-hidden flex flex-col justify-between min-h-[160px]">
      {/* Swap Loading Overlay */}
      {isSwapping && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs font-bold text-primary">
            <RefreshCw className="animate-spin" size={16} />
            <span>Finding alternative...</span>
          </div>
        </div>
      )}

      {/* Card Header */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[9px] tracking-wider uppercase bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full inline-block mb-1.5">
              {MEAL_TYPE_LABELS[meal.mealType] || meal.mealType}
            </span>
            <h4 className="font-bold text-textMain text-sm md:text-base leading-snug">{meal.displayName}</h4>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted font-semibold bg-primary/5 px-2 py-1 rounded-lg">
            <Clock size={12} className="text-primary" />
            <span>{meal.scheduledTime}</span>
          </div>
        </div>

        {/* Macros summary */}
        <div className="flex gap-4 text-xs font-semibold text-muted border-t border-b border-primary/5 py-2 my-2">
          <span>{meal.totalCalories} kcal</span>
          <span>P: {meal.totalProtein}g</span>
          <span>C: {meal.totalCarb}g</span>
          <span>F: {meal.totalFat}g</span>
        </div>

        {/* Ingredients/Items list */}
        {meal.items && meal.items.length > 0 && (
          <div className="mb-3 mt-2 bg-primary/5 dark:bg-white/5 rounded-xl p-3 border border-primary/5 space-y-1.5">
            <span className="block text-[10px] uppercase font-bold text-muted tracking-wider">Ingredients</span>
            <div className="space-y-1">
              {meal.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-textMain">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-primary font-bold">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benefit note */}
        {meal.benefitNote && (
          <p className="text-xs text-primary bg-primary/5 p-2 rounded-xl leading-snug mb-3">
            {meal.benefitNote}
          </p>
        )}

        {/* Recipe Steps Dropdown */}
        {meal.recipeSteps && meal.recipeSteps.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs font-bold text-muted hover:text-primary transition-colors flex items-center gap-1 select-none"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} />
                  <span>Hide Recipe Steps</span>
                </>
              ) : (
                <>
                  <ChevronDown size={14} />
                  <span>Show Recipe Steps</span>
                </>
              )}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden mt-3"
                >
                  <div className="bg-primary/5 rounded-xl p-3 border border-primary/5 space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                    {meal.recipeSteps.map((step, idx) => (
                      <div key={idx} className="flex gap-2 items-start text-xs text-textMain leading-relaxed">
                        <CheckCircle2 size={12} className="text-primary flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Swap Button */}
      <div className="mt-4 pt-3 border-t border-primary/5 flex justify-end">
        <button
          onClick={handleSwap}
          className="text-xs font-bold text-primary hover:text-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-all-smooth"
        >
          <RefreshCw size={12} />
          <span>Swap Meal</span>
        </button>
      </div>
    </div>
  );
}
