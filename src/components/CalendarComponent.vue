<template>
  <button
    :disabled="!madeChanges"
    @click="showPasswordPrompt"
    class="submit-button"
  >
    Zapisz
  </button>
  <section v-if="showPasswordModal" class="modal">
    <div class="modal-content">
      <p>Wpisz hasło:</p>
      <input type="password" v-model="password" />
      <button @click="authorize">Zapisz</button>
      <button @click="cancel">Anuluj</button>
    </div>
  </section>
  <section class="monthChange">
    <button class="buttonMonthChange" @click="changeMonth(-1)">&#8249;</button>
    <span> {{ monthYear }} </span>
    <button class="buttonMonthChange" @click="changeMonth(1)">&#8250;</button>
  </section>
  <div class="calendar-container">
    <!-- Calendar Section -->
    <section class="calendar">
      <div class="calendar-grid">
        <div
          v-for="(day, index) in monthDays"
          :key="index"
          class="day-column"
          @dragover.prevent
          @drop="handleDrop(day.date, 'day')"
        >
          <div>
            <div
              class="day-cell"
              :class="{ 'current-month': day.isCurrentMonth }"
            >
              <div class="day-header">
                {{ daysOfWeek[day.date.getDay()] }}
              </div>
              <div
                class="shift"
                @drop="handleDrop(day.date, 'day')"
                @dragover.prevent
              >
                <div class="day-date">{{ day.date.getDate() }}</div>
                <div
                  class="shift-slot"
                  :class="{
                    'user-changed':
                      changedShifts[day.date.toDateString()]?.dayShift1,
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift1,
                    ratownik: day.dayShift1Ratownik === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'dayShift1')"
                  @click="handleClickResetShift(day, 'dayShift1')"
                >
                  <div class="assigned-person day" v-if="day.dayShift1">
                    {{ day.dayShift1Name }}
                  </div>
                  <div class="empty-slot day" v-else>D</div>
                </div>
                <div
                  class="shift-slot"
                  :class="{
                    'user-changed':
                      changedShifts[day.date.toDateString()]?.dayShift2,
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift2,
                    ratownik: day.dayShift2Ratownik === true,
                  }"
                  @drop="handleDrop(day.date, 'dayShift2')"
                  @click="handleClickResetShift(day, 'dayShift2')"
                >
                  <div class="assigned-person day" v-if="day.dayShift2">
                    {{ day.dayShift2Name }}
                  </div>
                  <div class="empty-slot day" v-else>D</div>
                </div>
                <div
                  class="shift-slot"
                  :class="{
                    'user-changed':
                      changedShifts[day.date.toDateString()]?.nightShift1,
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift1,
                    ratownik: day.nightShift1Ratownik === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift1')"
                  @click="handleClickResetShift(day, 'nightShift1')"
                >
                  <div class="assigned-person night" v-if="day.nightShift1">
                    {{ day.nightShift1Name }}
                  </div>
                  <div class="empty-slot night" v-else>N</div>
                </div>
                <div
                  class="shift-slot"
                  :class="{
                    'user-changed':
                      changedShifts[day.date.toDateString()]?.nightShift2,
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift2,
                    ratownik: day.nightShift2Ratownik === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift2')"
                  @click="handleClickResetShift(day, 'nightShift2')"
                >
                  <div class="assigned-person night" v-if="day.nightShift2">
                    {{ day.nightShift2Name }}
                  </div>
                  <div class="empty-slot night" v-else>N</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <section class="people-list">
    <!-- People List Section -->
    <h3>Zespół</h3>
    <div class="person-list">
      <div
        v-for="person in people"
        :key="person.id"
        class="person-item"
        :style="{ borderColor: person.ratownik ? 'orange' : '' }"
        draggable="true"
        @dragstart="startDrag(person)"
      >
        {{ person.name }}
      </div>
    </div>
  </section>
</template>

