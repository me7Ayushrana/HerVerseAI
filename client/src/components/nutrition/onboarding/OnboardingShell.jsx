import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Step1_BodyMetrics from './steps/Step1_BodyMetrics';
import Step2_Goal from './steps/Step2_Goal';
import Step3_Activity from './steps/Step3_Activity';
import Step4_ExerciseTypes from './steps/Step4_ExerciseTypes';
import Step5_DietPreference from './steps/Step5_DietPreference';
import Step6_FoodPreferences from './steps/Step6_FoodPreferences';
import Step7_HealthConditions from './steps/Step7_HealthConditions';
import Step8_Lifestyle from './steps/Step8_Lifestyle';
import StepReview from './steps/StepReview';

const INITIAL_FORM_DATA = {
  age: '',
  weightKg: '',
  heightCm: '',
  goal: 'hormone_balance',
  targetWeightKg: '',
  timelineWeeks: '',
  activityLevel: 'sedentary',
  exerciseDaysPerWeek: 0,
  exerciseTypes: [],
  dietType: 'veg',
  mealFrequency: 5,
  cookingTime: 'moderate',
  allergies: [],
  intolerances: [],
  avoidFoods: [],
  preferredFoods: [],
  healthConditions: ['none'],
  wakeTime: '07:00',
  sleepTime: '23:00',
  waterLiters: 2.0,
  stressLevel: 'moderate',
  supplements: {
    proteinPowder: {
      active: false,
      name: '',
      proteinPer100g: '',
      carbsPer100g: '',
      fatPer100g: '',
      gramsPerDay: '',
      timing: 'Morning'
    },
    others: []
  }
};

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

export default function OnboardingShell({ onComplete }) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [currentPhase, setCurrentPhase] = useState('menstrual');

  const updateFields = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const handleNext = () => {
    // Basic validation for step 1
    if (step === 1 && (!formData.age || !formData.weightKg || !formData.heightCm)) {
      alert('Please fill out all body metrics.');
      return;
    }
    // Basic validation for weight goal
    if (step === 2 && (formData.goal === 'weight_loss' || formData.goal === 'weight_gain')) {
      if (!formData.targetWeightKg || !formData.timelineWeeks) {
        alert('Please fill out target weight and timeline.');
        return;
      }
    }

    if (step < 9) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onComplete(formData, currentPhase);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <Step1_BodyMetrics formData={formData} updateFields={updateFields} />;
      case 2:
        return <Step2_Goal formData={formData} updateFields={updateFields} />;
      case 3:
        return <Step3_Activity formData={formData} updateFields={updateFields} />;
      case 4:
        return <Step4_ExerciseTypes formData={formData} updateFields={updateFields} />;
      case 5:
        return <Step5_DietPreference formData={formData} updateFields={updateFields} />;
      case 6:
        return <Step6_FoodPreferences formData={formData} updateFields={updateFields} />;
      case 7:
        return <Step7_HealthConditions formData={formData} updateFields={updateFields} />;
      case 8:
        return <Step8_Lifestyle formData={formData} updateFields={updateFields} />;
      case 9:
        return (
          <div className="space-y-6">
            <StepReview formData={formData} />
            <div className="pt-2 border-t border-primary/10">
              <label className="block text-xs font-bold text-muted uppercase mb-2">Sync with Cycle Phase</label>
              <select
                value={currentPhase}
                onChange={e => setCurrentPhase(e.target.value)}
                className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3 text-sm text-textMain font-medium cursor-pointer"
              >
                <option value="menstrual">Menstrual Phase (Bleeding / Days 1-5)</option>
                <option value="follicular">Follicular Phase (Preparation / Days 6-11)</option>
                <option value="ovulatory">Ovulatory Phase (Peak Energy / Days 12-19)</option>
                <option value="luteal">Luteal Phase (PMS / Days 20-28)</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto glass-card p-6 md:p-8 border-primary/20 shadow-md">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-muted mb-2 tracking-wider">
          <span>Step {step} of 9</span>
          <span>{Math.round((step / 9) * 100)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-primary/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 9) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Slide Container */}
      <div className="relative overflow-hidden min-h-[380px] flex flex-col justify-between">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="w-full"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-8 mt-6 border-t border-primary/10">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className={`px-6 py-2.5 rounded-xl border text-sm font-bold transition-all-smooth ${
              step === 1
                ? 'opacity-40 cursor-not-allowed border-muted/20 text-muted'
                : 'border-primary/20 text-primary hover:bg-primary/5 cursor-pointer'
            }`}
          >
            Back
          </button>
          
          {step === 9 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-95 shadow-md shadow-primary/10 active:scale-95 transition-all cursor-pointer"
            >
              Generate Plan
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-95 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
