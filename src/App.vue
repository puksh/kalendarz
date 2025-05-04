<template>
  <div class="app-container">
    <component
      v-if="AuthorizationModal && showPasswordModal"
      :is="AuthorizationModal"
      :show="showPasswordModal"
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
    <section class="top-right-buttons-container">
      <button
        class="top-right-buttons buttonRefresh"
        @click="checkShiftDataSync()"
        aria-label="Odśwież harmonogram"
        title="Odśwież harmonogram"
      >
        <refresh-icon :class="{ refreshing: isRefreshing }" />
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
        </span> </label
      ><ButtonExport
        :people="people"
        :monthDays="monthDays"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        :currentPage="currentPage"
      />
      <ButtonImport
        v-if="currentPage === 'ExcelComponent'"
        :isEditingMode="isEditingMode"
        :people="people"
        :monthDays="monthDays"
        @has-changes="updateUnsavedChanges"
        @cells-imported="handleImportedCells"
      />
    </section>
    <main class="main-content">
      <div class="refresh-overlay" v-if="isRefreshing">
        <RefreshIcon class="centered-refresh-icon refreshing" />
      </div>
      <div :style="{ opacity: isRefreshing ? '0.5' : '1' }">
        <component
          ref="calendarComponent"
          v-if="currentPage === 'CalendarComponent'"
          :is="CalendarComponent"
          :isEditingMode="isEditingMode"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :people="people"
          @update-editing-mode="updateEditingMode"
          @has-changes="updateUnsavedChanges"
          @month-days-updated="updateMonthDays"
        />
        <component
          ref="excelComponent"
          v-if="currentPage === 'ExcelComponent'"
          :is="ExcelComponent"
          :isEditingMode="isEditingMode"
          :selectedMonth="selectedMonth"
          :selectedYear="selectedYear"
          :people="people"
          @update-editing-mode="updateEditingMode"
          @has-changes="updateUnsavedChanges"
          @month-days-updated="updateMonthDays"
        />
      </div>
      <PeopleListWindow
        :people="people"
        :isEditingMode="peopleListEditingMode"
      />
      <div
        v-show="isEditingMode"
        style="display: flex; flex-direction: column; align-items: center"
      >
        <h1
          v-show="currentPage === 'CalendarComponent'"
          class="editing-mode-label"
        >
          Tryb edytowania
          <a style="color: #4caf50">Włączony</a><br />
          Przeciągaj członków zespołu na miejsca w grafiku.<br />Kliknij na
          zajętą zmianę, aby ją wyczyścić.
        </h1>
        <h1
          v-show="currentPage === 'ExcelComponent'"
          class="editing-mode-label"
        >
          Tryb edytowania
          <a style="color: #4caf50">Włączony</a><br />
          Kliknij na miejsce w tabeli, aby wybrać zmianę.
        </h1>
      </div>
      <ShiftCountWindow
        ref="shiftCountWindow"
        v-if="monthDays.length > 0 && localData[1] !== null"
        :people="people"
        :monthDays="monthDays"
      />
      <NotificationMessage />
    </main>
  </div>
  <footer class="footer">
    <p>© 2025 puksh - All rights reserved</p>
  </footer>
</template>

<script>
import { defineAsyncComponent, markRaw } from "vue";
import { checkShiftDataSync } from "@/utils/dataSync.js";
import { addNotification } from "./components/NotificationMessage.vue";
import RefreshIcon from "./components/icons/RefreshIcon.vue";
import ButtonExport from "./components/ButtonExport.vue";
import ButtonImport from "./components/ButtonImport.vue";

