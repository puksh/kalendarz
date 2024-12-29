<template>
  <section class="shift-counts-window">
    <h3>Ilość zmian</h3>
    <div style="display: flex; flex-direction: row">
      <div style="display: flex; flex-direction: column">
        <h4>Ratowniczki/cy</h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => p.ratownik)"
            :key="person.id"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong> zmian/a
          </li>
        </ul>
      </div>
      <div style="display: flex; flex-direction: column">
        <h4>Pielęgniarki/rze</h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => !p.ratownik)"
            v-bind:key="person.id"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong> zmian/a
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "ShiftCountWindow",
  props: {
    people: {
      type: Array,
      required: true,
    },
    monthDays: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped>
.shift-counts {
  gap: var(--spacing-small);
  flex-wrap: wrap;
}
.shift-counts-window {
  width: 40% 600px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  align-self: center;
  padding: var(--spacing-medium);
}
</style>
