/**
 * Naive Bayes Sentiment Classifier for HerVerse AI Wellness Journal
 * Evaluates journal entries and classifies them into one of four states:
 * - Happy & Energetic
 * - Calm & Relaxed
 * - Anxious & Stressed
 * - Sad & Depressed
 */

// Vocabulary dataset for supervised training
const trainingData = {
  happy: [
    "happy", "energetic", "good", "great", "excited", "wonderful", "positive", "content", 
    "smiling", "love", "joy", "proud", "productive", "accomplished", "amazing", "grateful",
    "accomplish", "victory", "blessed", "motivated", "cheer", "happy", "thrilled", "glad",
    "awesome", "bright", "smile", "laugh", "fun", "celebrate", "succeed", "peace", "hope"
  ],
  calm: [
    "calm", "peaceful", "quiet", "relaxed", "breathing", "stillness", "sleep", "restful", 
    "meditation", "slow", "nature", "harmony", "cozy", "serene", "ease", "rested", "relax",
    "gentle", "smooth", "soothe", "balanced", "refresh", "unwind", "patient", "flow",
    "mindful", "cozy", "comfort", "silent", "soft", "breathe", "grounded", "centered"
  ],
  anxious: [
    "anxious", "worried", "stressed", "panic", "heart", "fast", "breathing", "tight", 
    "fear", "scared", "tense", "nervous", "hyper", "pressure", "overwhelmed", "headache",
    "anxiety", "worry", "shake", "shaking", "breathless", "scare", "frightened", "dread",
    "jittery", "unsettled", "rushing", "pounding", "heavy", "unable", "concentrate", "overthink"
  ],
  sad: [
    "sad", "crying", "lonely", "tired", "heavy", "down", "depressed", "gloomy", "empty", 
    "useless", "dark", "alone", "exhausting", "grief", "hurt", "painful", "cry", "weep",
    "exhausted", "hopeless", "worthless", "tear", "tears", "pain", "failure", "fatigue",
    "unmotivated", "numb", "heartbroken", "gloomy", "bored", "rejected", "isolate", "isolating"
  ]
};

const STOP_WORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
  "he", "him", "his", "she", "her", "hers", "it", "its", "they", "them", "their", 
  "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", 
  "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", 
  "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", 
  "between", "into", "through", "during", "before", "after", "above", "below", "to", 
  "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", 
  "then", "once"
]);

// Tokenizer helper
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, "") // remove punctuation
    .split(/\s+/) // split by whitespace
    .filter(word => word.length > 1 && !STOP_WORDS.has(word));
}

// Global vocabulary configuration built from training dataset
const vocabulary = new Set();
const classWordCounts = { happy: {}, calm: {}, anxious: {}, sad: {} };
const classTotalTokens = { happy: 0, calm: 0, anxious: 0, sad: 0 };

// Populate training parameters
Object.keys(trainingData).forEach(className => {
  trainingData[className].forEach(word => {
    vocabulary.add(word);
    classWordCounts[className][word] = (classWordCounts[className][word] || 0) + 1;
    classTotalTokens[className]++;
  });
});

const vocabSize = vocabulary.size;

/**
 * Runs the Naive Bayes probability classification
 * @param {string} text - Raw journal notes text input
 * @returns {object} Classification analysis results
 */
export function classifySentiment(text) {
  const tokens = tokenize(text);
  const classes = ["happy", "calm", "anxious", "sad"];
  
  // Prior probability (assumed uniform 25% for each class)
  const priorLog = Math.log(0.25);
  const logLikelihoods = {};

  classes.forEach(className => {
    let score = priorLog;
    tokens.forEach(token => {
      // Laplace Smoothing: (count + 1) / (total_tokens + vocab_size)
      const count = classWordCounts[className][token] || 0;
      const prob = (count + 1) / (classTotalTokens[className] + vocabSize);
      score += Math.log(prob);
    });
    logLikelihoods[className] = score;
  });

  // Find class with maximum log-likelihood (MAP - Maximum A Posteriori)
  let bestClass = "calm";
  let maxScore = -Infinity;
  
  classes.forEach(className => {
    if (logLikelihoods[className] > maxScore) {
      maxScore = logLikelihoods[className];
      bestClass = className;
    }
  });

  // Calculate relative confidence percentages
  // Convert log values back to relative scale using exponents
  const expScores = {};
  let totalExp = 0;
  classes.forEach(className => {
    // Offset scores to prevent math underflow
    expScores[className] = Math.exp(logLikelihoods[className] - maxScore);
    totalExp += expScores[className];
  });

  const confidences = {};
  classes.forEach(className => {
    confidences[className] = Math.round((expScores[className] / totalExp) * 100);
  });

  // Map to friendly UI responses and emoji
  const classMappings = {
    happy: { label: "Happy & Energetic", emoji: "😇", color: "text-emerald-500", bg: "bg-emerald-50" },
    calm: { label: "Calm & Relaxed", emoji: "😌", color: "text-sky-500", bg: "bg-sky-50" },
    anxious: { label: "Anxious & Stressed", emoji: "🥺", color: "text-amber-500", bg: "bg-amber-50" },
    sad: { label: "Sad & Depressed", emoji: "😢", color: "text-rose-500", bg: "bg-rose-50" }
  };

  const adviceMappings = {
    happy: "You are feeling great! Capitalize on this positive high-energy state: try journaling your gratitude list or schedule a high-intensity workout.",
    calm: "You are in a balanced, grounded state. This is the perfect baseline for mindfulness or deep learning. Keep breathing deeply.",
    anxious: "Your entry indicates elevated tension or worry. Try visiting the breathing bubble tool above for a 2-minute relaxation exercise.",
    sad: "Your journal indicates lower emotional energy today. Give yourself grace, listen to soothing ocean sounds, or write down one small positive thing."
  };

  return {
    sentiment: bestClass,
    label: classMappings[bestClass].label,
    emoji: classMappings[bestClass].emoji,
    color: classMappings[bestClass].color,
    bg: classMappings[bestClass].bg,
    advice: adviceMappings[bestClass],
    confidences,
    processedTokens: tokens.length
  };
}
