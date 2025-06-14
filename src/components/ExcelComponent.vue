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
                :title="lockButtonTooltip"
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
                  <rect x="7" y="11" width="10" height="10" rx="1" />
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
              :class="getHeaderCellClasses(day)"
              :title="getHolidayTooltip(day)"
              :aria-label="getHolidayTooltip(day)"
            >
              {{ day }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="person in orderedPeople" :key="person.id">
            <td :class="getPersonCellClasses(person)">
              {{ person.name }}
            </td>
            <td
              v-for="day in daysInMonth"
              :key="day"
              class="editable-cell"
              :class="getDataCellClasses(day)"
              @click="editCell(person.id, day)"
              :aria-label="editCellAriaLabel"
              :title="editCellTitle"
              role="gridcell"
            >
              <span
                v-if="!isEditingMode || !isEditing(person.id, day)"
                :class="{ 'imported-cell': isImportedCell(person.id, day) }"
              >
                {{ getShiftForPersonAndDay(person.id, day) || '' }}
              </span>
              <select
                v-else
                v-model="editedShifts[`${person.id}-${day}`]"
                @change="saveShift(person.id, day)"
              >
                <option
                  v-for="option in SHIFT_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { daysOfWeek } from '@/data/daysOfWeek.ts';
import NotificationMessage from './NotificationMessage.vue';
import { addNotification } from './NotificationMessage.vue';
import {
  checkShiftDataSync,
  resetSyncedChangesSessionStorage
} from '@/utils/dataSync.ts';
import { isPolishHoliday } from '@/utils/polishHolidays.ts';
import { Person, ShiftType, DayData } from '@/types/calendar';
import {
  validateShiftAssignment,
  assignShiftToDay,
  clearShiftAssignment,
  saveDayToLocalStorage,
  MESSAGES
} from '@/utils/shiftManagement';
import { getFormattedShift } from '@/utils/exportUtils';

// Constants
const SHIFT_OPTIONS = [
  { value: '', label: '' },
  { value: 'D', label: 'D' },
  { value: 'N', label: 'N' },
  { value: 'D N', label: 'D N' }
] as const;

const VALID_SHIFT_VALUES = ['D', 'N', 'D N', ''] as const;
type ValidShiftValue = (typeof VALID_SHIFT_VALUES)[number];

const MAX_DAYS_IN_MONTH = 31;
const SHIFT_TYPES: ShiftType[] = [
  'dayShift1',
  'dayShift2',
  'nightShift1',
  'nightShift2'
];

const PEOPLE_ORDER = [
  'Milena',
  'Mikołaj',
  'Aleksandra',
  'Joanna',
  'Łukasz',
  'Natalia',
  'Marcin'
] as const;

export default {
  name: 'SpreadsheetView',
  emits: ['update-editing-mode', 'has-changes', 'month-days-updated'],
  props: {
    isEditingMode: {
      type: Boolean,
      required: true
    },
    selectedMonth: {
      type: Number,
      required: true
    },
    selectedYear: {
      type: Number,
      required: true
    },
    people: {
      type: Array as () => Person[],
      required: true
    }
  },
  components: {
    NotificationMessage
  },
  data() {
    return {
      editedShifts: {} as Record<string, ValidShiftValue>,
      monthDays: [] as DayData[],
      localData: {} as Record<string, DayData>,
      daysOfWeek,
      madeChanges: false,
      scrollContainer: null as HTMLElement | null,
      isFirstColumnLocked: false,
      importedCells: new Set<string>(),
      MESSAGES,
      SHIFT_OPTIONS
    };
  },
  computed: {
    daysInMonth() {
      return this.monthDays.map((day) => day.date.getDate());
    },
    orderedPeople() {
      return this.people
        .filter((person) => PEOPLE_ORDER.includes(person.name))
        .sort(
          (a, b) => PEOPLE_ORDER.indexOf(a.name) - PEOPLE_ORDER.indexOf(b.name)
        );
    },
    lockButtonTooltip() {
      return this.isFirstColumnLocked
        ? MESSAGES.UNLOCK_WIDTH
        : MESSAGES.LOCK_WIDTH;
    },
    editCellAriaLabel() {
      return this.isEditingMode ? MESSAGES.CLICK_TO_EDIT : '';
    },
    editCellTitle() {
      return this.isEditingMode ? MESSAGES.CLICK_TO_EDIT : '';
    }
  },
  watch: {
    selectedMonth() {
      this.generateMonthDays();
    },
    selectedYear() {
      this.generateMonthDays();
    }
  },
  methods: {
    isEditing(personId: number, day: number): boolean {
      return this.editedShifts.hasOwnProperty(`${personId}-${day}`);
    },

    getShiftForPersonAndDay(personId: number, day: number): string | null {
      const date = this.monthDays.find((d) => d.date.getDate() === day)?.date;
      return date ? getFormattedShift(personId, date, ' ') : null;
    },

    editCell(personId: number, day: number): void {
      if (this.isEditingMode) {
        const key = `${personId}-${day}`;
        const currentValue = this.getShiftForPersonAndDay(personId, day) || '';
        this.editedShifts[key] = currentValue as ValidShiftValue;
      }
    },

    validateShiftValue(value: string | undefined): ValidShiftValue | null {
      const trimmedValue = value?.trim().toUpperCase() || '';
      return VALID_SHIFT_VALUES.includes(trimmedValue as ValidShiftValue)
        ? (trimmedValue as ValidShiftValue)
        : null;
    },

    clearPersonFromAllShifts(dayData: DayData, personId: number): void {
      SHIFT_TYPES.forEach((shiftType) => {
        if (dayData[shiftType] === personId) {
          dayData[shiftType] = null;
          dayData[shiftType + 'Name'] = MESSAGES.NOT_ASSIGNED;
          dayData[shiftType + 'UserChanged'] = true;
        }
      });
    },
    validateRatownikAssignment(
      dayData: DayData,
      personId: number,
      shiftValue: string
    ): boolean {
      const person = this.people.find((p) => p.id === personId);
      if (!person?.ratownik) return true;

      if (shiftValue.includes('D')) {
        const dayShiftPeople = [dayData.dayShift1, dayData.dayShift2].filter(
          Boolean
        );
        const hasOtherRatownikDay = dayShiftPeople.some((id) => {
          const shiftPerson = this.people.find((p) => p.id === id);
          return shiftPerson?.ratownik && id !== personId;
        });
        if (hasOtherRatownikDay) {
          addNotification(MESSAGES.TWO_RATOWNIK_ERROR, 'red');
          return false;
        }
      }

      if (shiftValue.includes('N')) {
        const nightShiftPeople = [
          dayData.nightShift1,
          dayData.nightShift2
        ].filter(Boolean);
        const hasOtherRatownikNight = nightShiftPeople.some((id) => {
          const shiftPerson = this.people.find((p) => p.id === id);
          return shiftPerson?.ratownik && id !== personId;
        });
        if (hasOtherRatownikNight) {
          addNotification(MESSAGES.TWO_RATOWNIK_ERROR, 'red');
          return false;
        }
      }

      return true;
    },
    assignPersonToShift(
      dayData: DayData,
      personId: number,
      shiftType: ShiftType
    ): boolean {
      const person = this.people.find((p) => p.id === personId);
      if (!dayData[shiftType]) {
        dayData[shiftType] = personId;
        dayData[shiftType + 'Name'] = person.name;
        dayData[shiftType + 'UserChanged'] = true;
        return true;
      }
      return false;
    },
    assignDayShift(dayData: DayData, personId: number): boolean {
      if (this.assignPersonToShift(dayData, personId, 'dayShift1')) return true;
      if (this.assignPersonToShift(dayData, personId, 'dayShift2')) return true;

      addNotification(MESSAGES.MAX_DAY_PEOPLE, 'red');
      return false;
    },
    assignNightShift(dayData: DayData, personId: number): boolean {
      if (this.assignPersonToShift(dayData, personId, 'nightShift1'))
        return true;
      if (this.assignPersonToShift(dayData, personId, 'nightShift2'))
        return true;

      addNotification(MESSAGES.MAX_NIGHT_PEOPLE, 'red');
      return false;
    },
    saveShiftData(dayData: DayData, date: string): void {
      const updatedData = {
        dayShift1: dayData.dayShift1,
        dayShift2: dayData.dayShift2,
        nightShift1: dayData.nightShift1,
        nightShift2: dayData.nightShift2,
        dayShift1Name: dayData.dayShift1Name,
        dayShift2Name: dayData.dayShift2Name,
        nightShift1Name: dayData.nightShift1Name,
        nightShift2Name: dayData.nightShift2Name
      };

      this.localData[date] = updatedData;
      localStorage.setItem(date, JSON.stringify(updatedData));
      this.madeChanges = true;
      this.$emit('has-changes', this.madeChanges);
    },
    saveShift(personId: number, day: number): void {
      const key = `${personId}-${day}`;
      const newValue = this.validateShiftValue(this.editedShifts[key]);
      const date = this.getDateString(day);
      if (!date) return;

      const dayData = this.findDayByDate(date);
      if (!dayData) return;

      // Only clear shifts for this person
      const personCurrentShifts = SHIFT_TYPES.filter(
        (shiftType) => dayData[shiftType] === personId
      );
      personCurrentShifts.forEach((shiftType) => {
        clearShiftAssignment(dayData, shiftType);
      });

      if (newValue === '') {
        saveDayToLocalStorage(dayData);
        delete this.editedShifts[key];
        return;
      }

      const person = this.people.find((p) => p.id === personId);
      if (!person) return;

      // Helper function to assign to first available slot
      const assignToFirstAvailable = (
        daySlot: ShiftType,
        nightSlot: ShiftType
      ): boolean => {
        // Try first slot
        if (
          !dayData[daySlot] &&
          validateShiftAssignment(dayData, daySlot, personId, this.people)
        ) {
          assignShiftToDay(dayData, daySlot, person);
          return true;
        }
        // Try second slot
        if (
          !dayData[nightSlot] &&
          validateShiftAssignment(dayData, nightSlot, personId, this.people)
        ) {
          assignShiftToDay(dayData, nightSlot, person);
          return true;
        }
        return false;
      };

      // Try to assign day shift
      if (newValue.includes('D')) {
        if (!assignToFirstAvailable('dayShift1', 'dayShift2')) {
          addNotification(MESSAGES.MAX_DAY_PEOPLE, 'red');
          delete this.editedShifts[key];
          return;
        }
      }

      // Try to assign night shift
      if (newValue.includes('N')) {
        if (!assignToFirstAvailable('nightShift1', 'nightShift2')) {
          addNotification(MESSAGES.MAX_NIGHT_PEOPLE, 'red');
          delete this.editedShifts[key];
          return;
        }
      }

      saveDayToLocalStorage(dayData);
      delete this.editedShifts[key];
      this.madeChanges = true;
      this.$emit('has-changes', true);
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
          dayShift1Name: 'Not assigned',
          dayShift2Name: 'Not assigned',
          nightShift1Name: 'Not assigned',
          nightShift2Name: 'Not assigned',
          isCurrentMonth: true
        });
      }

      this.loadFromLocalStorage();
      this.$emit('month-days-updated', this.monthDays);
    },
    updateChanges(hasChanges: boolean) {
      this.madeChanges = hasChanges;
      this.$emit('has-changes', this.madeChanges);
    },
    loadFromLocalStorage() {
      const { year, month } = {
        year: this.selectedYear,
        month: this.selectedMonth
      };

      for (let dayNum = 1; dayNum <= MAX_DAYS_IN_MONTH; dayNum++) {
        this.loadDayFromStorage(year, month, dayNum);
      }
    },
    loadDayFromStorage(year: number, month: number, dayNum: number) {
      const date = new Date(year, month, dayNum).toDateString();
      const savedStates = localStorage.getItem(date);

      if (!savedStates) return;

      try {
        const parsedStates = JSON.parse(savedStates);
        const day = this.findDayByDate(date);

        if (day) {
          this.applyStoredStatesToDay(day, parsedStates);
        }
      } catch (error) {
        console.error('Failed to load local data:', error);
        addNotification(MESSAGES.LOAD_ERROR, 'red');
      }
    },
    applyStoredStatesToDay(day: DayData, parsedStates: Record<string, any>) {
      SHIFT_TYPES.forEach((shiftType) => {
        day[shiftType] = parsedStates[shiftType];
        day[shiftType + 'Name'] =
          parsedStates[shiftType + 'Name'] || MESSAGES.NOT_ASSIGNED;
      });
    },
    resetUserChanges() {
      this.clearUserChangesFromStorage();
      this.localData = {};
      this.editedShifts = {};
      this.madeChanges = false;
      this.$emit('has-changes', this.madeChanges);
    },
    clearUserChangesFromStorage() {
      const keysToRemove = [];

      for (const key in localStorage) {
        if (key === 'isEditingMode' || key === 'currentPage') continue;

        if (localStorage.hasOwnProperty(key)) {
          try {
            const savedData = JSON.parse(localStorage.getItem(key) || '{}');
            const hasUserChanges = SHIFT_TYPES.some(
              (shiftType) => savedData[shiftType + 'UserChanged']
            );

            if (hasUserChanges) {
              keysToRemove.push(key);
            }
          } catch (error) {
            continue;
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    },
    isToday(date: Date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    },
    isImportedCell(personId, day) {
      return this.importedCells.has(`${personId}-${day}`);
    },
    toggleColumnsLocked() {
      this.isFirstColumnLocked = !this.isFirstColumnLocked;

      // Apply the changes to all first column cells
      this.$nextTick(() => {
        const firstCells = document.querySelectorAll(
          '.calendar-table th:first-child, .calendar-table td:first-child'
        );
        firstCells.forEach((cell) => {
          if (this.isFirstColumnLocked) {
            cell.classList.add('column-locked');
          } else {
            cell.classList.remove('column-locked');
          }
        });
      });
    },
    isHoliday(date) {
      return isPolishHoliday(date);
    },
    getHeaderCellClasses(day) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      return {
        'nd-color': daysOfWeek[date.getDay()] === 'Nd',
        'sob-color': daysOfWeek[date.getDay()] === 'Sob',
        'holiday-color': isPolishHoliday(date).isHoliday,
        'today-column': this.isToday(date)
      };
    },

    getPersonCellClasses(person) {
      return {
        ratownik: person.ratownik,
        pielegniarka: !person.ratownik
      };
    },

    getDataCellClasses(day) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      return {
        'nd-color': daysOfWeek[date.getDay()] === 'Nd',
        'sob-color': daysOfWeek[date.getDay()] === 'Sob',
        'holiday-color': isPolishHoliday(date).isHoliday,
        today: this.isToday(date)
      };
    },

    getHolidayTooltip(day) {
      const date = new Date(this.selectedYear, this.selectedMonth, day);
      return isPolishHoliday(date).name || '';
    },

    findDayByDate(date) {
      return this.monthDays.find((d) => d.date.toDateString() === date);
    },

    getDateString(day) {
      return this.monthDays
        .find((d) => d.date.getDate() === day)
        ?.date.toDateString();
    },
    handleScroll(event) {
      if (this.scrollContainer) {
        event.preventDefault(); // Prevent default vertical scrolling
        this.scrollContainer.scrollLeft += event.deltaY; // Smooth horizontal scrolling
      }
    }
  },
  mounted() {
    this.resetUserChanges();
    this.generateMonthDays();
    this.scrollContainer = this.$refs.scrollContainer;
  }
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
  width: 40px;
  max-width: 40px;
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
  content: '';
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

.imported-cell {
  color: var(--color-user-changed);
  font-style: italic;
}
/* Ensure styling works in both odd and even rows */
.calendar-table tr:nth-child(even) td .imported-cell {
  color: var(--color-user-changed);
}
</style>
