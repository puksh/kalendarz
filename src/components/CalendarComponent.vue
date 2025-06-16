<template>
  <mobile-warning-modal
    :show="showMobileWarning"
    @close="handleMobileWarningClose"
  />
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
          :class="{ 'today-column': isToday(day.date) }"
          class="day-column"
          @dragover.prevent
        >
          <div>
            <div
              class="day-cell"
              :class="getDayCellClasses(day)"
              :title="getHolidayTooltip(day.date)"
            >
              <div class="day-header">
                {{ daysOfWeek[day.date.getDay()] }}
              </div>
              <div class="shift" @dragover.prevent>
                <div class="day-date">{{ day.date.getDate() }}</div>
                <shift-slot
                  v-for="shiftType in SHIFT_TYPES"
                  :key="shiftType"
                  :day="day"
                  :shift-type="shiftType"
                  :is-editing="isEditingMode"
                  @drop="handleDrop(day.date, shiftType)"
                  @reset="handleClickResetShift(day, shiftType)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { daysOfWeek } from '@/data/daysOfWeek.ts';
import { checkShiftDataSync } from '@/utils/dataSync.js';
import { isPolishHoliday as utilIsPolishHoliday } from '@/utils/polishHolidays.ts';
import { isToday as utilIsToday, generateMonthDays } from '@/utils/dateUtils';
import {
  loadAllFromSessionStorage,
  saveDayToSessionStorage
} from '@/utils/sessionStorageUtils.ts';
import { resetUserChanges } from '@/utils/calendarChecks.ts';
import NotificationMessage from './NotificationMessage.vue';
import {
  validateShiftAssignment,
  assignShiftToDay as utilAssignShift,
  clearShiftAssignment
} from '@/utils/shiftManagement';
import { Person, ShiftType, DayData } from '@/types/calendar';
import ShiftSlot from './CalendarShiftSlotComponent.vue';
import MobileWarningModal from './MobileWarningModal.vue';
import { MESSAGES } from '@/constants/messages';
import {
  handleHorizontalScroll,
  scrollToTodayColumn
} from '@/utils/scrollUtils';

interface DraggedPerson extends Person {
  id: number;
  name: string;
  ratownik: boolean;
}

// Constants
const SHIFT_TYPES: ShiftType[] = [
  'dayShift1',
  'dayShift2',
  'nightShift1',
  'nightShift2'
];

