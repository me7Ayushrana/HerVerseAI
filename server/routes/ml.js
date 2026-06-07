const express = require('express');
const router = express.Router();
const { classifySentiment } = require('../utils/sentimentClassifier');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/ml/sentiment
// @desc    Analyze journal sentiment using Naive Bayes classifier
// @access  Private (or Public for testing, let's keep it open for quick evaluation)
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text content is required for classification.' });
    }

    const start = process.hrtime();
    const result = classifySentiment(text);
    const diff = process.hrtime(start);
    
    // Calculate classification processing time in milliseconds
    const executionMs = (diff[0] * 1e9 + diff[1]) / 1e6;

    res.json({
      success: true,
      model: "Local Naive Bayes Classifier (v1.0.0)",
      inputLength: text.length,
      executionTimeMs: Number(executionMs.toFixed(3)),
      ...result
    });
  } catch (error) {
    console.error('ML Sentiment Classification error:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

module.exports = router;
