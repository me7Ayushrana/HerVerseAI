const CYCLE_MAP = {
  menstrual: {
    phaseName: "Menstrual Phase",
    calorieAdjust: 100, // add to targetCalories
    priorityNutrients: ["iron", "magnesium", "omega-3", "vitamin C", "zinc", "B12"],
    avoidList: ["chai overload", "cold drinks", "refined maida", "alcohol", "excess salt"],
    powerFoods: ["spinach dal", "ragi roti", "pumpkin seeds", "dark chocolate", "banana", "ginger turmeric milk", "rajma", "sesame chikki", "pomegranate", "warm khichdi"],
    phaseNote: "Focus on warm, easily digestible foods that replenish iron and zinc lost during bleeding."
  },
  follicular: {
    phaseName: "Follicular Phase",
    calorieAdjust: 0,
    priorityNutrients: ["folate", "B12", "zinc", "probiotics", "fiber", "vitamin E"],
    avoidList: [],
    powerFoods: ["moong sprouts", "greek yogurt", "oats", "broccoli", "eggs", "almonds", "berries", "flaxseeds", "quinoa", "fermented rice kanji"],
    phaseNote: "Incorporate light, fresh foods and fiber to support developing follicles and metabolize rising estrogen."
  },
  ovulatory: {
    phaseName: "Ovulatory Phase",
    calorieAdjust: 150,
    priorityNutrients: ["antioxidants", "vitamin E", "glutathione", "fiber", "zinc"],
    avoidList: ["processed snacks", "excess sugar"],
    powerFoods: ["quinoa salad", "watermelon", "tomatoes", "asparagus", "figs", "coconut water", "sunflower seeds", "light poha", "raw carrot sticks", "amla"],
    phaseNote: "Energy is peaking! Focus on hydrating, cooling foods and antioxidants to support egg release."
  },
  luteal: {
    phaseName: "Luteal Phase",
    calorieAdjust: 200,
    priorityNutrients: ["magnesium", "B6", "calcium", "tryptophan", "complex carbs"],
    avoidList: ["caffeine", "alcohol", "excess salt", "refined sugar"],
    powerFoods: ["sweet potato", "brown rice", "chickpeas", "dates", "chamomile tea", "kale sabzi", "sunflower seeds", "dark chocolate", "banana oats smoothie", "turkey/paneer"],
    phaseNote: "Progesterone is rising. Prevent mood crashes, bloating, and sweet cravings with complex carbs, magnesium, and vitamin B6."
  }
};

module.exports = {
  CYCLE_MAP
};
