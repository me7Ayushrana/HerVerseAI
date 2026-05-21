import React from 'react';
export default function Emergency() {
  return (
    <div className="p-10 max-w-7xl mx-auto space-y-8">
      <h2 className="text-3xl font-display font-bold text-rose-500">Emergency</h2>
      <div className="glass-card p-10 h-64 flex items-center justify-center border-rose-500/30 bg-rose-500/5">
        <button className="w-48 h-48 rounded-full bg-rose-500 hover:bg-rose-600 animate-pulse text-white font-bold text-2xl shadow-[0_0_50px_rgba(244,63,94,0.5)]">
          SOS
        </button>
      </div>
    </div>
  );
}
