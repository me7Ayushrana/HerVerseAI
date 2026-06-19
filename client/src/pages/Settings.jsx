import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles, PhoneCall, ShieldCheck, Check, Key, HelpCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const currentUser = useAuthStore(state => state.user);
  const userId = currentUser?.id || currentUser?._id || 'mock-user-123';
  
  // State for API Keys
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(`herverse-${userId}-gemini-key`) || '');
  const [isApiSaved, setIsApiSaved] = useState(false);

  // State for Emergency Contact
  const [sosName, setSosName] = useState(() => localStorage.getItem(`herverse-${userId}-emergency-name`) || 'Sarah Doe');
  const [sosPhone, setSosPhone] = useState(() => localStorage.getItem(`herverse-${userId}-emergency-phone`) || '+1 (555) 911-3040');
  const [sosEmail, setSosEmail] = useState(() => localStorage.getItem(`herverse-${userId}-emergency-email`) || 'contact@example.com');
  const [isSosSaved, setIsSosSaved] = useState(false);

  // Sync settings state when currentUser changes
  useEffect(() => {
    setApiKey(localStorage.getItem(`herverse-${userId}-gemini-key`) || '');
    setSosName(localStorage.getItem(`herverse-${userId}-emergency-name`) || 'Sarah Doe');
    setSosPhone(localStorage.getItem(`herverse-${userId}-emergency-phone`) || '+1 (555) 911-3040');
    setSosEmail(localStorage.getItem(`herverse-${userId}-emergency-email`) || 'contact@example.com');
  }, [userId]);

  const handleSaveApi = (e) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();
    setApiKey(cleanKey);
    localStorage.setItem(`herverse-${userId}-gemini-key`, cleanKey);
    setIsApiSaved(true);
    setTimeout(() => setIsApiSaved(false), 2000);
  };

  const handleSaveSos = (e) => {
    e.preventDefault();
    localStorage.setItem(`herverse-${userId}-emergency-name`, sosName);
    localStorage.setItem(`herverse-${userId}-emergency-phone`, sosPhone);
    localStorage.setItem(`herverse-${userId}-emergency-email`, sosEmail);
    setIsSosSaved(true);
    setTimeout(() => setIsSosSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 text-textMain"
    >
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Profile & Settings</h2>
        <p className="text-muted text-sm">Manage your profile, safety settings, and API integrations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="glass-card p-6 border-primary/20 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-primary">
              <User size={20} /> Personal Profile
            </h3>
            <div className="space-y-4 text-sm mt-6">
              <div className="flex justify-between py-2.5 border-b border-primary/5">
                <span className="text-muted font-semibold">Full Name</span>
                <span className="font-bold text-textMain">{currentUser?.name || 'User'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-primary/5">
                <span className="text-muted font-semibold">Email Address</span>
                <span className="font-bold text-textMain">{currentUser?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-2.5 border-b border-primary/5">
                <span className="text-muted font-semibold">Account Status</span>
                <span className="font-bold text-success flex items-center gap-1">
                  <Check size={14} /> Verified
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-muted font-semibold">User Role</span>
                <span className="font-bold text-primary flex items-center gap-1">
                  <ShieldCheck size={14} /> {currentUser?.isAdmin ? 'Administrator' : 'Standard Member'}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-8 text-[10px] text-muted font-bold uppercase tracking-wider">
            HerVerse Member since 2026
          </div>
        </div>

        {/* Gemini API Key Configuration */}
        <div className="glass-card p-6 border-primary/20 shadow-md">
          <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-primary">
            <Sparkles size={20} className="animate-pulse" /> Gemini AI Integration
          </h3>
          <p className="text-xs text-muted leading-relaxed mb-6">
            Paste your free Google Gemini API Key here to enable live generated wellness suggestions and chatbot responses. 
            Your key is stored <strong>locally in your browser</strong> for safety.
          </p>

          <form onSubmit={handleSaveApi} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-bold text-muted mb-1 flex items-center gap-1">
                <Key size={12} /> Gemini API Key
              </label>
              <input 
                type="password" 
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Gemini 1.5 Flash)"
                className="w-full bg-white border border-primary/20 rounded-xl p-3 text-sm text-textMain focus:outline-none focus:border-primary"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all-smooth"
            >
              {isApiSaved ? (
                <>
                  <Check size={16} /> API Key Saved
                </>
              ) : (
                'Save Connection Key'
              )}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
            <span className="text-muted">API Status:</span>
            {apiKey.trim() ? (
              <span className="text-success">● Connected (Live AI Active)</span>
            ) : (
              <span className="text-primary">○ Offline (Local Database Fallback)</span>
            )}
          </div>

          {/* Help Guide Box */}
          <div className="mt-6 pt-5 border-t border-primary/10 text-xs space-y-3">
            <h4 className="font-bold text-textMain flex items-center gap-1.5">
              <HelpCircle size={14} className="text-primary" /> Guide: How to get a free key
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-muted pl-1">
              <li>Go to <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold">Google AI Studio</a>.</li>
              <li>Sign in with your standard Google (Gmail) account.</li>
              <li>Click the blue <strong>"Get API Key"</strong> button in the left menu.</li>
              <li>Click <strong>"Create API Key in new project"</strong>.</li>
              <li>Copy your key (starts with <code>AIzaSy...</code>) and paste it above!</li>
            </ol>
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10 text-[10px] text-muted leading-relaxed">
              💡 <strong>Developer Facts:</strong> The Gemini API is 100% free, requires no credit card, and has a limit of 15 requests per minute. Your key is stored directly in your browser's localStorage and is completely private.
            </div>
          </div>
        </div>

        {/* SOS Emergency Contact Configuration */}
        <div className="glass-card p-6 border-primary/20 shadow-md md:col-span-2">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-rose-500">
            <PhoneCall size={20} /> SOS Safety Contact
          </h3>
          <p className="text-xs text-muted leading-relaxed mb-6">
            Configure the emergency contact who will receive high-priority alerts and mock coordinates when you trigger the <strong>SOS Emergency Button</strong> on the Emergency page.
          </p>

          <form onSubmit={handleSaveSos} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Full Name</label>
              <input 
                type="text" 
                value={sosName}
                onChange={e => setSosName(e.target.value)}
                required
                className="w-full bg-white border border-primary/20 rounded-xl p-3 text-sm text-textMain focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Phone</label>
              <input 
                type="text" 
                value={sosPhone}
                onChange={e => setSosPhone(e.target.value)}
                required
                className="w-full bg-white border border-primary/20 rounded-xl p-3 text-sm text-textMain focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Email</label>
              <input 
                type="email" 
                value={sosEmail}
                onChange={e => setSosEmail(e.target.value)}
                required
                className="w-full bg-white border border-primary/20 rounded-xl p-3 text-sm text-textMain focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-3 flex justify-end">
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all-smooth"
              >
                {isSosSaved ? (
                  <>
                    <Check size={16} /> Contact Details Saved
                  </>
                ) : (
                  'Save Safety Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
