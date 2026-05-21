import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';
import wellnessHero from '../../assets/wellness_hero.png';

export default function Login() {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', formData);
      login(res.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
            Empowering women through AI-powered insights, interactive 3D anatomy, smart calendars, and a supportive community.
          </p>
        </div>
      </div>
      
      {/* Right panel: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 w-full max-w-md border-primary/20 shadow-xl"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display italic text-gradient font-bold mb-2">Welcome Back</h1>
            <p className="text-muted text-sm">Sign in to continue your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textMain mb-2">Password</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer hover:text-textMain transition-colors">
                <input 
                  type="checkbox" 
                  className="rounded border-primary/30 text-primary focus:ring-primary focus:ring-offset-0 bg-white" 
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:text-secondary transition-colors font-medium">Forgot Password?</Link>
            </div>
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md hover:shadow-lg active:scale-[0.98] glow-hover transition-all-smooth"
            >
              Sign In
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted">
            Don't have an account? <Link to="/signup" className="text-primary hover:text-secondary font-semibold">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
