<template>
  <div class="app-container">
    <SideBarComponent @navigate="handleNavigation" />
    <main class="main-content">
      <CalendarComponent v-if="currentPage === 'CalendarComponent'" />
      <AboutComponent v-if="currentPage === 'AboutComponent'" />
      <SettingsComponent v-if="currentPage === 'SettingsComponent'" />
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
    };
  },
  methods: {
    handleNavigation(section) {
      this.currentPage = section;
    },
  },
};
</script>

<style>
.main-content {
  padding: 20px;
  max-width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>