<script>
import { daysOfWeek } from "@/data/daysOfWeek.js";
import { MD5 } from "crypto-js";
import { addNotification } from "./NotificationMessage.vue";

export default {
  name: "CalendarComponent",
  data() {
    return {
      selectedMonth: new Date().getMonth(), // 0-indexed (January = 0)
      selectedYear: new Date().getFullYear(),
      monthDays: [],
      localData: {},
      changedShifts: {}, // User-modified shifts
      syncedChanges: {}, // Server-synced changes
      daysOfWeek,
      currentDate: new Date(),
      draggedPerson: null,
      people: [
        { id: 1, name: "Milena", ratownik: false },
        { id: 2, name: "Mikołaj", ratownik: false },
        { id: 3, name: "Aleksandra", ratownik: false },
        { id: 4, name: "Łukasz", ratownik: true },
        { id: 5, name: "Joanna", ratownik: true },
        { id: 6, name: "Natalia", ratownik: true },
        { id: 7, name: "Marcin", ratownik: true },
        { id: 8, name: "Alina", ratownik: false },
        { id: 9, name: "Ewelina", ratownik: false },
        { id: 7, name: "Teresa", ratownik: false },
      ],
      madeChanges: false,
      showPasswordModal: false,
      password: "",
      locale: "pl",
    };
  },
  computed: {
    monthYear() {
      return new Date(this.selectedYear, this.selectedMonth).toLocaleString(
        this.locale,
        {
          month: "long",
          year: "numeric",
        }
      );
    },
  },
  methods: {
    startDrag(person) {
      this.draggedPerson = person;
    },
    handleDrop(date, shiftType) {
      if (this.draggedPerson) {
        const day = this.monthDays.find(
          (day) => day.date.toDateString() === date.toDateString()
        );

        const previousValue = day[shiftType];

        // Temporarily update to test uniqueness
        const tempShifts = { ...day, [shiftType]: this.draggedPerson.id };
        if (
          (tempShifts.dayShift1 != null &&
            tempShifts.dayShift2 != null &&
            tempShifts.dayShift1 === tempShifts.dayShift2) ||
          (tempShifts.nightShift1 != null &&
            tempShifts.nightShift2 != null &&
            tempShifts.nightShift1 === tempShifts.nightShift2)
        ) {
          addNotification("Ta sama osoba na obydwu zmianach.", "red");
          return;
        }
        console.log(day.dayShift1Ratownik);
        console.log(day.dayShift2Ratownik);
        const isDraggedRatownik = this.draggedPerson.ratownik;

        // Check if another ratownik is already assigned to the same shift type
        const hasOtherRatownik =
          (shiftType === "dayShift1" && day.dayShift2Ratownik) ||
          (shiftType === "dayShift2" && day.dayShift1Ratownik) ||
          (shiftType === "nightShift1" && day.nightShift2Ratownik) ||
          (shiftType === "nightShift2" && day.nightShift1Ratownik);

        if (isDraggedRatownik && hasOtherRatownik) {
          addNotification(
            "Nie można przypisać ratownika do tego samego rodzaju zmiany.",
            "red"
          );
          return;
        }

        day[shiftType] = this.draggedPerson.id;
        day[`${shiftType}Name`] = this.draggedPerson.name;

        const updatedData = {
          dayShift1: day.dayShift1,
          dayShift2: day.dayShift2,
          nightShift1: day.nightShift1,
          nightShift2: day.nightShift2,
        };

        this.localData[date.toDateString()] = updatedData;
        localStorage.setItem(date.toDateString(), JSON.stringify(updatedData));

        if (!this.changedShifts[date.toDateString()]) {
          this.changedShifts[date.toDateString()] = {};
        }
        this.changedShifts[date.toDateString()][shiftType] = {
          from: previousValue,
          to: this.draggedPerson.id,
        };

        sessionStorage.setItem(
          "changedShifts",
          JSON.stringify(this.changedShifts)
        );

        this.madeChanges = true;

        this.draggedPerson = null;
      }
    },
    handleClickResetShift(day, shift) {
      // Check if the shift is assigned
      if (day[shift] !== null) {
        // Save the previous value before resetting
        const previousValue = day[shift];

        // Set the shift to empty
        day[shift] = null;
        day[shift + "Name"] = null; // Clear the name field as well

        // Save the updated day object in localStorage and in-memory data
        const updatedData = {
          dayShift1: day.dayShift1,
          dayShift2: day.dayShift2,
          nightShift1: day.nightShift1,
          nightShift2: day.nightShift2,
        };

        this.localData[day.date.toDateString()] = updatedData;
        localStorage.setItem(
          day.date.toDateString(),
          JSON.stringify(updatedData)
        );

        // Check if this change matches a null-to-null situation in changedShifts
        const changeExists =
          this.changedShifts?.[day.date.toDateString()]?.[shift];
        if (changeExists && changeExists.from === null) {
          delete this.changedShifts[day.date.toDateString()][shift];

          // Clean up the date entry if no shifts remain
          if (
            Object.keys(this.changedShifts[day.date.toDateString()]).length ===
            0
          ) {
            delete this.changedShifts[day.date.toDateString()];
          }
        } else {
          // Otherwise, track the reset in changedShifts
          if (!this.changedShifts[day.date.toDateString()]) {
            this.changedShifts[day.date.toDateString()] = {};
          }
          this.changedShifts[day.date.toDateString()][shift] = {
            from: previousValue,
            to: null,
          };
        }

        // Update sessionStorage
        sessionStorage.setItem(
          "changedShifts",
          JSON.stringify(this.changedShifts)
        );

        // Check if changedShifts is empty and update madeChanges
        if (Object.keys(this.changedShifts).length === 0) {
          this.madeChanges = false;
        } else {
          this.madeChanges = true;
        }
      }
    },
    resolvePersonName(id) {
      const person = this.people.find((person) => person.id === id);
      return person
        ? { name: person.name, isRatownik: person.ratownik }
        : { name: "Not assigned", isRatownik: false };
    },

    generateMonthDays() {
      const year = this.selectedYear;
      const month = this.selectedMonth;
      const lastDay = new Date(year, month + 1, 0).getDate();

      this.monthDays = [];
      for (let i = 1; i <= lastDay; i++) {
        this.monthDays.push({
          date: new Date(year, month, i),
          dayShift1: null,
          dayShift2: null,
          nightShift1: null,
          nightShift2: null,
          dayShift1Name: "Not assigned",
          dayShift2Name: "Not assigned",
          nightShift1Name: "Not assigned",
          nightShift2Name: "Not assigned",
          isCurrentMonth: true,
        });
      }

      this.loadFromLocalStorage();
    },
    changeMonth(newMonth) {
      if (this.madeChanges) {
        const confirmSwitch = confirm(
          "You have unsaved changes. Are you sure you want to switch the month? Your changes will be discarded."
        );
        if (!confirmSwitch) {
          return; // Cancel the month change
        }
        this.changedShifts = {};
      }

      // Update the selected month and year
      this.selectedMonth = this.selectedMonth + newMonth;
      this.generateMonthDays(); // Regenerate the days for the new month
    },
    showPasswordPrompt() {
      this.showPasswordModal = true;
    },
    async authorize() {
      const hashedPassword = import.meta.env.VITE_AUTH_PASSWORD;
      const enteredPasswordHash = MD5(this.password).toString();

      if (enteredPasswordHash === hashedPassword) {
        //addNotification("Authorized", "green");

        // Prepare data for committing
        const encodedContent = btoa(JSON.stringify(this.localData)); // Encode as Base64
        try {
          const response = await fetch("http://localhost:3000/", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ key: "shiftData", value: encodedContent }),
          });
          if (!response.ok) {
            throw new Error("Failed to update data on the server");
          }
          //addNotification("Data successfully updated on the server", "green");
          this.madeChanges = false;
        } catch (error) {
          console.error("Error updating server data:", error);
          addNotification(
            error.message || "Failed to update data on the server",
            "red"
          );
        }
      } else {
        addNotification("Złe hasło", "red");
      }

      this.showPasswordModal = false;
      this.password = "";
      this.changedShifts = {};
      addNotification("Zmiany zapisano :3 !", "green");
    },

    async fetchServerShiftData() {
      this.syncedChanges = {};
      try {
        const response = await fetch(
          "http://localhost:3000/?key=shiftData.json",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        //console.log(response);
        if (!response.ok) {
          if (response.status === 404) {
            addNotification("Data not found on server", "red");
          }
          throw new Error(
            `Failed to fetch data from server: ${response.status}`
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching data from server:", error);
        addNotification("Failed to fetch data from server", "red");
        return null;
      }
    },

    async checkShiftDataSync() {
      this.resetSyncedChangesSessionStorage();
      const remoteData = await this.fetchServerShiftData();

      if (!remoteData) {
        console.log("No remote data fetched.");
        return; // Exit if fetching fails
      }

      //console.log("Remote data fetched:", remoteData);

      const containedSyncedChanges = {}; // Reset synced changes

      for (const [date, remoteShifts] of Object.entries(remoteData)) {
        // Retrieve local shifts directly from localStorage
        const savedStates = localStorage.getItem(date);
        const localShifts = savedStates ? JSON.parse(savedStates) : null;

        const differences = {};

        //console.log(`Comparing shifts for date: ${date}`);
        //console.log("Local shifts from localStorage:", localShifts);
        //console.log("Remote shifts:", remoteShifts);

        if (!localShifts) {
          // New shifts entirely - add to synced changes and localStorage
          containedSyncedChanges[date] = { ...remoteShifts };
          localStorage.setItem(date, JSON.stringify(remoteShifts));
          //console.log(`New shifts added for ${date}:`, remoteShifts);
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
            //console.log(`Differences for ${date}:`, differences);
          }

          // Update local storage with the latest remote data
          localStorage.setItem(date, JSON.stringify(remoteShifts));
        }
      }

      this.generateMonthDays(); // Initialize local data first
      // Update syncedChanges and save to sessionStorage
      this.syncedChanges = containedSyncedChanges;
      console.log("Updated syncedChanges:", this.syncedChanges);

      sessionStorage.setItem(
        "syncedChanges",
        JSON.stringify(this.syncedChanges)
      );

      // Clear synced changes after 5 seconds
      setTimeout(() => {
        console.log("Clearing syncedChanges.");
        this.syncedChanges = {};
        sessionStorage.removeItem("syncedChanges");
      }, 5000);
    },
    async encodeLargeData(data) {
      try {
        // Convert data to a JSON string
        const jsonString = JSON.stringify(data, null, 2);

        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: "application/json" });

        // Use FileReader to convert Blob to base64
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
          reader.onloadend = () => {
            // Resolve the base64 encoded string
            resolve(reader.result.split(",")[1]); // Remove the "data:..." prefix
          };

          reader.onerror = () => reject(new Error("Failed to read the Blob"));

          // Read the Blob as data URL (base64)
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error("Error encoding large data:", error);
        addNotification("Error encoding data", "red");
        return null;
      }
    },
    cancel() {
      this.showPasswordModal = false;
      this.password = "";
    },

    loadFromLocalStorage() {
      const year = this.selectedYear;
      const month = this.selectedMonth;

      for (let i = 1; i <= 31; i++) {
        const date = new Date(year, month, i).toDateString();

        // Skip if the date is in syncedChanges
        if (this.syncedChanges[date]) continue;

        const savedStates = localStorage.getItem(date);
        if (savedStates) {
          try {
            const parsedStates = JSON.parse(savedStates);
            const day = this.monthDays.find(
              (day) => day.date.toDateString() === date
            );

            if (day) {
              day.dayShift1 = parsedStates.dayShift1;
              day.dayShift2 = parsedStates.dayShift2;
              day.nightShift1 = parsedStates.nightShift1;
              day.nightShift2 = parsedStates.nightShift2;

              // Resolve names with ratownik data
              const dayShift1Data = this.resolvePersonName(day.dayShift1);
              day.dayShift1Name = dayShift1Data.name;
              day.dayShift1Ratownik = dayShift1Data.isRatownik;

              const dayShift2Data = this.resolvePersonName(day.dayShift2);
              day.dayShift2Name = dayShift2Data.name;
              day.dayShift2Ratownik = dayShift2Data.isRatownik;

              const nightShift1Data = this.resolvePersonName(day.nightShift1);
              day.nightShift1Name = nightShift1Data.name;
              day.nightShift1Ratownik = nightShift1Data.isRatownik;

              const nightShift2Data = this.resolvePersonName(day.nightShift2);
              day.nightShift2Name = nightShift2Data.name;
              day.nightShift2Ratownik = nightShift2Data.isRatownik;
            }
          } catch (error) {
            addNotification("Failed to load local data: " + error, "red");
          }
        }
      }
    },

    resetSyncedChangesSessionStorage() {
      // Load synced changes from sessionStorage
      const savedSyncedChanges = sessionStorage.getItem("syncedChanges");
      if (savedSyncedChanges) {
        this.syncedChanges = JSON.parse(savedSyncedChanges);

        // Clear the syncedChanges after 5 seconds
        setTimeout(() => {
          this.syncedChanges = {};
          sessionStorage.removeItem("syncedChanges");
        }, 5000);
      }
    },
  },

  async mounted() {
    await this.checkShiftDataSync(); // Then sync with remote data
  },
};
</script>

