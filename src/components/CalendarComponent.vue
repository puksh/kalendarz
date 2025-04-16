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
        Ok :(
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
          class="day-column"
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
              }"
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
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift1,
                    ratownik: day.dayShift1Ratownik === true,
                    pielegniarka: day.dayShift1Ratownik === false,
                    userChanged: day.dayShift1UserChanged === true,
                    clickable: isEditingMode,
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
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.dayShift2,
                    ratownik: day.dayShift2Ratownik === true,
                    pielegniarka: day.dayShift2Ratownik === false,
                    userChanged: day.dayShift2UserChanged === true,
                    clickable: isEditingMode,
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
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift1,
                    ratownik: day.nightShift1Ratownik === true,
                    pielegniarka: day.nightShift1Ratownik === false,
                    userChanged: day.nightShift1UserChanged === true,
                    clickable: isEditingMode,
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
                    'synced-changed':
                      syncedChanges[day.date.toDateString()]?.nightShift2,
                    ratownik: day.nightShift2Ratownik === true,
                    pielegniarka: day.nightShift2Ratownik === false,
                    userChanged: day.nightShift2UserChanged === true,
                    clickable: isEditingMode,
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
import { daysOfWeek } from "@/data/daysOfWeek.ts";
import {
  checkShiftDataSync,
  resetSyncedChangesSessionStorage,
} from "@/utils/dataSync.js";
import NotificationMessage from "./NotificationMessage.vue";
import { addNotification } from "./NotificationMessage.vue";
export default {
  name: "CalendarComponent",
  emits: ["update-editing-mode", "has-changes", "month-days-updated"],
  components: {
    NotificationMessage,
  },
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
      isMobileDevice: false,
    };
  },
  methods: {
    handleDrop(date, shiftType) {
      const draggedPerson = JSON.parse(localStorage.getItem("draggedPerson"));
      // Is user actually dragging a person
      if (!draggedPerson) return;
      const day = this.monthDays.find(
        (day) => day.date.toDateString() === date.toDateString(),
      );

      // Temporarily update to test uniqueness
      const tempShifts = { ...day, [shiftType]: draggedPerson.id };
      if (
        (tempShifts.dayShift1 != null &&
          tempShifts.dayShift2 != null &&
          tempShifts.dayShift1 === tempShifts.dayShift2) ||
        (tempShifts.nightShift1 != null &&
          tempShifts.nightShift2 != null &&
          tempShifts.nightShift1 === tempShifts.nightShift2)
      ) {
        addNotification("Ta sama osoba na obydwu zmianach.", "red");
        return;
      }

      const isDraggedRatownik = draggedPerson.ratownik;

      // Check if another ratownik is already assigned to the same shift type
      let hasOtherRatownik = false;

      switch (shiftType) {
        case "dayShift1":
          hasOtherRatownik = day.dayShift2Ratownik;
          break;
        case "dayShift2":
          hasOtherRatownik = day.dayShift1Ratownik;
          break;
        case "nightShift1":
          hasOtherRatownik = day.nightShift2Ratownik;
          break;
        case "nightShift2":
          hasOtherRatownik = day.nightShift1Ratownik;
          break;
      }
      if (isDraggedRatownik && hasOtherRatownik) {
        addNotification(
          "Nie można przypisać dwóch ratowników na jedną zmianę.",
          "red",
        );
        return;
      }

      day[shiftType] = draggedPerson.id;
      day[`${shiftType}Name`] = draggedPerson.name;
      day[`${shiftType}Ratownik`] = draggedPerson.ratownik;
      day[`${shiftType}UserChanged`] = true;

      const updatedData = {
        dayShift1: day.dayShift1,
        dayShift2: day.dayShift2,
        nightShift1: day.nightShift1,
        nightShift2: day.nightShift2,
      };

      this.localData[date.toDateString()] = updatedData;
      localStorage.setItem(date.toDateString(), JSON.stringify(updatedData));

      this.madeChanges = true;
      this.$emit("has-changes", true);
      localStorage.removeItem("draggedPerson");
    },
    isDropTarget(date, shiftType) {
      if (!this.currentDropTarget.date) return false;

      return (
        this.currentDropTarget.date.toDateString() === date.toDateString() &&
        this.currentDropTarget.shiftType === shiftType
      );
    },
    handleClickResetShift(day, shift) {
      // Check if the shift is assigned
      if (day[shift] !== null) {
        // Set the shift to empty
        day[shift] = null;
        day[shift + "Name"] = "Usunięto";
        day[shift + "Ratownik"] = null;
        day[shift + "UserChanged"] = true;

        // Save the updated day object in localStorage and in-memory data
        const updatedData = {
          dayShift1: day.dayShift1,
          dayShift2: day.dayShift2,
          nightShift1: day.nightShift1,
          nightShift2: day.nightShift2,
        };

        this.localData[day.date.toDateString()] = updatedData;
        localStorage.setItem(
          day.date.toDateString(),
          JSON.stringify(updatedData),
        );

        this.madeChanges = true;
        this.$emit("has-changes", true);
      }
    },
    resolvePersonName(id) {
      const person = this.people.find((person) => person.id === id);
      return person
        ? { name: person.name, isRatownik: person.ratownik }
        : { name: undefined, isRatownik: false };
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

      // Emit the updated monthDays to App.vue
      this.$emit("month-days-updated", this.monthDays);
    },
    updateChanges(hasChanges) {
      this.madeChanges = hasChanges;
      this.$emit("has-changes", hasChanges);
    },
    emitEditingMode(newMode) {
      this.$emit("update-editing-mode", newMode); // Notify parent of the change
    },
    async checkShiftDataSync() {
      this.resetUserChanges();
      this.syncedChanges = await checkShiftDataSync(() =>
        this.generateMonthDays(),
      );
    },
    loadFromLocalStorage() {
      const year = this.selectedYear;
      const month = this.selectedMonth;

      for (let i = 1; i <= 31; i++) {
        const date = new Date(year, month, i).toDateString();

        // Skip if the date is in syncedChanges
        if (this.syncedChanges[date]) continue;

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

              // Resolve names with ratownik data
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
            addNotification("Failed to load local data: " + error, "red");
          }
        }
      }
    },
    resetSyncedChangesSessionStorage() {
      this.syncedChanges = resetSyncedChangesSessionStorage();
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
      this.madeChanges = false;
      this.$emit("has-changes", this.madeChanges);
      this.editedShifts = {};
    },
    handleScroll(event) {
      if (this.scrollContainer) {
        event.preventDefault(); // Prevent default vertical scrolling
        this.scrollContainer.scrollLeft += event.deltaY; // Smooth horizontal scrolling
      }
    },
    getDayClass(dayIndex) {
      if (daysOfWeek[dayIndex] === "Nd") return "nd-color";
      if (daysOfWeek[dayIndex] === "Sob") return "sob-color";
      return "normal-color";
    },
    getShiftAriaLabel(day, shiftType) {
      const shift = day[shiftType];
      const shiftName = shiftType.includes("day")
        ? "Zmiana dzienna"
        : "Zmiana nocna";
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
      const shiftName = shiftType.includes("day")
        ? "Zmiana dzienna"
        : "Zmiana nocna";

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
        userAgent.toLowerCase(),
      );
    },

    handleMobileWarningClose() {
      this.showMobileWarning = false;
      this.emitEditingMode(false); // Disable editing mode
    },
  },

  async mounted() {
    // Clear user-made changes on refresh
    this.resetUserChanges();
    await this.checkShiftDataSync(); // Then sync with remote data
    this.scrollContainer = this.$refs.scrollContainer;
    this.checkMobilePlatform();
  },
  watch: {
    isEditingMode(newValue) {
      localStorage.setItem("isEditingMode", JSON.stringify(newValue)); // Save to localStorage
      if (newValue && this.isMobileDevice) {
        this.showMobileWarning = true;
      }
    },
    selectedMonth() {
      this.generateMonthDays();
    },
    selectedYear() {
      this.generateMonthDays();
    },
  },
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

.day-column {
  scroll-snap-align: center;
  margin: 0 1px 0 0;
}

.day-cell {
  border: 1px solid var(--glass-border-color);
  padding: 1ch 1ch 1ch 0.5ch;
  width: var(--width-day-cell);
  background-color: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
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
  z-index: 1000;
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
</style>
