import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function Landing() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-bgDark">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen" />
      <div className="absolute bottom-[10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-secondary/20 blur-[100px] mix-blend-screen" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 px-6 py-4 flex justify-between items-center rounded-full border-white/10">
        <h1 className="text-2xl font-display italic text-gradient font-bold">HerVerse AI</h1>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#about" className="hover:text-primary transition-colors">About</a>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-5 py-2 rounded-full hover:bg-white/10 transition-colors">Log In</Link>
          <Link to="/signup" className="px-5 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-medium hover:opacity-90 glow-hover transition-all-smooth">Sign Up</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div 
          style={{ y: y1 }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          <h2 className="text-5xl md:text-7xl font-display italic mb-6 leading-tight">
            Your Health.<br/>
            <span className="text-gradient">Your Power.</span><br/>
            Your HerVerse.
          </h2>
          <p className="text-xl md:text-2xl text-muted mb-10 max-w-2xl mx-auto font-sans">
            AI-powered wellness for every woman, at every stage. Track, learn, and thrive with intelligent insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-lg hover:opacity-90 glow-hover transition-all-smooth transform hover:scale-105">
              Get Started Free
            </Link>
            <button className="px-8 py-4 rounded-full border border-white/20 glass-card hover:bg-white/5 transition-all-smooth font-bold text-lg">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto relative z-10">
        <h3 className="text-3xl md:text-5xl font-display italic text-center mb-16">Everything You Need, In One Place</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {['Period Tracker', 'AI Chatbot', '3D Pregnancy', 'Mental Wellness', 'Nutrition', 'PCOS Care'].map((feature, i) => (
            <motion.div 
              key={feature}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className="glass-card p-8 glow-hover group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary to-secondary" />
              </div>
              <h4 className="text-xl font-bold mb-3">{feature}</h4>
              <p className="text-muted text-sm leading-relaxed">
                Intelligent tracking and personalized insights tailored perfectly to your unique body and needs.
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-card mt-20 border-b-0 border-x-0 rounded-b-none py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <h2 className="text-xl font-display italic text-gradient font-bold mb-4">HerVerse AI</h2>
            <p className="text-sm text-muted">Your intelligent companion for every stage of womanhood.</p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Period Tracking</li>
              <li>Pregnancy Care</li>
              <li>Mental Wellness</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10 text-center text-xs text-muted">
          <p>Disclaimer: Not a medical replacement. Please consult a qualified healthcare provider for personalized medical advice.</p>
          <p className="mt-2">© 2026 HerVerse AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
