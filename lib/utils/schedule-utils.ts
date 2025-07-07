// Helper function to calculate periods for a schedule
export function calculatePeriods(schedule: {
  startTime: string;
  endTime: string;
  periodDuration: number;
  includeBreak?: boolean;
  breakDuration: number;
  breakAfterPeriod: number;
  includeLunch?: boolean;
  lunchDuration: number;
  lunchAfterPeriod: number;
}) {
  const startTime = new Date(`2000-01-01T${schedule.startTime}:00`);
  const endTime = new Date(`2000-01-01T${schedule.endTime}:00`);
  
  const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
  
  // Calculate total break and lunch time (only if included)
  let totalBreakTime = 0;
  if (schedule.includeBreak !== false) {
    totalBreakTime += schedule.breakDuration;
  }
  if (schedule.includeLunch !== false) {
    totalBreakTime += schedule.lunchDuration;
  }
  
  const availableTime = totalMinutes - totalBreakTime;
  const numberOfPeriods = Math.floor(availableTime / schedule.periodDuration);
  
  const periods = [];
  let currentTime = new Date(startTime);
  
  for (let i = 1; i <= numberOfPeriods; i++) {
    const periodStart = new Date(currentTime);
    currentTime.setMinutes(currentTime.getMinutes() + schedule.periodDuration);
    const periodEnd = new Date(currentTime);
    
    periods.push({
      period: i,
      startTime: periodStart.toTimeString().slice(0, 5),
      endTime: periodEnd.toTimeString().slice(0, 5),
      type: 'period',
    });
    
    // Add break after specified period (only if included)
    if (schedule.includeBreak !== false && i === schedule.breakAfterPeriod) {
      const breakStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + schedule.breakDuration);
      const breakEnd = new Date(currentTime);
      
      periods.push({
        period: null,
        startTime: breakStart.toTimeString().slice(0, 5),
        endTime: breakEnd.toTimeString().slice(0, 5),
        type: 'break',
      });
    }
    
    // Add lunch after specified period (only if included)
    if (schedule.includeLunch !== false && i === schedule.lunchAfterPeriod) {
      const lunchStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + schedule.lunchDuration);
      const lunchEnd = new Date(currentTime);
      
      periods.push({
        period: null,
        startTime: lunchStart.toTimeString().slice(0, 5),
        endTime: lunchEnd.toTimeString().slice(0, 5),
        type: 'lunch',
      });
    }
  }
  
  return {
    totalPeriods: numberOfPeriods,
    totalHours: (totalMinutes / 60).toFixed(1),
    periods,
  };
} 