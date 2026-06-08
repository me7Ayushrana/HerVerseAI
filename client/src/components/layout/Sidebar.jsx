import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Baby, 
  Brain, 
  Apple, 
  Dumbbell, 
  Activity, 
  Calendar,
  MessageSquareHeart,
  BarChart3,
  Users,
  BookOpen,
  PhoneCall,
  Calculator,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Period Tracker', path: '/dashboard/period', icon: CalendarDays },
  { name: 'Pregnancy Care', path: '/dashboard/pregnancy', icon: Baby },
  { name: 'Mental Wellness', path: '/dashboard/mental', icon: Brain },
  { name: 'Nutrition', path: '/dashboard/nutrition', icon: Apple },
  { name: 'Fitness', path: '/dashboard/fitness', icon: Dumbbell },
  { name: 'PCOS Manager', path: '/dashboard/pcos', icon: Activity },
  { name: 'Health Calculators', path: '/dashboard/calculators', icon: Calculator },
  { name: 'Health Calendar', path: '/dashboard/calendar', icon: Calendar },
  { name: 'AI Chatbot', path: '/dashboard/chatbot', icon: MessageSquareHeart },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Community', path: '/dashboard/community', icon: Users },
  { name: 'Education', path: '/dashboard/education', icon: BookOpen },
  { name: 'Emergency', path: '/dashboard/emergency', icon: PhoneCall },
  { name: 'Profile & Settings', path: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('herverse-dark-mode') === 'true';
    if (saved) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return saved;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('herverse-dark-mode', next.toString());
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass-card text-primary shadow-sm hover:scale-105 transition-all-smooth"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 glass-card flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        initial={false}
      >
        <div className="p-6">
          <h1 className="text-2xl font-display italic text-gradient font-bold tracking-wider">HerVerse AI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1.5 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-soft transition-all-smooth ${
                      isActive 
                        ? 'bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold' 
                        : 'text-muted hover:bg-primary/5 hover:text-primary hover:translate-x-1'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={18} className="transition-transform duration-300" />
                  <span className="font-sans font-medium text-sm">{item.name}</span>
                </NavLink>
              </li>
            ))}

            {/* Conditional Admin Panel link */}
            {user?.isAdmin && (
              <li>
                <NavLink 
                  to="/dashboard/admin"
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-2.5 rounded-soft transition-all-smooth ${
                      isActive 
                        ? 'bg-rose-500/15 text-rose-600 border border-rose-500/25 shadow-sm font-bold' 
                        : 'text-muted hover:bg-rose-500/5 hover:text-rose-600 hover:translate-x-1'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck size={18} />
                  <span className="font-sans font-medium text-sm">Admin Panel</span>
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="p-4 border-t border-primary/10">
          {user && (
            <div className="px-4 py-2 mb-2 text-xs text-muted font-bold truncate">
              Hi, {user.name} {user.isAdmin && '(Admin)'}
            </div>
          )}
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-muted hover:text-primary hover:bg-primary/10 rounded-soft transition-all-smooth hover:translate-x-1 text-sm font-medium mb-1"
          >
            {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} />}
            <span className="font-sans">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-left text-muted hover:text-red-500 hover:bg-red-500/10 rounded-soft transition-all-smooth hover:translate-x-1 text-sm font-medium"
          >
            <LogOut size={18} />
            <span className="font-sans">Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
