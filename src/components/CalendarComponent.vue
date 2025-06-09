<template>
  <div v-if="showMobileWarning" class="mobile-warning-overlay">
    <div class="mobile-warning">
      <h3>!! Urządzenie mobilne wykryte !!</h3>
      <p>
        Niestety, tryb edycji w widoku kalendarza nie jest obsługiwany na
        urządzeniach mobilnych.
      </p>
      <p>Proszę przejdź do widoku tabeli lub skorzystaj z komputera.</p>
      <button @click="handleMobileWarningClose" class="warning-button">
        Ok ☹
      </button>
    </div>
  </div>
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
          @dragover.prevent
          @drop="handleDrop(day.date, 'day')"
        >
          <div>
            <div
              class="day-cell"
              :class="{
                'current-month': day.isCurrentMonth,
                'nd-color': daysOfWeek[day.date.getDay()] === 'Nd',
                'sob-color': daysOfWeek[day.date.getDay()] === 'Sob',
                'holiday-color': isHoliday(day.date).isHoliday,
                today: isToday(day.date)
              }"
              :title="isHoliday(day.date).name || ''"
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
                  class="shift-slot day"
                  :class="{
                    ratownik: day.dayShift1Ratownik === true,
                    pielegniarka: day.dayShift1Ratownik === false,
                    userChanged: day.dayShift1UserChanged === true,
                    clickable: isEditingMode
                  }"
                  :clickable="isEditingMode"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'dayShift1')"
                  @click="
                    isEditingMode && handleClickResetShift(day, 'dayShift1')
                  "
                  :aria-label="getShiftAriaLabel(day, 'dayShift1')"
                  :title="getShiftTooltip(day, 'dayShift1')"
                  role="button"
                  tabindex="0"
                >
                  <div class="assigned-person" v-if="day.dayShift1">
                    {{ day.dayShift1Name }}
                  </div>
                  <div
                    class="assigned-person deleted"
                    v-else-if="day.dayShift1UserChanged"
                  >
                    Usunięto
                  </div>
                  <div class="empty-slot" v-else>D</div>
                </div>
                <div
                  class="shift-slot day"
                  :class="{
                    ratownik: day.dayShift2Ratownik === true,
                    pielegniarka: day.dayShift2Ratownik === false,
                    userChanged: day.dayShift2UserChanged === true,
                    clickable: isEditingMode
                  }"
                  :clickable="isEditingMode"
                  @drop="handleDrop(day.date, 'dayShift2')"
                  @click="
                    isEditingMode && handleClickResetShift(day, 'dayShift2')
                  "
                  :aria-label="getShiftAriaLabel(day, 'dayShift2')"
                  :title="getShiftTooltip(day, 'dayShift2')"
                  role="button"
                  tabindex="0"
                >
                  <div class="assigned-person" v-if="day.dayShift2">
                    {{ day.dayShift2Name }}
                  </div>
                  <div
                    class="assigned-person deleted"
                    v-else-if="day.dayShift2UserChanged"
                  >
                    Usunięto
                  </div>
                  <div class="empty-slot" v-else>D</div>
                </div>
                <div
                  class="shift-slot night"
                  :class="{
                    ratownik: day.nightShift1Ratownik === true,
                    pielegniarka: day.nightShift1Ratownik === false,
                    userChanged: day.nightShift1UserChanged === true,
                    clickable: isEditingMode
                  }"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift1')"
                  @click="
                    isEditingMode && handleClickResetShift(day, 'nightShift1')
                  "
                  :aria-label="getShiftAriaLabel(day, 'nightShift1')"
                  :title="getShiftTooltip(day, 'nightShift1')"
                  role="button"
                  tabindex="0"
                >
                  <div class="assigned-person" v-if="day.nightShift1">
                    {{ day.nightShift1Name }}
                  </div>
                  <div
                    class="assigned-person deleted"
                    v-else-if="day.nightShift1UserChanged"
                  >
                    Usunięto
                  </div>
                  <div class="empty-slot" v-else>N</div>
                </div>
                <div
                  class="shift-slot night"
                  :class="{
                    ratownik: day.nightShift2Ratownik === true,
                    pielegniarka: day.nightShift2Ratownik === false,
                    userChanged: day.nightShift2UserChanged === true,
                    clickable: isEditingMode
                  }"
                  :clickable="isEditingMode"
                  @dragover.prevent
                  @drop="handleDrop(day.date, 'nightShift2')"
                  @click="
                    isEditingMode && handleClickResetShift(day, 'nightShift2')
                  "
                  :aria-label="getShiftAriaLabel(day, 'nightShift2')"
                  :title="getShiftTooltip(day, 'nightShift2')"
                  role="button"
                  tabindex="0"
                >
                  <div class="assigned-person" v-if="day.nightShift2">
                    {{ day.nightShift2Name }}
                  </div>
                  <div
                    class="assigned-person deleted"
                    v-else-if="day.nightShift2UserChanged"
                  >
                    Usunięto
                  </div>
                  <div class="empty-slot" v-else>N</div>
                </div>
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
import {
  checkShiftDataSync,
  resetSyncedChangesSessionStorage
} from '@/utils/dataSync.js';
import { isPolishHoliday as utilIsPolishHoliday } from '@/utils/polishHolidays.ts'; // Aliased to avoid conflict if isPolishHoliday is used directly elsewhere
import NotificationMessage from './NotificationMessage.vue';
import { addNotification } from './NotificationMessage.vue';
import {
  generateMonthDays as utilGenerateMonthDays,
  resolvePersonName as utilResolvePersonName,
  hasOtherRatownik as utilHasOtherRatownik,
  assignShift as utilAssignShift,
  saveDayToLocalStorage as utilSaveDayToLocalStorage,
  isDuplicateShift as utilIsDuplicateShift,
  resetUserChanges as utilResetUserChanges,
  isToday as utilIsToday
} from '@/utils/calendarChecks.ts';

