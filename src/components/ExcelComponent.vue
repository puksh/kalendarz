<template>
  <div class="spreadsheet-view">
    <div
      class="scrollable-container"
      @wheel.prevent="handleScroll"
      ref="scrollContainer"
    >
      <table class="calendar-table">
        <thead>
          <tr>
            <th>
              <button
                class="lock-column-button"
                @click="toggleColumnsLocked"
                :title="
                  isFirstColumnLocked
                    ? 'Odblokuj szerokość'
                    : 'Zablokuj szerokość'
                "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                >
                  <!-- Padlock body (always visible) -->
                  <rect x="7" y="11" width="10" height="10" rx="1" />

                  <!-- Padlock shackle -->
                  <path
                    v-if="isFirstColumnLocked"
                    d="M12 3a4 4 0 0 0-4 4v4h8V7a4 4 0 0 0-4-4z"
                  />
                  <path v-else d="M8 11V7a4 4 0 0 1 8 0" />
                </svg>
              </button>
            </th>
            <th
              v-for="day in daysInMonth"
              :key="day"
              :class="{
                'nd-color':
                  daysOfWeek[
                    new Date(selectedYear, selectedMonth, day).getDay()
                  ] === 'Nd',
                'sob-color':
                  daysOfWeek[
                    new Date(selectedYear, selectedMonth, day).getDay()
                  ] === 'Sob',
                'today-column': isToday(
                  new Date(selectedYear, selectedMonth, day),
                ),
              }"
            >
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in orderedPeople" :key="person.id">
            <td
              :class="{
                ratownik: person.ratownik,
                pielegniarka: !person.ratownik,
              }"
            >
              {{ person.name }}
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day"
              class="editable-cell"
              :class="{
                'nd-color':
                  daysOfWeek[
                    new Date(selectedYear, selectedMonth, day).getDay()
                  ] === 'Nd',
                'sob-color':
                  daysOfWeek[
                    new Date(selectedYear, selectedMonth, day).getDay()
                  ] === 'Sob',
                today: isToday(new Date(selectedYear, selectedMonth, day)),
              }"
              @click="editCell(person.id, day)"
              :aria-label="isEditingMode ? 'Kliknij aby edytować zmianę' : ''"
              :title="isEditingMode ? 'Kliknij aby edytować zmianę' : ''"
              role="gridcell"
            >
              <span v-if="!isEditingMode || !isEditing(person.id, day)">
                {{ getShiftForPersonAndDay(person.id, day) || "" }}
              </span>
              <select
                v-else
                v-model="editedShifts[`${person.id}-${day}`]"
                @change="saveShift(person.id, day)"
              >
                <option value=""></option>
                <option value="D">D</option>
                <option value="N">N</option>
                <option value="D N">D N</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { daysOfWeek } from "@/data/daysOfWeek.ts";
import NotificationMessage from "./NotificationMessage.vue";
import { addNotification } from "./NotificationMessage.vue";
import {
  checkShiftDataSync,
  resetSyncedChangesSessionStorage,
} from "@/utils/dataSync.ts";

