import { DayData, ShiftType } from '../types/calendar.ts';
import NotificationMessage from '../components/NotificationMessage.vue';
import { addNotification } from '../components/NotificationMessage.vue';
import { isPolishHoliday } from './polishHolidays.ts';
export function generateMonthDays(
  selectedYear: number,
  selectedMonth: number,
  emitCallback?: (monthDays: DayData[]) => void
): DayData[] {
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthDays: DayData[] = [];

  for (let i = 1; i <= lastDay; i++) {
    monthDays.push({
      date: new Date(selectedYear, selectedMonth, i),
      dayShift1: null,
      dayShift2: null,
      nightShift1: null,
      nightShift2: null,
      dayShift1Name: 'Not assigned',
      dayShift2Name: 'Not assigned',
      nightShift1Name: 'Not assigned',
      nightShift2Name: 'Not assigned',
      isCurrentMonth: true
    });
  }

  if (emitCallback) {
    emitCallback(monthDays);
  }

  return monthDays;
}
export function loadFromLocalStorage() {
  const year = this.selectedYear;
  const month = this.selectedMonth;
  for (let i = 1; i <= 31; i++) {
    const date = new Date(year, month, i);
    const dateKey = date.toDateString();
    const savedStates = localStorage.getItem(dateKey);
    if (savedStates) {
      try {
        const parsedStates = JSON.parse(savedStates);
        const day = this.monthDays.find(
          (d) => d.date.toDateString() === dateKey
        );
        if (day) {
          ['dayShift1', 'dayShift2', 'nightShift1', 'nightShift2'].forEach(
            (shift: ShiftType) => {
              day[shift] = parsedStates[shift];
              const personData = resolvePersonName(day[shift]);
              day[`${shift}Name`] = personData.name;
              day[`${shift}Ratownik`] = personData.isRatownik;
            }
          );
        }
      } catch (error) {
        addNotification('Failed to load local data: ' + error, 'red');
      }
    }
  }
}
export function resolvePersonName(id: number) {
  const person = this.people.find((p: any) => p.id === id);
  return person
    ? { name: person.name, isRatownik: person.ratownik }
    : { name: undefined, isRatownik: false };
}
export function hasOtherRatownik(day: DayData, shiftType: ShiftType) {
  switch (shiftType) {
    case 'dayShift1':
      return day.dayShift2Ratownik;
    case 'dayShift2':
      return day.dayShift1Ratownik;
    case 'nightShift1':
      return day.nightShift2Ratownik;
    case 'nightShift2':
      return day.nightShift1Ratownik;
  }
}

export function assignShift(day: DayData, shiftType: ShiftType, person: any) {
  day[shiftType] = person.id;
  day[`${shiftType}Name`] = person.name;
  day[`${shiftType}Ratownik`] = person.ratownik;
  day[`${shiftType}UserChanged`] = true;
}

export function saveDayToLocalStorage(day: DayData) {
  const dateKey = day.date.toDateString();
  const updatedData = {
    dayShift1: day.dayShift1,
    dayShift2: day.dayShift2,
    nightShift1: day.nightShift1,
    nightShift2: day.nightShift2
  };
  this.localData[dateKey] = updatedData;
  localStorage.setItem(dateKey, JSON.stringify(updatedData));
}

export function isDuplicateShift(
  day: DayData,
  shiftType: ShiftType,
  personId: number
) {
  // Check if assigning the same person to both shifts of the same type
  if (
    (shiftType === 'dayShift1' && day.dayShift2 === personId) ||
    (shiftType === 'dayShift2' && day.dayShift1 === personId) ||
    (shiftType === 'nightShift1' && day.nightShift2 === personId) ||
    (shiftType === 'nightShift2' && day.nightShift1 === personId)
  ) {
    return true;
  }
  return false;
}

export function resetUserChanges(emitCallback?: (hasChanges: boolean) => void) {
  for (const key in localStorage) {
    if (key === 'isEditingMode' || key === 'currentPage') continue;
    if (localStorage.hasOwnProperty(key)) {
      try {
        const savedData = JSON.parse(localStorage.getItem(key) || '{}');
        if (
          savedData.dayShift1UserChanged ||
          savedData.dayShift2UserChanged ||
          savedData.nightShift1UserChanged ||
          savedData.nightShift2UserChanged
        ) {
          localStorage.removeItem(key);
        }
      } catch {
        continue;
      }
    }
  }
  if (emitCallback) {
    emitCallback(false);
  }

  return {
    localData: {},
    madeChanges: false
  };
  // this.editedShifts = {}; // Not used elsewhere
}

export function isToday(date: Date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isHoliday(date) {
  return isPolishHoliday(date);
}
export function utilGenerateMonthDays(utilGenerateMonthDays: any) {
  throw new Error('Function not implemented.');
}
export function utilAssignShift(utilAssignShift: any) {
  throw new Error('Function not implemented.');
}