<style scoped>
.calendar-container {
  display: flex;
  height: 100vh;
  height: auto;
  max-width: 1600px;
}

/* People Bar styles */
.people-list {
  position: fixed;
  top: var(--spacing-large);
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(30%); /* Center horizontally */
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  padding: var(--spacing-large);
  gap: var(--spacing-small);
  overflow-y: auto;
}
@media (max-width: 768px) {
  .people-list {
    width: 90%;
  }
}
/* Header for people list */
.people-list h3 {
  color: var(--color-text);
  filter: drop-shadow(var(--shadow-drop));
  margin-bottom: var(--spacing-medium);
}
.person-list {
  display: flex;
  flex-direction: row;
  gap: var(--spacing-small);
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
/* Individual draggable people items */
.person-item {
  padding: 1ch;
  color: var(--color-text);
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius);
  text-align: center;
  cursor: grab;
  transition: transform 0.2s ease;
}

.person-item:hover {
  transform: scale(1.1);
}

.person-item.dragging {
  cursor: grabbing;
  transform: scale(1.1);
}

.person-item.grabbing {
  cursor: grabbing;
  transform: scale(1.1);
}

/* Calendar styles */
.calendar {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: visible;
}
.calendar-header {
  text-align: center;
  position: fixed;
  top: 0;
  left: calc(var(--width-people-bar) + var(--spacing-large));
  color: var(--color-text);
  filter: drop-shadow(var(--shadow-drop));
  margin: 0;
  padding: var(--spacing-large);
}
.current-month {
  background-color: var(--color-background);
}

