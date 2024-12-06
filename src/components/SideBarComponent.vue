<template>
  <aside class="sidebar">
    <button @click="navigateTo('CalendarComponent')" class="sidebar-button">
      Calendar
    </button>
    <button @click="navigateTo('AboutComponent')" class="sidebar-button">
      About
    </button>
    <button @click="navigateTo('SettingsComponent')" class="sidebar-button">
      Settings
    </button>
  </aside>
</template>

<script>
export default {
  name: "SideBarComponent",
  methods: {
    navigateTo(section) {
      this.$emit("navigate", section); // Emit navigation events to parent
    },
  },
};
</script>

<style scoped>
:root {
  /* Sidebar Variables */
  --sidebar-bg-color: #3b1e54;
  --sidebar-padding: 10px;
  --sidebar-z-index: 10;

  /* Button Variables */
  --button-bg-color: #eeeeee;
  --button-text-color: #333;
  --button-hover-bg-color: #9b7ebd;
  --button-hover-text-color: #222;
  --button-hover-border-color: #9b7ebd;
  --button-active-bg-color: #562b7a;
  --button-active-text-color: #111;
  --button-active-border-color: #562b7a;
  --button-height: 39px;
  --button-border-radius: 8px;
  --button-font-size: 14px;
  --button-font-weight: bold;
  --button-transition: all 0.3s ease;

  /* Box Shadows */
  --box-shadow-hover: 0 0 5px rgba(0, 0, 0, 0.1);
  --box-shadow-active: inset 0 0 5px rgba(0, 0, 0, 0.2);
}

.sidebar {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  background-color: var(--sidebar-bg-color);
  padding: var(--sidebar-padding);
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  z-index: var(
    --sidebar-z-index
  ); /* Ensures it stays on top of other content */
}

.sidebar-button {
  background-color: var(--button-bg-color);
  color: var(--button-text-color);
  height: var(--button-height);
  border: 1px solid var(--sidebar-bg-color);
  flex: 1 1 33.33%; /* Make all buttons one-third of the width */
  font-size: var(--button-font-size);
  padding: 0;
  margin: 0 auto;
  cursor: pointer;
  border-radius: var(--button-border-radius);
  transition: var(--button-transition);
  font-weight: var(--button-font-weight);
}

.sidebar-button:hover {
  background-color: var(--button-hover-bg-color);
  color: var(--button-hover-text-color);
  border-color: var(--button-hover-border-color);
  box-shadow: var(--box-shadow-hover);
  transform: scale(1.05);
}

.sidebar-button:active {
  background-color: var(--button-active-bg-color);
  color: var(--button-active-text-color);
  border-color: var(--button-active-border-color);
  box-shadow: var(--box-shadow-active);
  transform: scale(0.95);
}
</style>
