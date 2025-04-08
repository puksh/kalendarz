<template>
  <div class="spreadsheet-view">
    <section class="monthChange">
      <button class="buttonMonthChange" @click="changeMonth(-1)">
        &#8249;
      </button>
      <span style="font-weight: bold; width: 200px !important;"> {{ monthYear.toUpperCase() }} </span>
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
    <label class="glass-toggle">
      <input
        type="checkbox"
        v-model="isEditingMode"
        @change="updateEditingMode"
      />
      <span class="toggle-slider"></span>
      <span class="label-text">Tryb edytowania</span>
    </label>
    <table class="calendar-table">
      <thead>
        <tr>
          <th></th>
          <th v-for="day in daysInMonth" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="person in orderedPeople" :key="person.id" >
          <td :class="{ 'ratownik': person.ratownik, 'pielegniarka': !person.ratownik }">{{ person.name }}</td>
          <td
            v-for="day in daysInMonth"
            :key="day"
            class="editable-cell"
            @click="editCell(person.id, day)"
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
  <PeopleListWindow :people="people" :isEditingMode="false"/>
  <div v-if="isEditingMode" style="display: flex; flex-direction: column; align-items: center">
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
import ShiftCountWindow from "./ShiftCountWindow.vue";
import PeopleListWindow from "./PeopleListWindow.vue";
export default {
  name: "SpreadsheetView",
  components: { ShiftCountWindow, PeopleListWindow },
  props: {
    monthDays: Array,
    people: Array,
  },
  data() {
    return {
      isEditingMode: false,
      editedShifts: {},
      selectedMonth: new Date().getMonth(), // 0-indexed (January = 0)
      selectedYear: new Date().getFullYear(),
      monthDays: [],
      madeChanges: false,
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
      locale: "pl",
    };
  },
  computed: {
    daysInMonth() {
      return this.monthDays.map((day) => day.date.getDate());
    },
    orderedPeople() {
      const order = ["Milena", "Mikołaj", "Aleksandra", "Joanna", "Łukasz", "Natalia", "Marcin"];
      return this.people.filter((person) => order.includes(person.name)).sort((a, b) => {
        return order.indexOf(a.name) - order.indexOf(b.name);
      });
    },
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
    toggleEditingMode() {
      this.isEditingMode = !this.isEditingMode;
    },
    isEditing(personId, day) {
      return this.editedShifts.hasOwnProperty(`${personId}-${day}`);
    },
    getShiftForPersonAndDay(personId, day) {
      const date = this.monthDays.find((d) => d.date.getDate() === day)?.date.toDateString();
      const shiftData = localStorage.getItem(date);
      if (shiftData) {
        const parsedData = JSON.parse(shiftData);
        return Object.values(parsedData).find((shift) => shift === personId);
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
      const newValue = this.editedShifts[key].trim().toUpperCase(); // Normalize input
      const validValues = ["D", "N", "D N", ""]; // Allowed values

      if (!validValues.includes(newValue)) {
        alert("Invalid input! Only 'D', 'N', or 'D N' are allowed.");
        delete this.editedShifts[key];
        return;
      }

      const date = this.monthDays.find((d) => d.date.getDate() === day)?.date.toDateString();

      if (date) {
        const shiftData = JSON.parse(localStorage.getItem(date) || "{}");
        const dayData = this.monthDays.find((d) => d.date.toDateString() === date);

        // Reset all shifts for the person
        if (newValue === "") {
          if (dayData.dayShift1 === personId) {
            dayData.dayShift1 = null;
            dayData.dayShift1Name = "Not assigned";
            shiftData.dayShift1 = null;
          } else if (dayData.dayShift2 === personId) {
            dayData.dayShift2 = null;
            dayData.dayShift2Name = "Not assigned";
            shiftData.dayShift2 = null;
          } else if (dayData.nightShift1 === personId) {
            dayData.nightShift1 = null;
            dayData.nightShift1Name = "Not assigned";
            shiftData.nightShift1 = null;
          } else if (dayData.nightShift2 === personId) {
            dayData.nightShift2 = null;
            dayData.nightShift2Name = "Not assigned";
            shiftData.nightShift2 = null;
          }

          localStorage.setItem(date, JSON.stringify(shiftData));
          delete this.editedShifts[key];
          return;
        }

        // Check if the person is a ratownik
        const draggedPerson = this.people.find((p) => p.id === personId);
        const isDraggedRatownik = draggedPerson?.ratownik;

        // Check if another ratownik is already assigned to the shift
        const currentShiftPeople = [
          dayData.dayShift1,
          dayData.dayShift2,
          dayData.nightShift1,
          dayData.nightShift2,
        ].filter(Boolean);

        const hasOtherRatownik = currentShiftPeople.some((id) => {
          const person = this.people.find((p) => p.id === id);
          return person?.ratownik;
        });

        if (isDraggedRatownik && hasOtherRatownik) {
          alert("Nie można przypisać dwóch ratowników na jedną zmianę.");
          delete this.editedShifts[key];
          return;
        }

        // Assign the person to the appropriate shift slots
        if (newValue.includes("D")) {
          if (!dayData.dayShift1) {
            dayData.dayShift1 = personId;
            dayData.dayShift1Name = draggedPerson.name;
          } else if (!dayData.dayShift2) {
            dayData.dayShift2 = personId;
            dayData.dayShift2Name = draggedPerson.name;
          } else {
            alert("Nie można przypisać więcej niż dwóch osób na zmianę dzienną.");
            delete this.editedShifts[key];
            return;
          }
        }

        if (newValue.includes("N")) {
          if (!dayData.nightShift1) {
            dayData.nightShift1 = personId;
            dayData.nightShift1Name = draggedPerson.name;
          } else if (!dayData.nightShift2) {
            dayData.nightShift2 = personId;
            dayData.nightShift2Name = draggedPerson.name;
          } else {
            alert("Nie można przypisać więcej niż dwóch osób na zmianę nocną.");
            delete this.editedShifts[key];
            return;
          }
        }

        // Save the updated data
        shiftData.dayShift1 = dayData.dayShift1;
        shiftData.dayShift2 = dayData.dayShift2;
        shiftData.nightShift1 = dayData.nightShift1;
        shiftData.nightShift2 = dayData.nightShift2;

        localStorage.setItem(date, JSON.stringify(shiftData));
      }

      delete this.editedShifts[key];
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
      }

      // Clear the editedShifts object to reset editing state
      this.editedShifts = {};

      // Update the selected month and year
      this.selectedMonth = this.selectedMonth + newMonth;
      this.generateMonthDays(); // Regenerate the days for the new month
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
            const day = this.monthDays.find((day) => day.date.toDateString() === date);

            if (day) {
              day.dayShift1 = parsedStates.dayShift1;
              day.dayShift2 = parsedStates.dayShift2;
              day.nightShift1 = parsedStates.nightShift1;
              day.nightShift2 = parsedStates.nightShift2;

              day.dayShift1Name = parsedStates.dayShift1Name || "Not assigned";
              day.dayShift2Name = parsedStates.dayShift2Name || "Not assigned";
              day.nightShift1Name = parsedStates.nightShift1Name || "Not assigned";
              day.nightShift2Name = parsedStates.nightShift2Name || "Not assigned";
            }
          } catch (error) {
            console.error("Failed to load local data:", error);
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
    async fetchServerShiftData() {
      this.syncedChanges = {};
      try {
        const response = await fetch(
          "https://mc.kot.li/?key=shiftData.json",
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
    getShiftForPersonAndDay(personId, day) {
      const date = this.monthDays.find((d) => d.date.getDate() === day)?.date.toDateString();
      const shiftData = localStorage.getItem(date);
      if (shiftData) {
        const parsedData = JSON.parse(shiftData);
        const shifts = [];

        // Check if the person is assigned to day or night shifts
        if (parsedData.dayShift1 === personId || parsedData.dayShift2 === personId) {
          shifts.push("D"); // Day shift
        }
        if (parsedData.nightShift1 === personId || parsedData.nightShift2 === personId) {
          shifts.push("N"); // Night shift
        }

        return shifts.join(" "); // Combine shifts (e.g., "D N" if both)
      }
      return null;
    },
  },
  mounted() {
    this.generateMonthDays();
  },
};
</script>

<style scoped>
/* General Table Styling */
.calendar-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  table-layout: fixed;
  background: #2e2e2e; /* Dark background for the table */
  border: 1px solid #444; /* Subtle border for the table */
  border-radius: 8px; /* Rounded corners */
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3); /* Subtle shadow for depth */
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #444; /* Subtle grid lines */
  text-align: center;
  padding: 8px;
  font-size: 14px;
  color: #e0e0e0; /* Muted light text for better readability */
}

.calendar-table th {
  background: #3c3c3c; /* Slightly darker header background */
  color: #ffffff; /* White text for headers */
  font-weight: bold;
  text-transform: uppercase;
}

.calendar-table td {
  background: #2e2e2e; /* Dark background for cells */
}

.calendar-table tr:nth-child(even) td {
  background: #3a3a3a; /* Alternating row colors */
}

.calendar-table td:hover {
  background: #585858; /* Highlighted background on hover */
}

.calendar-table td:nth-child(even):hover {
  background: #4a4a4a; /* Highlighted background on hover */
}
/* First Column Styling */
.calendar-table th:first-child,
.calendar-table td:first-child {
  background: #3c3c3c; /* Slightly darker background for the first column */
  font-weight: bold;
  text-align: left;
  padding-left: 12px;
  transition: width 0.3s ease, background-color 0.3s ease; /* Smooth transition */
  width: 25px; /* Default width */
}

.calendar-table :not(thead) tr:hover td:first-child   {
  width: 200px !important; /* Increased width on hover */
  background: #4a4a4a !important; /* Slightly lighter background on hover */
}

/* Editable Cell Styling */
.editable-cell {
  position: relative;
}

.editable-cell select {
  width: 100%;
  height: 100%;
  border: 1px solid #555;
  border-radius: 4px;
  background: #3a3a3a;
  color: #e0e0e0;
  font-size: 14px;
  padding: 4px;
  appearance: none; /* Remove default browser styling */
  outline: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); /* Subtle shadow */
  transition: border-color 0.2s, box-shadow 0.2s;
}

.editable-cell select:hover {
  border-color: #666; /* Highlight border on hover */
}

.editable-cell select:focus {
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.5); /* Blue glow on focus */
}

.editable-cell select option {
  background: #3a3a3a;
  color: #e0e0e0;
}

/* Table Header Styling */
.calendar-table th {
  font-size: 12px;
  padding: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .calendar-table th,
  .calendar-table td {
    font-size: 12px;
    padding: 6px;
  }

  .editable-cell select {
    font-size: 12px;
    padding: 2px;
  }
}
</style>