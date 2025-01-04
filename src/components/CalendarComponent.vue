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
  <section>
    <section class="monthChange">
      <button class="buttonMonthChange" @click="changeMonth(-1)">
        &#8249;
      </button>
      <span style="font-weight: bold"> {{ monthYear.toUpperCase() }} </span>
      <button class="buttonMonthChange" @click="changeMonth(1)">&#8250;</button>
    </section>
    <button
      class="top-right-buttons buttonRefresh"
      @click="checkShiftDataSync()"
    >
      <img
        :src="'/assets/icons/refresh.svg'"
        style="width: 30px; height: 30px; cursor: pointer"
        alt="Refresh"
      />
    </button>
    <!--
    <button class="top-right-buttons buttonFilter" @click="filterCalendar()">
      <img
        :src="'/assets/icons/filter.svg'"
        style="width: 30px; height: 30px; cursor: pointer"
        alt="Refresh"
      />
    </button>
    -->
  </section>
  <div class="calendar-container">
    <!-- Calendar Section -->
    <section
      class="scrollable-container"
      @wheel.prevent="handleScroll"
      ref="scrollContainer"
    >
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
              :class="{
                'current-month': day.isCurrentMonth,
                'nd-color': daysOfWeek[day.date.getDay()] === 'Nd',
                'sob-color': daysOfWeek[day.date.getDay()] === 'Sob',
              }"
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
                  class="shift-slot day"
                  :class="{
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift1,
                    ratownik: day.dayShift1Ratownik === true,
                    pielegniarka: day.dayShift1Ratownik === false,
                    userChanged: day.dayShift1UserChanged === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'dayShift1')"
                  @click="handleClickResetShift(day, 'dayShift1')"
                  @touchend="handleDrop(day.date, 'dayShift1')"
                >
                  <div class="assigned-person" v-if="day.dayShift1">
                    {{ day.dayShift1Name }}
                  </div>
                  <div class="empty-slot" v-else>D</div>
                </div>
                <div
                  class="shift-slot day"
                  :class="{
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift2,
                    ratownik: day.dayShift2Ratownik === true,
                    pielegniarka: day.dayShift2Ratownik === false,
                    userChanged: day.dayShift2UserChanged === true,
                  }"
                  @drop="handleDrop(day.date, 'dayShift2')"
                  @click="handleClickResetShift(day, 'dayShift2')"
                  @touchend="handleDrop(day.date, 'dayShift2')"
                >
                  <div class="assigned-person" v-if="day.dayShift2">
                    {{ day.dayShift2Name }}
                  </div>
                  <div class="empty-slot" v-else>D</div>
                </div>
                <div
                  class="shift-slot night"
                  :class="{
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift1,
                    ratownik: day.nightShift1Ratownik === true,
                    pielegniarka: day.nightShift1Ratownik === false,
                    userChanged: day.nightShift1UserChanged === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift1')"
                  @click="handleClickResetShift(day, 'nightShift1')"
                  @touchend="handleDrop(day.date, 'nightShift1')"
                >
                  <div class="assigned-person" v-if="day.nightShift1">
                    {{ day.nightShift1Name }}
                  </div>
                  <div class="empty-slot" v-else>N</div>
                </div>
                <div
                  class="shift-slot night"
                  :class="{
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift2,
                    ratownik: day.nightShift2Ratownik === true,
                    pielegniarka: day.nightShift2Ratownik === false,
                    userChanged: day.nightShift2UserChanged === true,
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift2')"
                  @click="handleClickResetShift(day, 'nightShift2')"
                  @touchend="handleDrop(day.date, 'nightShift2')"
                >
                  <div class="assigned-person" v-if="day.nightShift2">
                    {{ day.nightShift2Name }}
                  </div>
                  <div class="empty-slot" v-else>N</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  <PeopleListWindow :people="people" />
  <div style="display: flex; flex-direction: column; align-items: center">
    <h1
      style="
        background: var(--glass-bg-color);
        backdrop-filter: blur(var(--glass-blur));
        -webkit-backdrop-filter: blur(var(--glass-blur));
        border: 1px solid var(--glass-border-color);
        border-radius: var(--border-radius-small);
        filter: drop-shadow(var(--shadow-drop));
        color: var(--color-text-dark);
        font-size: 20px;
        box-shadow: var(--glass-box-shadow);
        padding: var(--spacing-medium);
      "
    >
      Tryb edytowania <a style="color: green">Włączony</a>
    </h1>
  </div>
  <ShiftCountWindow :people="people" :monthDays="monthDays" />
