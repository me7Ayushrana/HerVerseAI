import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users, MessageSquare, AlertOctagon, Trash2, Flag, BellRing, MapPin } from 'lucide-react';

export default function AdminPanel() {
  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('herverse-forum-posts');
    return saved ? JSON.parse(saved) : [];
  });

  const [sosLogs, setSosLogs] = useState(() => {
    const saved = localStorage.getItem('herverse-sos-logs');
    return saved ? JSON.parse(saved) : [
      { id: 'sos-1', date: new Date(Date.now() - 48 * 3600 * 1000).toISOString(), user: 'Sarah Doe', contactName: 'Jane Doe', phone: '+1 (555) 911-3040', status: 'Delivered', coords: '37.7749° N, 122.4194° W' },
      { id: 'sos-2', date: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), user: 'Jane Doe', contactName: 'Emergency Contact', phone: '+1 (555) 000-1111', status: 'Delivered', coords: '34.0522° N, 118.2437° W' }
    ];
  });

  const [totalUsersCount, setTotalUsersCount] = useState(() => {
    const users = localStorage.getItem('herverse-mock-users');
    return users ? JSON.parse(users).length : 2;
  });

  useEffect(() => {
    localStorage.setItem('herverse-sos-logs', JSON.stringify(sosLogs));
  }, [sosLogs]);

  const handleDeletePost = (id) => {
    const updated = posts.filter(p => p.id !== id);
    setPosts(updated);
    localStorage.setItem('herverse-forum-posts', JSON.stringify(updated));
  };

  const handleToggleFlagPost = (id) => {
    const updated = posts.map(p => {
      if (p.id === id) {
        return { ...p, isFlagged: !p.isFlagged };
      }
      return p;
    });
    setPosts(updated);
    localStorage.setItem('herverse-forum-posts', JSON.stringify(updated));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-600"><ShieldCheck size={28} /></div>
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Admin Moderation Panel</h2>
          <p className="text-muted text-sm">Oversee user accounts, moderate community forums, and inspect critical emergency SOS triggers.</p>
        </div>
      </div>

      {/* Row 1: System stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><Users size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Total Accounts</p>
            <h4 className="text-2xl font-bold text-textMain">{totalUsersCount} Users</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><MessageSquare size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Forum Discussions</p>
            <h4 className="text-2xl font-bold text-textMain">{posts.length} Threads</h4>
          </div>
        </div>
        <div className="glass-card p-6 flex items-center gap-4 border-primary/20 shadow-sm">
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary"><AlertOctagon size={24} /></div>
          <div>
            <p className="text-xs text-muted font-bold uppercase">Flagged Content</p>
            <h4 className="text-2xl font-bold text-rose-600">{posts.filter(p => p.isFlagged).length} Flagged</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Forum Moderation (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-4 text-gradient">Forum Thread Moderation</h3>
            
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
              {posts.length === 0 ? (
                <p className="text-center text-sm text-muted py-10">No discussion posts logged in the system.</p>
              ) : (
                posts.map(post => (
                  <div key={post.id} className={`p-4 rounded-2xl border transition-all-smooth ${post.isFlagged ? 'bg-rose-50 border-rose-300' : 'bg-white border-primary/10 hover:border-primary/20'}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary mr-2">{post.category}</span>
                        {post.isFlagged && <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">Flagged</span>}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleToggleFlagPost(post.id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 ${post.isFlagged ? 'bg-rose-500 border-rose-600 text-white' : 'bg-white border-primary/20 text-muted hover:text-primary hover:bg-primary/5'}`}
                          title="Flag Post for Review"
                        >
                          <Flag size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete Post"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-textMain text-sm">{post.title}</h4>
                    <p className="text-xs text-muted mt-1 leading-relaxed">{post.body}</p>
                    <p className="text-[10px] text-muted font-bold mt-2">Author: {post.author}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: SOS Emergency Logs (lg:col-span-5) */}
        <div className="lg:col-span-5">
          <div className="glass-card p-6 border-primary/20 shadow-md h-full flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="font-bold text-lg mb-4 text-gradient flex items-center gap-2">
                <BellRing size={20} className="text-rose-500 animate-pulse" /> Emergency SOS Signals
              </h3>
              
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {sosLogs.map((log) => (
                  <div key={log.id} className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 shadow-sm text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-rose-600">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-[10px]">{log.status}</span>
                    </div>

                    <div className="space-y-0.5 text-muted font-semibold">
                      <p>Triggered by: <span className="text-textMain">{log.user}</span></p>
                      <p>Recipient: <span className="text-textMain">{log.contactName} ({log.phone})</span></p>
                    </div>

                    <div className="bg-rose-50 p-2 rounded-xl border border-rose-100 flex items-center gap-1.5 font-bold text-[10px] text-rose-700">
                      <MapPin size={12} className="text-rose-500 flex-shrink-0" />
                      <span className="truncate">{log.coords}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setSosLogs([])}
              className="w-full mt-6 py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-50 transition-colors"
            >
              Clear Emergency Logs
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
