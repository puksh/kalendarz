import { DayData, ShiftType, Person } from '../types';
import { addNotification } from '../components/NotificationMessage.vue';
import { MESSAGES } from '../constants';

export function validateShiftAssignment(
  dayData: DayData,
  shiftType: ShiftType,
  personData: Person,
  people: any[]
): boolean {
  if (!isDuplicateAssignment(dayData, shiftType, personData.id)) {
    addNotification(MESSAGES.DUPLICATE_SHIFT, 'red');
    return false;
  }

  if (!personData.ratownik) {
    return true;
  }

  if (hasConflictingRatownik(dayData, shiftType, people)) {
    addNotification(MESSAGES.TWO_RATOWNIK_ERROR, 'red');
    return false;
  }

  return true;
}

function isDuplicateAssignment(
  dayData: DayData,
  shiftType: ShiftType,
  personId: number
): boolean {
  if (shiftType.includes('day')) {
    return dayData.dayShift1 !== personId && dayData.dayShift2 !== personId;
  }

  if (shiftType.includes('night')) {
    return dayData.nightShift1 !== personId && dayData.nightShift2 !== personId;
  }

  return true;
}

function hasConflictingRatownik(
  dayData: DayData,
  shiftType: ShiftType,
  people: any[]
): boolean {
  let shiftPeople: (number | null)[] = [];

  if (shiftType.includes('day')) {
    shiftPeople = [dayData.dayShift1, dayData.dayShift2].filter(Boolean);
  }

  if (shiftType.includes('night')) {
    shiftPeople = [dayData.nightShift1, dayData.nightShift2].filter(Boolean);
  }

  return shiftPeople.some((id) => {
    const shiftPerson = people.find((p) => p.id === id);
    return Boolean(shiftPerson?.ratownik);
  });
}

export function assignShiftToDay(
  day: DayData,
  shiftType: ShiftType,
  person: any
): void {
  day[shiftType] = person.id;
  day[`${shiftType}Name`] = person.name;
  day[`${shiftType}Ratownik`] = person.ratownik;
  day[`${shiftType}UserChanged`] = true;
}

export function clearShiftAssignment(day: DayData, shift: ShiftType): void {
  day[shift] = null;
  day[`${shift}Name`] = MESSAGES.NOT_ASSIGNED;
  day[`${shift}Ratownik`] = null;
  day[`${shift}UserChanged`] = true;
}
