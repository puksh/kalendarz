<template>
  <aside class="sidebar">
    <button
      v-if="currentComponent === 'ExcelComponent'"
      @click="$emit('navigate', 'CalendarComponent')"
      class="sidebar-button"
      title="Zmień widok na kalendarz"
      aria-label="Zmień widok na kalendarz"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="9" y1="4" x2="9" y2="22" />
      </svg>
      Kalendarz
    </button>
    <button
      v-else
      @click="$emit('navigate', 'ExcelComponent')"
      class="sidebar-button"
      title="Zmień widok na tabele"
      aria-label="Zmień widok na tabele"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="3" y1="15" x2="21" y2="15" />
        <line x1="9" y1="3" x2="9" y2="21" />
        <line x1="15" y1="3" x2="15" y2="21" />
      </svg>
      Tabela
    </button>
  </aside>
</template>

<script>
export default {
  name: "SideBarComponent",
  props: {
    currentComponent: {
      type: String,
      required: true,
      validator: (value) =>
        ["CalendarComponent", "ExcelComponent"].includes(value),
    },
  },
};
</script>

<style scoped>
.sidebar {
  position: absolute;
  left: 10px;
  top: 10px;
  z-index: 1001;
}

/* Sidebar button with glass effects */
.sidebar-button {
  display: flex;
  align-items: center;
  position: fixed;
  gap: 6px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  color: var(--color-text-dark);
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  box-shadow: var(--glass-box-shadow);
}

.sidebar-button:hover {
  background-color: #7fb9bd99;
  border-color: #7fb6bd99;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.sidebar-button:active {
  background-color: #2b717ab3;
  border-color: #2b6a7ab3;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
  transform: translateY(1px);
}

.sidebar-button svg {
  transition: transform 0.2s ease;
}

.sidebar-button:hover svg {
  transform: scale(1.1);
}
</style>
