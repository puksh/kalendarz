<template>
  <div class="app-container">
    <AuthorizationModal
      :show="showPasswordModal"
      :localData="localData"
      @close="showPasswordModal = false"
      @authorized="handleAuthorization"
      aria-label="Zapisz zmiany"
      title="Zapisz zmiany w harmonogramie"
    />
    <button
      :disabled="!hasUnsavedChanges"
      @click="showPasswordPrompt"
      class="submit-button"
      aria-label="Zapisz zmiany"
      title="Zapisz zmiany w harmonogramie"
    >
      Zapisz
    </button>
    <SideBarComponent
      :currentComponent="currentPage"
      @navigate="handleNavigation"
    />
    <MonthSelector
      :currentMonth="selectedMonth"
      :currentYear="selectedYear"
      :locale="locale"
      :hasUnsavedChanges="hasUnsavedChanges"
      @change-month="handleMonthChange"
      @discard-changes="discardChanges"
    />
    <section>
      <button
        class="top-right-buttons buttonRefresh"
        @click="checkShiftDataSync()"
        aria-label="Odśwież harmonogram"
        title="Odśwież harmonogram"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="refresh-icon"
          style="width: 30px; height: 30px"
        >
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
        </svg>
      </button>
      <label
        class="top-right-buttons compact-toggle"
        title="Przełącz tryb edytowania"
      >
        <input
          type="checkbox"
          :checked="isEditingMode"
          @change="emitEditingMode($event.target.checked)"
          aria-label="Przełącz tryb edytowania"
        />
        <span class="slider" role="switch" :aria-checked="isEditingMode">
          <svg
            v-if="!isEditingMode"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="pencil-icon"
          >
            <path d="M12 20h9"></path>
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
            ></path>
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="pencil-icon"
          >
            <path d="M12 20h9"></path>
            <path
              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
            ></path>
          </svg>
        </span>
      </label>
    </section>
    <main class="main-content">
      <CalendarComponent
        ref="calendarComponent"
        v-if="currentPage === 'CalendarComponent'"
        :isEditingMode="isEditingMode"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        :people="people"
        @update-editing-mode="updateEditingMode"
        @has-changes="updateUnsavedChanges"
        @month-days-updated="updateMonthDays"
      />
      <ExcelComponent
        ref="excelComponent"
        v-if="currentPage === 'ExcelComponent'"
        :isEditingMode="isEditingMode"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        :people="people"
        @update-editing-mode="updateEditingMode"
        @has-changes="updateUnsavedChanges"
        @month-days-updated="updateMonthDays"
      />
      <PeopleListWindow
        :people="people"
        :isEditingMode="peopleListEditingMode"
      />
      <ShiftCountWindow
        v-if="monthDays.length > 0"
        :people="people"
        :monthDays="monthDays"
      />
      <NotificationMessage />
    </main>
  </div>
  <div
    v-if="isEditingMode"
    style="display: flex; flex-direction: column; align-items: center"
  >
    <h1 v-if="currentPage === 'CalendarComponent'" class="editing-mode-label">
      Tryb edytowania
      <a style="color: #4caf50">Włączony</a><br />
      Przeciągaj członków zespołu na miejsca w grafiku.<br />Kliknij na zajętą
      zmianę, aby ją wyczyścić.
    </h1>
    <h1 v-if="currentPage === 'ExcelComponent'" class="editing-mode-label">
      Tryb edytowania
      <a style="color: #4caf50">Włączony</a><br />
      Kliknij na miejsce w tabeli, aby wybrać zmianę.
    </h1>
  </div>
  <footer class="footer">
    <p>© 2025 puksh - All rights reserved</p>
  </footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import MonthSelector from "./components/MonthSelector.vue";
import AuthorizationModal from "./components/AuthorizationModal.vue";
import PeopleListWindow from "./components/PeopleListWindow.vue";
import ShiftCountWindow from "./components/ShiftCountWindow.vue";
import { checkShiftDataSync } from "@/utils/dataSync.js";
import { addNotification } from "./components/NotificationMessage.vue";

