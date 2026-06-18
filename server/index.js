const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
app.use(limiter);

// Placeholder routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'HerVerse API is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ml', require('./routes/ml'));
app.use('/api/nutrition', require('./routes/nutrition'));



// Database connection
const connectDB = async () => {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('MongoDB Connected');
    } else {
      console.log('MongoDB connection skipped: MONGO_URI not set');
    }
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running on port ${PORT}`);
});
