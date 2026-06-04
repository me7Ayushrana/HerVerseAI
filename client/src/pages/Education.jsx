import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, HelpCircle, X, ChevronRight, Award, Check, AlertTriangle } from 'lucide-react';

export default function Education() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // 'Myth' or 'Fact'
  const [isAnswered, setIsAnswered] = useState(false);

  const articles = [
    {
      id: '1',
      title: "Understanding Hormonal Rhythms",
      summary: "Estrogen, Progesterone, LH, and FSH run your monthly cycle. Learn how these messengers interact.",
      content: `Your menstrual cycle is governed by a delicate dance of four primary hormones:

1. **FSH (Follicle Stimulating Hormone)**: Released by the brain, FSH prompts the ovaries to grow fluid-filled sacs (follicles), each containing an egg.
2. **Estrogen**: As follicles grow, they release estrogen. This hormone triggers the thickening of your uterine lining and boosts your physical energy and mood.
3. **LH (Luteinizing Hormone)**: Rising estrogen levels trigger a sharp surge in LH. This surge forces the dominant follicle to rupture, releasing the mature egg. This is **Ovulation**.
4. **Progesterone**: After ovulation, the ruptured follicle transforms into the corpus luteum, producing progesterone. Progesterone maintains the uterine lining for potential pregnancy. If no egg is fertilized, levels plummet, signaling the uterine lining to shed, starting **Menstruation**.

**Cycle Syncing Tip**: Tailor your workouts and calorie intake to these phases. High estrogen phases (follicular/ovulation) favor high-intensity training. High progesterone phases (luteal) favor slow recovery movements.`,
      tag: "Hormonal Health",
      emoji: "🧬"
    },
    {
      id: '2',
      title: "PCOS & Insulin Resistance",
      summary: "Explore the deep clinical link between blood sugar insulin levels and ovarian cyst development.",
      content: `Polycystic Ovary Syndrome (PCOS) is primarily an endocrine/metabolic disorder. A central driver for over 70% of PCOS cases is **Insulin Resistance**.

When you eat carbohydrates, they convert into glucose. The pancreas releases insulin to unlock cells, allowing them to absorb glucose for energy. In insulin-resistant bodies, cells ignore these insulin signals. The pancreas responds by pumping out more insulin to clear the glucose.

**The PCOS Connection**: High levels of insulin direct the ovaries to produce excess male hormones (androgens) like testosterone. Excess androgens block follicles from releasing mature eggs, forming small, immature fluid-filled sacs (erroneously called 'cysts') and causing irregular periods, facial hair, and weight gain.

**Lifestyle Strategy**:
* **Prioritize Fiber & Protein**: Eat complex carbs (quinoa, legumes) paired with healthy fats to slow down glucose absorption.
* **Resistance Training**: Building lean muscle activates glucose receptors independent of insulin, lowering circulating insulin levels naturally.`,
      tag: "Metabolic Health",
      emoji: "🥗"
    },
    {
      id: '3',
      title: "Pelvic Floor Wellness",
      summary: "Strengthen and support pelvic floor muscles to enhance deep bladder control and uterine health.",
      content: `The pelvic floor is a bowl-shaped sling of muscles stretching from your pubic bone to your tailbone. It supports your bladder, uterus, and bowels.

**Why Pelvic Floor Health Matters**:
Weakened pelvic floor muscles can lead to urinary incontinence, pelvic organ prolapse, or back pain. Conversely, hypertonic (excessively tight) pelvic floor muscles can cause pelvic pain or painful intimacy.

**Exercises for Balance**:
* **Kegels (Strengthening)**: Squeeze and lift your pelvic floor muscles (as if trying to stop the flow of urine). Hold for 5 seconds, relax fully for 5 seconds. Repeat 10 times.
* **Deep Diaphragmatic Breathing (Relaxation)**: Lie down, place one hand on your belly. Inhale deeply, allowing your belly and pelvic floor to expand fully. Exhale slowly, allowing them to return to neutral. This prevents muscle tension and calms the nervous system.`,
      tag: "Physical Fitness",
      emoji: "🧘‍♀️"
    }
  ];

  const quizQuestions = [
    {
      question: "Synchronized cycles among housemates is a clinically proven biological phenomenon.",
      correctAnswer: "Myth",
      explanation: "Large-scale clinical studies show no proof that cycles synchronize. Overlapping periods are statistically expected simply because cycles vary in length."
    },
    {
      question: "Regular resistance training (weightlifting) stabilizes PCOS symptoms by improving insulin sensitivity.",
      correctAnswer: "Fact",
      explanation: "Building muscle allows cells to absorb blood glucose more effectively, lowering circulating insulin and reducing the hormonal signal that produces excess androgens."
    },
    {
      question: "Estrogen and Progesterone both drop to their lowest levels during menstruation.",
      correctAnswer: "Fact",
      explanation: "The drop in both hormones signals the uterus that no pregnancy occurred, triggering the shedding of the uterine lining."
    }
  ];

  const handleQuizAnswer = (answer) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === quizQuestions[quizIndex].correctAnswer) {
      setQuizScore(s => s + 1);
    }
  };

  const handleNextQuiz = () => {
    setIsAnswered(false);
    setSelectedAnswer(null);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(quizIndex + 1);
    } else {
      // Completed, loop back or keep final state
      setQuizIndex(0);
      setQuizScore(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div>
        <h2 className="text-3xl font-display font-bold text-gradient">Education Hub</h2>
        <p className="text-muted text-sm">Empower yourself with evidence-based articles and test your knowledge with health quizzes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Articles Grid (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <BookOpen className="text-primary" size={22} /> Guided Articles & Tutorials
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {articles.map((art) => (
                <div key={art.id} className="bg-white/90 border border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all-smooth flex flex-col justify-between h-56">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{art.tag}</span>
                      <span className="text-2xl">{art.emoji}</span>
                    </div>
                    <h4 className="font-bold text-textMain text-md mb-2">{art.title}</h4>
                    <p className="text-xs text-muted leading-relaxed font-semibold">{art.summary}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedArticle(art)}
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5 mt-4 self-start"
                  >
                    Read Article <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Myth vs Fact Quiz (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border-primary/20 shadow-md h-full flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <HelpCircle className="text-primary" size={22} /> Myth vs Fact Quiz
                </h3>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Question {quizIndex + 1} / {quizQuestions.length}
                </span>
              </div>

              {/* Question box */}
              <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl mb-6 shadow-inner min-h-[110px] flex items-center justify-center text-center">
                <p className="text-sm font-semibold text-textMain leading-relaxed">
                  "{quizQuestions[quizIndex].question}"
                </p>
              </div>

              {/* Option buttons */}
              <div className="grid grid-cols-2 gap-4">
                {['Myth', 'Fact'].map((ans) => {
                  const isSelected = selectedAnswer === ans;
                  const isCorrect = quizQuestions[quizIndex].correctAnswer === ans;
                  let btnStyle = "bg-white border-primary/15 hover:bg-primary/5 text-textMain";

                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = "bg-green-500 border-green-500 text-white shadow-md";
                    } else if (isSelected) {
                      btnStyle = "bg-red-500 border-red-500 text-white shadow-md";
                    } else {
                      btnStyle = "bg-white border-primary/5 text-muted opacity-50";
                    }
                  }

                  return (
                    <button 
                      key={ans}
                      disabled={isAnswered}
                      onClick={() => handleQuizAnswer(ans)}
                      className={`py-3.5 rounded-xl border text-sm font-bold transition-all-smooth ${btnStyle}`}
                    >
                      {ans}
                    </button>
                  );
                })}
              </div>

              {/* Quiz feedback details */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl text-xs font-semibold leading-relaxed border bg-white shadow-sm flex items-start gap-2 border-primary/10"
                  >
                    {selectedAnswer === quizQuestions[quizIndex].correctAnswer ? (
                      <div className="p-1 bg-green-100 rounded-full text-green-600 flex-shrink-0"><Check size={12} /></div>
                    ) : (
                      <div className="p-1 bg-red-100 rounded-full text-red-600 flex-shrink-0"><AlertTriangle size={12} /></div>
                    )}
                    <div>
                      <p className="font-bold text-textMain mb-1">
                        {selectedAnswer === quizQuestions[quizIndex].correctAnswer ? 'Correct Answer!' : 'Incorrect.'}
                      </p>
                      <p className="text-muted">{quizQuestions[quizIndex].explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAnswered && (
              <button 
                onClick={handleNextQuiz}
                className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-1.5"
              >
                {quizIndex === quizQuestions.length - 1 ? 'Reset Quiz' : 'Next Question'} <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Pop-up article viewer modal */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bgDark border border-primary/20 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-textMain"
            >
              <button 
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-primary/10 text-muted hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl p-2 bg-white rounded-2xl shadow-sm border border-primary/10">{selectedArticle.emoji}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{selectedArticle.tag}</span>
                  <h3 className="text-2xl font-display font-bold text-gradient mt-1">{selectedArticle.title}</h3>
                </div>
              </div>

              <div className="text-sm text-textMain leading-relaxed space-y-4 whitespace-pre-wrap border-t border-primary/10 pt-6">
                {selectedArticle.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