export default {
  name: "SpreadsheetView",
  emits: ["update-editing-mode", "has-changes", "month-days-updated"],
  props: {
    isEditingMode: {
      type: Boolean,
      required: true,
    },
    selectedMonth: {
      type: Number,
      required: true,
    },
    selectedYear: {
      type: Number,
      required: true,
    },
    people: {
      type: Array,
      required: true,
    },
  },
  components: {
    NotificationMessage,
  },
  data() {
    return {
      editedShifts: {},
      monthDays: [],
      localData: {},
      daysOfWeek,
      madeChanges: false,
      scrollContainer: null,
      isFirstColumnLocked: false,
    };
  },
  computed: {
    daysInMonth() {
      return this.monthDays.map((day) => day.date.getDate());
    },
    orderedPeople() {
      const order = [
        "Milena",
        "Mikołaj",
        "Aleksandra",
        "Joanna",
        "Łukasz",
        "Natalia",
        "Marcin",
      ];
      return this.people
        .filter((person) => order.includes(person.name))
        .sort((a, b) => {
          return order.indexOf(a.name) - order.indexOf(b.name);
        });
    },
  },
  watch: {
    selectedMonth() {
      this.generateMonthDays();
    },
    selectedYear() {
      this.generateMonthDays();
    },
  },
  methods: {
    isEditing(personId, day) {
      return this.editedShifts.hasOwnProperty(`${personId}-${day}`);
    },
    getShiftForPersonAndDay(personId, day) {
      const date = this.monthDays
        .find((d) => d.date.getDate() === day)
        ?.date.toDateString();
      const shiftData = localStorage.getItem(date);
      if (shiftData) {
        const parsedData = JSON.parse(shiftData);
        const shifts = [];

        // Check if the person is assigned to day or night shifts
        if (
          parsedData.dayShift1 === personId ||
          parsedData.dayShift2 === personId
        ) {
          shifts.push("D"); // Day shift
        }
        if (
          parsedData.nightShift1 === personId ||
          parsedData.nightShift2 === personId
        ) {
          shifts.push("N"); // Night shift
        }

        return shifts.join(" "); // Combine shifts (e.g., "D N" if both)
      }
      return null;
    },
    editCell(personId, day) {
      if (this.isEditingMode) {
        const key = `${personId}-${day}`;
        const currentValue = this.getShiftForPersonAndDay(personId, day) || ""; // Get the current value
        this.editedShifts[key] = currentValue; // Initialize the editedShifts object with the current value
      }
    },
    saveShift(personId, day) {
      const key = `${personId}-${day}`;
      const newValue = this.editedShifts[key]?.trim().toUpperCase() || "";
      const previousValue = this.getShiftForPersonAndDay(personId, day) || "";
      const validValues = ["D", "N", "D N", ""];

      if (!validValues.includes(newValue)) {
        addNotification(
          "Zła wartość! Tylko 'D', 'N', lub 'D N' są dozwolone.",
          "red",
        );
        this.$nextTick(() => {
          this.editedShifts[key] = previousValue;
        });
        return;
      }

      const date = this.monthDays
        .find((d) => d.date.getDate() === day)
        ?.date.toDateString();
      if (!date || !this.monthDays) return;

      const dayData = this.monthDays.find(
        (d) => d.date.toDateString() === date,
      );
      if (!dayData) return;

      // First, CLEAR ALL existing assignments for this person on this day
      // This prevents the issue of shifts being combined when they shouldn't be
      if (dayData.dayShift1 === personId) {
        dayData.dayShift1 = null;
        dayData.dayShift1Name = "Not assigned";
        dayData.dayShift1UserChanged = true;
      }
      if (dayData.dayShift2 === personId) {
        dayData.dayShift2 = null;
        dayData.dayShift2Name = "Not assigned";
        dayData.dayShift2UserChanged = true;
      }
      if (dayData.nightShift1 === personId) {
        dayData.nightShift1 = null;
        dayData.nightShift1Name = "Not assigned";
        dayData.nightShift1UserChanged = true;
      }
      if (dayData.nightShift2 === personId) {
        dayData.nightShift2 = null;
        dayData.nightShift2Name = "Not assigned";
        dayData.nightShift2UserChanged = true;
      }

      // If the new value is empty, we've already cleared everything
      if (newValue === "") {
        const updatedData = {
          dayShift1: dayData.dayShift1,
          dayShift2: dayData.dayShift2,
          nightShift1: dayData.nightShift1,
          nightShift2: dayData.nightShift2,
          dayShift1Name: dayData.dayShift1Name,
          dayShift2Name: dayData.dayShift2Name,
          nightShift1Name: dayData.nightShift1Name,
          nightShift2Name: dayData.nightShift2Name,
        };

        this.localData[date] = updatedData;
        localStorage.setItem(date, JSON.stringify(updatedData));
        this.madeChanges = true;
        this.$emit("has-changes", this.madeChanges);
        this.$nextTick(() => {
          delete this.editedShifts[key];
          this.$forceUpdate();
        });
        return;
      }

      const draggedPerson = this.people.find((p) => p.id === personId);

      // Now assign the new shifts based on the selected value
      if (newValue.includes("D")) {
        // If the dragged person is a ratownik, check only the day shift columns.
        if (draggedPerson?.ratownik) {
          const dayShiftPeople = [dayData.dayShift1, dayData.dayShift2].filter(
            Boolean,
          );
          const hasOtherRatownikDay = dayShiftPeople.some((id) => {
            const person = this.people.find((p) => p.id === id);
            return person?.ratownik && id !== personId;
          });
          if (hasOtherRatownikDay) {
            addNotification(
              "Nie można przypisać dwóch ratowników na zmianę dzienną.",
              "red",
            );
            delete this.editedShifts[key];
            return;
          }
        }

        // For day shift (either D alone or D N), assign to dayShift1 or dayShift2
        if (!dayData.dayShift1) {
          dayData.dayShift1 = personId;
          dayData.dayShift1Name = draggedPerson.name;
          dayData.dayShift1UserChanged = true;
        } else if (!dayData.dayShift2) {
          dayData.dayShift2 = personId;
          dayData.dayShift2Name = draggedPerson.name;
          dayData.dayShift2UserChanged = true;
        } else {
          addNotification(
            "Nie można przypisać więcej niż dwóch osób na zmianę dzienną.",
            "red",
          );
          delete this.editedShifts[key];
          return;
        }
      }

      // Handle night shift assignment
      if (newValue.includes("N")) {
        // If the dragged person is a ratownik, check only the night shift columns.
        if (draggedPerson?.ratownik) {
          const nightShiftPeople = [
            dayData.nightShift1,
            dayData.nightShift2,
          ].filter(Boolean);
          const hasOtherRatownikNight = nightShiftPeople.some((id) => {
            const person = this.people.find((p) => p.id === id);
            return person?.ratownik && id !== personId;
          });
          if (hasOtherRatownikNight) {
            addNotification(
              "Nie można przypisać dwóch ratowników na zmianę nocną.",
              "red",
            );
            delete this.editedShifts[key];
            return;
          }
        }

        // For night shift (either N alone or D N), assign to nightShift1 or nightShift2
        if (!dayData.nightShift1) {
          dayData.nightShift1 = personId;
          dayData.nightShift1Name = draggedPerson.name;
          dayData.nightShift1UserChanged = true;
        } else if (!dayData.nightShift2) {
          dayData.nightShift2 = personId;
          dayData.nightShift2Name = draggedPerson.name;
          dayData.nightShift2UserChanged = true;
        } else {
          addNotification(
            "Nie można przypisać więcej niż dwóch osób na zmianę nocną.",
            "red",
          );
          delete this.editedShifts[key];
          return;
        }
      }

      // Save the updated data
      const updatedData = {
        dayShift1: dayData.dayShift1,
        dayShift2: dayData.dayShift2,
        nightShift1: dayData.nightShift1,
        nightShift2: dayData.nightShift2,
      };

      this.localData[date] = updatedData;
      this.madeChanges = true;
      this.$emit("has-changes", this.madeChanges);
      localStorage.setItem(date, JSON.stringify(updatedData));

      delete this.editedShifts[key];
    },
    generateMonthDays() {
      this.resetUserChanges();
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
      this.$emit("month-days-updated", this.monthDays);
    },
    updateChanges(hasChanges) {
      this.madeChanges = hasChanges;
      this.$emit("has-changes", this.madeChanges);
    },
    loadFromLocalStorage() {
      const year = this.selectedYear;
      const month = this.selectedMonth;

      for (let i = 1; i <= 31; i++) {
        const date = new Date(year, month, i).toDateString();
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

              day.dayShift1Name = parsedStates.dayShift1Name || "Not assigned";
              day.dayShift2Name = parsedStates.dayShift2Name || "Not assigned";
              day.nightShift1Name =
                parsedStates.nightShift1Name || "Not assigned";
              day.nightShift2Name =
                parsedStates.nightShift2Name || "Not assigned";
            }
          } catch (error) {
            console.error("Failed to load local data:", error);
            addNotification(
              "Nie udało się załadować danych lokalnych. Sprawdź konsolę.",
              "red",
            );
          }
        }
      }
    },
    resolvePersonName(id) {
      const person = this.people.find((person) => person.id === id);
      return person
        ? { name: person.name, isRatownik: person.ratownik }
        : { name: undefined, isRatownik: false };
    },

    async checkShiftDataSync() {
      this.syncedChanges = await checkShiftDataSync(() =>
        this.generateMonthDays(),
      );
    },
    resetSyncedChangesSessionStorage() {
      this.syncedChanges = resetSyncedChangesSessionStorage();
    },
    handleScroll(event) {
      if (this.scrollContainer) {
        event.preventDefault(); // Prevent default vertical scrolling
        this.scrollContainer.scrollLeft += event.deltaY; // Smooth horizontal scrolling
      }
    },
    resetUserChanges() {
      // Clear user-made changes from localStorage
      for (const key in localStorage) {
        if (key === "isEditingMode" || key === "currentPage") {
          continue;
        }
        if (localStorage.hasOwnProperty(key)) {
          try {
            const savedData = JSON.parse(localStorage.getItem(key) || "{}");
            if (
              savedData.dayShift1UserChanged ||
              savedData.dayShift2UserChanged ||
              savedData.nightShift1UserChanged ||
              savedData.nightShift2UserChanged
            ) {
              localStorage.removeItem(key); // Remove user-modified data
            }
          } catch (error) {
            // Skip invalid JSON items - they're probably not shift data anyway
            continue;
          }
        }
      }

      this.localData = {};
      this.editedShifts = {};
      this.madeChanges = false;
      this.$emit("has-changes", this.madeChanges);
    },
    isToday(date: Date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
    toggleColumnsLocked() {
      this.isFirstColumnLocked = !this.isFirstColumnLocked;

      // Apply the changes to all first column cells
      this.$nextTick(() => {
        const firstCells = document.querySelectorAll(
          ".calendar-table th:first-child, .calendar-table td:first-child",
        );
        firstCells.forEach((cell) => {
          if (this.isFirstColumnLocked) {
            cell.classList.add("column-locked");
          } else {
            cell.classList.remove("column-locked");
          }
        });
      });
    },
  },
  mounted() {
    this.resetUserChanges();
    this.generateMonthDays();
    this.scrollContainer = this.$refs.scrollContainer;
  },
};
</script>

