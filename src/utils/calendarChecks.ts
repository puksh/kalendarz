import { DayData, ShiftType } from '../types';
import { clearUserChangesFromStorage } from './sessionStorageUtils';

export function hasOtherRatownik(day: DayData, shiftType: ShiftType): boolean {
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

export function resetUserChanges(): { localData: {}; madeChanges: boolean } {
  clearUserChangesFromStorage();
  return {
    localData: {},
    madeChanges: false
  };
}
export function assignShift(day: DayData, shiftType: ShiftType, person: any) {
  day[shiftType] = person.id;
  day[`${shiftType}Name`] = person.name;
  day[`${shiftType}Ratownik`] = person.ratownik;
  day[`${shiftType}UserChanged`] = true;
}