export default {
  name: "VueCalendar",
  components: {
    CalendarComponent: defineAsyncComponent(
      () => import("./components/CalendarComponent.vue"),
    ),
    ExcelComponent: defineAsyncComponent(
      () => import("./components/ExcelComponent.vue"),
    ),
    SideBarComponent: defineAsyncComponent(
      () => import("./components/SideBarComponent.vue"),
    ),
    NotificationMessage: defineAsyncComponent(
      () => import("./components/NotificationMessage.vue"),
    ),
    MonthSelector: defineAsyncComponent(
      () => import("./components/MonthSelector.vue"),
    ),
    AuthorizationModal: defineAsyncComponent(
      () => import("./components/AuthorizationModal.vue"),
    ),
    PeopleListWindow: defineAsyncComponent(
      () => import("./components/PeopleListWindow.vue"),
    ),
    ShiftCountWindow: defineAsyncComponent(
      () => import("./components/ShiftCountWindow.vue"),
    ),
  },
  data() {
    return {
      currentPage: "CalendarComponent",
      isEditingMode: JSON.parse(localStorage.getItem("isEditingMode")) || false, // Shared editing mode state
      //MonthSelector
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      locale: "pl",
      hasUnsavedChanges: false,
      // Modal and Save state
      showPasswordModal: false,
      localData: {},
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
        { id: 10, name: "Teresa", ratownik: false },
      ],
      monthDays: [],
    };
  },
  methods: {
    handleNavigation(section) {
      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(
          "Masz niezapisane zmiany. Czy na pewno chcesz zmienić widok? Twoje zmiany zostaną utracone.",
        );
        if (!confirmSwitch) {
          return;
        }
      }
      this.currentPage = section;
      this.hasUnsavedChanges = false;
    },
    handleMonthChange(delta) {
      // Just handle the month change logic
      this.selectedMonth += delta;

      // Handle year change if needed
      if (this.selectedMonth > 11) {
        this.selectedMonth = 0;
        this.selectedYear += 1;
      } else if (this.selectedMonth < 0) {
        this.selectedMonth = 11;
        this.selectedYear -= 1;
      }
    },
    discardChanges() {
      this.hasUnsavedChanges = false;
      this.checkShiftDataSync();
    },
    generateCurrentView() {
      // Regenerate the current component's view
      if (
        this.currentPage === "CalendarComponent" &&
        this.$refs.calendarComponent
      ) {
        this.$refs.calendarComponent.generateMonthDays();
      } else if (
        this.currentPage === "ExcelComponent" &&
        this.$refs.excelComponent
      ) {
        this.$refs.excelComponent.generateMonthDays();
      }
    },
    async checkShiftDataSync() {
      this.syncedChanges = await checkShiftDataSync(() =>
        this.generateCurrentView(),
      );
      addNotification("Odświeżanie...", "blue");
    },
    updateEditingMode(newMode) {
      this.isEditingMode = newMode;
      localStorage.setItem("isEditingMode", JSON.stringify(newMode)); // Persist state
    },
    updateUnsavedChanges(hasChanges) {
      this.hasUnsavedChanges = hasChanges;
    },
    showPasswordPrompt() {
      this.showPasswordModal = true;
    },
    handleAuthorization() {
      this.showPasswordModal = false;
      this.hasUnsavedChanges = false;
      addNotification("Zmiany zostały zapisane pomyślnie.", "green");

      // Notify active component that changes were saved
      this.$refs.activeComponent?.handleChangesSaved();
    },
    emitEditingMode(newMode) {
      // Directly update the state instead of emitting an event
      this.updateEditingMode(newMode);
    },
    updateMonthDays(days) {
      this.monthDays = days;
    },
  },
  async mounted() {
    this.discardChanges();
  },

  computed: {
    peopleListEditingMode() {
      switch (this.currentPage) {
        case "CalendarComponent":
          return this.isEditingMode;
        case "ExcelComponent":
          return false;
        default:
          return false;
      }
    },
  },
};
</script>

<style scoped>
.main-content {
  padding-top: 20px;
  max-width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 40px !important;
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  padding: 8px;
  background-color: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-top: 1px solid var(--glass-border-color);
  box-shadow: 0 -2px 10px rgba(0, 200, 200, 0.15);
  color: var(--color-text-light, #e0e0e0);
  font-size: 12px;
  line-height: 0.8ch;
}

.footer p {
  margin: 2px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.footer p:hover {
  opacity: 1;
}
</style>
