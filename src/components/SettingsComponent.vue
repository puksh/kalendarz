<template>
  <div class="about">
    <h1>Settings</h1>
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
      isEditingMode: false, // default value
    };
  },
  methods: {
    updateEditingMode() {
      this.$emit("update-editing-mode", this.isEditingMode);
    },
  },
};
</script>

<style scoped>
.glass-toggle {
  display: inline-flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
  gap: 12px;
}

.glass-toggle input {
  display: none;
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