/* Month Change top bar */
.monthChange {
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  padding: 1ch 0;
  align-items: center;
  width: 100%;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  z-index: 1000;
}

.buttonMonthChange {
  color: var(--color-text-dark);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: xx-large;
  transition: background-color 0.3s ease;
  padding-bottom: var(--spacing-small);
  line-height: 16px;
}
/* Days Header styles */
.days-header {
  display: flex;
  margin-top: 40px;
}
.day-header {
  flex: 1;
  text-align: center;
  font-weight: bold;
}

/* Calendar Grid styles */
.calendar-grid {
  margin-top: 3ch;
  display: grid;
  grid-template-columns: repeat(31, 1fr);
  flex: 1;
  overflow-x: visible;
  scrollbar-width: auto;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  padding: var(--spacing-small);
}

/* Day (24h cycle) styles */
.day-column {
  display: flex;
  flex-direction: column;
}

.day-cell {
  flex: 1;
  border: 1px solid var(--glass-border-color);
  position: relative;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small);
  width: var(--width-day-cell);
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-box-shadow);
  border-radius: 4px;
}

.day-date {
  font-weight: bold;
}

/* Shifts styles */
.shift {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.shift-slot {
  border: 1px solid #ccc;
  margin-top: var(--spacing-small);
}
.empty-slot {
  color: var(--color-empty-slot);
  font-size: var(--font-size-small);
  padding: var(--spacing-small);
  height: var(--height-empty-slot);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
}
/* Assigned Person Styles */
.assigned-person.day,
.assigned-person.night {
  padding: var(--spacing-small);
  background-color: transparent;
  font-weight: bolder;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
  cursor: pointer;
}

.shift-label {
  background-color: var(--color-label-bg);
  padding: var(--spacing-small);
}

/* Shift Types Colors */
.day {
  background-color: var(--color-day) !important;
}
.night {
  background-color: var(--color-night) !important;
}

/* Button Styles */
.submit-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius-small);
  padding: var(--spacing-medium) var(--spacing-large);
  cursor: pointer;
  font-size: var(--font-size-large);
  transition: background-color 0.3s ease, transform 0.2s ease;
  filter: drop-shadow(var(--shadow-drop));
  box-shadow: var(--glass-box-shadow);
}

