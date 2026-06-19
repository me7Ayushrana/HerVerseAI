const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ==========================================
// Mongoose Schema Definitions
// ==========================================

const nutritionProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  weightKg: { type: Number, required: true },
  heightCm: { type: Number, required: true },
  bmi: Number,
  goal: { type: String, required: true },
  targetWeightKg: Number,
  timelineWeeks: Number,
  activityLevel: { type: String, required: true },
  exerciseDaysPerWeek: { type: Number, default: 0 },
  exerciseTypes: [String],
  dietType: { type: String, required: true },
  cuisinePreferences: [String],
  mealFrequency: { type: Number, default: 5 },
  cookingTime: { type: String, default: "moderate" },
  allergies: [String],
  intolerances: [String],
  avoidFoods: [String],
  preferredFoods: [String],
  healthConditions: [String],
  wakeTime: { type: String, default: "07:00" },
  sleepTime: { type: String, default: "23:00" },
  waterLiters: { type: Number, default: 2.0 },
  stressLevel: { type: String, default: "moderate" },
  supplements: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const mealSchema = new mongoose.Schema({
  mealType: String,
  scheduledTime: String,
  displayName: String,
  items: mongoose.Schema.Types.Mixed, // JSON array of items
  totalCalories: Number,
  totalProtein: Number,
  totalCarb: Number,
  totalFat: Number,
  prepMinutes: Number,
  recipeSteps: [String],
  benefitNote: String,
  isRegenerated: { type: Boolean, default: false }
}, { timestamps: true });

const dietDaySchema = new mongoose.Schema({
  dayNumber: Number,
  dayLabel: String,
  meals: [mealSchema]
});

const dietPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  nutritionProfileId: { type: String, required: true },
  cyclePhase: String,
  weekLabel: String,
  targetCalories: Number,
  proteinG: Number,
  carbG: Number,
  fatG: Number,
  keyFocusNote: String,
  cycleBenefitNote: String,
  days: [dietDaySchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RealNutritionProfile = mongoose.model('NutritionProfile', nutritionProfileSchema);
const RealDietPlan = mongoose.model('DietPlan', dietPlanSchema);

// ==========================================
// Mock Database / JSON Storage File Fallback
// ==========================================

const DATA_DIR = path.join(__dirname, '..', 'data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('[MockDB] Could not create local data directory (likely read-only environment):', err.message);
}

// Global in-memory cache fallback for stateless serverless environments (Vercel)
const inMemoryCache = {
  'nutrition_profiles.json': [],
  'diet_plans.json': []
};

const getJSONData = (file) => {
  if (inMemoryCache[file] && inMemoryCache[file].length > 0) {
    return inMemoryCache[file];
  }
  
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    inMemoryCache[file] = parsed;
    return parsed;
  } catch (err) {
    console.error(`Error reading mock file ${file}:`, err.message);
    return inMemoryCache[file] || [];
  }
};

const saveJSONData = (file, data) => {
  inMemoryCache[file] = data;
  const filePath = path.join(DATA_DIR, file);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn(`[MockDB] Filesystem write failed for ${file} (likely read-only serverless environment). Using in-memory fallback:`, err.message);
  }
};

// Mock NutritionProfile Class
class MockNutritionProfile {
  static async findOne({ userId }) {
    console.log('[MockDB] findOne profile for user:', userId);
    const list = getJSONData('nutrition_profiles.json');
    const profile = list.find(p => p.userId === userId);
    if (!profile) return null;
    return {
      ...profile,
      save: async function() {
        const idx = list.findIndex(p => p.id === this.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...this, updatedAt: new Date().toISOString() };
        } else {
          list.push(this);
        }
        saveJSONData('nutrition_profiles.json', list);
        return this;
      }
    };
  }

  static async create(fields) {
    console.log('[MockDB] create profile for user:', fields.userId);
    const list = getJSONData('nutrition_profiles.json');
    const id = 'prof-' + Math.random().toString(36).substr(2, 9);
    const newProfile = {
      id,
      _id: id,
      ...fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Remove duplicates
    const filtered = list.filter(p => p.userId !== fields.userId);
    filtered.push(newProfile);
    saveJSONData('nutrition_profiles.json', filtered);
    return {
      ...newProfile,
      save: async function() {
        return this;
      }
    };
  }
}

// Mock DietPlan Class
class MockDietPlan {
  static async find(query) {
    console.log('[MockDB] find plans query:', query);
    const list = getJSONData('diet_plans.json');
    let results = list;
    if (query.userId) {
      results = results.filter(p => p.userId === query.userId);
    }
    if (query.isActive !== undefined) {
      results = results.filter(p => p.isActive === query.isActive);
    }
    return results;
  }

  static async findOne(query) {
    console.log('[MockDB] findOne plan query:', query);
    const list = getJSONData('diet_plans.json');
    let results = list;
    if (query.userId) {
      results = results.filter(p => p.userId === query.userId);
    }
    if (query._id) {
      results = results.filter(p => p._id === query._id || p.id === query._id);
    }
    if (query.isActive !== undefined) {
      results = results.filter(p => p.isActive === query.isActive);
    }
    const plan = results[0] || null;
    if (!plan) return null;
    return {
      ...plan,
      save: async function() {
        const idx = list.findIndex(p => p.id === this.id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...this, updatedAt: new Date().toISOString() };
          saveJSONData('diet_plans.json', list);
        }
        return this;
      }
    };
  }

  static async updateMany(filter, update) {
    console.log('[MockDB] updateMany plans:', filter, update);
    const list = getJSONData('diet_plans.json');
    const updated = list.map(p => {
      let match = true;
      if (filter.userId && p.userId !== filter.userId) match = false;
      if (filter._id && p.id !== filter._id && p._id !== filter._id) match = false;
      
      if (match) {
        return { ...p, ...update, updatedAt: new Date().toISOString() };
      }
      return p;
    });
    saveJSONData('diet_plans.json', updated);
    return { modifiedCount: updated.length };
  }

  static async create(fields) {
    console.log('[MockDB] create plan for user:', fields.userId);
    const list = getJSONData('diet_plans.json');
    const id = 'plan-' + Math.random().toString(36).substr(2, 9);
    
    // Convert Mongoose structures or custom models nested objects
    const newPlan = {
      id,
      _id: id,
      ...fields,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    list.push(newPlan);
    saveJSONData('diet_plans.json', list);
    return {
      ...newPlan,
      save: async function() {
        return this;
      }
    };
  }
}

// Proxied exports
const NutritionProfile = new Proxy(RealNutritionProfile, {
  get(target, prop, receiver) {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      if (Reflect.has(MockNutritionProfile, prop)) {
        return Reflect.get(MockNutritionProfile, prop, receiver);
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

const DietPlan = new Proxy(RealDietPlan, {
  get(target, prop, receiver) {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      if (Reflect.has(MockDietPlan, prop)) {
        return Reflect.get(MockDietPlan, prop, receiver);
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = {
  NutritionProfile,
  DietPlan
};
