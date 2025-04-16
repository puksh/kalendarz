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
  // Reset synced changes in sessionStorage
  resetSyncedChangesSessionStorage();

  const remoteData = await fetchServerShiftData(() => {});
  if (!remoteData) {
    console.log("No remote data fetched.");
    return; // Exit if fetching fails
  }

  const containedSyncedChanges = {}; // Reset synced changes

  for (const [date, remoteShifts] of Object.entries(remoteData)) {
    // Retrieve local shifts directly from localStorage
    const savedStates = localStorage.getItem(date);
    const localShifts = savedStates ? JSON.parse(savedStates) : null;

    const differences = {};

    if (!localShifts) {
      // New shifts entirely - add to synced changes and localStorage
      containedSyncedChanges[date] = { ...remoteShifts };
      localStorage.setItem(date, JSON.stringify(remoteShifts));
    } else {
      // Compare existing shifts
      for (const [shiftType, remoteValue] of Object.entries(remoteShifts)) {
        const localValue = localShifts[shiftType] || null;
        if (localValue !== remoteValue) {
          differences[shiftType] = {
            from: localValue || "Empty",
            to: remoteValue || "Empty",
          };
        }
      }

      // If differences are found, track them
      if (Object.keys(differences).length > 0) {
        containedSyncedChanges[date] = differences;
      }

      // Update local storage with the latest remote data
      localStorage.setItem(date, JSON.stringify(remoteShifts));
    }
  }

  // Call the generateMonthDays function provided by the component
  if (typeof generateMonthDays === "function") {
    generateMonthDays();
  }

  // Update syncedChanges in sessionStorage
  sessionStorage.setItem(
    "syncedChanges",
    JSON.stringify(containedSyncedChanges),
  );

  // Clear synced changes after 5 seconds
  setTimeout(() => {
    sessionStorage.removeItem("syncedChanges");
  }, 5000);

  return containedSyncedChanges;
}

export function resetSyncedChangesSessionStorage() {
  // Load synced changes from sessionStorage
  const savedSyncedChanges = sessionStorage.getItem("syncedChanges");
  if (savedSyncedChanges) {
    const syncedChanges = JSON.parse(savedSyncedChanges);

    // Clear the syncedChanges after 5 seconds
    setTimeout(() => {
      sessionStorage.removeItem("syncedChanges");
    }, 5000);

    return syncedChanges;
  }
  return {};
}
