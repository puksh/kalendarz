import { addNotification } from "../components/NotificationMessage.vue";
import type { DayData } from "../types/calendar";

export async function fetchServerShiftData(
  callback: () => void,
): Promise<Record<string, DayData>> {
  try {
    const response = await fetch("https://mc.kot.li/?key=shiftData.json", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        addNotification("Brak danych na serwerze", "red");
      }
      throw new Error(`Failed to fetch data from server: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data from server:", error);
    addNotification("Nie udało się połączyć z serwerem", "red");
    return null;
  }
}

export async function checkShiftDataSync(generateMonthDays) {
  try {
    // Fetch latest data from server
    const remoteData = await fetchServerShiftData(() => {
      console.log("Callback executed after fetching server shift data.");
    });
    if (!remoteData) return null;

    // Get all localStorage keys except settings
    const allKeys = Object.keys(localStorage);
    const dataKeys = allKeys.filter(
      (key) => key !== "isEditingMode" && key !== "currentPage",
    );

    // Clear all existing shift data
    dataKeys.forEach((key) => localStorage.removeItem(key));

    // Write server data to localStorage
    Object.entries(remoteData).forEach(([date, shifts]) =>
      localStorage.setItem(date, JSON.stringify(shifts)),
    );

    // Refresh the UI
    if (typeof generateMonthDays === "function") {
      generateMonthDays();
    }
    return remoteData;
  } catch (error) {
    console.error("Error during data synchronization:", error);
    addNotification("Błąd podczas synchronizacji danych", "red");
    return null;
  }
}

export function resetSyncedChangesSessionStorage() {
  const savedSyncedChanges = sessionStorage.getItem("syncedChanges");

  if (!savedSyncedChanges) return {};

  const syncedChanges = JSON.parse(savedSyncedChanges);

  // Auto-clear after delay
  setTimeout(() => sessionStorage.removeItem("syncedChanges"), 5000);

  return syncedChanges;
}
