import { differenceInDays, parseISO, addDays } from 'date-fns';

export function getCyclePhase(lastPeriodStart, averageCycleLength = 28) {
  if (!lastPeriodStart) {
    return {
      phase: 'Unknown',
      dayOfCycle: 0,
      description: 'Log your period to see your current phase.',
      color: '#C084FC',
      nextPeriod: null
    };
  }

  const today = new Date();
  const start = parseISO(lastPeriodStart);
  const daysSinceStart = differenceInDays(today, start);
  const dayOfCycle = (daysSinceStart % averageCycleLength) + 1; // 1-indexed

  // Standard approximations
  let phase = '';
  let description = '';
  let color = '';

  if (dayOfCycle >= 1 && dayOfCycle <= 5) {
    phase = 'Menstrual';
    description = 'Your body is shedding the uterine lining. You might feel fatigued. Rest and hydrate.';
    color = '#F472B6'; // Rose pink
  } else if (dayOfCycle >= 6 && dayOfCycle <= 13) {
    phase = 'Follicular';
    description = 'Estrogen is rising. Energy levels typically increase. Great time for challenging workouts!';
    color = '#818CF8'; // Indigo/Blue
  } else if (dayOfCycle >= 14 && dayOfCycle <= 15) {
    phase = 'Ovulation';
    description = 'An egg is released. Peak energy and mood levels. Highest chance of conception.';
    color = '#FBBF24'; // Gold/Warning
  } else {
    phase = 'Luteal';
    description = 'Progesterone rises. You might experience PMS symptoms like bloating or mood swings.';
    color = '#C084FC'; // Primary purple
  }

  const nextPeriod = addDays(start, averageCycleLength);

  return { phase, dayOfCycle, description, color, nextPeriod };
}
