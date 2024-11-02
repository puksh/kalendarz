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
  scrollbar-width: none;
}
body::-webkit-scrollbar {
  display: none; /* Hide scrollbar on Chrome, Safari */
}
.app-container {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  padding-left: 88px;
}

.main-content {
  flex: 1;
  padding: 20px;
  max-width: 800px;
  text-align: center;
  border-left: 4px solid transparent;
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
  overflow: visible;
}
/* Remove left padding on smaller screens */
@media (max-width: 900px) {
  .app-container {
    padding-left: 0;
    height: auto;
  }

  .main-content {
    padding-bottom: 60px; /* Offset for bottom-positioned sidebar */
  }
}
</style>
