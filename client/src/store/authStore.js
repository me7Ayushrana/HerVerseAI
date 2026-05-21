import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  isAuthenticated: false, // Defaulting to false. For easy testing, you could set to true.
  user: null,
  login: (userData, token) => set({ isAuthenticated: true, user: userData }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
