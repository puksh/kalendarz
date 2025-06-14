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
      mode="save"
    />
    <button
      :disabled="!canSave"
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
        <PencilIcon :isEditing="isEditingMode" />
      </label>
      <ButtonExport
        :people="people"
        :monthDays="monthDays"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        :currentPage="currentPage"
      />
      <ButtonImport
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
      <div v-show="isEditingMode" class="editing-mode-container">
        <h1
          v-show="currentPage === 'CalendarComponent'"
          class="editing-mode-label"
        >
          Tryb edytowania
          <a class="editing-mode-status">Włączony</a><br />
          Przeciągaj członków zespołu na miejsca w grafiku.<br />Kliknij na
          zajętą zmianę, aby ją wyczyścić.
        </h1>
        <h1
          v-show="currentPage === 'ExcelComponent'"
          class="editing-mode-label"
        >
          Tryb edytowania
          <a class="editing-mode-status">Włączony</a><br />
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
    <a href="https://github.com/puksh/kalendar"
      >© 2025 puksh - All rights reserved</a
    >
  </footer>
</template>

<script>
import { defineAsyncComponent, markRaw } from 'vue';
import PencilIcon from './components/PencilIcon.vue';
import { checkShiftDataSync } from '@/utils/dataSync.js';
import { addNotification } from './components/NotificationMessage.vue';
import RefreshIcon from './components/icons/RefreshIcon.vue';
import ButtonExport from './components/ButtonExport.vue';
import ButtonImport from './components/ButtonImport.vue';

