<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    "
  >
    <h1>Ustawienia</h1>
    <label class="glass-toggle">
      <input
        type="checkbox"
        v-model="isEditingMode"
        @change="updateEditingMode"
      />
      <span class="toggle-slider"></span>
      <span class="label-text">Tryb edytowania</span>
    </label>
  </div>
</template>

<script>
export default {
  name: "SettingsComponent",
  data() {
    return {
      isEditingMode: JSON.parse(localStorage.getItem("isEditingMode")) || false, // Load initial value from localStorage
    };
  },
  methods: {
    updateEditingMode() {
      localStorage.setItem("isEditingMode", JSON.stringify(this.isEditingMode)); // Sync with localStorage
      this.$emit("update-editing-mode", this.isEditingMode); // Notify parent of the change
    },
  },
};
</script>

<style scoped>
h1 {
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius-small);
  filter: drop-shadow(var(--shadow-drop));
  box-shadow: var(--glass-box-shadow);
  width: auto;
  padding: var(--spacing-medium);
}
.glass-toggle {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}

.glass-toggle input {
  position: absolute;
  opacity: 0; /* Keeps the input accessible but invisible */
  width: 0;
  height: 0;
}

.glass-toggle .toggle-slider {
  width: 50px;
  height: 25px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  border: 2px solid var(--glass-border-color);
  border-radius: 15px;
  box-shadow: var(--glass-box-shadow);
  position: relative;
  transition: background 0.3s, transform 0.3s;
}

.glass-toggle .toggle-slider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 4px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: var(--shadow-drop);
  transition: transform 0.3s;
}

.glass-toggle input:checked + .toggle-slider {
  background: rgba(0, 128, 255, 0.4); /* A subtle blue glow when checked */
}

.glass-toggle input:checked + .toggle-slider::before {
  transform: translateY(-50%) translateX(24px);
}

.glass-toggle .label-text {
  font-size: 1rem;
  color: white;
  text-shadow: var(--shadow-modal);
}
</style>
