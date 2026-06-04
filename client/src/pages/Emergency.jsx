import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, ShieldAlert, HeartHandshake, Save, BellRing, MapPin, X, HelpCircle } from 'lucide-react';

export default function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [activeDirectory, setActiveDirectory] = useState('medical'); // medical, mental, crisis

  // Contact configurations
  const [contactName, setContactName] = useState(() => localStorage.getItem('herverse-emergency-name') || 'Sarah Doe');
  const [contactPhone, setContactPhone] = useState(() => localStorage.getItem('herverse-emergency-phone') || '+1 (555) 911-3040');
  const [contactEmail, setContactEmail] = useState(() => localStorage.getItem('herverse-emergency-email') || 'contact@example.com');
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveContact = (e) => {
    e.preventDefault();
    localStorage.setItem('herverse-emergency-name', contactName);
    localStorage.setItem('herverse-emergency-phone', contactPhone);
    localStorage.setItem('herverse-emergency-email', contactEmail);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const triggerSOS = () => {
    setSosActive(true);
    // Try sending native browser notification if allowed
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification("HerVerse SOS Alert Activated!", {
          body: `Sending location coords to ${contactName} at ${contactPhone}.`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };

  const directory = {
    medical: [
      { name: "Emergency Dispatch", number: "911 / 112", detail: "General medical emergencies & response" },
      { name: "Women's Health Helpline", number: "1-800-994-9662", detail: "General reproductive and health guidance" },
      { name: "Poison Control", number: "1-800-222-1222", detail: "Toxic ingestion and pharmaceutical response" }
    ],
    mental: [
      { name: "Suicide & Crisis Lifeline", number: "988", detail: "24/7 free, confidential crisis mental health counseling" },
      { name: "Crisis Text Line", number: "Text HOME to 741741", detail: "Text connection to real crisis support volunteers" },
      { name: "NAMI Mental Health Help", number: "1-800-950-6264", detail: "National Alliance on Mental Illness support" }
    ],
    crisis: [
      { name: "Domestic Violence Hotline", number: "1-800-799-7233", detail: "Safe space guidance and protection routing" },
      { name: "RAINN Sexual Assault Hotline", number: "1-800-656-4673", detail: "National sexual assault support hotline" },
      { name: "Trevor Project (LGBTQ+)", number: "1-866-488-7386", detail: "Crisis support for LGBTQ+ youth" }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-rose-600">Emergency & Crisis Support</h2>
        <p className="text-muted text-sm">Instant access to response helplines and quick-alert emergency notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Big SOS Button (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-10 flex flex-col items-center justify-center border-rose-500/20 bg-rose-500/5 min-h-[400px] text-center relative overflow-hidden shadow-md">
            
            {/* Pulsing warning aura */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 to-primary/5 pointer-events-none" />

            <h3 className="font-display font-extrabold text-xl text-rose-600 mb-2 flex items-center gap-2 z-10">
              <ShieldAlert className="animate-pulse" size={24} /> Trigger Emergency SOS
            </h3>
            <p className="text-xs text-muted max-w-sm mb-12 z-10">
              Pressing the SOS button below will simulate sending a high-priority alert notification along with your mock GPS coordinates to your saved contact.
            </p>

            {/* Giant SOS circle */}
            <button 
              onClick={triggerSOS}
              className="w-44 h-44 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 active:scale-95 transition-all duration-300 text-white font-display font-extrabold text-4xl shadow-[0_0_35px_rgba(244,63,94,0.4)] flex flex-col items-center justify-center gap-1.5 z-10 cursor-pointer animate-pulse"
            >
              <span>SOS</span>
              <span className="text-[10px] uppercase font-sans tracking-widest font-normal opacity-85">Click to Trigger</span>
            </button>
          </div>

          {/* Directory section */}
          <div className="glass-card p-6 border-primary/20 shadow-sm">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/10">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <HeartHandshake className="text-primary" size={22} /> Support Helpline Directory
              </h3>
              <div className="flex bg-primary/5 p-1 rounded-full border border-primary/10 text-xs">
                {['medical', 'mental', 'crisis'].map(dir => (
                  <button 
                    key={dir} 
                    onClick={() => setActiveDirectory(dir)}
                    className={`px-3 py-1.5 rounded-full font-bold uppercase transition-all-smooth ${activeDirectory === dir ? 'bg-rose-500 text-white shadow-sm' : 'text-muted hover:text-rose-500'}`}
                  >
                    {dir}
                  </button>
                ))}
              </div>
            </div>

            {/* Helpline cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {directory[activeDirectory].map((line, idx) => (
                <div key={idx} className="bg-white/95 border border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all-smooth flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-textMain text-sm mb-1">{line.name}</h4>
                    <p className="text-[10px] text-muted font-bold leading-tight mb-4">{line.detail}</p>
                  </div>
                  <a 
                    href={`tel:${line.number.split(' ')[0]}`}
                    className="w-full py-2 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold text-center hover:bg-rose-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall size={12} /> {line.number}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: SOS Contact setup (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Save className="text-primary" size={22} /> Configure SOS Contact
            </h3>
            
            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Full Name</label>
                <input 
                  type="text" 
                  value={contactName} 
                  onChange={e => setContactName(e.target.value)} 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Phone Number</label>
                <input 
                  type="text" 
                  value={contactPhone} 
                  onChange={e => setContactPhone(e.target.value)} 
                  required
                  placeholder="e.g. +1 (555) 911-3040"
                  className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-bold text-muted mb-1">Contact Email Address</label>
                <input 
                  type="email" 
                  value={contactEmail} 
                  onChange={e => setContactEmail(e.target.value)} 
                  required
                  placeholder="e.g. contact@example.com"
                  className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth"
              >
                {isSaved ? 'SOS Contact Saved!' : 'Save SOS Configurations'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* SOS Alert Modal overlay */}
      <AnimatePresence>
        {sosActive && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-rose-500 rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center text-textMain space-y-6"
            >
              <button 
                onClick={() => setSosActive(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-rose-50 text-muted hover:text-rose-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto text-rose-600 animate-bounce">
                <BellRing size={40} />
              </div>

              <div>
                <h3 className="text-2xl font-display font-extrabold text-rose-600 mb-2">SOS Alert Broadcasted!</h3>
                <p className="text-sm text-muted leading-relaxed">
                  An emergency dispatch signal has been simulated. Location coordinates have been sent to:
                </p>
              </div>

              <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-sm font-semibold space-y-1 text-rose-700">
                <p>Name: {contactName}</p>
                <p>SMS: {contactPhone}</p>
                <p>Email: {contactEmail}</p>
              </div>

              <div className="text-[10px] text-muted flex justify-center items-center gap-1.5 font-bold">
                <MapPin size={12} className="text-rose-500" />
                <span>Broadcasting GPS: 37.7749° N, 122.4194° W</span>
              </div>

              <button 
                onClick={() => setSosActive(false)}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-colors"
              >
                Deactivate Alert
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
