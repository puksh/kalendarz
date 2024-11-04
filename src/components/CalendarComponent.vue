<template>
  <div class="calendar-container">
    <!-- People List Section -->
    <div class="people-list">
      <h3>People</h3>
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

    <!-- Calendar Section -->
    <div class="calendar">
      <div class="calendar-header">
        <h2>{{ monthYear }}</h2>
        <div class="days-header">
          <div v-for="day in daysOfWeek" :key="day" class="day-header">
            {{ day }}
          </div>
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
                @drop="handleDrop(day.date, 'day')"
              >
                <div class="assigned-person day" v-if="day.dayShift">
                  {{ day.dayShift.name }}
                </div>
                <div class="empty-slot day" v-else>7 - 19</div>
              </div>
              <div
                class="shift-slot"
                @dragover.prevent
                @drop="handleDrop(day.date, 'night')"
              >
                <div class="assigned-person night" v-if="day.nightShift">
                  {{ day.nightShift.name }}
                </div>
                <div class="empty-slot night" v-else>19 - 7</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { people } from "@/data/people.js";
import { daysOfWeek } from "@/data/daysOfWeek.js";

export default {
  name: "CalendarComponent",
  data() {
    return {
      monthDays: [],
      currentDate: new Date(), // Current date
      draggedPerson: null,
      people, // Assign imported people list to component data
      daysOfWeek, // Assign imported daysOfWeek list to component data
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
          if (shiftType === "day") {
            day.dayShift = this.draggedPerson; // Assign to day shift
          } else if (shiftType === "night") {
            day.nightShift = this.draggedPerson; // Assign to night shift
          }
          this.draggedPerson = null; // Clear the reference after dropping
        }
      }
    },
    generateMonthDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      this.monthDays = [];

      // Fill in the empty slots for the previous month's days
      for (let i = 0; i < firstDay.getDay(); i++) {
        this.monthDays.push({
          date: new Date(year, month, i - firstDay.getDay() + 1),
          dayShift: null,
          nightShift: null,
          isCurrentMonth: false,
        });
      }

      // Add the current month's days
      for (let i = 1; i <= daysInMonth; i++) {
        this.monthDays.push({
          date: new Date(year, month, i),
          dayShift: null,
          nightShift: null,
          isCurrentMonth: true,
        });
      }

      // Fill in the empty slots for the next month's days
      const nextMonthDaysToFill = 42 - this.monthDays.length; // Fill a complete 6x7 grid
      for (let i = 1; i <= nextMonthDaysToFill; i++) {
        this.monthDays.push({
          date: new Date(year, month + 1, i),
          dayShift: null,
          nightShift: null,
          isCurrentMonth: false,
        });
      }
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
}
.people-list {
  width: 200px;
  padding: 10px;
  border-right: 1px solid #ddd;
  background-color: #f9f9f9;
}
.person-item {
  padding: 10px;
  background-color: #e0e0e0;
  margin-bottom: 8px;
  cursor: grab;
  text-align: center;
}
.calendar {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.calendar-header {
  text-align: center;
  padding: 10px 0;
}
.days-header {
  display: flex;
}
.day-header {
  flex: 1;
  text-align: center;
  font-weight: bold;
}
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
}
.day-column {
  display: flex;
  flex-direction: column;
}
.day-cell {
  flex: 1;
  border: 1px solid #ddd;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 120px;
  background-color: #f5f5f5;
}
.day-date {
  font-weight: bold;
}
.shift {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.shift-slot {
  flex: 1;
  border: 1px solid #ccc;
  margin-top: 4px;
  position: relative;
}
.empty-slot {
  color: #494949;
  font-size: 0.8em;
  text-align: center;
  padding: 8px;
}
.assigned-person.day {
  padding: 5px;
  background-color: #3dc2ff;
  text-align: center;
  font-weight: bold;
}
.shift-label {
  background-color: #e0e0e0;
  padding: 5px;
  text-align: center;
}
.current-month {
  background-color: #e1f5fe; /* Highlight color for current month */
}
.day {
  background-color: #aaddf5;
}
.night {
  background-color: #83d8ff;
}
</style>
