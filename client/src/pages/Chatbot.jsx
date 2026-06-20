import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Mic, Settings, AlertTriangle, Sparkles, Check, Server } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getBestAvailableModelAndUrl } from '../utils/gemini';

// Helper to parse bold text (**text**)
function parseInlineMarkdown(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, partIdx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={partIdx} className="font-extrabold text-primary">{boldText}</strong>;
    }
    return part;
  });
}

// Helper to parse basic markdown elements (headers, lists)
function renderMarkdown(text) {
  if (!text) return "";
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Check if the line is a header (###, ##, #)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = parseInlineMarkdown(headerMatch[2]);
      const headerClasses = level === 1 ? "text-xl font-bold mb-2 mt-3 block" :
                            level === 2 ? "text-lg font-bold mb-1.5 mt-2 block" :
                            "text-base font-bold mb-1 mt-1 block";
      return <span key={lineIdx} className={headerClasses}>{content}</span>;
    }

    // Check if the line is a bullet list (*, -)
    const bulletMatch = line.match(/^[\*\-]\s+(.*)$/);
    if (bulletMatch) {
      const content = parseInlineMarkdown(bulletMatch[1]);
      return (
        <span key={lineIdx} className="flex gap-2 items-start pl-2 my-1 text-left w-full">
          <span className="text-primary font-bold">•</span>
          <span>{content}</span>
        </span>
      );
    }

    // Check if the line is a numbered list (1., 2.)
    const numberMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberMatch) {
      const num = numberMatch[1];
      const content = parseInlineMarkdown(numberMatch[2]);
      return (
        <span key={lineIdx} className="flex gap-2 items-start pl-2 my-1 text-left w-full">
          <span className="text-primary font-bold">{num}.</span>
          <span>{content}</span>
        </span>
      );
    }

    // Default: regular line of text (parse bold inline)
    if (line.trim() === '') {
      return <span key={lineIdx} className="block h-2" />;
    }

    return (
      <span key={lineIdx} className="block mb-1 text-left w-full">
        {parseInlineMarkdown(line)}
      </span>
    );
  });
}

// Helper to extract a list of keys from user input
const getApiKeyPool = (keyString) => {
  if (!keyString) return [];
  return keyString.split(/[\s,]+/).map(k => k.trim()).filter(k => k.startsWith('AIzaSy'));
};

