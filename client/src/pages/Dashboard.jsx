import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplet, Smile, Activity, Moon, Calendar, 
  MessageSquareHeart, Bell, ChevronRight 
} from 'lucide-react';

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Top Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Good morning, Sarah 👋</h2>
          <p className="text-muted text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex gap-4">
          <button className="p-3 glass-card rounded-full hover:bg-primary/5 transition-colors shadow-sm">
            <Bell size={20} className="text-primary" />
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-secondary p-1 shadow-md">
            <div className="w-full h-full rounded-full bg-bgDark flex items-center justify-center font-bold text-primary">S</div>
          </div>
        </div>
      </div>

      {/* Row 1: Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Period", value: "Next in 12 days", icon: Calendar, color: "text-rose-500" },
          { title: "Mood Today", value: "Calm 😌", icon: Smile, color: "text-primary" },
          { title: "Water Intake", value: "1.5L / 2.5L", icon: Droplet, color: "text-secondary" },
          { title: "Sleep", value: "7h 20m", icon: Moon, color: "text-accent" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all-smooth hover:-translate-y-1"
          >
            <div className="flex justify-between items-center">
              <span className="text-muted text-sm font-medium">{stat.title}</span>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-xl font-bold text-textMain">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Row 2: Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-1 border-primary/20 shadow-sm">
          <h3 className="font-bold text-textMain mb-4">Wellness Score</h3>
          <div className="flex justify-center items-center h-40 relative">
            <div className="w-32 h-32 rounded-full border-8 border-primary/10 border-t-primary border-r-primary flex items-center justify-center transform -rotate-45">
              <span className="text-4xl font-bold transform rotate-45 text-gradient">85</span>
            </div>
          </div>
          <p className="text-center text-sm text-success font-semibold mt-4">Great job! You're on track.</p>
        </div>
        
        <div className="glass-card p-6 lg:col-span-1 border-primary/20 shadow-sm">
          <h3 className="font-bold text-textMain mb-4 flex items-center gap-2">
            <MessageSquareHeart size={20} className="text-primary"/> AI Tip of the Day
          </h3>
          <div className="bg-white/90 p-4 rounded-xl border border-primary/15 mt-2 shadow-inner">
            <p className="text-sm leading-relaxed text-textMain">
              Since you're in the luteal phase of your cycle, try adding magnesium-rich foods like spinach or dark chocolate to help reduce potential cramps and stabilize mood.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-1 border-primary/20 shadow-sm">
          <h3 className="font-bold text-textMain mb-4 flex items-center justify-between">
            Reminders
            <span className="text-xs text-primary cursor-pointer hover:underline font-semibold">View all</span>
          </h3>
          <ul className="space-y-3">
            {[
              { time: "09:00 AM", task: "Take Iron Supplement", done: true },
              { time: "02:00 PM", task: "Drink 500ml Water", done: false },
              { time: "06:00 PM", task: "Prenatal Yoga (15m)", done: false },
            ].map((task, i) => (
              <li key={i} className="flex items-center gap-3 bg-white/90 p-3 rounded-xl border border-primary/15 shadow-sm">
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all-smooth ${task.done ? 'bg-primary border-primary text-white' : 'border-primary/30 bg-white'}`}>
                  {task.done && <ChevronRight size={14} className="text-white" />}
                </div>
                <div>
                  <p className={`text-sm font-medium ${task.done ? 'text-textMain/40 line-through' : 'text-textMain'}`}>{task.task}</p>
                  <p className="text-xs text-muted">{task.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
    </motion.div>
  );
}
