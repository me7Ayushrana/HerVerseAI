function calculateMacros(targetCalories, goal, healthConditions) {
  // Splits by goal (% of calories)
  const splits = {
    weight_loss:        [0.35, 0.35, 0.30],
    muscle_gain:        [0.35, 0.45, 0.20],
    hormonal_balance:   [0.25, 0.40, 0.35],
    pcos_management:    [0.30, 0.35, 0.35],
    energy_boost:       [0.25, 0.50, 0.25],
    skin_health:        [0.25, 0.40, 0.35],
    fertility_support:  [0.25, 0.40, 0.35],
    general_wellness:   [0.25, 0.45, 0.30],
  };

  // Override for diabetes/prediabetes: lower carbs
  if (healthConditions && (healthConditions.includes('type2_diabetes') ||
      healthConditions.includes('prediabetes'))) {
    splits[goal] = [0.30, 0.30, 0.40];
  }

  const [p, c, f] = splits[goal] ?? [0.25, 0.45, 0.30];
  return {
    proteinG: Math.round((targetCalories * p) / 4),
    carbG:    Math.round((targetCalories * c) / 4),
    fatG:     Math.round((targetCalories * f) / 9),
  };
}

module.exports = {
  calculateMacros
};
