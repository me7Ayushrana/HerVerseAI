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
      
      const res = await axios.post('/api/chat', { 
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
          <div className="w-full h-full rounded-full bg-bgDark flex items-center justify-center">
            <Bot className="text-primary" size={24} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold">HerVerse AI Assistant</h2>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" /> Online
          </p>
        </div>
      </div>

      <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden mb-6">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-4 rounded-2xl bg-white/5 border border-white/10 text-white rounded-tl-none">
                <div className="flex gap-1 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSend} className="mt-4 relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your cycle, pregnancy, or wellness..."
            className="w-full bg-bgDark border border-white/10 rounded-full pl-6 pr-24 py-4 text-white focus:outline-none focus:border-primary transition-colors text-sm"
          />
          <div className="absolute right-2 top-2 flex gap-2">
            <button type="button" className="p-2 rounded-full text-muted hover:text-white hover:bg-white/5 transition-colors">
              <Mic size={20} />
            </button>
            <button type="submit" className="p-2 rounded-full bg-primary text-white hover:opacity-90 transition-colors">
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
