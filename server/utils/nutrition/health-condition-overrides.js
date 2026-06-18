const HEALTH_OVERRIDES = {
  pcos: {
    avoid: ["high-GI foods", "refined carbs", "excess dairy", "processed sugar"],
    prioritize: ["inositol-rich foods (buckwheat, citrus)", "anti-inflammatory omega-3", "chromium-rich foods (broccoli, green beans)", "magnesium", "low-GI carbs only"],
    note: "PCOS Protocol: Low-GI carbs only, anti-inflammatory focus, inositol-rich foods"
  },
  thyroid_hypo: {
    avoid: ["raw cruciferous vegetables (cauliflower, broccoli, cabbage — cook them instead)", "soy in excess", "gluten in excess"],
    prioritize: ["selenium (Brazil nuts, sunflower seeds)", "iodine (seaweed, iodized salt)", "zinc (pumpkin seeds, lentils)", "vitamin D (eggs, mushrooms)"],
    note: "Hypothyroid Protocol: Cook all cruciferous, selenium + iodine priority"
  },
  anemia: {
    avoid: ["tea/coffee with meals (blocks iron absorption)", "calcium with iron meals"],
    prioritize: ["iron-rich foods (spinach, rajma, ragi, dates)", "vitamin C with every meal", "B12 (eggs, paneer, fortified foods)"],
    note: "Anemia Protocol: Iron + Vitamin C pairings at every meal"
  },
  ibs: {
    avoid: ["high-FODMAP: onion, garlic raw, apple, excess wheat, lentils in excess", "carbonated drinks", "spicy food", "large meals"],
    prioritize: ["low-FODMAP: rice, oats, banana, carrot, cooked spinach, ginger", "probiotics (curd, kanji)", "small frequent meals"],
    note: "IBS Protocol: Low-FODMAP meals, no raw onion/garlic, small portions"
  },
  type2_diabetes: {
    avoid: ["high-GI: white rice excess, maida, sugary drinks, fruit juice", "large carb portions"],
    prioritize: ["low-GI carbs only: brown rice, oats, daliya", "fiber first (sabzi before roti)", "distribute carbs evenly across all meals", "bitter gourd, methi, cinnamon"],
    note: "Diabetes Protocol: Strict low-GI, fiber-first eating order, carbs distributed"
  },
  acne: {
    avoid: ["excess dairy", "high glycemic foods", "fried food", "refined sugar"],
    prioritize: ["zinc (pumpkin seeds, lentils)", "omega-3 (flaxseeds, walnuts)", "vitamin A (carrots, sweet potato)", "antioxidants", "adequate hydration"],
    note: "Skin Protocol: Anti-inflammatory, low-GI, zinc and omega-3 priority"
  }
};

module.exports = {
  HEALTH_OVERRIDES
};
