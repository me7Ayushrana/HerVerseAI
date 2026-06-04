import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import wellnessHero from '../assets/wellness_hero.png';

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 150]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-bgDark selection:bg-primary/20 selection:text-primary">
      {/* Background Orbs with light-theme opacity and rose glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[30vw] h-[30vw] rounded-full bg-accent/8 blur-[100px] pointer-events-none" />



      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex justify-between items-center rounded-full border-primary/10">
        <h1 className="text-2xl font-display italic text-gradient font-bold tracking-wider">HerVerse AI</h1>
        <div className="hidden md:flex gap-8 text-sm font-medium text-muted">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-full text-muted hover:text-primary hover:bg-primary/5 transition-colors font-medium">Log In</Link>
          <Link to="/signup" className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 glow-hover transition-all-smooth">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6 md:px-12 max-w-7xl mx-auto z-10">
        <div className="grid md:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Heading and CTA */}
          <motion.div 
            style={{ y: y1 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:col-span-7 text-left max-w-2xl"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6">
              Empowering Every Stage of You
            </span>
            <h2 className="text-4xl md:text-6xl font-display italic mb-6 leading-tight">
              Your Health.<br/>
              <span className="text-gradient">Your Power.</span><br/>
              Your HerVerse.
            </h2>
            <p className="text-lg md:text-xl text-muted mb-10 leading-relaxed font-sans font-normal">
              Empathetic AI-powered guidance, interactive 3D anatomy, and smart wellness metrics customized perfectly for your unique body, cycle, and life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-95 glow-hover transition-all-smooth text-center shadow-lg shadow-primary/20">
                Get Started Free
              </Link>
              <a href="#features" className="px-8 py-4 rounded-full border border-primary/20 glass-card hover:bg-primary/5 transition-all-smooth font-bold text-lg text-center text-primary">
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
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-3xl blur-2xl z-0" />
            <div className="glass-card p-4 relative z-10 border-primary/15 shadow-xl">
              <img 
                src={wellnessHero} 
                alt="Women wellness illustration representing healthy living, yoga, self-care, and tracking cycle" 
                className="w-full h-auto rounded-2xl object-cover hover:scale-102 transition-transform duration-700" 
              />
            </div>
            {/* Absolute badge overlay */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 glass-card p-4 flex items-center gap-3 border-primary/20 shadow-lg z-20 bg-white/90"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl">🤖</div>
              <div className="text-left">
                <p className="text-xs text-muted font-bold">HerVerse AI</p>
                <p className="text-xs font-bold text-gradient">Supportive Chat Active</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold text-xs uppercase tracking-widest mb-3">
            Wellness Suite
          </span>
          <h3 className="text-3xl md:text-5xl font-display italic text-center">
            Everything You Need, In One Place
          </h3>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Period Tracker', desc: 'Intelligent calendar logging, symptom predictions, and a gorgeous dynamic 3D cycle visualization.' },
            { title: 'AI Chatbot', desc: 'Compassionate, safe, and context-aware responses powered by Google Gemini to guide your wellness journey.' },
            { title: '3D Pregnancy Care', desc: 'Active monitoring tools, kick counters, contraction stopwatches, and interactive 3D fetal development models.' },
            { title: 'Mental Wellness', desc: 'Self-care checklists, mindful breathing guidance bubbles, and reflective daily mood logs.' },
            { title: 'Nutrition & Lifestyle', desc: 'Tailored vitamin logging, diet tracking sheets, and targeted wellness score checkers.' },
            { title: 'PCOS Care Companion', desc: 'Personalized trackers for weight logs, daily symptom scores, and targeted hydration monitors.' }
          ].map((feature, i) => (
            <motion.div 
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 glow-hover group cursor-pointer border-primary/10 shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary" />
              </div>
              <h4 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h4>
              <p className="text-muted text-sm leading-relaxed">
                {feature.desc}
              </p>
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
            <h4 className="font-bold text-primary mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Menstrual Cycle Logging</li>
              <li>Interactive 3D Pregnancy</li>
              <li>Empathetic AI Assistant</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-4">Legal</h4>
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
