import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePregnancyStore = create(
  persist(
    (set, get) => ({
      isSetupComplete: false,
      setSetupComplete: (val) => set({ isSetupComplete: val }),
      
      healthProfile: null,
      setHealthProfile: (profile) => set({ healthProfile: profile }),
      
      weightLogs: [],
      addWeightLog: (weight) => set(state => ({
        weightLogs: [...state.weightLogs, { id: Date.now().toString(), date: new Date().toISOString(), weight }]
      })),

      currentWeek: 12,
      setCurrentWeek: (week) => set({ currentWeek: week }),
      
      // Contractions
      contractions: [],
      addContraction: (duration) => set(state => ({
        contractions: [{ id: Date.now().toString(), date: new Date().toISOString(), duration }, ...state.contractions].slice(0, 10)
      })),
      
      // Kicks
      kickCounts: [],
      addKickSession: (count, durationMinutes) => set(state => ({
        kickCounts: [{ id: Date.now().toString(), date: new Date().toISOString(), count, durationMinutes }, ...state.kickCounts]
      })),

      // Hospital Bag
      hospitalBag: {
        'Mom': [{ id: 'm1', item: 'Comfortable Robe', checked: false }, { id: 'm2', item: 'Nursing Bra', checked: false }, { id: 'm3', item: 'Toiletries', checked: false }],
        'Baby': [{ id: 'b1', item: 'Going Home Outfit', checked: false }, { id: 'b2', item: 'Swaddle Blankets', checked: false }, { id: 'b3', item: 'Diapers', checked: false }],
        'Documents': [{ id: 'd1', item: 'ID & Insurance Card', checked: false }, { id: 'd2', item: 'Birth Plan', checked: false }]
      },
      toggleBagItem: (category, id) => set(state => {
        const catItems = state.hospitalBag[category].map(i => i.id === id ? { ...i, checked: !i.checked } : i);
        return { hospitalBag: { ...state.hospitalBag, [category]: catItems } };
      }),
      
      // Appointments
      appointments: [],
      addAppointment: (app) => set(state => ({
        appointments: [...state.appointments, { ...app, id: Date.now().toString() }].sort((a, b) => new Date(a.date) - new Date(b.date))
      }))
    }),
    {
      name: 'herverse-pregnancy-storage',
    }
  )
);
