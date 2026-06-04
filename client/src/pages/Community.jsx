import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Heart, MessageCircle, Send, Plus, Search, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [posts, setPosts] = useState(() => {
    const saved = localStorage.getItem('herverse-forum-posts');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: "Anyone tried spearmint tea for PCOS acne?",
        body: "I've been reading about how spearmint tea lowers high androgen levels. Has anyone drank it consistently? Would love to know if it helped clear up hormonal cystic acne and how long it took!",
        author: "Sophia R.",
        category: "PCOS Support",
        likes: 14,
        comments: 6,
        liked: false,
        date: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: '2',
        title: "Hearing the baby's heartbeat for the first time ❤️",
        body: "Just came back from my 12-week prenatal checkup scan. Hearing the heartbeat was the most magical, overwhelming, and emotional experience. Sending love and positive vibes to all the mamas out there!",
        author: "Anonymous Mama",
        category: "Pregnancy Support",
        likes: 38,
        comments: 12,
        liked: true,
        date: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
      },
      {
        id: '3',
        title: "Tracking fatigue trends in luteal phase?",
        body: "Does anyone else notice their energy drop off a cliff exactly 6 days before their period starts? What are your go-to slow recovery workouts or nutrients to stabilize this?",
        author: "Emma G.",
        category: "Cycle Syncing",
        likes: 8,
        comments: 3,
        liked: false,
        date: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('herverse-forum-posts', JSON.stringify(posts));
  }, [posts]);

  const handleLikePost = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.liked ? post.likes - 1 : post.likes + 1,
          liked: !post.liked
        };
      }
      return post;
    }));
  };

  const handleSubmitPost = (e) => {
    e.preventDefault();
    if (!postTitle || !postBody) return;

    const newPost = {
      id: Date.now().toString(),
      title: postTitle,
      body: postBody,
      author: authorName.trim() || 'Anonymous Member',
      category: selectedCategory === 'All' ? 'General Chat' : selectedCategory,
      likes: 0,
      comments: 0,
      liked: false,
      date: new Date().toISOString()
    };

    setPosts([newPost, ...posts]);
    setPostTitle('');
    setPostBody('');
    setAuthorName('');
    setShowAddForm(false);
  };

  const categories = ['All', 'General Chat', 'Pregnancy Support', 'PCOS Support', 'Cycle Syncing'];

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === selectedCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-textMain"
    >
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient">Community Safe Space</h2>
          <p className="text-muted text-sm">Ask questions, share experiences, and support fellow members in a positive and secure environment.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center gap-2"
        >
          <Plus size={18} /> {showAddForm ? 'Cancel Post' : 'Create New Post'}
        </button>
      </div>

      {/* Moderation banner */}
      <div className="bg-success/5 border border-success/20 rounded-2xl p-4 flex items-center gap-3 text-sm text-textMain">
        <ShieldCheck className="text-success animate-bounce" size={24} />
        <div>
          <span className="font-bold text-success">Safe Space Moderation Active:</span> All posts are screened to filter out hate speech, body-shaming, or spam. Please respect other members' journeys.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Post list / Form (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          <AnimatePresence mode="wait">
            {showAddForm && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="glass-card p-6 border-primary/20 shadow-md space-y-4 overflow-hidden"
              >
                <h3 className="font-bold text-lg text-primary">Ask the Community</h3>
                <form onSubmit={handleSubmitPost} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase font-bold text-muted mb-1">Your Name (or alias)</label>
                      <input 
                        type="text" 
                        value={authorName} 
                        onChange={e => setAuthorName(e.target.value)}
                        placeholder="e.g. Jane M."
                        className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase font-bold text-muted mb-1">Category</label>
                      <select 
                        value={selectedCategory === 'All' ? 'General Chat' : selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain font-medium cursor-pointer"
                      >
                        <option>General Chat</option>
                        <option>Pregnancy Support</option>
                        <option>PCOS Support</option>
                        <option>Cycle Syncing</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-muted mb-1">Topic Title</label>
                    <input 
                      type="text" 
                      value={postTitle} 
                      onChange={e => setPostTitle(e.target.value)}
                      placeholder="Summarize your question or story..."
                      required
                      className="w-full bg-white border border-primary/20 rounded-xl p-2.5 text-sm text-textMain"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-bold text-muted mb-1">Post Details</label>
                    <textarea 
                      rows="4" 
                      value={postBody} 
                      onChange={e => setPostBody(e.target.value)}
                      placeholder="Share your thoughts with detail. You can include symptoms, questions, or updates..."
                      required
                      className="w-full bg-white border border-primary/20 rounded-xl px-4 py-3.5 text-sm text-textMain focus:outline-none focus:border-primary resize-none placeholder-muted/50"
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold hover:opacity-95 shadow-md active:scale-95 transition-all-smooth flex items-center justify-center gap-1.5"
                  >
                    <Send size={16} /> Publish Post
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts list */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="glass-card p-10 text-center text-muted">
                No posts found under this category yet. Be the first to start a conversation!
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} className="glass-card p-6 border-primary/10 hover:border-primary/20 shadow-sm transition-all-smooth">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">{post.category}</span>
                    <span className="text-xs text-muted font-bold">
                      {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-textMain mb-2">{post.title}</h4>
                  <p className="text-sm text-muted leading-relaxed mb-4">{post.body}</p>

                  <div className="flex justify-between items-center border-t border-primary/5 pt-3.5 text-xs font-semibold text-muted">
                    <span className="text-textMain/80">Posted by: {post.author}</span>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-1.5 transition-colors ${post.liked ? 'text-primary' : 'hover:text-primary'}`}
                      >
                        <Heart size={16} className={post.liked ? 'fill-primary text-primary' : ''} /> {post.likes} Likes
                      </button>
                      <span className="flex items-center gap-1.5"><MessageCircle size={16} /> {post.comments} Comments</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Category Filters (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-primary/20 shadow-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Users className="text-primary" size={22} /> Discussion Boards
            </h3>
            
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left p-3.5 rounded-xl border text-sm font-semibold transition-all-smooth flex justify-between items-center ${
                    selectedCategory === cat 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-white/80 border-primary/5 hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-xs bg-primary/5 text-primary border border-primary/15 font-bold px-2.5 py-0.5 rounded-full">
                    {cat === 'All' ? posts.length : posts.filter(p => p.category === cat).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick resources */}
          <div className="glass-card p-6 border-primary/20 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-textMain flex items-center gap-1.5"><HelpCircle size={16} className="text-primary" /> Community Rules:</h4>
            <ul className="text-xs text-muted space-y-2 leading-relaxed font-medium">
              <li>• Always preserve anonymity if sharing private health history.</li>
              <li>• Refrain from prescribing medications or diagnostic drugs.</li>
              <li>• Support, validate, and lift up other members with positivity.</li>
            </ul>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
