import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Shield, Activity, Calendar, ArrowRight, MessageSquareHeart, Check, HelpCircle } from 'lucide-react';
import wellnessHero from '../assets/wellness_hero.png';

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState('pcos');
  const [demoMessages, setDemoMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);

  const demoThreads = {
    pcos: {
      question: "How do I manage my PCOS symptoms naturally?",
      answer: `🌸 **PCOS Lifestyle Guidelines** 🌸

To help regulate insulin resistance and balance hormones:
1. **Low-GI Diet**: Focus on fiber-rich grains, avocados, and dark leafy greens to keep blood sugar stable.
2. **Strength over Cardio**: Building muscle mass helps regulate male hormones (androgens) much better than long, stressful cardio.
3. **Anti-inflammatory Herbs**: Spearmint tea is clinically proven to help reduce hormonal acne and unwanted hair growth.`
    },
    cramps: {
      question: "What is the best way to deal with severe menstrual cramps?",
      answer: `📅 **Menstrual Cramp Relief** 📅

To naturally soothe uterine muscle spasms:
* **Magnesium Boost**: Snacking on pumpkin seeds, bananas, or dark chocolate relaxes uterine walls.
* **Warmth**: Use a heating pad or drink hot chamomile/ginger tea to improve blood flow and relieve tension.
* **Gentle Movement**: Swap intense cardio workouts for restorative yoga stretches to avoid raising stress hormones.`
    },
    pregnancy: {
      question: "How and when should I start counting baby kicks?",
      answer: `🤰 **Prenatal Kick Counting** 🤰

* **When to Start**: Start counting daily around **Week 28** (third trimester).
* **The Routine**: Sit or lie comfortably on your left side after a meal. Note down how long it takes to feel **10 distinct movements**.
* **Target**: You should ideally count 10 kicks within 2 hours. Use our built-in **Kick Counter** inside the app to track daily progress!`
    }
  };

  // Trigger demo simulation when active topic changes
  useEffect(() => {
    setDemoMessages([]);
    setIsTyping(true);

    const timer1 = setTimeout(() => {
      // Add user message
      setDemoMessages([{ role: 'user', text: demoThreads[activeDemo].question }]);
      setIsTyping(true);

      const timer2 = setTimeout(() => {
        // Stop typing indicator and add AI answer
        setIsTyping(false);
        setDemoMessages(prev => [...prev, { role: 'bot', text: demoThreads[activeDemo].answer }]);
      }, 1000);

      return () => clearTimeout(timer2);
    }, 400);

    return () => clearTimeout(timer1);
  }, [activeDemo]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-bgDark selection:bg-primary/20 selection:text-primary">
      
      {/* Floating Background Light Orbs */}
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/8 blur-[130px] pointer-events-none z-0" 
      />
      <motion.div 
        animate={{ y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/8 blur-[120px] pointer-events-none z-0" 
      />
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-accent/6 blur-[100px] pointer-events-none z-0" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex justify-between items-center rounded-full border-primary/10">
        <h1 className="text-2xl font-display italic text-gradient font-bold tracking-wider">HerVerse AI</h1>
        <div className="hidden md:flex gap-8 text-sm font-semibold text-muted">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#demo" className="hover:text-primary transition-colors">Try AI Demo</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-5 py-2.5 rounded-full text-muted hover:text-primary hover:bg-primary/5 transition-colors text-sm font-semibold">Log In</Link>
          <Link to="/signup" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold hover:opacity-90 glow-hover transition-all-smooth shadow-md shadow-primary/10">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-12 gap-12 items-center w-full">
          {/* Left Column: Heading and CTA */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:col-span-7 text-left max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-6">
              <Sparkles size={12} className="animate-pulse" /> Empowering Every Stage of You
            </span>
            <h2 className="text-4xl md:text-6xl font-display italic mb-6 leading-tight font-extrabold text-textMain">
              Your Health.<br/>
              <span className="text-gradient">Your Power.</span><br/>
              Your <span className="underline decoration-wavy decoration-primary/30">HerVerse</span>.
            </h2>
            <p className="text-lg md:text-xl text-muted mb-8 leading-relaxed font-sans font-normal">
              Empathetic AI-powered guidance, interactive 3D cycle visualization, and smart wellness metrics customized perfectly for your unique body, cycle, and life.
            </p>

            {/* Value Props Inline Grid */}
            <div className="flex flex-wrap gap-5 mb-10 border-l-2 border-primary/20 pl-4 py-1 text-xs font-bold uppercase tracking-wider text-muted">
              <span className="flex items-center gap-1">🛡️ Secure & Private</span>
              <span className="flex items-center gap-1">✨ Gemini 1.5 Enabled</span>
              <span className="flex items-center gap-1">🌸 10+ Interactive Trackers</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-95 shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-98 transition-all duration-300 text-center">
                Get Started Free
              </Link>
              <a href="#features" className="px-8 py-4 rounded-full border border-primary/20 glass-card hover:bg-primary/5 transition-all duration-300 font-bold text-lg text-center text-primary">
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Right Column: Hero Illustration Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="md:col-span-5 flex justify-center items-center relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl blur-2xl z-0" />
            <div className="glass-card p-4 relative z-10 border-primary/15 shadow-xl">
              <img 
                src={wellnessHero} 
                alt="Women wellness illustration representing healthy living, yoga, self-care, and tracking cycle" 
                className="w-full h-auto rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-700" 
              />
            </div>
            
            {/* Absolute badge overlay */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 glass-card p-4 flex items-center gap-3 border-primary/20 shadow-lg z-20 bg-white/90"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">🤖</div>
              <div className="text-left">
                <p className="text-[10px] text-muted font-extrabold uppercase tracking-wider">HerVerse AI</p>
                <p className="text-xs font-extrabold text-gradient flex items-center gap-1">
                  Supportive Chat Active
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive AI Chat Sandbox Demo Section */}
      <section id="demo" className="py-20 px-6 max-w-5xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-3">
            Interactive Experience
          </span>
          <h3 className="text-3xl md:text-4xl font-display font-bold italic text-textMain">
            Experience HerVerse AI In Action
          </h3>
          <p className="text-sm text-muted mt-2">
            Click one of the popular topics below to simulate a conversation with our supportive AI wellness counselor.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
          {/* Left panel: Sample Topics */}
          <div className="md:col-span-4 flex flex-col gap-3 justify-center">
            {[
              { id: 'pcos', label: '🌸 PCOS Symptom Management', detail: 'Hormonal & lifestyle tips' },
              { id: 'cramps', label: '📅 Fast Period Cramp Relief', detail: 'Natural spasm control guidance' },
              { id: 'pregnancy', label: '🤰 Prenatal Kick Counting', detail: 'Third trimester safety routines' },
            ].map(topic => (
              <button
                key={topic.id}
                onClick={() => setActiveDemo(topic.id)}
                className={`text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-1 cursor-pointer ${
                  activeDemo === topic.id 
                    ? 'bg-gradient-to-r from-primary/10 to-secondary/10 border-primary shadow-sm' 
                    : 'bg-white/60 border-primary/10 hover:border-primary/30 hover:bg-white/90'
                }`}
              >
                <span className="font-bold text-sm text-textMain">{topic.label}</span>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{topic.detail}</span>
              </button>
            ))}
          </div>

          {/* Right panel: Chat Mockup Box */}
          <div className="md:col-span-8 glass-card p-6 border-primary/20 shadow-xl flex flex-col justify-between min-h-[350px]">
            {/* Chat header */}
            <div className="flex items-center gap-2 pb-3 border-b border-primary/10 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-textMain">HerVerse AI Assistant</p>
                <p className="text-[9px] text-success font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live Sandbox
                </p>
              </div>
            </div>

            {/* Message Feed Area */}
            <div className="flex-1 space-y-4 overflow-y-auto mb-4 min-h-[200px] flex flex-col justify-end">
              <AnimatePresence>
                {demoMessages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-tr-none font-medium' 
                        : 'bg-white border border-primary/10 text-textMain rounded-tl-none whitespace-pre-wrap font-medium'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-primary/10 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Input simulator bar */}
            <div className="bg-primary/5 px-4 py-3 rounded-full text-xs text-muted border border-primary/10 flex items-center justify-between">
              <span>Ask about cycles, pregnancy, PCOS, mental wellness...</span>
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white">
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10 border-t border-primary/5">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/15 text-secondary font-bold text-xs uppercase tracking-widest mb-3">
            Wellness Suite
          </span>
          <h3 className="text-3xl md:text-5xl font-display font-bold italic text-center text-textMain">
            Everything You Need, In One Place
          </h3>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Period Tracker', desc: 'Intelligent calendar logging, symptom predictions, and a gorgeous dynamic 3D cycle visualization.', tag: 'Interactive 3D' },
            { title: 'AI Chatbot', desc: 'Compassionate, safe, and context-aware responses powered by Google Gemini to guide your wellness journey.', tag: 'Gemini 1.5' },
            { title: '3D Pregnancy Care', desc: 'Active monitoring tools, kick counters, contraction stopwatches, and interactive 3D fetal development models.', tag: 'Motherhood' },
            { title: 'Mental Wellness', desc: 'Self-care checklists, mindful breathing guidance bubbles, and reflective daily mood logs.', tag: 'Mindfulness' },
            { title: 'Nutrition & Lifestyle', desc: 'Tailored vitamin logging, diet tracking sheets, and targeted wellness score checkers.', tag: 'Lifestyle' },
            { title: 'PCOS Care Companion', desc: 'Personalized trackers for weight logs, daily symptom scores, and targeted hydration monitors.', tag: 'PCOS/PCOD' }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group cursor-pointer relative flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary" />
                  </div>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary">
                    {feature.tag}
                  </span>
                </div>
                <h4 className="text-xl font-bold mb-3 text-textMain group-hover:text-primary transition-colors">{feature.title}</h4>
                <p className="text-muted text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card mt-20 border-t border-primary/10 rounded-b-none py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-display italic text-gradient font-bold mb-4">HerVerse AI</h2>
            <p className="text-sm text-muted">Your intelligent, beautifully tailored companion for every stage of womanhood.</p>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Menstrual Cycle Logging</li>
              <li>Interactive 3D Pregnancy</li>
              <li>Empathetic AI Assistant</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-primary/10 text-center text-xs text-muted">
          <p>Disclaimer: Not a medical replacement. Please consult a qualified healthcare provider for personalized medical advice.</p>
          <p className="mt-2">© 2026 HerVerse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
