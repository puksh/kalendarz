<template>
  <button
    v-if="currentComponent === 'ExcelComponent'"
    @click="$emit('navigate', 'CalendarComponent')"
    class="switch-view-button"
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
      stroke-width="3"
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
    class="switch-view-button"
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
      stroke-width="3"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
    Tabela
  </button>
</template>

<script lang="ts">
export default {
  name: 'ButtonSwitchView',
  props: {
    currentComponent: {
      type: String,
      required: true,
      validator: (value: string) =>
        ['CalendarComponent', 'ExcelComponent'].includes(value)
    }
  }
};
</script>

<style scoped>
.switch-view-button {
  display: flex;
  align-items: center;
  position: fixed;
  left: 4px;
  top: 12px;
  gap: 6px;
  background: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color);
  color: var(--color-text);
  height: 36px;
  border-radius: var(--border-radius-small);
  font-size: 14px;
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  z-index: var(--z-index-button-switch-view);
}

@media not all and (hover: none) {
  .switch-view-button:active {
    background-color: rgba(0, 200, 200, 0.3);
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.3);
    transform: translateY(1px);
  }
  .switch-view-button:hover {
    background-color: rgba(0, 200, 200, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .switch-view-button:hover svg {
    transform: scale(1.1);
  }
}

.switch-view-button svg {
  transition: transform 0.2s ease;
}
</style>
