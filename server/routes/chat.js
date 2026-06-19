const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

const MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

// Helper for model fallback and retry logic
async function sendMessageWithFallback(message, history, apiKey, systemInstructionOverride) {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(`[Gemini Proxy] Attempting chat using model: ${modelName}`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: systemInstructionOverride || SYSTEM_PROMPT,
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      });

      // Format history so it strictly alternates and starts with 'user'
      const formattedHistory = [];
      if (history && Array.isArray(history)) {
        for (const msg of history.slice(-8)) {
          const role = msg.role === 'user' ? 'user' : 'model';
          if (formattedHistory.length === 0) {
            if (role === 'user') {
              formattedHistory.push({ role, parts: [{ text: msg.text }] });
            }
          } else {
            const lastItem = formattedHistory[formattedHistory.length - 1];
            if (lastItem.role === role) {
              lastItem.parts[0].text += "\n" + msg.text;
            } else {
              formattedHistory.push({ role, parts: [{ text: msg.text }] });
            }
          }
        }
      }

      // Retry mechanism for transient errors (rate limit 429, 5xx server errors)
      let retries = 3;
      let delay = 1000;
      let chat = null;

      while (retries > 0) {
        try {
          chat = model.startChat({
            history: formattedHistory,
            generationConfig: {
              maxOutputTokens: 1000,
            },
          });
          const result = await chat.sendMessage(message);
          const response = await result.response;
          const candidate = response.candidates?.[0];
          const finishReason = candidate?.finishReason;
          if (finishReason && finishReason !== 'STOP') {
            throw new Error(`Candidate blocked or cut off mid-generation. Finish reason: ${finishReason}`);
          }
          const text = response.text();
          if (text) {
            console.log(`[Gemini Proxy] Success with model: ${modelName}`);
            return text;
          }
        } catch (err) {
          const status = err.status || (err.message && err.message.match(/\b\d{3}\b/)?.[0]);
          const isRateLimit = status == 429 || err.message?.includes('429');
          const isTransient = isRateLimit || status >= 500 || err.message?.includes('500') || err.message?.includes('socket') || err.message?.includes('timeout');
          
          if (isTransient && retries > 1) {
            console.warn(`[Gemini Proxy] Transient error on ${modelName} (${err.message || err}). Retrying in ${delay}ms... (${retries - 1} left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
            retries--;
          } else {
            throw err;
          }
        }
      }
    } catch (err) {
      console.error(`[Gemini Proxy] Model ${modelName} failed:`, err.message || err);
      lastError = err;
      // Loop continues to next model fallback
    }
  }

  throw lastError || new Error("All Gemini models failed to respond.");
}

// @route   POST /api/chat
// @desc    Send a message to the AI Chatbot (Public route proxied through rate limiter)
// @access  Public (Rate-limited, CORS protected)
router.post('/', async (req, res) => {
  try {
    const { message, history, systemInstruction } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      console.warn('[Gemini Proxy] GEMINI_API_KEY environment variable is not configured or is using default placeholder.');
      return res.status(503).json({ message: 'Gemini API key is not configured on the server.' });
    }

    const reply = await sendMessageWithFallback(message, history, apiKey, systemInstruction);
    res.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ message: error.message || 'Internal server error while calling Gemini API' });
  }
});

module.exports = router;
