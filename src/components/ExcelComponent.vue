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
        <tr v-for="person in orderedPeople" :key="person.id">
          <td>{{ person.name }}</td>
          <td
            v-for="day in daysInMonth"
            :key="day"
            class="editable-cell"
            @click="editCell(person.id, day)"
          >
            <span v-if="!isEditingMode || !isEditing(person.id, day)">
              {{ getShiftForPersonAndDay(person.id, day) || "" }}
            </span>
            <input
              v-else
              type="text"
              v-model="editedShifts[`${person.id}-${day}`]"
              @blur="saveShift(person.id, day)"
            />
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
        this.editedShifts[key] = this.getShiftForPersonAndDay(personId, day) || "";
      }
    },
    saveShift(personId, day) {
      const key = `${personId}-${day}`;
      const newValue = this.editedShifts[key];
      const date = this.monthDays.find((d) => d.date.getDate() === day)?.date.toDateString();

      if (date) {
        const shiftData = JSON.parse(localStorage.getItem(date) || "{}");
        shiftData[`shift-${personId}`] = newValue;
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
  margin-bottom: 10px;
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
  width: 100%;
  border-collapse: collapse;
}

.calendar-table th,
.calendar-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.calendar-table th {
  background-color: #f4f4f4;
}

.calendar-table th:first-child,
.calendar-table td:first-child {
  width: 140px !important;
  text-align: center;
}
.calendar-table td{
  width: 36px !important;
  height: 36px !important;
  text-align: center;
}
.calendar-table thead{
    font-size: 12px;
}
.editable-cell {
  cursor: pointer;
}

.editable-cell input {
  width: 100%;
  border: none;
  text-align: center;
}
</style>