import { DayData, ShiftType } from '../types/calendar';
import { resolvePersonName } from './personUtils';

const SHIFT_TYPES: ShiftType[] = [
  'dayShift1',
  'dayShift2',
  'nightShift1',
  'nightShift2'
];

export function saveDayToSessionStorage(day: DayData): void {
  const dateKey = day.date.toDateString();
  const updatedData = {
    dayShift1: day.dayShift1,
    dayShift2: day.dayShift2,
    nightShift1: day.nightShift1,
    nightShift2: day.nightShift2
  };
  sessionStorage.setItem(dateKey, JSON.stringify(updatedData));
}

export function loadDayFromStorage(
  year: number,
  month: number,
  dayNum: number,
  monthDays: DayData[],
  people: any[]
): void {
  const date = new Date(year, month, dayNum).toDateString();
  const savedStates = sessionStorage.getItem(date);

  if (!savedStates) return;

  try {
    const parsedStates = JSON.parse(savedStates);
    const day = monthDays.find((d) => d.date.toDateString() === date);

    if (day) {
      SHIFT_TYPES.forEach((shiftType) => {
        day[shiftType] = parsedStates[shiftType];
        const personData = resolvePersonName(day[shiftType], people);
        day[shiftType + 'Name'] = personData.name;
        day[shiftType + 'Ratownik'] = personData.isRatownik;
        day[shiftType + 'UserChanged'] =
          parsedStates[shiftType + 'UserChanged'] ?? false;
      });
    }
  } catch (error) {
    console.error('Failed to load local data:', error);
  }
}

export function loadAllFromSessionStorage(
  selectedYear: number,
  selectedMonth: number,
  monthDays: DayData[],
  people: any[]
): void {
  const MAX_DAYS_IN_MONTH = 31;
  for (let dayNum = 1; dayNum <= MAX_DAYS_IN_MONTH; dayNum++) {
    loadDayFromStorage(selectedYear, selectedMonth, dayNum, monthDays, people);
  }
}

export function clearUserChangesFromStorage(): void {
  const keysToRemove = [];

  for (const key in sessionStorage) {
    if (sessionStorage.hasOwnProperty(key)) {
      try {
        const savedData = JSON.parse(sessionStorage.getItem(key) || '{}');
        const hasUserChanges = SHIFT_TYPES.some(
          (shiftType) => savedData[shiftType + 'UserChanged']
        );

        if (hasUserChanges) {
          keysToRemove.push(key);
        }
      } catch (error) {
        continue;
      }
    }
  }

  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}
