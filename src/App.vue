<template>
  <div class="app-container">
    <SideBarComponent @navigate="handleNavigation" />
    <main class="main-content">
      <CalendarComponent v-if="currentPage === 'CalendarComponent'" />
      <AboutComponent v-if="currentPage === 'AboutComponent'" />
      <SettingsComponent v-if="currentPage === 'SettingsComponent'" />
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
* {
  font-family: "IBMPlexMono", monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  image-rendering: pixelated;
}
body::-webkit-scrollbar {
  display: none; /* Hide scrollbar on Chrome, Safari */
}
.app-container {
}

.main-content {
  padding: 20px;
  max-width: 1600px;
  text-align: center;
  overflow-x: visible !important;
  overflow-y: hidden;
}
</style>