export default {
  name: 'VueCalendar',
  components: {
    SideBarComponent: defineAsyncComponent(
      () => import('./components/SideBarComponent.vue')
    ),
    MonthSelector: defineAsyncComponent(
      () => import('./components/MonthSelector.vue')
    ),
    PeopleListWindow: defineAsyncComponent(
      () => import('./components/PeopleListWindow.vue')
    ),
    ShiftCountWindow: defineAsyncComponent(
      () => import('./components/ShiftCountWindow.vue')
    ),
    NotificationMessage: defineAsyncComponent(
      () => import('./components/NotificationMessage.vue')
    ),
    RefreshIcon,
    ButtonExport,
    ButtonImport,
    PencilIcon
  },
  data() {
    return {
      isLoading: false,
      isEditingMode: this.safeGetFromStorage('isEditingMode', false),
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      locale: 'pl',
      hasUnsavedChanges: false,
      showPasswordModal: false,
      localData: {},
      people: [
        { id: 1, name: 'Milena', ratownik: false },
        { id: 2, name: 'Mikołaj', ratownik: false },
        { id: 3, name: 'Aleksandra', ratownik: false },
        { id: 4, name: 'Łukasz', ratownik: true },
        { id: 5, name: 'Joanna', ratownik: false },
        { id: 6, name: 'Natalia', ratownik: true },
        { id: 7, name: 'Marcin', ratownik: true }
        //{ id: 8, name: "Alina", ratownik: false },
        //{ id: 9, name: "Ewelina", ratownik: false },
        //{ id: 10, name: "Teresa", ratownik: false },
      ],
      monthDays: [],
      isRefreshing: false,
      AuthorizationModal: null,
      CalendarComponent: null,
      ExcelComponent: null,
      currentPage: this.safeGetFromStorage('currentPage', 'ExcelComponent')
    };
  },
  computed: {
    canSave() {
      return this.hasUnsavedChanges;
    },
    peopleListEditingMode() {
      return this.currentPage === 'CalendarComponent' && this.isEditingMode;
    },
    activeComponentRef() {
      return this.currentPage === 'CalendarComponent'
        ? this.$refs.calendarComponent
        : this.$refs.excelComponent;
    }
  },
  methods: {
    showPasswordPrompt() {
      if (this.AuthorizationModal) {
        this.showPasswordModal = true;
        return;
      }
      import('./components/AuthorizationModal.vue').then((m) => {
        this.AuthorizationModal = markRaw(m.default);
        this.showPasswordModal = true;
      });
    },
    handleAuthorization() {
      this.showPasswordModal = false;
      this.hasUnsavedChanges = false;
      this.activeComponentRef?.handleChangesSaved();
    },
    loadPageComponent(name) {
      const loaders = {
        CalendarComponent: () => import('./components/CalendarComponent.vue'),
        ExcelComponent: () => import('./components/ExcelComponent.vue')
      };
      const loader = loaders[name];
      if (!loader || this[name]) return Promise.resolve();
      this.isLoading = true;
      return loader()
        .then((module) => {
          this[name] = markRaw(module.default);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    handleNavigation(section) {
      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(
          'Masz niezapisane zmiany. Czy na pewno chcesz zmienić widok?'
        );
        if (!confirmSwitch) return;
      }
      localStorage.setItem('currentPage', section);
      this.loadPageComponent(section).then(() => {
        this.currentPage = section;
        this.hasUnsavedChanges = false;
      });
    },
    handleMonthChange(delta) {
      const currentDate = new Date(this.selectedYear, this.selectedMonth, 1);
      currentDate.setMonth(currentDate.getMonth() + delta);
      this.selectedMonth = currentDate.getMonth();
      this.selectedYear = currentDate.getFullYear();
    },
    discardChanges() {
      this.hasUnsavedChanges = false;
      this.checkShiftDataSync();
    },
    generateCurrentView() {
      if (
        this.currentPage === 'CalendarComponent' &&
        this.$refs.calendarComponent
      ) {
        this.$refs.calendarComponent.generateMonthDays();
      }
    },
    async checkShiftDataSync() {
      const timeoutError = new Error('Sync timeout');
      this.isRefreshing = true;
      try {
        await Promise.race([
          checkShiftDataSync(() =>
            this.activeComponentRef?.generateMonthDays()
          ),
          new Promise((_, r) => setTimeout(() => r(timeoutError), 5000))
        ]);
        this.hasUnsavedChanges = false;
      } catch (e) {
        console.error(e);
        addNotification(`Błąd podczas odświeżania: ${e.message}`, 'red');
      } finally {
        setTimeout(() => (this.isRefreshing = false), 800);
      }
    },
    updateEditingMode(newMode) {
      this.isEditingMode = newMode;
      localStorage.setItem('isEditingMode', JSON.stringify(newMode));
    },
    updateUnsavedChanges(hasChanges) {
      this.hasUnsavedChanges = hasChanges;
    },
    emitEditingMode(newMode) {
      this.updateEditingMode(newMode);
    },
    enableEditingMode() {
      this.isEditingMode = true;
    },
    updateMonthDays(days) {
      this.monthDays = days;
    },
    globalErrorHandler() {
      this.isRefreshing = false;
      if (this.currentPage === 'ExcelComponent' && !this.$refs.excelComponent) {
        this.handleNavigation('ExcelComponent');
      }
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
      if (!this.ExcelComponent) {
        console.error('ExcelComponent is not loaded yet.');
        return;
      }
      this.$refs.excelComponent.importedCells = new Set(importedCellKeys);
    }
  },
  async mounted() {
    try {
      this.isRefreshing = false;
      await this.loadPageComponent('ExcelComponent').catch((error) => {
        console.error('Failed to load Excel component:', error);
        addNotification('Błąd ładowania Tabeli', 'red');
      });

      const savedPage = localStorage.getItem('currentPage');
      if (savedPage === 'CalendarComponent') {
        await this.loadPageComponent('CalendarComponent').catch((error) => {
          console.error('Failed to load Calendar component:', error);
          addNotification('Błąd ładowania Kalendarza', 'red');
          this.currentPage = 'ExcelComponent';
          localStorage.setItem('currentPage', 'ExcelComponent');
        });
      }
      this.discardChanges();
      this.hasUnsavedChanges = false;
    } catch (error) {
      console.error('Error during application initialization:', error);
      addNotification('Błąd inicjalizacji aplikacji', 'red');
    }
    ['error', 'unhandledrejection'].forEach((evt) =>
      window.addEventListener(evt, () => this.globalErrorHandler())
    );
  }
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
  z-index: var(--z-index-footer, 1000);
}

.footer a {
  margin: 2px;
  opacity: 0.8;
  text-decoration: none;
  color: var(--color-text);
  transition: opacity 0.2s ease;
}

.footer a:hover {
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
  z-index: var(--z-index-refresh-overlay, 1000);
  pointer-events: none; /* Allow clicks to pass through */
  background-color: rgba(0, 0, 0, 0.5);
}

.centered-refresh-icon {
  width: 60px;
  height: 60px;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.6));
}

.editing-mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editing-mode-status {
  color: #4caf50;
}
</style>
