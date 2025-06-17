<template>
  <div v-show="isEditingMode" class="editing-mode-container">
    <h1 v-show="currentPage === 'CalendarComponent'" class="editing-mode-label">
      Tryb edytowania
      <a class="editing-mode-status">Włączony</a><br />
      Przeciągaj członków zespołu na miejsca w grafiku.<br />Kliknij na zajętą
      zmianę, aby ją wyczyścić.
    </h1>
    <h1 v-show="currentPage === 'ExcelComponent'" class="editing-mode-label">
      Tryb edytowania
      <a class="editing-mode-status">Włączony</a><br />
      Kliknij na miejsce w tabeli, aby wybrać zmianę.
    </h1>
  </div>
</template>

<script>
export default {
  name: 'EditingModeContainer',
  props: {
    isEditingMode: {
      type: Boolean,
      required: true
    },
    currentPage: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.editing-mode-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.editing-mode-status {
  color: #4caf50;
}
.editing-mode-label {
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius-small);
  filter: drop-shadow(var(--shadow-drop));
  color: var(--color-text);
  font-size: 16px;
  padding: var(--spacing-medium);
  text-align: center;
}
</style>
