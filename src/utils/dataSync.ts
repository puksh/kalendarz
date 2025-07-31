import { addNotification } from '../components/NotificationMessage.vue';
import type { DayData } from '../types';
import { MESSAGES } from '../constants';

export async function fetchServerShiftData(
  _callback: () => void
): Promise<Record<string, DayData>> {
  try {
    const response = await fetch('https://mc.kot.li:9443/?key=shiftData.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        addNotification(MESSAGES.SERVER_NO_DATA, 'red');
      }
      throw new Error(MESSAGES.ERROR_FETCHING_DATA + `${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(MESSAGES.SERVER_CONNECTION_ERROR, error);
    addNotification(MESSAGES.SERVER_CONNECTION_ERROR, 'red');
    return null;
  }
}

export async function checkShiftDataSync(generateMonthDays) {
  try {
    const remoteData = await fetchServerShiftData(() => {
      console.log('Callback executed after fetching server shift data.');
    });
    if (!remoteData) return null;

    // Clear all existing shift data
    sessionStorage.clear();

    // Write only essential shift data to sessionStorage
    Object.entries(remoteData).forEach(([date, shifts]) => {
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
    return remoteData;
  } catch (error) {
    console.error(MESSAGES.DATA_SYNC_ERROR, error);
    addNotification(MESSAGES.DATA_SYNC_ERROR, 'red');
    return null;
  }
}
