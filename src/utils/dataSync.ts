import { addNotification } from '../components/NotificationMessage.vue';
import type { ShiftData } from '../types';
import { MESSAGES } from '../constants';
import shiftDataJson from '../assets/data/shiftData.json';

export async function loadLocalShiftData(): Promise<Record<string, ShiftData>> {
  try {
    // Return the imported JSON data directly
    return shiftDataJson as Record<string, ShiftData>;
  } catch (error) {
    console.error('Error loading local shift data:', error);
    addNotification('Błąd ładowania danych zmian', 'red');
    return {};
  }
}

export async function checkShiftDataSync(generateMonthDays) {
  try {
    const localData = await loadLocalShiftData();
    if (!localData || Object.keys(localData).length === 0) {
      addNotification('Brak lokalnych danych zmian', 'yellow');
      return null;
    }

    // Clear all existing shift data
    sessionStorage.clear();

    // Write only essential shift data to sessionStorage
    Object.entries(localData).forEach(([date, shifts]) => {
      const essentialShifts = {
        dayShift1: shifts.dayShift1 || null,
        dayShift2: shifts.dayShift2 || null,
        nightShift1: shifts.nightShift1 || null,
        nightShift2: shifts.nightShift2 || null
      };
      sessionStorage.setItem(date, JSON.stringify(essentialShifts));
    });

    // Refresh the UI
    if (typeof generateMonthDays === 'function') {
      generateMonthDays();
    }
    return localData;
  } catch (error) {
    console.error(MESSAGES.DATA_SYNC_ERROR, error);
    addNotification(MESSAGES.DATA_SYNC_ERROR, 'red');
    return null;
  }
}
