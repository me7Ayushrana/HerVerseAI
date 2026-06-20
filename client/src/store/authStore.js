import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  initialize: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const user = session.user;
        set({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            isAdmin: user.email === 'admin@example.com' || !!user.user_metadata?.isAdmin
          },
          loading: false
        });
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const user = data.user;
      set({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || 'User',
          isAdmin: user.email === 'admin@example.com' || !!user.user_metadata?.isAdmin
        },
        loading: false
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, isAdmin: email === 'admin@example.com' }
        }
      });
      if (error) throw error;
      
      const user = data.user;
      set({
        isAuthenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || name,
          isAdmin: email === 'admin@example.com'
        },
        loading: false
      });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ isAuthenticated: false, user: null, loading: false });
      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false };
    }
  }
}));

// Run auto-initialization immediately when the script loads
useAuthStore.getState().initialize();