<style scoped>
.scrollable-container {
  width: 100%;
  max-width: 9999px;
  margin: 0 auto;
  overflow-x: auto;
  margin-top: 70px;
}
/* General Table Styling */
.calendar-table {
  width: 100%;
  min-width: 1160px;
  max-width: 9999px;
  border-spacing: 1px;
  table-layout: auto;
  background: #1a3c3c;
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  border-spacing: 0;
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #1e5e5e;
  text-align: center;
  padding: 8px;
  font-size: 14px;
  color: var(--color-text);
  transition: background-color 0.2s ease;
}

.calendar-table td {
  background-color: #113535;
  min-width: 28px;
  text-wrap: nowrap;
}

.calendar-table tr:nth-child(even) td {
  background-color: #163939;
}

/* First Column Styling */
.calendar-table th:first-child,
.calendar-table td:first-child {
  background-color: #0a3c3c;
  font-weight: bold;
  text-align: left;
  padding-left: 12px;
  transition:
    width 0.3s ease,
    max-width 0.3s ease,
    background-color 0.3s ease;
  width: 24px;
  max-width: 24px;
  overflow: hidden;
  text-overflow: ellipsis;
  z-index: 2;
  position: sticky;
  left: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.2);
}

/* Increased z-index for header */
.calendar-table th:first-child {
  z-index: 4;
}

