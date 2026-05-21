const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/authMiddleware');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_now');

// System prompt for the health assistant
const SYSTEM_PROMPT = `
You are HerVerse AI, a compassionate, knowledgeable, and professional women's health and wellness assistant.
Your goal is to provide supportive, accurate, and easy-to-understand information related to menstrual health, pregnancy, mental wellness, PCOS/PCOD, nutrition, and fitness for women.

IMPORTANT RULES:
1. Always maintain a supportive and empathetic tone.
2. If asked about a serious medical condition, severe pain, or emergency, advise the user to seek immediate professional medical help.
3. You are NOT a doctor. Always include this disclaimer in your advice: "Please remember that I am an AI assistant and this information is not a replacement for professional medical advice. Always consult with your healthcare provider for medical decisions."
4. Keep your responses concise and well-formatted using markdown.
`;

// @route   POST /api/chat
// @desc    Send a message to the AI Chatbot
// @access  Private (or Public for testing, let's keep it protected)
router.post('/', protect, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Configure the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Format history for Gemini API
    const formattedHistory = history ? history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    })) : [];

    // Start a chat session
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: "System Instructions: " + SYSTEM_PROMPT }]
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I am HerVerse AI, ready to assist." }]
        },
        ...formattedHistory
      ],
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ message: 'Failed to generate response', error: error.message });
  }
});

module.exports = router;
