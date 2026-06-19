import { create } from 'zustand';
import { differenceInDays, parseISO } from 'date-fns';
import { useAuthStore } from './authStore';

export const useHealthStore = create((set, get) => ({
  periodLogs: [], // { id, startDate, endDate, flow, symptoms, notes }
  
  addPeriodLog: (log) => set((state) => {
    const sortedLogs = [...state.periodLogs, { ...log, id: Date.now().toString() }]
      .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)); // Newest first
    return { periodLogs: sortedLogs };
  }),

  deletePeriodLog: (id) => set((state) => ({
    periodLogs: state.periodLogs.filter(log => log.id !== id)
  })),

  // Helper to calculate cycle lengths between consecutive periods
  getCycleStats: () => {
    const logs = get().periodLogs;
    if (logs.length < 2) return { averageLength: 28, cycleHistory: [] };

    const cycleHistory = [];
    let totalDays = 0;
    let validCycles = 0;

    // Logs are sorted newest first. To calculate cycles, we go from oldest to newest.
    const ascendingLogs = [...logs].reverse();

    for (let i = 1; i < ascendingLogs.length; i++) {
      const prevDate = parseISO(ascendingLogs[i - 1].startDate);
      const currDate = parseISO(ascendingLogs[i].startDate);
      const days = differenceInDays(currDate, prevDate);
      
      if (!isNaN(days)) {
        cycleHistory.push({
          name: `Cycle ${i}`,
          length: days,
          date: ascendingLogs[i].startDate
        });

        if (days > 15 && days < 50) { // Reasonable cycle lengths
          totalDays += days;
          validCycles++;
        }
      }
    }

    const averageLength = validCycles > 0 ? Math.round(totalDays / validCycles) : 28;
    return { averageLength, cycleHistory };
  }
}));

// Manage persistence dynamically per user
const syncLogsWithStorage = (userId) => {
  const saved = localStorage.getItem(`herverse-${userId}-period-logs`);
  useHealthStore.setState({ periodLogs: saved ? JSON.parse(saved) : [] });
};

// Subscribe to auth changes to load the correct user's logs
useAuthStore.subscribe((state) => {
  const userId = state.user?.id || state.user?._id || 'mock-user-123';
  syncLogsWithStorage(userId);
});

// Initial load
const initialUser = useAuthStore.getState().user;
syncLogsWithStorage(initialUser?.id || initialUser?._id || 'mock-user-123');

// Subscribe to store changes to save logs to user-specific storage
useHealthStore.subscribe((state) => {
  const user = useAuthStore.getState().user;
  const userId = user?.id || user?._id || 'mock-user-123';
  localStorage.setItem(`herverse-${userId}-period-logs`, JSON.stringify(state.periodLogs));
});

