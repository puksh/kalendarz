<template>
  <div class="app-container">
    <SideBarComponent @navigate="handleNavigation" />
    <main class="main-content">
      <CalendarComponent v-if="currentPage === 'CalendarComponent'" />
      <ExcelComponent v-if="currentPage === 'ExcelComponent'" />
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
    };
  },
  methods: {
    handleNavigation(section) {
      this.currentPage = section;
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
