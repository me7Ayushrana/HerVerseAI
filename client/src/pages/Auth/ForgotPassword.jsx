import React from 'react';
export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgDark">
      <div className="glass-card p-10 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <p className="text-muted text-sm text-center mb-6">Enter your email to receive a reset link.</p>
        <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary mb-4" />
        <button className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold">Send Link</button>
      </div>
    </div>
  );
}