.submit-button:hover:not(:disabled) {
  background-color: rgba(200, 200, 255, 0.3);
  transform: scale(1.1);
}

.submit-button:disabled {
  background-color: var(--color-button-disabled-bg);
  cursor: not-allowed;
  filter: none;
}

/* Modal Styles */
.modal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-modal-bg);
  display: flex;
  justify-content: center;
  align-items: center;
}
/* Base modal container styles */
.modal-content {
  background-color: var(--color-modal-content-bg, rgba(255, 255, 255, 0.95));
  padding: var(--spacing-large, 1.5rem);
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-modal, 0 4px 10px rgba(0, 0, 0, 0.2));
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: fadeIn 0.3s ease-out;
}

/* Password Input */
.modal-content input[type="password"] {
  max-width: 400px;
  padding: 0.8rem;
  margin: 10px 0;
  border: 1px solid var(--color-border, #ccc);
  border-radius: var(--border-radius-small, 4px);
  outline: none;
  transition: box-shadow 0.2s ease;
}

.modal-content input[type="password"]:focus {
  box-shadow: 0 0 5px var(--color-primary, #7e5bef);
}

/* Button styles */
.modal-content button {
  background-color: var(--color-button-bg, #7e5bef);
  color: var(--color-text-light, #ffffff);
  padding: 0.8rem 1.2rem;
  margin: 5px;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.modal-content button:hover {
  background-color: var(--color-button-hover-bg, #9b7ebd);
  transform: scale(1.05);
}

.modal-content button:active {
  transform: scale(0.95);
}

/* Responsive Modal */
@media (max-width: 500px) {
  .modal-content {
    padding: 1rem;
  }

  .modal-content input[type="password"] {
    font-size: 14px;
  }

  .modal-content button {
    font-size: 14px;
  }
}

/* Animation */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Changes Highlight */
.user-changed {
  background-color: var(
    --color-user-changed
  ) !important; /* Highlight user-made changes */
}

.synced-changed {
  background-color: var(
    --color-synced-changed
  ) !important; /* Highlight server-synced changes */
}
.ratownik {
  color: #ffffff !important;
}
</style>
