<template>
  <div class="app-container">
    <SideBarComponent
      :currentComponent="currentPage"
      @navigate="handleNavigation"
    />
    <main class="main-content">
      <CalendarComponent
        v-if="currentPage === 'CalendarComponent'"
        :isEditingMode="isEditingMode"
        @update-editing-mode="updateEditingMode"
      />
      <ExcelComponent
        v-if="currentPage === 'ExcelComponent'"
        :isEditingMode="isEditingMode"
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
  },
  data() {
    return {
      currentPage: "CalendarComponent",
      isEditingMode: JSON.parse(localStorage.getItem("isEditingMode")) || false, // Shared editing mode state
    };
  },
  methods: {
    handleNavigation(section) {
      this.currentPage = section;
    },
    updateEditingMode(newMode) {
      this.isEditingMode = newMode;
      localStorage.setItem("isEditingMode", JSON.stringify(newMode)); // Persist state
    },
  },
  mounted() {
    const isEditingMode =
      JSON.parse(localStorage.getItem("isEditingMode")) || false;
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
