import { create } from 'zustand';
import { useAuthStore } from './authStore';

const initialDefaultState = {
  isSetupComplete: false,
  healthProfile: null,
  weightLogs: [],
  currentWeek: 12,
  contractions: [],
  kickCounts: [],
  hospitalBag: {
    'Mom': [{ id: 'm1', item: 'Comfortable Robe', checked: false }, { id: 'm2', item: 'Nursing Bra', checked: false }, { id: 'm3', item: 'Toiletries', checked: false }],
    'Baby': [{ id: 'b1', item: 'Going Home Outfit', checked: false }, { id: 'b2', item: 'Swaddle Blankets', checked: false }, { id: 'b3', item: 'Diapers', checked: false }],
    'Documents': [{ id: 'd1', item: 'ID & Insurance Card', checked: false }, { id: 'd2', item: 'Birth Plan', checked: false }]
  },
  appointments: []
};

export const usePregnancyStore = create((set, get) => ({
  ...initialDefaultState,
  
  setSetupComplete: (val) => set({ isSetupComplete: val }),
  setHealthProfile: (profile) => set({ healthProfile: profile }),
  
  addWeightLog: (weight) => set(state => ({
    weightLogs: [...state.weightLogs, { id: Date.now().toString(), date: new Date().toISOString(), weight }]
  })),

  setCurrentWeek: (week) => set({ currentWeek: week }),
  
  // Contractions
  addContraction: (duration) => set(state => ({
    contractions: [{ id: Date.now().toString(), date: new Date().toISOString(), duration }, ...state.contractions].slice(0, 10)
  })),
  
  // Kicks
  addKickSession: (count, durationMinutes) => set(state => ({
    kickCounts: [{ id: Date.now().toString(), date: new Date().toISOString(), count, durationMinutes }, ...state.kickCounts]
  })),

  // Hospital Bag
  toggleBagItem: (category, id) => set(state => {
    const catItems = state.hospitalBag[category].map(i => i.id === id ? { ...i, checked: !i.checked } : i);
    return { hospitalBag: { ...state.hospitalBag, [category]: catItems } };
  }),
  
  // Appointments
  addAppointment: (app) => set(state => ({
    appointments: [...state.appointments, { ...app, id: Date.now().toString() }].sort((a, b) => new Date(a.date) - new Date(b.date))
  }))
}));

// Manage persistence dynamically per user
const syncPregnancyWithStorage = (userId) => {
  const saved = localStorage.getItem(`herverse-${userId}-pregnancy-data`);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      usePregnancyStore.setState({
        isSetupComplete: parsed.isSetupComplete ?? initialDefaultState.isSetupComplete,
        healthProfile: parsed.healthProfile ?? initialDefaultState.healthProfile,
        weightLogs: parsed.weightLogs ?? initialDefaultState.weightLogs,
        currentWeek: parsed.currentWeek ?? initialDefaultState.currentWeek,
        contractions: parsed.contractions ?? initialDefaultState.contractions,
        kickCounts: parsed.kickCounts ?? initialDefaultState.kickCounts,
        hospitalBag: parsed.hospitalBag ?? initialDefaultState.hospitalBag,
        appointments: parsed.appointments ?? initialDefaultState.appointments
      });
    } catch (e) {
      console.error('Failed to parse saved pregnancy data', e);
      usePregnancyStore.setState(initialDefaultState);
    }
  } else {
    usePregnancyStore.setState(initialDefaultState);
  }
};

// Subscribe to auth changes to load the correct user's logs
useAuthStore.subscribe((state) => {
  const userId = state.user?.id || state.user?._id || 'mock-user-123';
  syncPregnancyWithStorage(userId);
});

// Initial load
const initialUser = useAuthStore.getState().user;
syncPregnancyWithStorage(initialUser?.id || initialUser?._id || 'mock-user-123');

// Subscribe to store changes to save pregnancy data
usePregnancyStore.subscribe((state) => {
  const user = useAuthStore.getState().user;
  const userId = user?.id || user?._id || 'mock-user-123';
  const dataToSave = {
    isSetupComplete: state.isSetupComplete,
    healthProfile: state.healthProfile,
    weightLogs: state.weightLogs,
    currentWeek: state.currentWeek,
    contractions: state.contractions,
    kickCounts: state.kickCounts,
    hospitalBag: state.hospitalBag,
    appointments: state.appointments
  };
  localStorage.setItem(`herverse-${userId}-pregnancy-data`, JSON.stringify(dataToSave));
});

