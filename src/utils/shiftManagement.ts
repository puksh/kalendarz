import { DayData, ShiftType } from '../types/calendar';
import { addNotification } from '../components/NotificationMessage.vue';
import { MESSAGES } from '../constants/messages';

export function validateShiftAssignment(
  dayData: DayData,
  shiftType: ShiftType,
  personId: number,
  people: any[]
): boolean {
  const person = people.find((p) => p.id === personId);
  if (!person?.ratownik) return true;

  // Check for duplicate assignments on day shift
  if (shiftType.includes('day')) {
    if (
      (shiftType === 'dayShift1' && dayData.dayShift2 === personId) ||
      (shiftType === 'dayShift2' && dayData.dayShift1 === personId)
    ) {
      addNotification(MESSAGES.DUPLICATE_SHIFT, 'red');
      return false;
    }

    const dayShiftPeople = [dayData.dayShift1, dayData.dayShift2].filter(
      Boolean
    );
    const hasOtherRatownik = dayShiftPeople.some((id) => {
      const shiftPerson = people.find((p) => p.id === id);
      return shiftPerson?.ratownik && id !== personId;
    });

    if (hasOtherRatownik) {
      addNotification(MESSAGES.TWO_RATOWNIK_ERROR, 'red');
      return false;
    }
  }

  // Check for duplicate assignments on night shift
  if (shiftType.includes('night')) {
    if (
      (shiftType === 'nightShift1' && dayData.nightShift2 === personId) ||
      (shiftType === 'nightShift2' && dayData.nightShift1 === personId)
    ) {
      addNotification(MESSAGES.DUPLICATE_SHIFT, 'red');
      return false;
    }

    const nightShiftPeople = [dayData.nightShift1, dayData.nightShift2].filter(
      Boolean
    );
    const hasOtherRatownik = nightShiftPeople.some((id) => {
      const shiftPerson = people.find((p) => p.id === id);
      return shiftPerson?.ratownik && id !== personId;
    });

    if (hasOtherRatownik) {
      addNotification(MESSAGES.TWO_RATOWNIK_ERROR, 'red');
      return false;
    }
  }

  return true;
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
