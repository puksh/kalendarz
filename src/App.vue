<template>
  <div class="app-container">
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
    />
    <main class="main-content">
      <CalendarComponent
        v-if="currentPage === 'CalendarComponent'"
        :isEditingMode="isEditingMode"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        @update-editing-mode="updateEditingMode"
      />
      <ExcelComponent
        v-if="currentPage === 'ExcelComponent'"
        :isEditingMode="isEditingMode"
        :selectedMonth="selectedMonth"
        :selectedYear="selectedYear"
        @update-editing-mode="updateEditingMode"
      />
      <NotificationMessage />
    </main>
  </div>
  <footer class="footer">
    <p>© 2025 puksh - All rights reserved</p>
  </footer>
</template>

<script>
import { defineAsyncComponent } from "vue";
import MonthSelector from "./components/MonthSelector.vue";

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
    MonthSelector,
  },
  data() {
    return {
      currentPage: "CalendarComponent",
      isEditingMode: JSON.parse(localStorage.getItem("isEditingMode")) || false, // Shared editing mode state

      selectedMonth: new Date().getMonth(), //MonthSelector
      selectedYear: new Date().getFullYear(), //MonthSelector
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
      //MonthSelector
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
    updateEditingMode(newMode) {
      this.isEditingMode = newMode;
      localStorage.setItem("isEditingMode", JSON.stringify(newMode)); // Persist state
    },
    updateUnsavedChanges(hasChanges) {
      this.hasUnsavedChanges = hasChanges;
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