export default {
  name: 'CalendarComponent',
  emits: ['update-editing-mode', 'has-changes', 'month-days-updated'],
  components: {
    NotificationMessage
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
      type: Array,
      required: true
    }
  },
  data() {
    return {
      monthDays: [],
      localData: {},
      syncedChanges: {}, // Server-synced changes
      daysOfWeek,
      currentDate: new Date(),
      madeChanges: false,
      scrollContainer: null,
      currentDropTarget: { date: null, shiftType: null },
      showMobileWarning: false,
      isMobileDevice: false
    };
  },
  methods: {
    handleDrop(date, shiftType) {
      const draggedPerson = JSON.parse(localStorage.getItem('draggedPerson'));
      if (!draggedPerson) return;
      const day = this.monthDays.find(
        (day) => day.date.toDateString() === date.toDateString()
      );

      if (utilIsDuplicateShift(day, shiftType, draggedPerson.id)) {
        addNotification('Ta sama osoba na obydwu zmianach.', 'red');
        return;
      }

      const isDraggedRatownik = draggedPerson.ratownik;
      if (isDraggedRatownik && utilHasOtherRatownik(day, shiftType)) {
        addNotification(
          'Nie można przypisać dwóch ratowników na jedną zmianę.',
          'red'
        );
        return;
      }

      utilAssignShift(day, shiftType, draggedPerson);
      // .call(this) is used because utilSaveDayToLocalStorage uses this.localData
      utilSaveDayToLocalStorage.call(this, day);

      this.madeChanges = true;
      this.$emit('has-changes', true);
      localStorage.removeItem('draggedPerson');
    },
    isDropTarget(date, shiftType) {
      if (!this.currentDropTarget.date) return false;

      return (
        this.currentDropTarget.date.toDateString() === date.toDateString() &&
        this.currentDropTarget.shiftType === shiftType
      );
    },
    handleClickResetShift(day, shift) {
      if (day[shift] !== null) {
        day[shift] = null;
        day[shift + 'Name'] = 'Usunięto';
        day[shift + 'Ratownik'] = null;
        day[shift + 'UserChanged'] = true;

        // .call(this) is used because utilSaveDayToLocalStorage uses this.localData
        utilSaveDayToLocalStorage.call(this, day);

        this.madeChanges = true;
        this.$emit('has-changes', true);
      }
    },
    resolvePersonName(id: number) {
      // .call(this) is used because utilResolvePersonName uses this.people
      return utilResolvePersonName.call(this, id);
    },

    generateMonthDays() {
      this.monthDays = utilGenerateMonthDays(
        this.selectedYear,
        this.selectedMonth
      );
      this.loadFromLocalStorage();
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
              (day) => day.date.toDateString() === date
            );

            if (day) {
              day.dayShift1 = parsedStates.dayShift1;
              day.dayShift2 = parsedStates.dayShift2;
              day.nightShift1 = parsedStates.nightShift1;
              day.nightShift2 = parsedStates.nightShift2;

              const dayShift1Data = this.resolvePersonName(day.dayShift1);
              day.dayShift1Name = dayShift1Data.name;
              day.dayShift1Ratownik = dayShift1Data.isRatownik;

              const dayShift2Data = this.resolvePersonName(day.dayShift2);
              day.dayShift2Name = dayShift2Data.name;
              day.dayShift2Ratownik = dayShift2Data.isRatownik;

              const nightShift1Data = this.resolvePersonName(day.nightShift1);
              day.nightShift1Name = nightShift1Data.name;
              day.nightShift1Ratownik = nightShift1Data.isRatownik;

              const nightShift2Data = this.resolvePersonName(day.nightShift2);
              day.nightShift2Name = nightShift2Data.name;
              day.nightShift2Ratownik = nightShift2Data.isRatownik;
            }
          } catch (error) {
            addNotification('Failed to load local data: ' + error, 'red');
          }
        }
      }
    },
    resetSyncedChangesSessionStorage() {
      this.syncedChanges = resetSyncedChangesSessionStorage();
    },
    resetUserChanges() {
      const result = utilResetUserChanges();
      this.localData = result.localData;
      this.madeChanges = result.madeChanges;
      this.$emit('has-changes', this.madeChanges);
    },
    handleScroll(event) {
      if (this.scrollContainer) {
        event.preventDefault(); // Prevent default vertical scrolling
        this.scrollContainer.scrollLeft += event.deltaY; // Smooth horizontal scrolling
      }
    },
    scrollToToday() {
      this.$nextTick(() => {
        const today = new Date();
        if (
          today.getMonth() === this.selectedMonth &&
          today.getFullYear() === this.selectedYear
        ) {
          const todayIndex = this.monthDays.findIndex((day) =>
            utilIsToday(day.date)
          );

          if (todayIndex !== -1 && this.scrollContainer) {
            // Get the column width (including margins)
            const columnWidth =
              (document.querySelector('.day-cell') as HTMLElement)
                ?.offsetWidth || 0;
            const containerWidth = this.scrollContainer.offsetWidth;

            // Calculate scroll position to center today's column
            const scrollPosition =
              columnWidth * todayIndex - containerWidth / 2 + columnWidth / 2;

            // Smooth scroll to the position
            this.scrollContainer.scrollTo({
              left: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }
      });
    },
    getDayClass(dayIndex) {
      if (daysOfWeek[dayIndex] === 'Nd') return 'nd-color';
      if (daysOfWeek[dayIndex] === 'Sob') return 'sob-color';
      return 'normal-color';
    },
    getShiftAriaLabel(day, shiftType) {
      const shift = day[shiftType];
      const shiftName = shiftType.includes('day')
        ? 'Zmiana dzienna'
        : 'Zmiana nocna';
      const personName = day[`${shiftType}Name`];
      if (this.isEditingMode) {
        return shift
          ? `${shiftName}: ${personName}. Kliknij aby usunąć zmianę.`
          : `${shiftName}: Pusta zmiana. Przeciągnij członka zespołu by nadać im zmianę.`;
      } else {
        return shift
          ? `${shiftName}: ${personName}`
          : `${shiftName}: Pusta zmiana.`;
      }
    },

    getShiftTooltip(day, shiftType) {
      const shift = day[shiftType];
      const shiftName = shiftType.includes('day')
        ? 'Zmiana dzienna'
        : 'Zmiana nocna';

      if (this.isEditingMode) {
        return shift
          ? `${shiftName}: ${day[`${shiftType}Name`]} (Kliknij by usunąć)`
          : `Przeciągnij członka zespołu by nadać im - ${shiftName.toLowerCase()}`;
      } else {
        return shift
          ? `${shiftName}: ${day[`${shiftType}Name`]}`
          : `${shiftName}: Nieprzypisana`;
      }
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
    isHoliday(date) {
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
/* Changes Highlight */
.userChanged {
  color: var(--color-user-changed) !important; /* Highlight user-made changes */
}
.clickable {
  cursor: pointer !important;
}
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

/* Shifts styles */
.shift-slot {
  margin-top: var(--spacing-small);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.shift-slot:has(.empty-slot) {
  filter: saturate(0.3) opacity(0.7);
  border: 2px solid var(--color-empty-slot) !important;
  font-weight: 600;
}
.shift-slot[clickable='true'] {
  cursor: pointer;
}
.empty-slot {
  color: var(--color-text);
  padding: var(--spacing-small);
  height: var(--height-empty-slot);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
  width: 100%;
  background-color: transparent !important;
}
/* Assigned Person Styles */
.assigned-person {
  padding: var(--spacing-small);
  background-color: transparent;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
  font-weight: bolder;
  transition: all 0.2s ease;
  width: 100%;
  color: var(--color-text);
}

.shift-label {
  background-color: var(--color-label-bg);
  padding: var(--spacing-small);
}
.calendar-container {
  margin-top: 40px;
}
.shift-slot.touch-hover {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px dashed #4caf50;
  transform: scale(1.05);
  transition: all 0.2s ease;
} /* Mobile warning styles */
.mobile-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.mobile-warning {
  background-color: var(--glass-bg-color);
  color: var(--color-text);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  padding: 20px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.mobile-warning h3 {
  color: #ff5252;
  margin-top: 0;
}

.mobile-warning p {
  margin: 15px 0;
}

.warning-button {
  background-color: #4caf50;
  color: var(--color-text);
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 10px;
  cursor: pointer;
}
.assigned-person.deleted {
  color: var(--color-text-secondary);
  border: 2px solid var(--glass-border-color);
  font-style: italic;
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
