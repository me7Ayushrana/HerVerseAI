import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import PeriodTracker from './pages/PeriodTracker';
import PregnancyCare from './pages/PregnancyCare';
import MentalWellness from './pages/MentalWellness';
import Nutrition from './pages/Nutrition';
import Fitness from './pages/Fitness';
import PCOSManager from './pages/PCOSManager';
import HealthCalendar from './pages/HealthCalendar';
import Community from './pages/Community';
import Chatbot from './pages/Chatbot';
import Analytics from './pages/Analytics';
import Education from './pages/Education';
import Emergency from './pages/Emergency';
import HealthCalculators from './pages/HealthCalculators';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Sidebar from './components/layout/Sidebar';
import GlobalMusicPlayer from './components/layout/GlobalMusicPlayer';
import { useAuthStore } from './store/authStore';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    loading: state.loading
  }));

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bgDark">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-bgDark pt-16 md:pt-0">
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/dashboard/period" element={<ProtectedRoute><PeriodTracker /></ProtectedRoute>} />
        <Route path="/dashboard/pregnancy" element={<ProtectedRoute><PregnancyCare /></ProtectedRoute>} />
        <Route path="/dashboard/mental" element={<ProtectedRoute><MentalWellness /></ProtectedRoute>} />
        <Route path="/dashboard/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
        <Route path="/dashboard/fitness" element={<ProtectedRoute><Fitness /></ProtectedRoute>} />
        <Route path="/dashboard/pcos" element={<ProtectedRoute><PCOSManager /></ProtectedRoute>} />
        <Route path="/dashboard/calendar" element={<ProtectedRoute><HealthCalendar /></ProtectedRoute>} />
        <Route path="/dashboard/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
        <Route path="/dashboard/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/dashboard/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />
        <Route path="/dashboard/emergency" element={<ProtectedRoute><Emergency /></ProtectedRoute>} />
        <Route path="/dashboard/calculators" element={<ProtectedRoute><HealthCalculators /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
      <GlobalMusicPlayer />
    </Router>
  );
}

export default App;
