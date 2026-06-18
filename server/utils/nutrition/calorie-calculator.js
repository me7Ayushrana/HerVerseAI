function calculateBMR(weightKg, heightCm, age) {
  // Mifflin-St Jeor for women: most accurate equation
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
}

function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725
  };
  return bmr * (multipliers[activityLevel] ?? 1.2);
}

function calculateTargetCalories(tdee, goal) {
  const adjustments = {
    weight_loss: -400,
    muscle_gain: +250,
    hormonal_balance: 0,
    pcos_management: -200,
    energy_boost: +100,
    skin_health: 0,
    fertility_support: +150,
    general_wellness: 0
  };
  return Math.round(tdee + (adjustments[goal] ?? 0));
}

module.exports = {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories
};
