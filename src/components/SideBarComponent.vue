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
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 88px;
  background-color: #3b1e54;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10; /* Ensures it stays on top of other content */
}

.sidebar-button {
  background-color: #eeeeee;
  color: #333;
  height: 66px;
  padding: 10px;
  font-size: 12px;
  border-radius: 8px;
  cursor: pointer;
  border-color: #3b1e54;
  border-width: 1px;
  transition: all 0.3s ease;
  font-weight: bold;
}
.sidebar-button:hover {
  background-color: #9b7ebd;
  color: #222;
  border-color: #9b7ebd;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transform: scale(1.05) ease;
}

.sidebar-button:active {
  background-color: #562b7a;
  color: #111;
  border-color: #562b7a;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  transform: scale(0.95) ease;
}
/* Mobile styling: Move sidebar to the bottom */
@media (max-width: 900px) {
  .sidebar {
    background-color: transparent;
    position: fixed;
    left: 0;
    bottom: 33px;
    top: auto; /* Remove top alignment */
    width: 100%;
    height: 33px;
    flex-direction: row;
    justify-content: space-around;
    z-index: 10;
    box-sizing: border-box; /* Include scrollbar in width calculation */
  }

  .sidebar-button {
    height: 39px;
    border-color: #3b1e54;
    border-width: 1px;
    flex: 1 1 33.33%; /* Make all buttons one-third of the width */
    font-size: 14px;
    padding: 0px;
    margin: 0 auto;
  }
}
</style>
