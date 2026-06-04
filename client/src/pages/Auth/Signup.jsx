import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import wellnessHero from '../../assets/wellness_hero.png';

export default function Signup() {
  const signup = useAuthStore(state => state.signup);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    dob: '',
    isPregnant: 'no'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signup(formData.email, formData.password, formData.name);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-bgDark overflow-hidden relative">
      {/* Background soft rosy orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/8 blur-[100px] pointer-events-none" />

      {/* Floating decorative petals */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20 text-lg"
            style={{
              top: `${10 + (i * 19) % 80}%`,
              left: `${5 + (i * 23) % 90}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, (i % 2 === 0 ? 15 : -15), 0],
              rotate: [0, i % 2 === 0 ? 20 : -20, 0],
            }}
            transition={{
              duration: 10 + i * 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🌸
          </motion.div>
        ))}
      </div>

      {/* Left panel: Decorative Illustration */}
      <div className="hidden md:flex w-1/2 relative items-center justify-center p-12 z-10">
        <div className="glass-card p-8 w-full max-w-lg text-center flex flex-col items-center justify-center border-primary/10 shadow-lg">
          <motion.img 
            src={wellnessHero} 
            alt="HerVerse Wellness" 
            className="max-h-[350px] object-contain drop-shadow-md mb-8"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <h2 className="text-3xl font-display font-bold text-textMain mb-3 italic">HerVerse AI</h2>
          <p className="text-muted text-sm max-w-sm">
            Begin your journey with your personal AI wellness companion. Get access to smart diagnostics, educational animations, and tools tailored to you.
          </p>
        </div>
      </div>
      
      {/* Right panel: Signup Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 relative overflow-y-auto max-h-screen">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 w-full max-w-md my-8 border-primary/20 shadow-xl"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-display italic text-gradient font-bold mb-2">Join HerVerse AI</h1>
            <p className="text-muted text-sm">Create your profile to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50" 
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50" 
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50" 
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-1">Date of Birth</label>
              <input 
                type="date" 
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required 
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-2.5 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-medium text-textMain">Are you currently pregnant?</label>
              <select 
                name="isPregnant"
                value={formData.isPregnant}
                onChange={handleChange}
                className="bg-white/95 border border-primary/20 rounded-xl px-3 py-2 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer font-medium"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md hover:shadow-lg active:scale-[0.98] glow-hover transition-all-smooth"
            >
              Create Account
            </button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="text-primary hover:text-secondary font-semibold">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
