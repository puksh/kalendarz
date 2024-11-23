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
    <div class="calendar-header">
      <h2>{{ monthYear }}</h2>
    </div>
    <section class="calendar">
      <div class="days-header">
        <div v-for="day in daysOfWeek" :key="day" class="day-header">
          {{ day }}
        </div>
      </div>
      <div class="calendar-grid">
        <div
          v-for="(day, index) in monthDays"
          :key="index"
          class="day-column"
          @dragover.prevent
          @drop="handleDrop(day.date, 'day')"
        >
          <div
            class="day-cell"
            :class="{ 'current-month': day.isCurrentMonth }"
          >
            <div class="day-date">{{ day.date.getDate() }}</div>
            <div
              class="shift"
              @drop="handleDrop(day.date, 'day')"
              @dragover.prevent
            >
              <div
                class="shift-slot"
                @dragover.prevent
                @drop="handleDrop(day.date, 'day1')"
              >
                <div class="assigned-person day" v-if="day.dayShift1">
                  {{ day.dayShift1.name }}
                </div>
                <div class="empty-slot day" v-else>D</div>
              </div>
              <div
                class="shift-slot"
                @dragover.prevent
                @drop="handleDrop(day.date, 'day2')"
              >
                <div class="assigned-person day" v-if="day.dayShift2">
                  {{ day.dayShift2.name }}
                </div>
                <div class="empty-slot day" v-else>D</div>
              </div>
              <div
                class="shift-slot"
                @dragover.prevent
                @drop="handleDrop(day.date, 'night1')"
              >
                <div class="assigned-person night" v-if="day.nightShift1">
                  {{ day.nightShift1.name }}
                </div>
                <div class="empty-slot night" v-else>N</div>
              </div>
              <div
                class="shift-slot"
                @dragover.prevent
                @drop="handleDrop(day.date, 'night2')"
              >
                <div class="assigned-person night" v-if="day.nightShift2">
                  {{ day.nightShift2.name }}
                </div>
                <div class="empty-slot night" v-else>N</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

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
import { people } from "@/data/people.js";
import { daysOfWeek } from "@/data/daysOfWeek.js";

export default {
  name: "CalendarComponent",
  data() {
    return {
      monthDays: [],
      daysOfWeek, // Assign imported daysOfWeek list to component data
      currentDate: new Date(), // Current date
      draggedPerson: null,
      people, // Assign imported people list to component data
      madeChanges: false,
      showPasswordModal: false,
      password: "",
    };
  },
  computed: {
    monthYear() {
      return this.currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    },
  },
  methods: {
    startDrag(person) {
      this.draggedPerson = person;
    },
    handleDrop(date, shiftType) {
      // Assign the dragged person to the selected date's shift
      if (this.draggedPerson) {
        const day = this.monthDays.find(
          (day) => day.date.toDateString() === date.toDateString()
        );
        if (day) {
          switch (shiftType) {
            case "day1":
              day.dayShift1 = this.draggedPerson;
              localStorage.setItem("dayShift1", JSON.stringify(day.dayShift1));
              this.madeChanges = true;
              break;
            case "day2":
              day.dayShift2 = this.draggedPerson;
              localStorage.setItem("dayShift2", JSON.stringify(day.dayShift2));
              this.madeChanges = true;
              break;
            case "night1":
              day.nightShift1 = this.draggedPerson;
              localStorage.setItem(
                "nightShift1",
                JSON.stringify(day.nightShift1)
              );
              this.madeChanges = true;
              break;
            case "night2":
              day.nightShift2 = this.draggedPerson;
              localStorage.setItem(
                "nightShift2",
                JSON.stringify(day.nightShift2)
              );
              this.madeChanges = true;
              break;
          }
          this.draggedPerson = null; // Clear the reference after dropping
        }
      }
    },

    getLatestCommit() {
      const latestCommit = localStorage.getItem("latestCommit");
      if (latestCommit) {
        this.latestCommit = JSON.parse(latestCommit);
      }
    },

    updateSchedule() {
      let buttonUpdateSchedule = document.getElementById(
        "buttonUpdateSchedule"
      );

      //TODO: Add logic to update schedule

      buttonUpdateSchedule.classList.add("hidden");
    },
    generateMonthDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      this.monthDays = [];

      // Add the current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        this.monthDays.push({
          date: new Date(year, month, i),
          dayShift1: null,
          dayShift2: null,
          nightShift1: null,
          nightShift2: null,
          isCurrentMonth: true,
        });
      }
    },
    showPasswordPrompt() {
      this.showPasswordModal = true;
    },
    authorize() {
      if (this.password === "yourPassword") {
        // Submit the changes
        console.log("Changes submitted");
        this.madeChanges = false;
      } else {
        alert("Incorrect password");
      }
      this.showPasswordModal = false;
      this.password = "";
    },
    cancel() {
      this.showPasswordModal = false;
      this.password = "";
    },
  },
  mounted() {
    this.generateMonthDays();
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
  padding: 10px;
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
  background-color: #e1f5fe; /* Highlight color for current month */
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
  bottom: 20px;
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
