<template>
  <div class="app-container">
    <SideBarComponent @navigate="handleNavigation" />
    <main class="main-content">
      <CalendarComponent v-if="currentPage === 'CalendarComponent'" 
        :isEditingMode="isEditingMode"
        @update-editing-mode="updateEditingMode"/>
      <ExcelComponent v-if="currentPage === 'ExcelComponent'" 
        :isEditingMode="isEditingMode"
        @update-editing-mode="updateEditingMode"/>
      <NotificationMessage />
    </main>
  </div>
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
  margin-bottom: 28px !important;
}
</style>
