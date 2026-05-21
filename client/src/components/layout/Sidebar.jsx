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
  LogOut,
  Menu,
  X
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
  { name: 'Health Calendar', path: '/dashboard/calendar', icon: Calendar },
  { name: 'AI Chatbot', path: '/dashboard/chatbot', icon: MessageSquareHeart },
  { name: 'Analytics', path: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Community', path: '/dashboard/community', icon: Users },
  { name: 'Education', path: '/dashboard/education', icon: BookOpen },
  { name: 'Emergency', path: '/dashboard/emergency', icon: PhoneCall },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const logout = useAuthStore(state => state.logout);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass-card text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div 
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 glass-card border-r border-white/10 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        initial={false}
      >
        <div className="p-6">
          <h1 className="text-2xl font-display italic text-gradient font-bold tracking-wider">HerVerse AI</h1>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-soft transition-all-smooth ${
                      isActive 
                        ? 'bg-primary/20 text-primary border border-primary/30 glow-hover' 
                        : 'text-muted hover:bg-white/5 hover:text-white'
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon size={20} />
                  <span className="font-sans font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-muted hover:text-red-400 hover:bg-white/5 rounded-soft transition-all-smooth"
          >
            <LogOut size={20} />
            <span className="font-sans font-medium">Logout</span>
          </button>
        </div>
      </motion.div>
    </>
  );
}
