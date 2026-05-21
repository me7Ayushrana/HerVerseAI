const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: Number,
  height: Number, // in cm
  weight: Number, // in kg
  lifestyleHabits: [String],
  medicalConditions: [String],
  pregnancyStatus: {
    type: Boolean,
    default: false
  },
  healthGoals: [String],
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const RealUser = mongoose.model('User', userSchema);

// Memory database for when MongoDB is not connected
const memoryDb = {
  users: []
};

// Add a default test user for convenient local use without DB
const initMemoryDb = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    memoryDb.users.push({
      id: 'mock-user-id-123',
      _id: 'mock-user-id-123',
      name: 'Jane Doe',
      email: 'test@example.com',
      password: hashedPassword,
      age: 28,
      height: 165,
      weight: 60,
      lifestyleHabits: ['Yoga', 'Meditation'],
      medicalConditions: [],
      pregnancyStatus: false,
      healthGoals: ['Stay Fit', 'Manage Stress'],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('[MockDB] Memory database initialized with default test user: test@example.com / password123');
  } catch (err) {
    console.error('[MockDB] Failed to initialize memory db:', err);
  }
};
initMemoryDb();

class MockUser {
  static async findOne({ email }) {
    console.log('[MockDB] findOne called for email:', email);
    const user = memoryDb.users.find(u => u.email === email);
    if (!user) return null;
    return {
      ...user,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  }

  static async findById(id) {
    console.log('[MockDB] findById called for id:', id);
    const user = memoryDb.users.find(u => u.id === id || u._id === id);
    if (!user) return null;
    
    const returnedUser = {
      ...user,
      save: async function() {
        console.log('[MockDB] save called for user:', this.id);
        const idx = memoryDb.users.findIndex(u => u.id === this.id);
        if (idx !== -1) {
          memoryDb.users[idx] = {
            ...memoryDb.users[idx],
            name: this.name || memoryDb.users[idx].name,
            age: this.age !== undefined ? this.age : memoryDb.users[idx].age,
            height: this.height !== undefined ? this.height : memoryDb.users[idx].height,
            weight: this.weight !== undefined ? this.weight : memoryDb.users[idx].weight,
            lifestyleHabits: this.lifestyleHabits || memoryDb.users[idx].lifestyleHabits,
            medicalConditions: this.medicalConditions || memoryDb.users[idx].medicalConditions,
            pregnancyStatus: this.pregnancyStatus !== undefined ? this.pregnancyStatus : memoryDb.users[idx].pregnancyStatus,
            healthGoals: this.healthGoals || memoryDb.users[idx].healthGoals,
            updatedAt: new Date()
          };
          if (this.password && this.password !== memoryDb.users[idx].password) {
            const salt = await bcrypt.genSalt(10);
            memoryDb.users[idx].password = await bcrypt.hash(this.password, salt);
          }
          return memoryDb.users[idx];
        }
        return this;
      }
    };

    // Chainable select
    returnedUser.select = function(fields) {
      if (fields.includes('-password')) {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
      }
      return this;
    };

    return returnedUser;
  }

  static async create({ name, email, password }) {
    console.log('[MockDB] create called for email:', email);
    const userExists = memoryDb.users.some(u => u.email === email);
    if (userExists) {
      throw new Error('User already exists');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = 'mock-user-' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id,
      _id: id,
      name,
      email,
      password: hashedPassword,
      age: 25,
      height: 160,
      weight: 55,
      lifestyleHabits: [],
      medicalConditions: [],
      pregnancyStatus: false,
      healthGoals: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDb.users.push(newUser);
    return {
      ...newUser,
      matchPassword: async function(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  }
}

// Export wrapper that switches dynamically based on MongoDB connection state
const exportUser = new Proxy(RealUser, {
  get(target, prop, receiver) {
    const isConnected = mongoose.connection.readyState === 1;
    if (!isConnected) {
      console.log(`[Database] MongoDB not connected. Falling back to MockUser for property: ${prop}`);
      if (Reflect.has(MockUser, prop)) {
        return Reflect.get(MockUser, prop, receiver);
      }
    }
    return Reflect.get(target, prop, receiver);
  }
});

module.exports = exportUser;