export default function Chatbot() {
  const user = useAuthStore(state => state.user);
  const userId = user?.id || user?._id || 'mock-user-123';
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiStatus, setApiStatus] = useState('connected');
  const [keyIndex, setKeyIndex] = useState(0);

  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi there! I am HerVerse AI. How can I support your wellness journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => {
    return localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
  });
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem(`herverse-${userId}-chat-mode`);
    if (saved) return saved;
    const hasKey = !!(localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || import.meta.env.VITE_GEMINI_API_KEY);
    return hasKey ? 'ai' : 'local';
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Sync state when userId changes
  useEffect(() => {
    setIsLoaded(false);
    const key = localStorage.getItem(`herverse-${userId}-gemini-key`) || localStorage.getItem('herverse-gemini-key') || '';
    setCustomApiKey(key);
    const savedMode = localStorage.getItem(`herverse-${userId}-chat-mode`);
    const hasKey = !!(key || import.meta.env.VITE_GEMINI_API_KEY);
    setMode(savedMode || (hasKey ? 'ai' : 'local'));

    // Load saved messages
    const savedMsgStr = localStorage.getItem(`herverse-${userId}-chat-messages`);
    if (savedMsgStr) {
      try {
        setMessages(JSON.parse(savedMsgStr));
      } catch (err) {
        console.error("Failed to parse saved chat messages:", err);
      }
    } else {
      setMessages([
        { role: 'bot', text: 'Hi there! I am HerVerse AI. How can I support your wellness journey today?' }
      ]);
    }

    setIsLoaded(true);
  }, [userId]);

  // Save messages to local storage whenever they update
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`herverse-${userId}-chat-messages`, JSON.stringify(messages));
    }
  }, [messages, userId, isLoaded]);

  // Verify API Key connection status on mount, when customApiKey, mode, or userId changes
  useEffect(() => {
    let active = true;
    
    const timer = setTimeout(async () => {
      const keyPool = getApiKeyPool(customApiKey);
      const fallbackKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      const keysToTry = keyPool.length > 0 ? keyPool : (fallbackKey ? [fallbackKey] : []);

      if (keysToTry.length === 0) {
        if (active) setApiStatus('disconnected');
        return;
      }

      let anyKeyWorked = false;
      for (const key of keysToTry) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
          if (response.ok) {
            anyKeyWorked = true;
            break;
          }
        } catch (err) {
          console.warn("Failed to verify key in mount test:", err);
        }
      }

      if (active) {
        if (anyKeyWorked) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      }
    }, 500); // 500ms debounce

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customApiKey, mode, userId]);

  const handleSaveKey = (e) => {
    e.preventDefault();
    const cleanKey = customApiKey.trim();
    setCustomApiKey(cleanKey);
    localStorage.setItem(`herverse-${userId}-gemini-key`, cleanKey);
    setIsSaved(true);
    if (cleanKey) {
      setMode('ai');
      localStorage.setItem(`herverse-${userId}-chat-mode`, 'ai');
    }
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleToggleMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem(`herverse-${userId}-chat-mode`, newMode);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + ' ' + transcript : transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const hasApiKey = !!(
    customApiKey.trim() || 
    localStorage.getItem('herverse-gemini-key') || 
    import.meta.env.VITE_GEMINI_API_KEY
  );

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    const newMsg = { role: 'user', text: userText };
    const chatHistory = [...messages, newMsg];
    
    setMessages(chatHistory);
    setInput('');
    setIsLoading(true);
    
    const SYSTEM_PROMPT = `
You are HerVerse AI, a compassionate, knowledgeable, and professional women's health and wellness assistant.
Your goal is to provide supportive, accurate, and easy-to-understand information related to menstrual health, pregnancy, mental wellness, PCOS/PCOD, nutrition, and fitness for women.

IMPORTANT RULES:
1. Always maintain a supportive and empathetic tone.
2. If asked about a serious medical condition, severe pain, or emergency, advise the user to seek immediate professional medical help.
3. You are NOT a doctor. Always include this disclaimer in your advice: "Please remember that I am an AI assistant and this information is not a replacement for professional medical advice. Always consult with your healthcare provider for medical decisions."
4. Keep your responses concise and well-formatted using markdown.
`;

    // Format history so it strictly alternates and starts with 'user'
    const formattedHistory = [];
    for (const msg of messages.slice(-8)) {
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

    // Add the new user message, combining with the last message if it was also a user message
    const contents = [...formattedHistory];
    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts[0].text += "\n" + userText;
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: userText }]
      });
    }

    const keyPool = getApiKeyPool(customApiKey);
    const fallbackKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    const keysToTry = keyPool.length > 0 ? keyPool : (fallbackKey ? [fallbackKey] : []);
    
    if (mode === 'ai' && keysToTry.length > 0) {
      let success = false;
      let reply = "";
      
      // Start trying from the current keyIndex in our rotation pool
      for (let attempt = 0; attempt < keysToTry.length; attempt++) {
        const currentIdx = (keyIndex + attempt) % keysToTry.length;
        const activeKey = keysToTry[currentIdx];
        
        try {
          console.log(`[Chatbot] Attempting Gemini API request with key index ${currentIdx}...`);
          const { url: geminiUrl } = await getBestAvailableModelAndUrl(activeKey);

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const response = await fetch(
            geminiUrl,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents,
                systemInstruction: {
                  parts: [{ text: SYSTEM_PROMPT }]
                },
                generationConfig: {
                  maxOutputTokens: 1000,
                }
              }),
              signal: controller.signal
            }
          );
          clearTimeout(timeoutId);

          if (!response.ok) {
            let errMsg = `Status ${response.status}`;
            try {
              const errData = await response.json();
              if (errData.error?.message) {
                errMsg = errData.error.message;
              }
            } catch (_) {}
            throw new Error(errMsg);
          }

          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I am here to support you. Could you please rephrase your question?";
          
          setMessages([...chatHistory, { role: 'bot', text: reply }]);
          setApiStatus('connected');
          setKeyIndex(currentIdx);
          success = true;
          break; // Exit retry loop on successful completion
        } catch (error) {
          console.warn(`[Chatbot] Gemini API request failed for key index ${currentIdx}:`, error.message || error);
          
          // If all keys in the pool failed, fall back to the offline database
          if (attempt === keysToTry.length - 1) {
            setApiStatus('disconnected');
            console.error('[Chatbot] Chat Gemini API error: All keys in rotation pool failed.');
            runFallback(userText, chatHistory);
          }
        }
      }
      setIsLoading(false);
    } else {
      // Run local fallback immediately (offline mode)
      setTimeout(() => {
        runFallback(userText, chatHistory);
        setIsLoading(false);
      }, 500);
    }
  };

  const runFallback = (userText, chatHistory, prefix = "") => {
    const msgLower = userText.toLowerCase();
    let reply = "";

    const disclaimer = "\n\nPlease remember that I am an AI assistant and this information is not a replacement for professional medical advice. Always consult with your healthcare provider for medical decisions.";

    if (msgLower.includes('emergency') || msgLower.includes('severe pain') || msgLower.includes('bleeding heavily') || msgLower.includes('chest pain') || msgLower.includes('suicid') || msgLower.includes('hurt')) {
      reply = `Emergency Alert\n\nIf you are experiencing severe pain, heavy abnormal bleeding, chest tightness, or other medical emergencies, please seek immediate professional medical attention or call emergency services right away. You can also view the emergency numbers in our Emergency Center in the sidebar. Please take care of yourself!${disclaimer}`;
    } else if (msgLower.includes('pcos') || msgLower.includes('pcod') || msgLower.includes('cyst') || msgLower.includes('irregular cycle')) {
      reply = `PCOS and PCOD Guidance\n\nManaging PCOS and PCOD involves supportive lifestyle, dietary, and fitness habits:\n\n1. Low Glycemic Index Diet: Prioritize whole grains, leafy greens, healthy fats, and high fiber to help manage insulin resistance.\n2. Strength Training: Building muscle mass helps optimize metabolic function and hormone levels.\n3. Sleep Hygiene: Maintain a consistent 7-8 hours of sleep to stabilize cortisol (stress hormone) levels.\n4. Regular Tracking: Keep logging your symptoms in our PCOS Manager to identify personal triggers.${disclaimer}`;
    } else if (msgLower.includes('period') || msgLower.includes('cycle') || msgLower.includes('menstru') || msgLower.includes('cramp') || msgLower.includes('flow')) {
      reply = `Menstrual Cycle and Care\n\nHere are some helpful insights for your cycle:\n\n- Menstrual Phase (Days 1-5): Energy levels are lowest. Focus on low-impact movement (like gentle yoga) and warm, iron-rich meals (spinach, soups).\n- Follicular Phase (Days 6-12): Estrogen is rising, giving you a boost of energy. Great time to plan cardio and try new fitness exercises.\n- Ovulation Phase (Days 13-15): Peak fertility and energy! High-intensity workouts are excellent now.\n- Luteal Phase (Days 16-28): Progesterone dominates. You may experience PMS, bloating, or fatigue. Supplement with magnesium-rich foods (dark chocolate, pumpkin seeds) to calm cramps.\n\nUse our Period Tracker in the sidebar to log flows, symptoms, and visualize your cycle phase in 3D!${disclaimer}`;
    } else if (msgLower.includes('pregna') || msgLower.includes('baby') || msgLower.includes('due date') || msgLower.includes('kick') || msgLower.includes('contraction')) {
      reply = `Pregnancy Support\n\nCongratulations on this beautiful journey! Here is some quick guidance:\n\n- Fetal Movement: From Week 28, it is recommended to count fetal kicks. Use our built-in Kick Counter inside the Pregnancy Care page to track 10 kicks (ideally within 2 hours).\n- Contractions: If you feel tightening in your abdomen, use the Contraction Timer tab to calculate the duration and frequency. Remember the 5-1-1 rule: seek care if contractions are 5 minutes apart, lasting 1 minute, for at least 1 hour.\n- Nutrition: Focus on folate, iron, calcium, and staying well-hydrated. Check out your personalized Weekly Guide in the Pregnancy Care page!${disclaimer}`;
    } else if (msgLower.includes('stress') || msgLower.includes('anxious') || msgLower.includes('breath') || msgLower.includes('mood') || msgLower.includes('depress') || msgLower.includes('sad')) {
      reply = `Mental Wellness and Grounding\n\nI hear you, and it's completely okay to feel this way. Let's try a quick grounding exercise:\n\n- Mindful Breathing: Go to the Mental Wellness page in the sidebar and try our interactive breathing bubble. Breathe in as it expands, hold, and breathe out as it shrinks. Just 2 minutes can significantly reduce stress.\n- Journaling: Writing down your thoughts in the daily diary helper can help release tension. Don't bottle it up!${disclaimer}`;
    } else if (msgLower.includes('diet') || msgLower.includes('nutrition') || msgLower.includes('eat') || msgLower.includes('food') || msgLower.includes('meal') || msgLower.includes('water') || msgLower.includes('calor') || msgLower.includes('bmr') || msgLower.includes('bmi')) {
      reply = `Nutrition and Healthy Eating\n\nFueling your body with key nutrients changes how you feel:\n\n- Hydration: Aim for 2.5 Liters of water daily. Use the water tracker in the Nutrition page to easily log cups throughout the day.\n- Balanced Macros: Include protein with every meal to keep blood sugar stable.\n- Cycle-Syncing: Eat warm foods during menstruation, fresh raw greens during follicular, and fiber-rich slow carbs during luteal.${disclaimer}`;
    } else if (msgLower.includes('exercise') || msgLower.includes('workout') || msgLower.includes('fitness') || msgLower.includes('gym') || msgLower.includes('yoga') || msgLower.includes('strength')) {
      reply = `Fitness and Movement\n\nRegular physical activity is a pillar of wellness. To optimize your workouts, match them to your hormonal cycle:\n\n- Follicular/Ovulatory: ESTROGEN is high. Ideal for strength training, HIIT, and higher intensity routines.\n- Luteal/Menstrual: PROGESTERONE dominates or hormones drop. Opt for active recovery, pilates, walking, and slow yoga flows.\n\nCheck out the Fitness page to select a curated cycle-synced routine and log your activity!${disclaimer}`;
    } else if (msgLower.includes('weight') || msgLower.includes('height') || msgLower.includes('bmi') || msgLower.includes('bmr') || msgLower.includes('ideal') || msgLower.includes('body mass')) {
      reply = `Ideal Weight and BMI Guidance for Women\n\nA healthy body weight is usually evaluated using the Body Mass Index (BMI). Here is the standard breakdown:\n- Underweight: BMI under 18.5\n- Normal / Healthy Weight: BMI 18.5 – 24.9\n- Overweight: BMI 25.0 – 29.9\n- Obese: BMI 30.0 or higher\n\nFor a height of 165 cm (approx. 5 feet 5 inches):\n- The healthy weight range is approximately 50.5 kg to 67.8 kg.\n- An ideal middle-range weight is typically around 58 - 60 kg, depending on bone density, muscle mass, and age.\n\nHormonal weight changes:\n1. Water Retention: During the Luteal and Menstrual phases, progesterone and estrogen shifts can cause temporary water retention, showing a temporary increase of 1 to 2 kg on the scale. Do not panic! This is completely normal.\n2. Muscle vs Fat: Focus on body composition and strength rather than just the number on the scale. Strength training optimizes metabolic health and insulin sensitivity, especially helpful for PCOS.\n\nYou can calculate your exact daily calorie and macronutrient requirements by completing the onboarding inside our Nutrition & Meal Planner page in the sidebar!${disclaimer}`;
    } else if (msgLower === 'hi' || msgLower === 'hello' || msgLower === 'hey' || msgLower.startsWith('hi ') || msgLower.startsWith('hello ') || msgLower.startsWith('hey ')) {
      reply = `Hello! I am HerVerse AI, your companion for women's wellness. How can I help you today? You can ask me about menstrual cycles, pregnancy care, PCOS management, diet plans, workout routines, or grounding exercises!`;
    } else {
      reply = `Welcome to HerVerse AI\n\nI am your companion for women's wellness. You can ask me anything about:\n- Menstrual cycles and period symptoms\n- Pregnancy care, kick counting, and fetal growth\n- PCOS/PCOD symptom management\n- Nutrition and hydration goals\n- Fitness plans and cycle-syncing exercises\n- Mental wellness and grounding techniques\n\nFeel free to ask a specific question, or select any of the dedicated tracking modules in the sidebar!${disclaimer}`;
    }

    setMessages([...chatHistory, { role: 'bot', text: prefix + reply }]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-[calc(100vh-2rem)] p-6 max-w-4xl mx-auto flex flex-col"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
              <Bot className="text-primary" size={24} />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-textMain">HerVerse AI Assistant</h2>
            {mode === 'ai' && hasApiKey && apiStatus === 'connected' ? (
              <p className="text-xs text-success flex items-center gap-1 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" /> Online
              </p>
            ) : mode === 'local' ? (
              <p className="text-xs text-slate-500 flex items-center gap-1 font-semibold" title="Running in Local Guide mode. All responses are offline.">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Offline (Local Guide)
              </p>
            ) : !hasApiKey ? (
              <p className="text-xs text-amber-500 flex items-center gap-1 font-semibold" title="No API key entered. Kindly reconnect or check settings.">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Offline (No API Key)
              </p>
            ) : (
              <p className="text-xs text-red-500 flex items-center gap-1 font-semibold" title="Gemini API connection failed. Quota might be expired or key is invalid. Kindly check/update your keys.">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Offline (API Key Expired / Quota Over)
              </p>
            )}
          </div>
        </div>

        {/* Controls: Mode Switch & Settings Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-white/70 backdrop-blur-sm p-1 rounded-full border border-primary/20 shadow-sm text-xs font-bold">
            <button 
              type="button" 
              onClick={() => handleToggleMode('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                mode === 'ai' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow' 
                  : 'text-muted hover:text-primary'
              }`}
            >
              <Sparkles size={13} />
              <span>AI Mode</span>
            </button>
            <button 
              type="button" 
              onClick={() => handleToggleMode('local')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                mode === 'local' 
                  ? 'bg-secondary text-white shadow' 
                  : 'text-muted hover:text-secondary'
              }`}
            >
              <Server size={13} />
              <span>Local Guide</span>
            </button>
          </div>

          <button 
            type="button" 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full border shadow-sm transition-all duration-300 bg-white/70 ${showSettings ? 'border-primary/50 text-primary rotate-45' : 'border-primary/20 text-muted hover:text-primary'}`}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Settings Drawer */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="glass-card p-5 border-primary/20 shadow-md">
              <h4 className="font-bold text-sm text-textMain mb-1.5 flex items-center gap-1.5">
                <Sparkles className="text-primary animate-pulse" size={16} /> Configure Gemini AI API Key
              </h4>
              <p className="text-xs text-muted leading-relaxed mb-4">
                To chat using real-time Google Gemini generative models, paste your API Key here. 
                You can paste <strong>multiple keys separated by commas or spaces</strong> to build a rotation pool so your quota never runs out!
              </p>

              {customApiKey.trim() && (
                <div className="mb-3 px-3.5 py-2 bg-success/10 border border-success/20 rounded-xl text-xs text-success font-semibold flex items-center gap-1.5 self-start">
                  <Check size={14} />
                  <span>
                    API Key Rotation Pool Active ({getApiKeyPool(customApiKey).length} key(s) loaded)
                  </span>
                </div>
              )}
              
              <div className="mb-4 bg-primary/5 p-3 rounded-xl border border-primary/10 text-[10px] text-muted leading-relaxed space-y-1">
                <p><strong>🔑 How to get free API keys:</strong></p>
                <p>1. Open <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Google AI Studio</a> and sign in with Gmail.</p>
                <p>2. Click <strong>"Get API Key"</strong> -&gt; <strong>"Create API Key in new project"</strong> and copy it.</p>
                <p>3. (Optional) Create key pools by logging into different Google accounts to get additional keys, then paste them separated by commas below!</p>
              </div>
              
              <form onSubmit={handleSaveKey} className="flex gap-2">
                <input 
                  type="text" 
                  value={customApiKey}
                  onChange={e => {
                    setCustomApiKey(e.target.value);
                    setApiStatus('connected'); // reset status on edit
                  }}
                  placeholder="API Keys (separated by commas: Key1, Key2, ...)"
                  className="flex-1 bg-white border border-primary/20 rounded-xl px-4 py-2.5 text-sm text-textMain focus:outline-none focus:border-primary"
                />
                <button 
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm shadow hover:opacity-95 flex items-center gap-1 transition-all active:scale-95"
                >
                  {isSaved ? <Check size={16} /> : 'Save Key'}
                </button>
              </form>

              {/* Clear chat history action */}
              <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center">
                <span className="text-xs text-muted">Manage chat history:</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to clear your entire chat history?")) {
                      const initialMsg = [{ role: 'bot', text: 'Hi there! I am HerVerse AI. How can I support your wellness journey today?' }];
                      setMessages(initialMsg);
                      localStorage.setItem(`herverse-${userId}-chat-messages`, JSON.stringify(initialMsg));
                    }
                  }}
                  className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors py-1.5 px-3 rounded-lg border border-red-200 hover:bg-red-50/50 flex items-center gap-1 cursor-pointer"
                >
                  Clear Chat History
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Alert Banner if API key is not connected */}
      {!hasApiKey && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/5 border border-primary/20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 text-xs mb-4"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">✨</span>
            <p className="text-textMain font-semibold text-left">
              Running in Local Guide Mode. Connect your personal Gemini API key to unlock real-time AI responses and tailored diet plans!
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setShowSettings(true)}
            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-95 shadow active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
          >
            <Sparkles size={12} /> Connect API Key
          </button>
        </motion.div>
      )}

      {/* Main Chat Panel */}
      <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden mb-6 border-primary/20 shadow-xl">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none shadow-md font-medium' 
                  : 'bg-white/90 border border-primary/10 text-textMain rounded-tl-none'
              }`}>
                <div className="text-sm leading-relaxed space-y-1">
                  {renderMarkdown(msg.text)}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-2xl bg-white/90 border border-primary/10 text-textMain rounded-tl-none shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="mb-2 mt-4">
            <p className="text-xs text-muted font-bold mb-2 uppercase tracking-wider text-left">Quick Topics to Explore:</p>
            <div className="flex flex-wrap gap-2 justify-start">
              {[
                { label: "📅 Cycle Phase Tips", prompt: "What are the best foods and exercises for my current cycle phase?" },
                { label: "🥗 Low-GI PCOS Diet", prompt: "Explain the low glycemic index diet guidelines for PCOS management." },
                { label: "🤰 Kick Counter Rules", prompt: "How and when should I count fetal kicks during pregnancy?" },
                { label: "🧘 2-Min Grounding Flow", prompt: "Give me a quick grounding exercise or stress release routine." },
                { label: "💧 Water Goal Benefits", prompt: "Why is drinking 2.5 liters of water daily important for hormonal balance?" }
              ].map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInput(pill.prompt);
                  }}
                  className="px-3.5 py-2 text-xs font-bold bg-primary/5 border border-primary/10 rounded-full text-primary hover:bg-primary hover:text-white transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSend} className="mt-4 relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'ai' && apiStatus === 'connected' ? "Ask anything... (Live Gemini active)" : mode === 'ai' ? "Ask anything... (Gemini Offline - using Local Guide)" : "Ask about period, PCOS, fitness, pregnancy, stress..."}
            className="w-full bg-white border border-primary/25 rounded-full pl-6 pr-24 py-4 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-inner placeholder-muted/50"
          />
          <div className="absolute right-2 flex gap-2">
            <button 
              type="button" 
              onClick={handleVoiceInput}
              className={`p-2 rounded-full transition-all duration-300 ${
                isListening 
                  ? 'text-white bg-red-500 hover:bg-red-600 animate-pulse shadow-md' 
                  : 'text-muted hover:text-primary hover:bg-primary/5'
              }`}
              title={isListening ? "Listening... Click to stop" : "Start voice input"}
            >
              <Mic size={20} />
            </button>
            <button type="submit" className="p-2 rounded-full bg-primary text-white hover:opacity-95 shadow active:scale-95 transition-all-smooth">
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
      
      <p className="text-center text-xs text-muted">
        HerVerse AI provides general information, not medical advice. Please consult a doctor for personal health concerns.
      </p>
    </motion.div>
  );
}
