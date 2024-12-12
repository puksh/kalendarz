<template>
  <div class="app-container">
    <SideBarComponent @navigate="handleNavigation" />
    <main class="main-content">
      <CalendarComponent v-if="currentPage === 'CalendarComponent'" />
      <CalendarStaticComponent
        v-if="currentPage === 'CalendarStaticComponent'"
      />
      <AboutComponent v-if="currentPage === 'AboutComponent'" />
      <SettingsComponent
        v-if="currentPage === 'SettingsComponent'"
        @update-editing-mode="setEditingMode"
      />
      <NotificationMessage />
    </main>
  </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
export default {
  name: "VueCalendar",
  components: {
    CalendarComponent: defineAsyncComponent(() =>
      import("./components/CalendarComponent.vue")
    ),
    CalendarStaticComponent: defineAsyncComponent(() =>
      import("./components/CalendarStaticComponent.vue")
    ),
    SideBarComponent: defineAsyncComponent(() =>
      import("./components/SideBarComponent.vue")
    ),
    AboutComponent: defineAsyncComponent(() =>
      import("./components/AboutComponent.vue")
    ),
    SettingsComponent: defineAsyncComponent(() =>
      import("./components/SettingsComponent.vue")
    ),
    NotificationMessage: defineAsyncComponent(() =>
      import("./components/NotificationMessage.vue")
    ),
  },
  data() {
    return {
      currentPage: "CalendarComponent",
      isEditingMode: false, // default value
    };
  },
  methods: {
    handleNavigation(section) {
      this.currentPage = section;
    },
    setEditingMode(isEditingMode) {
      this.isEditingMode = isEditingMode;
      if (
        this.currentPage === "CalendarStaticComponent" ||
        this.currentPage === "CalendarComponent"
      ) {
        // Update the current page based on editing mode
        this.currentPage = isEditingMode
          ? "CalendarComponent"
          : "CalendarStaticComponent";
      }
    },
  },
  mounted() {
    // Set the initial page based on editing mode
    this.currentPage = this.isEditingMode
      ? "CalendarComponent"
      : "CalendarStaticComponent";
  },
};
</script>

<style scoped>
.main-content {
  padding: 20px;
  max-width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
