import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';

import { useState } from 'react';
import axios from 'axios';

export default function Signup() {
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
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
      const res = await axios.post('/api/auth/register', formData);
      login(res.data, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-bgDark overflow-hidden">
      <div className="hidden md:flex w-1/2 relative items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 mix-blend-screen" />
        <div className="w-[30vw] h-[30vw] rounded-full bg-secondary/30 blur-[100px] animate-pulse" />
      </div>
      
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 relative overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-10 w-full max-w-md my-8"
        >
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-display italic text-gradient font-bold mb-2">Join HerVerse AI</h1>
            <p className="text-muted text-sm">Create your profile to start your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Date of Birth</label>
              <input type="date" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary" />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <label className="text-sm font-medium text-muted">Are you currently pregnant?</label>
              <select className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary">
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-90 glow-hover transition-all-smooth"
            >
              Create Account
            </button>
          </form>
          
          <p className="mt-8 text-center text-sm text-muted">
            Already have an account? <Link to="/login" className="text-primary hover:text-secondary font-medium">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
