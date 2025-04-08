<template>
  <div class="spreadsheet-view">
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
    <button @click="toggleEditingMode" class="edit-mode-button">
      {{ isEditingMode ? "Wyłącz tryb edytowania" : "Włącz tryb edytowania" }}
    </button>
    <table class="calendar-table">
      <thead>
        <tr>
          <th>Nazwisko i imię</th>
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
</template>

<script>
export default {
  name: "SpreadsheetView",
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
.spreadsheet-view {
  padding: 20px;
}

.edit-mode-button {
  margin: 10px 0px 10px 0px;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.edit-mode-button:hover {
  background-color: #0056b3;
}

.calendar-table {
  border-collapse: collapse;
  table-layout: fixed;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.2); /* Semi-transparent background */
  backdrop-filter: blur(10px); /* Glassy blur effect */
  border-radius: 10px; /* Rounded corners */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
}

.calendar-table th,
.calendar-table td {
  border: 1px solid rgba(255, 255, 255, 0.3); /* Semi-transparent borders */
  text-align: center;
  color: #fff; /* White text for contrast */
}

.calendar-table th {
  background: rgba(0, 0, 0, 0.4); /* Darker semi-transparent background for headers */
  font-weight: bold;
  font-size: 12px;
  height: 28px !important;
}

.calendar-table th:first-child,
.calendar-table td:first-child {
  width: 134px !important;
  text-align: center;
}

.calendar-table td {
  width: 38px !important;
  height: 56px !important;
  text-align: center;
  font-size: x-large;
  background: rgba(255, 255, 255, 0.1); /* Slightly lighter background for cells */
}

.calendar-table td:hover {
  background: rgba(255, 255, 255, 0.3); /* Highlight effect on hover */
  cursor: pointer;
}

.editable-cell {
  cursor: pointer;
}

.editable-cell input {
  width: 100%;
  border: none;
  text-align: center;
  background: rgba(255, 255, 255, 0.2); /* Glassy input background */
  color: #fff; /* White text for input */
  border-radius: 5px;
}

.editable-cell input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.4); /* Slightly brighter background on focus */
}
</style>