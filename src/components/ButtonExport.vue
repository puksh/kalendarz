<template>
  <button
    class="export-button top-right-buttons"
    :class="{
      'excel-position': currentPage === 'ExcelComponent',
      'calendar-position': currentPage === 'CalendarComponent',
    }"
    @click="exportToCsv"
    title="Eksportuj do CSV"
    aria-label="Eksportuj harmonogram do pliku CSV"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="export-icon"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  </button>
</template>

<script lang="ts">
export default {
  name: "ButtonExport",
  props: {
    people: {
      type: Array,
      required: true,
    },
    monthDays: {
      type: Array,
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
    currentPage: {
      type: String,
      default: "ExcelComponent",
    },
  },
  methods: {
    exportToCsv() {
      // Get month name for the filename
      const monthNames = [
        "Styczeń",
        "Luty",
        "Marzec",
        "Kwiecień",
        "Maj",
        "Czerwiec",
        "Lipiec",
        "Sierpień",
        "Wrzesień",
        "Październik",
        "Listopad",
        "Grudzień",
      ];
      const monthName = monthNames[this.selectedMonth];

      // Add UTF-8 BOM to ensure Excel recognizes encoding correctly
      let csvContent = "\ufeff"; // BOM character for UTF-8

      // Create CSV header row with dates
      csvContent += "Imię";
      for (let day = 1; day <= this.getDaysInMonth(); day++) {
        // Format day number consistently
        csvContent += `;${day}`; // Using semicolon as separator for better Excel compatibility
      }
      csvContent += "\r\n"; // Windows-style line endings for Excel

      // Add data for each person
      for (const person of this.people) {
        // Wrap name in quotes to handle any commas or special characters
        csvContent += `"${person.name}"`;

        // Add shift data for each day
        for (let day = 1; day <= this.getDaysInMonth(); day++) {
          const shift = this.getShiftForPersonAndDay(person.id, day);
          csvContent += `;${shift || ""}`; // Use semicolons as separators
        }
        csvContent += "\r\n";
      }

      // Create a Blob with the CSV content
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });

      // Create a download link and trigger it
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `Harmonogram_${monthName}_${this.selectedYear}.csv`,
      );
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
    },

    getDaysInMonth() {
      return new Date(this.selectedYear, this.selectedMonth + 1, 0).getDate();
    },

    getShiftForPersonAndDay(personId, day) {
      const dateObj = new Date(this.selectedYear, this.selectedMonth, day);
      const dateString = dateObj.toDateString();

      const shiftData = localStorage.getItem(dateString);
      if (shiftData) {
        const parsedData = JSON.parse(shiftData);
        const shifts = [];

        if (
          parsedData.dayShift1 === personId ||
          parsedData.dayShift2 === personId
        ) {
          shifts.push("D");
        }
        if (
          parsedData.nightShift1 === personId ||
          parsedData.nightShift2 === personId
        ) {
          shifts.push("N");
        }

        return shifts.join(" ");
      }
      return "";
    },
  },
};
</script>

<style scoped>
.export-button {
  position: relative;
  top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
}
.excel-position {
  left: 132px;
}

.calendar-position {
  left: 108px;
}
.export-icon {
  transition: transform 0.2s ease;
}

@media (hover: none) {
  .export-button:active {
    transform: none !important;
    background-color: var(--glass-bg-color) !important;
    border-color: var(--glass-border-color) !important;
  }
}
</style>