</template>

<script>
import { daysOfWeek } from "@/data/daysOfWeek.js";
import { MD5 } from "crypto-js";
import { addNotification } from "./NotificationMessage.vue";
import ShiftCountWindow from "./ShiftCountWindow.vue";
import PeopleListWindow from "./PeopleListWindow.vue";

export default {
  name: "CalendarComponent",
  components: { ShiftCountWindow, PeopleListWindow },
  data() {
    return {
      selectedMonth: new Date().getMonth(), // 0-indexed (January = 0)
      selectedYear: new Date().getFullYear(),
      monthDays: [],
      localData: {},
      syncedChanges: {}, // Server-synced changes
      daysOfWeek,
      currentDate: new Date(),
      people: [
        { id: 1, name: "Milena", ratownik: false },
        { id: 2, name: "Mikołaj", ratownik: false },
        { id: 3, name: "Aleksandra", ratownik: false },
        { id: 4, name: "Łukasz", ratownik: true },
        { id: 5, name: "Joanna", ratownik: false },
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
      scrollContainer: null,
      isEditingMode: JSON.parse(localStorage.getItem("isEditingMode")) || false, // Retrieve initial state
    };
  },
  computed: {
    monthYear() {
      return new Date(this.selectedYear, this.selectedMonth).toLocaleString(
        this.locale,
        {
          month: "long",
          year: "numeric",
        },
      );
    },
  },
  methods: {
    handleDrop(date, shiftType) {
      const draggedPerson = JSON.parse(localStorage.getItem("draggedPerson"));
      // Is user actually dragging a person
      if (!draggedPerson) return;
      const day = this.monthDays.find(
        (day) => day.date.toDateString() === date.toDateString(),
      );

      // Temporarily update to test uniqueness
      const tempShifts = { ...day, [shiftType]: draggedPerson.id };
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

      const isDraggedRatownik = draggedPerson.ratownik;

      // Check if another ratownik is already assigned to the same shift type
      let hasOtherRatownik = false;

      switch (shiftType) {
        case "dayShift1":
          hasOtherRatownik = day.dayShift2Ratownik;
          break;
        case "dayShift2":
          hasOtherRatownik = day.dayShift1Ratownik;
          break;
        case "nightShift1":
          hasOtherRatownik = day.nightShift2Ratownik;
          break;
        case "nightShift2":
          hasOtherRatownik = day.nightShift1Ratownik;
          break;
      }
      if (isDraggedRatownik && hasOtherRatownik) {
        addNotification(
          "Nie można przypisać dwóch ratowników na jedną zmianę.",
          "red",
        );
        return;
      }

      day[shiftType] = draggedPerson.id;
      day[`${shiftType}Name`] = draggedPerson.name;
      day[`${shiftType}Ratownik`] = draggedPerson.ratownik;
      day[`${shiftType}UserChanged`] = true;

      const updatedData = {
        dayShift1: day.dayShift1,
        dayShift2: day.dayShift2,
        nightShift1: day.nightShift1,
        nightShift2: day.nightShift2,
      };

      this.localData[date.toDateString()] = updatedData;
      localStorage.setItem(date.toDateString(), JSON.stringify(updatedData));

      this.madeChanges = true;

      localStorage.removeItem("draggedPerson");
    },
    handleClickResetShift(day, shift) {
      // Check if the shift is assigned
      if (day[shift] !== null) {
        // Set the shift to empty
        day[shift] = null;
        day[shift + "Name"] = "Usunięto";
        day[shift + "Ratownik"] = null; //Clear Ratownik data
        day[shift + "UserChanged"] = true; //Clear Ratownik data

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
          JSON.stringify(updatedData),
        );
        day[shift] = "Usunięto";

        this.madeChanges = true;
      }
    },
    resolvePersonName(id) {
      const person = this.people.find((person) => person.id === id);
      return person
        ? { name: person.name, isRatownik: person.ratownik }
        : { name: undefined, isRatownik: false };
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
          "You have unsaved changes. Are you sure you want to switch the month? Your changes will be discarded.",
        );
        if (!confirmSwitch) {
          return; // Cancel the month change
        }
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
          const response = await fetch(
            "https://vuecalendar.kot.li/?key=shiftData.json",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ key: "shiftData", value: encodedContent }),
            },
          );
          if (!response.ok) {
            throw new Error("Failed to update data on the server");
          }
          //addNotification("Data successfully updated on the server", "green");
          this.madeChanges = false;
        } catch (error) {
          console.error("Error updating server data:", error);
          addNotification(
            error.message || "Failed to update data on the server",
            "red",
          );
        }
        addNotification("Zmiany zapisano :3 !", "green");
      } else {
        addNotification("Złe hasło", "red");
      }

      this.showPasswordModal = false;
      this.password = "";
    },

    async fetchServerShiftData() {
      this.syncedChanges = {};
      try {
        const response = await fetch(
          "https://vuecalendar.kot.li/?key=shiftData.json",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        //console.log(response);
        if (!response.ok) {
          if (response.status === 404) {
            addNotification("Data not found on server", "red");
          }
          throw new Error(
            `Failed to fetch data from server: ${response.status}`,
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
        JSON.stringify(this.syncedChanges),
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
        // Remove the toggle value before encoding
        localStorage.removeItem("isEditingMode");

        // Convert data to a JSON string
        const jsonString = JSON.stringify(data, null, 2);

        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: "application/json" });

        // Use FileReader to convert Blob to base64
        const reader = new FileReader();

        const base64String = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            // Resolve the base64 encoded string
            resolve(reader.result.split(",")[1]); // Remove the "data:..." prefix
          };

          reader.onerror = () => reject(new Error("Failed to read the Blob"));

          // Read the Blob as data URL (base64)
          reader.readAsDataURL(blob);
        });

        localStorage.setItem("isEditingMode", JSON.stringify(true));

        return base64String;
      } catch (error) {
        console.error("Error encoding large data:", error);
        this.addNotification("Error encoding data", "red");

        localStorage.setItem("isEditingMode", JSON.stringify(true));

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
              (day) => day.date.toDateString() === date,
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
      this.calculateAllShiftCounts();
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
    handleScroll(event) {
      if (this.scrollContainer) {
        event.preventDefault(); // Prevent default vertical scrolling
        this.scrollContainer.scrollLeft += event.deltaY; // Smooth horizontal scrolling
      }
    },
    getDayClass(dayIndex) {
      if (daysOfWeek[dayIndex] === "Nd") return "nd-color";
      if (daysOfWeek[dayIndex] === "Sob") return "sob-color";
      return "normal-color";
    },
    countShiftsForPerson(personId) {
      if (!personId) return 0;
      let tempCount = 0;

      for (let i = 0; i < this.monthDays.length; i++) {
        if (this.monthDays[i].dayShift1 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].dayShift2 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].nightShift1 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].nightShift2 === personId) {
          tempCount += 1;
        }
      }
      return tempCount;
    },

    calculateAllShiftCounts() {
      this.people.forEach((person) => {
        person.shiftCount = this.countShiftsForPerson(person.id);
      });
    },
  },

  async mounted() {
    await this.checkShiftDataSync(); // Then sync with remote data
    this.scrollContainer = this.$refs.scrollContainer;
  },
  watch: {
    isEditingMode(newValue) {
      localStorage.setItem("isEditingMode", JSON.stringify(newValue)); // Save to localStorage
    },
  },
};
</script>

<style scoped>
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
  filter: drop-shadow(var(--shadow-drop));
  box-shadow: var(--glass-box-shadow);
  padding: var(--spacing-medium) var(--spacing-large);
  cursor: pointer;
  font-size: var(--font-size-large);
  transition: all 0.3s ease;
}

.submit-button:hover:not(:disabled) {
  background-color: rgba(200, 200, 255, 0.3);
  transform: scale(1.1);
}

.submit-button:disabled {
  background-color: var(--color-button-disabled-bg);
  cursor: not-allowed;
  filter: none;
  visibility: hidden !important;
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
  color: var(--color-text-dark);
  padding: 0.8rem 1.2rem;
  margin: 5px;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
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
.userChanged {
  color: var(--color-user-changed) !important; /* Highlight user-made changes */
}
.assigned-person {
  cursor: pointer !important;
}
</style>