/* Locked column state */
.calendar-table .column-locked {
  width: 88px !important;
  max-width: 88px !important;
}

/* Lock button styling */
.lock-column-button {
  background-color: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  background-color: #ffffff00;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

@media not all and (hover: none) {
  .calendar-table td:hover {
    filter: brightness(1.5);
    z-index: 2;
  }
  /* First column hover - only apply when not locked */
  .calendar-table td:first-child:not(.column-locked):hover {
    width: 88px !important;
    max-width: 88px !important;
    filter: brightness(1.2);
  }

  .editable-cell select:hover {
    border-color: #27bebe;
  }
  .lock-column-button:active svg {
    transform: scale(0.9);
  }
  .lock-column-button:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}
.lock-column-button svg {
  transition: transform 0.3s ease;
}

.editable-cell select {
  border: 1px solid #1e5e5e;
  background-color: #0a3c3c;
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.editable-cell select:focus {
  border-color: #27bebe;
  box-shadow: 0 0 4px rgba(0, 200, 200, 1);
}
/* Today's column highlighting */
.today-column {
  z-index: 5;
  background-color: rgba(53, 255, 255, 0.3) !important;
  border-bottom: 2px solid rgba(255, 255, 255, 0.6) !important;
}
.today-column::before {
  content: "";
  position: absolute;
  top: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}
.today {
  border-left: 2px solid rgba(255, 255, 255, 0.6) !important;
  border-right: 2px solid rgba(255, 255, 255, 0.6) !important;
}
.today {
  border-bottom: 2px solid rgba(255, 255, 255, 0.6) !important;
}

.calendar-table th.today-column {
  text-decoration: underline;
}

/* Ensure styling works in both odd and even rows */
.calendar-table tr:nth-child(even) td .imported-cell {
  color: var(--color-user-changed);
}
</style>
