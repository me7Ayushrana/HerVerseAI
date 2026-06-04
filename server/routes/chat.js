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
    
    // Smart local conversational fallback for offline/unconfigured API keys
    const msgLower = req.body.message.toLowerCase();
    let reply = "";

    const disclaimer = "\n\n*Please remember that I am an AI assistant and this information is not a replacement for professional medical advice. Always consult with your healthcare provider for medical decisions.*";

    if (msgLower.includes('emergency') || msgLower.includes('severe pain') || msgLower.includes('bleeding heavily') || msgLower.includes('chest pain')) {
      reply = `🚨 **Emergency Alert** 🚨\n\nIf you are experiencing severe pain, heavy abnormal bleeding, chest tightness, or other medical emergencies, please seek immediate professional medical attention or call emergency services right away. You can also view the emergency numbers in our **Emergency Center** in the sidebar. Please take care of yourself!${disclaimer}`;
    } else if (msgLower.includes('pcos') || msgLower.includes('pcod') || msgLower.includes('cyst') || msgLower.includes('irregular cycle')) {
      reply = `🌸 **PCOS/PCOD Guidance** 🌸\n\nManaging PCOS/PCOD involves supportive lifestyle, dietary, and fitness habits:\n\n1. **Low Glycemic Index Diet**: Prioritize whole grains, leafy greens, healthy fats, and high fiber to help manage insulin resistance.\n2. **Strength Training**: Building muscle mass helps optimize metabolic function and hormone levels.\n3. **Sleep Hygiene**: Maintain a consistent 7-8 hours of sleep to stabilize cortisol (stress hormone) levels.\n4. **Regular Tracking**: Keep logging your symptoms in our **PCOS Manager** to identify personal triggers.${disclaimer}`;
    } else if (msgLower.includes('period') || msgLower.includes('cycle') || msgLower.includes('menstru') || msgLower.includes('cramp') || msgLower.includes('flow')) {
      reply = `📅 **Menstrual Cycle & Care** 📅\n\nHere are some helpful insights for your cycle:\n\n* **Menstrual Phase (Days 1-5)**: Energy levels are lowest. Focus on low-impact movement (like gentle yoga) and warm, iron-rich meals (spinach, soups).\n* **Follicular Phase (Days 6-12)**: Estrogen is rising, giving you a boost of energy. Great time to plan cardio and try new fitness exercises.\n* **Ovulation Phase (Days 13-15)**: Peak fertility and energy! High-intensity workouts are excellent now.\n* **Luteal Phase (Days 16-28)**: Progesterone dominates. You may experience PMS, bloating, or fatigue. Supplement with magnesium-rich foods (dark chocolate, pumpkin seeds) to calm cramps.\n\nUse our **Period Tracker** in the sidebar to log flows, symptoms, and visualize your cycle phase in 3D!${disclaimer}`;
    } else if (msgLower.includes('pregna') || msgLower.includes('baby') || msgLower.includes('due date') || msgLower.includes('kick') || msgLower.includes('contraction')) {
      reply = `🤰 **Pregnancy Support** 🤰\n\nCongratulations on this beautiful journey! Here is some quick guidance:\n\n* **Fetal Movement**: From Week 28, it is recommended to count fetal kicks. Use our built-in **Kick Counter** inside the **Pregnancy Care** page to track 10 kicks (ideally within 2 hours).\n* **Contractions**: If you feel tightening in your abdomen, use the **Contraction Timer** tab to calculate the duration and frequency. Remember the 5-1-1 rule: seek care if contractions are 5 minutes apart, lasting 1 minute, for at least 1 hour.\n* **Nutrition**: Focus on folate, iron, calcium, and staying well-hydrated. Check out your personalized Weekly Guide in the **Pregnancy Care** page!${disclaimer}`;
    } else if (msgLower.includes('stress') || msgLower.includes('anxious') || msgLower.includes('breath') || msgLower.includes('mood') || msgLower.includes('depress') || msgLower.includes('sad')) {
      reply = `🧠 **Mental Wellness & Grounding** 🧠\n\nI hear you, and it's completely okay to feel this way. Let's try a quick grounding exercise:\n\n* **Mindful Breathing**: Go to the **Mental Wellness** page in the sidebar and try our interactive breathing bubble. Breathe in as it expands, hold, and breathe out as it shrinks. Just 2 minutes can significantly reduce stress.\n* **Journaling**: Writing down your thoughts in the daily diary helper can help release tension. Don't bottle it up!${disclaimer}`;
    } else if (msgLower.includes('diet') || msgLower.includes('nutrition') || msgLower.includes('eat') || msgLower.includes('food') || msgLower.includes('meal') || msgLower.includes('water')) {
      reply = `🍎 **Nutrition & Healthy Eating** 🍎\n\nFueling your body with key nutrients changes how you feel:\n\n* **Hydration**: Aim for 2.5 Liters of water daily. Use the water tracker in the **Nutrition** page to easily log cups throughout the day.\n* **Balanced Macros**: Include protein with every meal to keep blood sugar stable.\n* **Cycle-Syncing**: Eat warm foods during menstruation, fresh raw greens during follicular, and fiber-rich slow carbs during luteal.${disclaimer}`;
    } else if (msgLower.includes('exercise') || msgLower.includes('workout') || msgLower.includes('fitness') || msgLower.includes('gym') || msgLower.includes('yoga') || msgLower.includes('strength')) {
      reply = `🏋️ **Fitness & Movement** 🏋️\n\nRegular physical activity is a pillar of wellness. To optimize your workouts, match them to your hormonal cycle:\n\n* **Follicular/Ovulatory**: ESTROGEN is high. Ideal for strength training, HIIT, and higher intensity routines.\n* **Luteal/Menstrual**: PROGESTERONE dominates or hormones drop. Opt for active recovery, pilates, walking, and slow yoga flows.\n\nCheck out the **Fitness** page to select a curated cycle-synced routine and log your activity!${disclaimer}`;
    } else {
      reply = `🌸 **Welcome to HerVerse AI** 🌸\n\nI am your companion for women's wellness. You can ask me anything about:\n* **Menstrual cycles** and period symptoms\n* **Pregnancy care**, kick counting, and fetal growth\n* **PCOS/PCOD** symptom management\n* **Nutrition** and hydration goals\n* **Fitness plans** and cycle-syncing exercises\n* **Mental wellness** and grounding techniques\n\nFeel free to ask a specific question, or select any of the dedicated tracking modules in the sidebar!${disclaimer}`;
    }

    res.json({ reply });
  }
});

module.exports = router;
