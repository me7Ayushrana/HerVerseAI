import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgDark relative px-4">
      {/* Background soft rosy orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-secondary/8 blur-[100px] pointer-events-none" />

      <div className="glass-card p-10 max-w-md w-full border-primary/20 shadow-xl z-10 relative">
        <h2 className="text-3xl font-display font-bold mb-3 text-center text-gradient italic">Reset Password</h2>
        <p className="text-muted text-sm text-center mb-6">Enter your email to receive a secure link to reset your password.</p>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-textMain mb-2">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com" 
            className="w-full bg-white/90 border border-primary/20 rounded-xl px-4 py-3 text-textMain focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-muted/50" 
          />
        </div>
        
        <button className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md hover:shadow-lg active:scale-[0.98] glow-hover transition-all-smooth mb-4">
          Send Reset Link
        </button>
        
        <div className="text-center text-sm">
          <Link to="/login" className="text-primary hover:text-secondary font-semibold">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