export default {
  name: 'CalendarComponent',
  emits: ['update-editing-mode', 'has-changes', 'month-days-updated'],
  components: {
    NotificationMessage,
    ShiftSlot,
    MobileWarningModal
  },
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
  data() {
    return {
      monthDays: [] as DayData[],
      localData: {} as Record<string, DayData>,
      syncedChanges: {} as Record<string, any>, // Server-synced changes
      daysOfWeek,
      currentDate: new Date(),
      madeChanges: false,
      scrollContainer: null as HTMLElement | null,
      currentDropTarget: {
        date: null as Date | null,
        shiftType: null as ShiftType | null
      },
      showMobileWarning: false,
      isMobileDevice: false,
      MESSAGES,
      SHIFT_TYPES
    };
  },
  computed: {
    holidayInfo() {
      return this.monthDays.map((day) => utilIsPolishHoliday(day.date));
    }
  },
  methods: {
    handleDrop(date: Date, shiftType: ShiftType): void {
      const draggedPerson = this.getDraggedPersonFromStorage();
      if (!draggedPerson) return;

      const day = this.findDayByDate(date);
      if (
        !day ||
        !validateShiftAssignment(day, shiftType, draggedPerson, this.people)
      ) {
        return;
      }

      utilAssignShift(day, shiftType, draggedPerson);
      saveDayToSessionStorage(day);
      this.markChangesAndEmit();
      this.clearDraggedPersonFromStorage();
    },

    handleClickResetShift(day: DayData, shift: ShiftType): void {
      if (day[shift] !== null) {
        clearShiftAssignment(day, shift);
        saveDayToSessionStorage(day);
        this.madeChanges = true;
        this.$emit('has-changes', true);
      }
    },
    generateMonthDays() {
      this.monthDays = generateMonthDays(this.selectedYear, this.selectedMonth);
      loadAllFromSessionStorage(
        this.selectedYear,
        this.selectedMonth,
        this.monthDays,
        this.people
      );
      this.$emit('month-days-updated', this.monthDays);
    },

    updateChanges(hasChanges) {
      this.madeChanges = hasChanges;
      this.$emit('has-changes', hasChanges);
    },
    emitEditingMode(newMode) {
      this.$emit('update-editing-mode', newMode);
    },
    async checkShiftDataSync() {
      this.resetUserChanges();
      this.syncedChanges = await checkShiftDataSync(() =>
        this.generateMonthDays()
      );
    },
    loadFromSessionStorage() {
      loadAllFromSessionStorage(
        this.selectedYear,
        this.selectedMonth,
        this.monthDays,
        this.people
      );
    },
    resetUserChanges() {
      const result = resetUserChanges();
      this.localData = result.localData;
      this.madeChanges = result.madeChanges;
      this.$emit('has-changes', this.madeChanges);
    },
    handleScroll(event) {
      handleHorizontalScroll(event, this.scrollContainer);
    },
    scrollToToday() {
      this.$nextTick(() => {
        const todayIndex = this.monthDays.findIndex((day) =>
          utilIsToday(day.date)
        );
        scrollToTodayColumn(
          this.scrollContainer,
          this.selectedMonth,
          this.selectedYear,
          todayIndex
        );
      });
    },
    getDayCellClasses(day) {
      return {
        'current-month': day.isCurrentMonth,
        'nd-color': daysOfWeek[day.date.getDay()] === 'Nd',
        'sob-color': daysOfWeek[day.date.getDay()] === 'Sob',
        'holiday-color': this.isHoliday(day.date).isHoliday,
        today: this.isToday(day.date)
      };
    },
    getHolidayTooltip(date) {
      return this.isHoliday(date).name || '';
    },
    getDraggedPersonFromStorage(): DraggedPerson | null {
      const stored = localStorage.getItem('draggedPerson');
      return stored ? JSON.parse(stored) : null;
    },
    findDayByDate(date) {
      return this.monthDays.find(
        (day) => day.date.toDateString() === date.toDateString()
      );
    },
    assignShiftToDay(day, shiftType, draggedPerson) {
      utilAssignShift(day, shiftType, draggedPerson);
      saveDayToSessionStorage.call(this, day);
    },
    markChangesAndEmit() {
      this.madeChanges = true;
      this.$emit('has-changes', true);
    },
    clearDraggedPersonFromStorage() {
      localStorage.removeItem('draggedPerson');
    },
    checkMobilePlatform() {
      // Check if user is on mobile device (iOS or Android)
      const userAgent = navigator.userAgent || navigator.vendor;
      this.isMobileDevice = /android|iphone|ipad|ipod/i.test(
        userAgent.toLowerCase()
      );
    },

    handleMobileWarningClose() {
      this.showMobileWarning = false;
      this.emitEditingMode(false);
    },
    isToday(date: Date) {
      return utilIsToday(date);
    },
    isHoliday(date: Date) {
      return utilIsPolishHoliday(date);
    }
  },

  async mounted() {
    this.resetUserChanges();
    await this.checkShiftDataSync();
    this.scrollContainer = this.$refs.scrollContainer;
    this.scrollToToday();
    this.checkMobilePlatform();
  },
  watch: {
    isEditingMode(newValue) {
      localStorage.setItem('isEditingMode', JSON.stringify(newValue));
      if (newValue && this.isMobileDevice) {
        this.showMobileWarning = true;
      }
    },
    selectedMonth() {
      this.generateMonthDays();
      this.scrollToToday();
    },
    selectedYear() {
      this.generateMonthDays();
    }
  }
};
</script>

<style scoped>
.calendar-grid {
  margin-top: 3ch;
  display: grid;
  grid-template-columns: repeat(31, 1fr);
  border-radius: 8px;
  position: relative;
}

.day-header {
  font-weight: bold;
  color: var(--color-text);
}

.day-cell {
  border: 1px solid var(--glass-border-color);
  padding: 1ch 1ch 1ch 0.64ch;
  width: var(--width-day-cell);
  background-color: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  margin: 0 1px 0 0;
  scroll-snap-align: center;
}

.day-date {
  font-weight: bold;
  color: var(--color-text);
}

.day-column {
  min-width: 140px;
}
.today-column {
  position: relative;
  z-index: 2;
}

.today-column::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 43%;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #fff;
}

.day-cell.today {
  border: 2px solid #fff !important;
}

.day-cell.today .day-date {
  display: flex;
  justify-content: center;
}
</style>
