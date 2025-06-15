import { addNotification } from '../components/NotificationMessage.vue';
import type { DayData } from '../types/calendar';

export async function fetchServerShiftData(
  callback: () => void
): Promise<Record<string, DayData>> {
  try {
    const response = await fetch('https://mc.kot.li/?key=shiftData.json', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        addNotification('Brak danych na serwerze', 'red');
      }
      throw new Error(`Failed to fetch data from server: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data from server:', error);
    addNotification('Nie udało się połączyć z serwerem', 'red');
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
    console.error('Error during data synchronization:', error);
    addNotification('Błąd podczas synchronizacji danych', 'red');
    return null;
  }
}