export default {
  name: "VueCalendar",
  components: {
    SideBarComponent: defineAsyncComponent(
      () => import("./components/SideBarComponent.vue"),
    ),
    MonthSelector: defineAsyncComponent(
      () => import("./components/MonthSelector.vue"),
    ),
    PeopleListWindow: defineAsyncComponent(
      () => import("./components/PeopleListWindow.vue"),
    ),
    ShiftCountWindow: defineAsyncComponent(
      () => import("./components/ShiftCountWindow.vue"),
    ),
    NotificationMessage: defineAsyncComponent(
      () => import("./components/NotificationMessage.vue"),
    ),
    RefreshIcon,
    ButtonExport,
    ButtonImport,
  },
  data() {
    return {
      isEditingMode: this.safeGetFromStorage("isEditingMode", false), // Shared Edit state
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
        //{ id: 8, name: "Alina", ratownik: false },
        //{ id: 9, name: "Ewelina", ratownik: false },
        //{ id: 10, name: "Teresa", ratownik: false },
      ],
      monthDays: [],
      isRefreshing: false,
      AuthorizationModal: null,
      CalendarComponent: null,
      ExcelComponent: null,
      currentPage: localStorage.getItem("currentPage") || "ExcelComponent",
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

      // Save to localStorage
      localStorage.setItem("currentPage", section);

      // Dynamic component loading
      if (section === "CalendarComponent" && !this.CalendarComponent) {
        // Show loading indicator
        this.isLoading = true;

        import("./components/CalendarComponent.vue").then((module) => {
          this.CalendarComponent = markRaw(module.default);
          this.currentPage = section;
          this.hasUnsavedChanges = false;
          this.isLoading = false;
        });
      } else if (section === "ExcelComponent" && !this.ExcelComponent) {
        // Add ExcelComponent lazy loading too
        this.isLoading = true;

        import("./components/ExcelComponent.vue").then((module) => {
          this.ExcelComponent = markRaw(module.default);
          this.currentPage = section;
          this.hasUnsavedChanges = false;
          this.isLoading = false;
        });
      } else {
        this.currentPage = section;
        this.hasUnsavedChanges = false;
      }
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
      if (this.currentPage === "ExcelComponent" && this.$refs.excelComponent) {
        this.$refs.excelComponent.generateMonthDays();
      } else if (
        this.currentPage === "CalendarComponent" &&
        this.$refs.calendarComponent
      ) {
        this.$refs.calendarComponent.generateMonthDays();
      }
    },
    async checkShiftDataSync() {
      // Set a timeout to prevent infinite spinning
      const refreshTimeout = setTimeout(() => {
        if (this.isRefreshing) {
          console.warn("Refresh operation timed out");
          this.isRefreshing = false;
          addNotification("Odświeżanie przerwane - timeout", "red");
        }
      }, 6000);

      this.isRefreshing = true;

      try {
        const syncPromise = checkShiftDataSync(() =>
          this.generateCurrentView(),
        );
        this.syncedChanges = await Promise.race([
          syncPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Sync timeout")), 5000),
          ),
        ]);

        this.hasUnsavedChanges = false;
      } catch (error) {
        console.error("Error during refresh:", error);
        addNotification(
          `Błąd podczas odświeżania: ${error.message || "Unknown error"}`,
          "red",
        );
      } finally {
        clearTimeout(refreshTimeout);
        setTimeout(() => {
          this.isRefreshing = false;
        }, 800);
      }
    },
    updateEditingMode(newMode) {
      this.isEditingMode = newMode;
      localStorage.setItem("isEditingMode", JSON.stringify(newMode)); // Persist state
    },
    updateUnsavedChanges(hasChanges) {
      this.hasUnsavedChanges = hasChanges;
    },
    showPasswordPrompt() {
      if (!this.AuthorizationModal) {
        // Only import if not already loaded
        import("./components/AuthorizationModal.vue").then((module) => {
          this.AuthorizationModal = markRaw(module.default);
          this.showPasswordModal = true;
        });
      } else {
        // If already loaded, just show it
        this.showPasswordModal = true;
      }
    },
    handleAuthorization() {
      this.showPasswordModal = false;
      this.hasUnsavedChanges = false;
      // Notify active component that changes were saved
      this.$refs.activeComponent?.handleChangesSaved();
    },
    emitEditingMode(newMode) {
      // Directly update the state instead of emitting an event
      this.updateEditingMode(newMode);
    },
    enableEditingMode() {
      this.isEditingMode = true;
    },
    updateMonthDays(days) {
      this.monthDays = days;
    },
    recoverFromError() {
      // Reset critical state
      this.isRefreshing = false;

      // Force reload component if needed
      if (this.currentPage === "ExcelComponent" && !this.$refs.excelComponent) {
        this.handleNavigation("ExcelComponent");
      }

      // Clear any stuck flags
      this.isLoading = false;
    },
    safeGetFromStorage(key, defaultValue) {
      try {
        const item = localStorage.getItem(key);
        return item !== null ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.warn(`Error reading ${key} from localStorage:`, e);
        return defaultValue;
      }
    },
    handleImportedCells(importedCellKeys) {
      // You can pass this to ExcelComponent if needed for styling
      this.$refs.excelComponent.importedCells = new Set(importedCellKeys);
    },
  },
  async mounted() {
    try {
      // Reset any stuck state from previous sessions
      this.isRefreshing = false;

      // Wrap in try-catch to handle component loading failures
      if (!this.ExcelComponent) {
        try {
          this.ExcelComponent = markRaw(
            (await import("./components/ExcelComponent.vue")).default,
          );
        } catch (error) {
          console.error("Failed to load Excel component:", error);
          addNotification("Błąd ładowania Tabeli", "red");
        }
      }

      // Load stored page with error handling
      const savedPage = localStorage.getItem("currentPage");
      if (savedPage === "CalendarComponent" && !this.CalendarComponent) {
        try {
          const module = await import("./components/CalendarComponent.vue");
          this.CalendarComponent = markRaw(module.default);
        } catch (error) {
          console.error("Failed to load Calendar component:", error);
          addNotification("Błąd ładowania Kalendarza", "red");

          // Fallback to ExcelComponent if Calendar fails to load
          this.currentPage = "ExcelComponent";
          localStorage.setItem("currentPage", "ExcelComponent");
        }
      }

      this.discardChanges();
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.error("Error during application initialization:", error);
      addNotification("Błąd inicjalizacji aplikacji", "red");
    }
    // Global error handler
    window.addEventListener("error", (event) => {
      console.error("Global error caught:", event.error);
      this.recoverFromError();
    });

    // Unhandled promise rejection handler
    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason);
      this.recoverFromError();
    });
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
  color: var(--color-text, #e0e0e0);
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
.refresh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9000;
  pointer-events: none; /* Allow clicks to pass through */
  background-color: rgba(0, 0, 0, 0.5);
}

.centered-refresh-icon {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
}
</style>
