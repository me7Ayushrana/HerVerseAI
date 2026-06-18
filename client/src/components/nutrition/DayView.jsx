import React from 'react';
import MealCard from './MealCard';

export default function DayView({ day, onSwapMeal }) {
  if (!day || !day.meals) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-bold text-textMain">{day.dayLabel}'s Meals</h3>
        <span className="text-xs text-muted font-semibold bg-primary/5 px-2.5 py-1 rounded-full border border-primary/5">
          {day.meals.length} scheduled meals
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {day.meals.map((meal) => (
          <MealCard
            key={meal.id || meal._id}
            meal={meal}
            onSwap={onSwapMeal}
          />
        ))}
      </div>
    </div>
  );
}
