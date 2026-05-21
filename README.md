# 🌸 HerVerse AI - AI-Powered Women's Wellness & 3D Interactive Platform

> Your Health. Your Power. Your HerVerse.

**HerVerse AI** is a state-of-the-art, production-grade women's wellness application designed to support women through every stage of life. From intelligent menstrual cycle tracking and PCOS/PCOD management to a comprehensive pregnancy companion with interactive 3D visualizations, HerVerse AI brings high-end aesthetics, smart analytics, and empathetic AI guidance into a single, cohesive ecosystem.

---

## ✨ Features at a Glance

### 1. 🤖 Empathetic AI Health Assistant
* **Google Gemini API Integration**: Empathetic, supportive, and context-aware responses specifically calibrated for women's wellness.
* **Safety Protocols**: Custom system prompt ensuring helpful disclaimers and immediate redirection to professional medical care in case of emergencies.
* **Interactive Chat UI**: Seamless glassmorphic chat interface with persistent chat history.

### 2. 📅 Smart Period & Ovulation Tracker
* **Interactive 3D Visualizer**: A beautiful, glowing Three.js sphere that dynamically adapts in shape, color, and speed to represent current cycle phases (menstrual, follicular, ovulatory, luteal).
* **Comprehensive Logging**: Track flow intensity, physical symptoms, moods, and intimate activity.
* **Cycle Insights**: Dynamic calculation of next period start date, fertile window, and peak ovulation day.

### 3. 🤰 Interactive 3D Pregnancy Care
* **Interactive 3D Womb & Fetus**: An immersive, procedural Three.js 3D model representing the gestational sac and fetus, dynamically scaling, breathing, and changing opacity based on the selected week.
* **Pregnancy Setup Wizard**: Custom calculator to determine due date and current gestational week.
* **Active Care Tools**:
  * **Kick Counter**: Real-time tracker to log fetal movement sessions.
  * **Contraction Timer**: Intuitive stopwatch to track duration and frequency of contractions, signaling when to head to the hospital.
  * **Hospital Bag Checklist**: Smart categorizations (Mama, Baby, Partner) to prepare for the big day.
  * **Gestational Calendar**: Tailored weekly guides detailing baby's size and developmental milestones.

### 4. 🧠 Mental Wellness & PCOS Management
* **Mental Health Companion**: Daily mood log tracking, mindful breathing bubble animations, and active self-care challenges.
* **PCOS/PCOD Tracker**: Tailored symptom assessments, active log trackers for water, sleep, and physical activity, and curated lifestyle recommendations.

### 5. 📊 Smart Analytics Dashboard
* **Dynamic Visualization**: Beautiful, smooth linear charts powered by **Recharts** to track symptoms, weight logs, and water intake trends over time.
* **Personalized Greeting System**: Dynamic greeting based on current local time with proactive wellness reminders.

### 6. 🔌 Zero-DB Fail-Safe (Mock DB Fallback)
* **Out-of-the-box Execution**: The backend includes a smart dynamic JavaScript Proxy wrapper. If a local MongoDB instance is not running, the application **automatically falls back to a highly robust in-memory mock database**.
* **Pre-configured Accounts**: Comes pre-populated with a default test account (`test@example.com` / `password123`) to allow instant sign-in and exploration without any environment configuration!

---

## 🎨 Design System & Aesthetics

HerVerse AI is built with **premium design aesthetics** to ensure a stunning first impression:
* **Color Palette**: A curated HSL theme consisting of neon purple (`#C084FC`), pink blush (`#F472B6`), indigo accent (`#818CF8`), and deep space dark mode (`#0F0A1E`).
* **Glassmorphism**: Elegant semi-transparent cards with dense backdrop blur (`20px`), subtle border reflections, and soft drop shadows.
* **Typography**: Immersive typography using `Playfair Display` for headings and `DM Sans` for readable body text.
* **Micro-Animations**: Fluid transitions using **Framer Motion** and responsive interactive hover effects.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React 18, Vite
* **Styling**: Tailwind CSS
* **Animation**: Framer Motion
* **3D Rendering**: React Three Fiber, Three.js, React Three Drei
* **Charts**: Recharts
* **State Management**: Zustand
* **Icons & UI Utilities**: Lucide React, clsx, tailwind-merge

### Backend
* **Runtime & Framework**: Node.js, Express
* **Database**: MongoDB (Mongoose ORM) with **Dynamic In-Memory Fallback**
* **Security & Auth**: JWT (JSON Web Tokens), bcryptjs, Helmet, Express Rate Limit
* **AI Orchestration**: `@google/generative-ai` (Gemini-1.5-flash)

---

## 🚀 Setup & Installation

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Optional - app will auto-fallback to Memory DB if not running)

### 1. Clone & Environment Configuration
Clone the repository and locate the server configuration:
```bash
git clone https://github.com/me7Ayushrana/HerVerseAI.git
cd HerVerseAI/server
```

Create a `.env` file in the `server` directory (you can copy from `.env.example`):
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/herverse
JWT_SECRET=supersecretjwtkey123
GEMINI_API_KEY=your_gemini_api_key_here
```
*(If you do not have a Gemini API Key, the chatbot will fall back gracefully and report connection status, while all other core tracking features remain fully functional!)*

### 2. Install Dependencies
Install dependencies for both the backend server and the frontend client:
```bash
# In the repository root
cd server && npm install
cd ../client && npm install
```

### 3. Run the Servers
Launch both dev environments simultaneously:

**Terminal 1 (Backend Server)**:
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend Client)**:
```bash
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to experience **HerVerse AI**!

*   **Quick Log In**:
    *   **Email**: `test@example.com`
    *   **Password**: `password123`

---

## 📜 Disclaimer
HerVerse AI is an educational and wellness tracking platform. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
