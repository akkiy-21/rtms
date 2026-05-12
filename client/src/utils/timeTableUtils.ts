import { TimeTable } from '../types';

const DEFAULT_BASE_HOUR = 8;
const DEFAULT_BASE_MINUTE = 30;
const MINUTES_PER_DAY = 24 * 60;

export const timeToMinutes = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

export const getSortedTimeTables = (timeTables: TimeTable[]): TimeTable[] => (
  [...timeTables].sort((first, second) => first.id - second.id)
);

export const getBaseTimeInMinutes = (timeTables: TimeTable[]): number => {
  if (timeTables.length === 0) {
    return DEFAULT_BASE_HOUR * 60 + DEFAULT_BASE_MINUTE;
  }

  return timeToMinutes(getSortedTimeTables(timeTables)[0].start_time);
};

export const normalizeTimeForBusinessDay = (minutes: number, baseTime: number): number => (
  minutes < baseTime ? minutes + MINUTES_PER_DAY : minutes
);

export const getNormalizedTimeTableWindow = (table: TimeTable, baseTime: number) => {
  const startMinutes = timeToMinutes(table.start_time);
  const endMinutes = timeToMinutes(table.end_time);
  const normalizedStart = normalizeTimeForBusinessDay(startMinutes, baseTime);
  let normalizedEnd = normalizeTimeForBusinessDay(endMinutes, baseTime);

  if (normalizedEnd <= normalizedStart) {
    normalizedEnd += MINUTES_PER_DAY;
  }

  return {
    startTime: normalizedStart,
    endTime: normalizedEnd
  };
};

export const getCurrentTimeTableId = (timeTables: TimeTable[], now: Date = new Date()): number | null => {
  if (timeTables.length === 0) {
    return null;
  }

  const sortedTables = getSortedTimeTables(timeTables);
  const baseTime = getBaseTimeInMinutes(sortedTables);
  const currentTime = normalizeTimeForBusinessDay(now.getHours() * 60 + now.getMinutes(), baseTime);

  for (const table of sortedTables) {
    const { startTime, endTime } = getNormalizedTimeTableWindow(table, baseTime);

    if (currentTime >= startTime && currentTime < endTime) {
      return table.id;
    }
  }

  return sortedTables[0].id;
};

export const getBusinessDayRange = (timeTables: TimeTable[], now: Date = new Date()) => {
  const baseTime = getBaseTimeInMinutes(timeTables);
  const baseHour = Math.floor(baseTime / 60);
  const baseMinute = baseTime % 60;
  const startTime = new Date(now);

  startTime.setHours(baseHour, baseMinute, 0, 0);

  if ((now.getHours() * 60 + now.getMinutes()) < baseTime) {
    startTime.setDate(startTime.getDate() - 1);
  }

  const endTime = new Date(startTime);
  endTime.setDate(endTime.getDate() + 1);

  return { startTime, endTime, baseTime };
};