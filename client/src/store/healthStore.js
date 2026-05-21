import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInDays, parseISO } from 'date-fns';

export const useHealthStore = create(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'herverse-health-storage',
    }
  )
);
