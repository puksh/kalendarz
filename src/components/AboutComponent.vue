<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 20px;
      align-items: center;
    "
  >
    <h1>Info</h1>
  </div>
</template>

<script>
export default {
  name: "AboutComponent",
  methods: {},
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
</style>
