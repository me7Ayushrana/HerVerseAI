/**
 * HerVerse AI - Local Authentication Store
 *
 * Completely self-contained - no Supabase, no backend, no network calls.
 * All data stored in localStorage. Works 100% offline on any deployment.
 *
 * DEMO CREDENTIALS (always pre-seeded):
 *   User:  demo@herverse.ai  /  herverse2024
 *   Admin: admin@herverse.ai /  admin2024
 */

import { create } from 'zustand';

// ─── Storage keys ─────────────────────────────────────────────────────────────
const USERS_KEY = 'herverse_auth_users';
const SESSION_KEY = 'herverse_auth_session';

// ─── Pre-seeded demo accounts ─────────────────────────────────────────────────
const DEMO_USERS = [
  {
    id: 'demo-user-001',
    name: 'Priya Sharma',
    email: 'demo@herverse.ai',
    password: 'herverse2024',
    isAdmin: false,
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'admin-user-001',
    name: 'Admin Manager',
    email: 'admin@herverse.ai',
    password: 'admin2024',
    isAdmin: true,
    createdAt: new Date('2024-01-01').toISOString(),
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    const storedUsers = stored ? JSON.parse(stored) : [];
    const merged = [...storedUsers];
    for (const demo of DEMO_USERS) {
      if (!merged.find((u) => u.id === demo.id)) merged.push(demo);
    }
    return merged;
  } catch {
    return [...DEMO_USERS];
  }
}

function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('[Auth] Could not save users:', e);
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(sessionUser) {
  try {
    if (sessionUser) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  } catch (e) {
    console.warn('[Auth] Could not save session:', e);
  }
}

function sanitize(user) {
  const { password, ...safe } = user;
  return safe;
}

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    const session = loadSession();
    if (session) {
      set({ isAuthenticated: true, user: session, loading: false, error: null });
    } else {
      set({ isAuthenticated: false, user: null, loading: false, error: null });
    }
  },

  login: (email, password) => {
    set({ loading: true, error: null });
    const users = loadUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        u.password === password
    );
    if (!found) {
      const err = 'Invalid email or password. Try demo@herverse.ai / herverse2024';
      set({ loading: false, error: err });
      return { success: false, error: err };
    }
    const sessionUser = sanitize(found);
    saveSession(sessionUser);
    set({ isAuthenticated: true, user: sessionUser, loading: false, error: null });
    return { success: true };
  },

  signup: (email, password, name) => {
    set({ loading: true, error: null });
    if (!email || !password || !name) {
      const err = 'Please fill in all required fields.';
      set({ loading: false, error: err });
      return { success: false, error: err };
    }
    if (password.length < 6) {
      const err = 'Password must be at least 6 characters.';
      set({ loading: false, error: err });
      return { success: false, error: err };
    }
    const users = loadUsers();
    const exists = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (exists) {
      const err = 'An account with this email already exists. Please log in.';
      set({ loading: false, error: err });
      return { success: false, error: err };
    }
    const newUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      isAdmin: false,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const sessionUser = sanitize(newUser);
    saveSession(sessionUser);
    set({ isAuthenticated: true, user: sessionUser, loading: false, error: null });
    return { success: true };
  },

  logout: () => {
    saveSession(null);
    set({ isAuthenticated: false, user: null, loading: false, error: null });
    return { success: true };
  },

  resetPassword: (email, newPassword) => {
    const users = loadUsers();
    const idx = users.findIndex(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (idx === -1) return { success: false, error: 'No account found with this email.' };
    if (!newPassword || newPassword.length < 6)
      return { success: false, error: 'Password must be at least 6 characters.' };
    users[idx].password = newPassword;
    saveUsers(users);
    return { success: true };
  },

  updateProfile: (updates) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Not logged in.' };
    const users = loadUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1 && updates.name) {
      users[idx].name = updates.name;
      saveUsers(users);
    }
    const updatedUser = { ...user, ...updates };
    saveSession(updatedUser);
    set({ user: updatedUser });
    return { success: true };
  },
}));

// Auto-initialize on import
useAuthStore.getState().initialize();

