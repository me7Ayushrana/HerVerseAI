import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

import { useState } from 'react';
import axios from 'axios';

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
    <div className="min-h-screen flex bg-bgDark overflow-hidden">
      <div className="hidden md:flex w-1/2 relative items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 mix-blend-screen" />
        <div className="w-[30vw] h-[30vw] rounded-full bg-primary/30 blur-[100px] animate-pulse" />
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 relative">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 w-full max-w-md"
        >
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-display italic text-gradient font-bold mb-2">Welcome Back</h1>
            <p className="text-muted text-sm">Sign in to continue your wellness journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Password</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted cursor-pointer">
                <input type="checkbox" className="rounded bg-white/5 border-white/10 text-primary focus:ring-primary" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary hover:text-secondary transition-colors">Forgot Password?</Link>
            </div>
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-90 glow-hover transition-all-smooth"
            >
              Sign In
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted">
            Don't have an account? <Link to="/signup" className="text-primary hover:text-secondary font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
