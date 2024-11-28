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
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'day1')"
                >
                  <div class="assigned-person day" v-if="day.dayShift1">
                    {{ day.dayShift1Name }}
                  </div>
                  <div class="empty-slot day" v-else>D</div>
                </div>
                <div
                  class="shift-slot"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'day2')"
                >
                  <div class="assigned-person day" v-if="day.dayShift2">
                    {{ day.dayShift2Name }}
                  </div>
                  <div class="empty-slot day" v-else>D</div>
                </div>
                <div
                  class="shift-slot"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'night1')"
                >
                  <div class="assigned-person night" v-if="day.nightShift1">
                    {{ day.nightShift1Name }}
                  </div>
                  <div class="empty-slot night" v-else>N</div>
                </div>
                <div
                  class="shift-slot"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'night2')"
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
  <button @click="changeMonth(-1)">Previous Month</button>
  <span>{{ monthYear }}</span>
  <button @click="changeMonth(1)">Next Month</button>

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
    };
  },
  computed: {
    monthYear() {
      return new Date(this.selectedYear, this.selectedMonth).toLocaleString(
        "default",
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
          switch (shiftType) {
            case "day1":
              day.dayShift1 = this.draggedPerson.id; // Save ID
              day.dayShift1Name = this.draggedPerson.name; // Set name
              break;
            case "day2":
              day.dayShift2 = this.draggedPerson.id; // Save ID
              day.dayShift2Name = this.draggedPerson.name; // Set name
              break;
            case "night1":
              day.nightShift1 = this.draggedPerson.id; // Save ID
              day.nightShift1Name = this.draggedPerson.name; // Set name
              break;
            case "night2":
              day.nightShift2 = this.draggedPerson.id; // Save ID
              day.nightShift2Name = this.draggedPerson.name; // Set name
              break;
          }

          // Save the updated day object in localStorage and in-memory data
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

          addNotification("Shift updated locally", "green");
          this.madeChanges = true;
          this.draggedPerson = null;
        }
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
    },
    changeMonth(newMonth) {
      if (this.madeChanges) {
        const confirmSwitch = confirm(
          "You have unsaved changes. Are you sure you want to switch the month? Your changes will be discarded."
        );
        if (!confirmSwitch) {
          return; // Cancel the month change
        }
      }

      // Update the selected month and year
      this.selectedMonth = this.selectedMonth + newMonth;
      this.generateMonthDays(); // Regenerate the days for the new month
      this.loadFromLocalStorage(); // Load the data for the new month
    },
    showPasswordPrompt() {
      this.showPasswordModal = true;
    },
    async authorize() {
      const hashedPassword = import.meta.env.VITE_AUTH_PASSWORD;
      const enteredPasswordHash = MD5(this.password).toString();

      if (enteredPasswordHash === hashedPassword) {
        addNotification("Authorized", "green");
        this.madeChanges = false;

        // Prepare data for committing
        const encodedContent = btoa(JSON.stringify(this.localData)); // Encode as Base64
        try {
          const response = await fetch(
            "https://my-worker.6o4avjb7.workers.dev/?key=shiftData",
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ key: "shiftData", value: encodedContent }),
            }
          );

          if (!response.ok) {
            throw new Error("Failed to update data in KV");
          }
          addNotification("Data successfully updated in KV store", "green");
        } catch (error) {
          console.error("Error updating KV data:", error);
          addNotification(
            error.message || "Failed to update data in KV",
            "red"
          );
        }
      } else {
        addNotification("Incorrect Password", "red");
      }

      this.showPasswordModal = false;
      this.password = "";
    },
    async fetchKVData() {
      try {
        const response = await fetch(
          "https://my-worker.6o4avjb7.workers.dev/?key=shiftData",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json", // Ensure the content type is set correctly
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            addNotification("Data not found in KV store", "yellow");
          }
          throw new Error(`Failed to fetch data from KV: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching KV data:", error);
        addNotification("Failed to fetch data from KV", "red");
        return null;
      }
    },

    async checkDataSync() {
      const remoteData = await this.fetchKVData();

      if (!remoteData) {
        return; // Exit if fetching failed
      }

      if (JSON.stringify(remoteData) !== JSON.stringify(this.localData)) {
        // Clear localStorage and update with remoteData
        localStorage.clear(); // Remove previous data
        this.localData = {}; // Clear localData to reset UI

        for (const [date, shifts] of Object.entries(remoteData)) {
          this.localData[date] = shifts; // Update reactive localData
          localStorage.setItem(date, JSON.stringify(shifts)); // Sync localStorage
        }

        addNotification("Local data synced with KV store", "blue");
        this.madeChanges = false; // Reset the change flag
      } else {
        console.log("Data is already up-to-date");
      }
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
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();

      for (let i = 1; i <= 31; i++) {
        const date = new Date(year, month, i).toDateString();
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
  },
  async mounted() {
    this.generateMonthDays();
    this.loadFromLocalStorage();
    this.checkDataSync();
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
/* Peaople Bar styles */
.people-list {
  margin-top: 20px;
  width: 200px;
  position: fixed;
  padding: 10px;
  height: 430px;
}
.people-list h3 {
  color: #fff;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));
}
.person-item {
  padding: 0.3rem;
  color: #fff;
  background-color: #83d8ff;
  border-radius: 25px;
  margin-bottom: 8px;
  cursor: grab;
  text-align: center;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));
}
.person-item {
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
  left: 250px;
  color: #fff;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));
  margin: 0;
  padding: 10px;
}
.current-month {
  background-color: #e1f5fe;
}
/* Calendar styles */
.days-header {
  display: flex;
  margin-top: 40px;
}
.day-header {
  flex: 1;
  text-align: center;
  font-weight: bold;
}
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
  border: 1px solid #ddd;
  position: relative;
  flex-direction: column;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  width: 120px;
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
  margin-top: 4px;
}
.empty-slot {
  color: #494949;
  font-size: 0.8em;
  padding: 5px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
/* Assigned person styles */
.assigned-person.day {
  padding: 5px;
  background-color: #3dc2ff;
  font-weight: bolder;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.assigned-person.night {
  padding: 5px;
  background-color: #83d8ff;
  font-weight: bolder;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.shift-label {
  background-color: #e0e0e0;
  padding: 5px;
}
/* Shift types colors */
.day {
  background-color: #aaddf5;
}
.night {
  background-color: #83d8ff;
}

/* Button styles */
.submit-button {
  position: fixed;
  bottom: 100px;
  right: 20px;
  background-color: #3b1e54;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 24px;
  transition: background-color 0.3s ease;
  filter: drop-shadow(0px 3px 6px rgba(0, 0, 0, 0.4));
}
.submit-button:hover {
  background-color: #6f4592;
}
/*disabled style*/
.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Modal styles */
.modal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}
</style>
