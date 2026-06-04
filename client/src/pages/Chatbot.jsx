import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Mic } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi there! I am HerVerse AI. How can I support your wellness journey today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore(state => state.user?.token || ''); // Fallback for now if testing without auth

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userText = input.trim();
    const newMsg = { role: 'user', text: userText };
    const chatHistory = [...messages, newMsg];
    
    setMessages(chatHistory);
    setInput('');
    setIsLoading(true);
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // For local testing without token being strictly enforced on the server if not using protect,
      // But since we added protect, we need the token.
      
      const apiBase = import.meta.env.VITE_API_URL || '';
      const res = await axios.post(`${apiBase}/api/chat`, { 
        message: userText, 
        history: messages 
      }, config);
      
      setMessages([...chatHistory, { role: 'bot', text: res.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages([...chatHistory, { role: 'bot', text: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="h-[calc(100vh-2rem)] p-6 max-w-4xl mx-auto flex flex-col"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px]">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
            <Bot className="text-primary" size={24} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-textMain">HerVerse AI Assistant</h2>
          <p className="text-xs text-success flex items-center gap-1 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" /> Online
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden mb-6 border-primary/20 shadow-xl">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none shadow-md font-medium' 
                  : 'bg-white/90 border border-primary/10 text-textMain rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
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
        
        <form onSubmit={handleSend} className="mt-4 relative flex items-center">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your cycle, pregnancy, or wellness..."
            className="w-full bg-white border border-primary/25 rounded-full pl-6 pr-24 py-4 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm shadow-inner placeholder-muted/50"
          />
          <div className="absolute right-2 flex gap-2">
            <button type="button" className="p-2 rounded-full text-muted hover:text-primary hover:bg-primary/5 transition-colors">
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
