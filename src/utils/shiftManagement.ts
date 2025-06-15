import { DayData, ShiftType } from '../types/calendar';
import { addNotification } from '../components/NotificationMessage.vue';

export const MESSAGES = {
  DUPLICATE_SHIFT: 'Ta sama osoba na obydwu zmianach.',
  INVALID_VALUE: "Zła wartość! Tylko 'D', 'N', lub 'D N' są dozwolone.",
  INVALID_SHIFT:
    'Nieprawidłowy typ zmiany. Dozwolone wartości to: "day", "night", "day night".',
  TWO_RATOWNIK_ERROR: 'Nie można przypisać dwóch ratowników na jedną zmianę.',
  MAX_DAY_PEOPLE:
    'Nie można przypisać więcej niż dwóch osób na zmianę dzienną.',
  MAX_NIGHT_PEOPLE:
    'Nie można przypisać więcej niż dwóch osób na zmianę nocną.',
  NOT_ASSIGNED: 'Not assigned',
  CLICK_TO_EDIT: 'Click to edit',
  UNLOCK_WIDTH: 'Odblokuj szerokość',
  LOCK_WIDTH: 'Zablokuj szerokość',
  LOAD_ERROR: 'Failed to load local data: ',
  MOBILE_WARNING_TITLE: '!! Urządzenie mobilne wykryte !!',
  MOBILE_WARNING_TEXT:
    'Niestety, tryb edycji w widoku kalendarza nie jest obsługiwany na urządzeniach mobilnych.',
  MOBILE_WARNING_INSTRUCTION:
    'Proszę przejdź do widoku tabeli lub skorzystaj z komputera.',
  MOBILE_WARNING_OK_BUTTON: 'Ok ☹'
};

export function validateShiftAssignment(
  dayData: DayData,
  shiftType: ShiftType,
  personId: number,
  people: any[]
) {
  const person = people.find((p) => p.id === personId);
  if (!person?.ratownik) return true;

  // Check for duplicate assignments on day shift
  if (shiftType.includes('day')) {
    // Check if person is already assigned to another day shift
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
    // Check if person is already assigned to another night shift
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
) {
  day[shiftType] = person.id;
  day[`${shiftType}Name`] = person.name;
  day[`${shiftType}Ratownik`] = person.ratownik;
  day[`${shiftType}UserChanged`] = true;
}

export function clearShiftAssignment(day: DayData, shift: ShiftType) {
  day[shift] = null;
  day[`${shift}Name`] = MESSAGES.NOT_ASSIGNED;
  day[`${shift}Ratownik`] = null;
  day[`${shift}UserChanged`] = true;
}

export function saveDayToLocalStorage(day: DayData) {
  const dateKey = day.date.toDateString();
  const updatedData = {
    dayShift1: day.dayShift1,
    dayShift2: day.dayShift2,
    nightShift1: day.nightShift1,
    nightShift2: day.nightShift2
  };
  sessionStorage.setItem(dateKey, JSON.stringify(updatedData));
  return updatedData;
}
