import React from 'react';

export default function StepReview({ formData }) {
  const getGoalLabel = (id) => {
    const goals = {
      hormone_balance: 'Hormone Balance',
      weight_loss: 'Healthy Weight Management (Loss)',
      weight_gain: 'Nourish & Build (Gain)',
      metabolic_reset: 'Metabolic Reset',
      fertility_support: 'Fertility Support'
    };
    return goals[id] || id;
  };

  const getDietLabel = (id) => {
    const diets = {
      veg: 'Vegetarian',
      vegan: 'Vegan',
      'non-veg': 'Non-Vegetarian',
      jain: 'Jain',
      eggitarian: 'Eggitarian'
    };
    return diets[id] || id;
  };

  const getActivityLabel = (id) => {
    const acts = {
      sedentary: 'Sedentary',
      lightly_active: 'Lightly Active',
      moderately_active: 'Moderately Active',
      very_active: 'Very Active'
    };
    return acts[id] || id;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gradient">Review Profile</h3>
        <p className="text-xs text-muted">Verify your details below. Once submitted, we will analyze your metrics and build your 7-day plan.</p>
      </div>

      <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar">
        {/* Core Metrics */}
        <div className="border-b border-primary/10 pb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Core Metrics</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-muted block font-semibold">Age</span>
              <span className="text-textMain font-bold">{formData.age} years</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Weight</span>
              <span className="text-textMain font-bold">{formData.weightKg} kg</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Height</span>
              <span className="text-textMain font-bold">{formData.heightCm} cm</span>
            </div>
          </div>
        </div>

        {/* Primary Goal */}
        <div className="border-b border-primary/10 pb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Primary Goal</h4>
          <div className="text-xs space-y-1">
            <div>
              <span className="text-muted block font-semibold">Goal Focus</span>
              <span className="text-textMain font-bold">{getGoalLabel(formData.goal)}</span>
            </div>
            {(formData.goal === 'weight_loss' || formData.goal === 'weight_gain') && (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <span className="text-muted block font-semibold">Target Weight</span>
                  <span className="text-textMain font-bold">{formData.targetWeightKg} kg</span>
                </div>
                <div>
                  <span className="text-muted block font-semibold">Timeline</span>
                  <span className="text-textMain font-bold">{formData.timelineWeeks} weeks</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity & Exercise */}
        <div className="border-b border-primary/10 pb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Activity & Training</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted block font-semibold">Activity Level</span>
              <span className="text-textMain font-bold">{getActivityLabel(formData.activityLevel)}</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Exercise Days</span>
              <span className="text-textMain font-bold">{formData.exerciseDaysPerWeek} days/week</span>
            </div>
            {formData.exerciseTypes && formData.exerciseTypes.length > 0 && (
              <div className="col-span-2 mt-1">
                <span className="text-muted block font-semibold">Selected Workouts</span>
                <span className="text-textMain font-bold capitalize">{formData.exerciseTypes.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dietary Preferences */}
        <div className="border-b border-primary/10 pb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Dietary Preferences</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted block font-semibold">Diet Type</span>
              <span className="text-textMain font-bold">{getDietLabel(formData.dietType)}</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Meal Frequency</span>
              <span className="text-textMain font-bold">{formData.mealFrequency} meals/day</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Cooking Time</span>
              <span className="text-textMain font-bold capitalize">{formData.cookingTime}</span>
            </div>
          </div>
        </div>

        {/* Exclusions & Health */}
        <div className="border-b border-primary/10 pb-3">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Exclusions & Health</h4>
          <div className="text-xs space-y-1">
            {formData.allergies && formData.allergies.length > 0 && (
              <div>
                <span className="text-muted block font-semibold">Allergies</span>
                <span className="text-textMain font-bold capitalize">{formData.allergies.join(', ')}</span>
              </div>
            )}
            {formData.intolerances && formData.intolerances.length > 0 && (
              <div>
                <span className="text-muted block font-semibold">Intolerances</span>
                <span className="text-textMain font-bold capitalize">{formData.intolerances.join(', ')}</span>
              </div>
            )}
            {formData.avoidFoods && formData.avoidFoods.length > 0 && (
              <div>
                <span className="text-muted block font-semibold">Foods to Avoid</span>
                <span className="text-textMain font-bold">{formData.avoidFoods.join(', ')}</span>
              </div>
            )}
            {formData.preferredFoods && formData.preferredFoods.length > 0 && (
              <div>
                <span className="text-muted block font-semibold">Preferred Foods</span>
                <span className="text-textMain font-bold">{formData.preferredFoods.join(', ')}</span>
              </div>
            )}
            <div>
              <span className="text-muted block font-semibold">Health Conditions</span>
              <span className="text-textMain font-bold capitalize">
                {(formData.healthConditions || []).filter(c => c !== 'none').join(', ') || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Supplements Intake */}
        {formData.supplements && (
          <div className="border-b border-primary/10 pb-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Supplements Intake</h4>
            <div className="text-xs space-y-1">
              {formData.supplements.proteinPowder?.active ? (
                <div>
                  <span className="text-muted block font-semibold">Protein Powder</span>
                  <span className="text-textMain font-bold">
                    {formData.supplements.proteinPowder.name} ({formData.supplements.proteinPowder.gramsPerDay}g daily, timing: {formData.supplements.proteinPowder.timing})
                  </span>
                </div>
              ) : (
                <div>
                  <span className="text-muted block font-semibold">Protein Powder</span>
                  <span className="text-textMain font-bold">None</span>
                </div>
              )}
              {formData.supplements.others && formData.supplements.others.length > 0 && (
                <div>
                  <span className="text-muted block font-semibold">Other Supplements</span>
                  <span className="text-textMain font-bold">
                    {formData.supplements.others.join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Circadian & Lifestyle */}
        <div>
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Circadian & Sleep</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted block font-semibold">Wake / Sleep</span>
              <span className="text-textMain font-bold">{formData.wakeTime} / {formData.sleepTime}</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Daily Water</span>
              <span className="text-textMain font-bold">{formData.waterLiters} Liters</span>
            </div>
            <div>
              <span className="text-muted block font-semibold">Stress Level</span>
              <span className="text-textMain font-bold capitalize">{formData.stressLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
