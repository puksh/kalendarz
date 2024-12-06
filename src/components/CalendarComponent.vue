<template>
  <button
    :disabled="!madeChanges"
    @click="showPasswordPrompt"
    class="submit-button"
  >
    Submit
  </button>
  <section v-if="showPasswordModal" class="modal">
    <div class="modal-content">
      <p>Enter Password:</p>
      <input type="password" v-model="password" />
      <button @click="authorize">Submit</button>
      <button @click="cancel">Cancel</button>
    </div>
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
          <div class="days-header">
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
  <button class="buttonMonthChange" @click="changeMonth(-1)">⇐</button>
  <span> {{ monthYear }} </span>
  <button class="buttonMonthChange" @click="changeMonth(1)">⇒</button>

  <section>
    <!-- People List Section -->
    <div class="people-list">
      <h3>Załoga</h3>
      <div
        v-for="person in people"
        :key="person.id"
        class="person-item"
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
        { id: 1, name: "Milena" },
        { id: 2, name: "Mikołaj" },
        { id: 3, name: "Aleksandra" },
        { id: 4, name: "Łukasz" },
        { id: 5, name: "Joanna" },
        { id: 6, name: "Natalia" },
        { id: 7, name: "Marcin" },
      ],
      madeChanges: false,
      showPasswordModal: false,
      password: "",
      githubToken: import.meta.env.VITE_TOKEN,
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

        if (day) {
          // Save the previous value before updating
          const previousValue = day[shiftType];

          // Update the shift dynamically
          day[shiftType] = this.draggedPerson.id; // Save ID
          day[`${shiftType}Name`] = this.draggedPerson.name; // Save name

          // Update localData and localStorage
          const updatedData = {
            dayShift1: day.dayShift1,
            dayShift2: day.dayShift2,
            nightShift1: day.nightShift1,
            nightShift2: day.nightShift2,
          };

          this.localData[date.toDateString()] = updatedData;
          localStorage.setItem(
            date.toDateString(),
            JSON.stringify(updatedData)
          );

          // Track changes made by the user in changedShifts
          if (!this.changedShifts[date.toDateString()]) {
            this.changedShifts[date.toDateString()] = {};
          }
          this.changedShifts[date.toDateString()][shiftType] = {
            from: previousValue,
            to: this.draggedPerson.id,
          };

          // Save changedShifts to sessionStorage
          sessionStorage.setItem(
            "changedShifts",
            JSON.stringify(this.changedShifts)
          );

          // Notify change and reset dragged person
          this.madeChanges = true;
          this.draggedPerson = null;
        }
      }
    },
    handleClickResetShift(day, shift) {
      // Check if the shift is assigned
      if (day[shift]) {
        // Save the previous value before resetting
        const previousValue = day[shift];

        // Set the shift to empty
        day[shift] = null;
        day[shift + "Name"] = null; // Clear the name field as well (e.g., nightShift2Name)

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

        // Track the reset in changedShifts
        if (!this.changedShifts[day.date.toDateString()]) {
          this.changedShifts[day.date.toDateString()] = {};
        }
        this.changedShifts[day.date.toDateString()][shift] = {
          from: previousValue,
          to: null,
        };

        // Notify the change and mark changes made
        this.madeChanges = true; // Track changes
      }
    },
    resolvePersonName(id) {
      const person = this.people.find((person) => person.id === id);
      return person ? person.name : "Not assigned";
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

              // Resolve names
              day.dayShift1Name = this.resolvePersonName(day.dayShift1);
              day.dayShift2Name = this.resolvePersonName(day.dayShift2);
              day.nightShift1Name = this.resolvePersonName(day.nightShift1);
              day.nightShift2Name = this.resolvePersonName(day.nightShift2);
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
  margin-top: var(--spacing-large);
  width: var(--width-people-bar);
  position: fixed;
  padding: var(--spacing-large);
  height: var(--height-people-bar);
}
.people-list h3 {
  color: var(--color-text);
  filter: drop-shadow(var(--shadow-drop));
}
.person-item {
  padding: 0.3rem;
  color: var(--color-text);
  background-color: var(--color-primary);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-medium);
  cursor: grab;
  text-align: center;
  filter: drop-shadow(var(--shadow-drop));
}
.person-item.grabbing {
  cursor: grabbing;
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
  display: grid;
  grid-template-columns: repeat(31, 1fr);
  flex: 1;
  overflow-x: visible;
  scrollbar-width: auto;
}

/* Day (24h cycle) styles */
.day-column {
  display: flex;
  flex-direction: column;
}
.day-cell {
  flex: 1;
  border: 1px solid var(--color-border);
  position: relative;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-small);
  width: var(--width-day-cell);
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
  background-color: var(--color-day);
}
.night {
  background-color: var(--color-night);
}

/* Button Styles */
.submit-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  background-color: var(--color-button-bg);
  color: var(--color-text-light);
  border: none;
  border-radius: var(--border-radius-small);
  padding: var(--spacing-medium) var(--spacing-large);
  cursor: pointer;
  font-size: var(--font-size-large);
  transition: background-color 0.3s ease;
  filter: drop-shadow(var(--shadow-drop));
}
.submit-button:hover {
  background-color: var(--color-button-hover-bg);
}
.submit-button:disabled {
  background-color: var(--color-button-disabled-bg);
  cursor: not-allowed;
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
.modal-content {
  background-color: var(--color-modal-content-bg);
  padding: var(--spacing-large);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-modal);
  text-align: center;
}

/* Month Change Button */
.buttonMonthChange {
  background-color: var(--color-button-bg);
  color: var(--color-text-light);
  border: none;
  border-radius: var(--border-radius-small);
  cursor: pointer;
  font-size: var(--font-size-large);
  transition: background-color 0.3s ease;
  margin: var(--spacing-medium) var(--spacing-medium) 0 var(--spacing-medium);
  padding-bottom: var(--spacing-small);
  line-height: 16px;
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
</style>
