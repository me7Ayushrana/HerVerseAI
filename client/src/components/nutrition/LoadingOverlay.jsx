import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  "The menstrual phase (Days 1-5) requires iron and magnesium-rich foods to soothe uterine contractions.",
  "During the follicular phase (Days 6-11), focus on fermented foods and cruciferous vegetables to process rising estrogen.",
  "Peak estrogen during ovulation (Days 12-19) requires antioxidants to support healthy egg release.",
  "The luteal phase (Days 20-28) calls for complex carbs and vitamin B6 to lift progesterone and prevent cravings.",
  "Stable blood sugar prevents cortisol spikes, which helps regulate estrogen and progesterone ratios naturally."
];

export default function LoadingOverlay({ message = "Compiling cycle syncing insights..." }) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-8">
        {/* Loading Spinner */}
        <div className="relative w-24 h-24 mx-auto">
          <motion.div
            className="absolute inset-0 border-4 border-primary/20 rounded-full"
            style={{ borderTopColor: 'var(--color-primary)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-3xl">🌸</div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-textMain">{message}</h3>
          <p className="text-xs text-muted font-semibold uppercase tracking-widest animate-pulse">Running Calculations</p>
        </div>

        {/* Rotating Tips Box */}
        <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 min-h-[100px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={tipIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-textMain leading-relaxed font-medium"
            >
              {TIPS[tipIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
