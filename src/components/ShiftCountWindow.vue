<template>
  <section class="shift-counts-window">
    <h3 style="margin: 8px">Ilość zmian</h3>
    <div style="display: flex; flex-direction: row">
      <div style="display: flex; flex-direction: column">
        <h4 style="margin: 8px">Ratowniczki/cy</h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => p.ratownik)"
            :key="person.id"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong>
          </li>
        </ul>
      </div>
      <div style="display: flex; flex-direction: column">
        <h4 style="margin: 8px">Pielęgniarki/rze</h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => !p.ratownik)"
            v-bind:key="person.id"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong>
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
  flex-wrap: wrap;
  font-size: 16px;
  line-height: 2.4ch;
  margin: 0 0 10px 0;
  list-style: none;
}
.shift-counts-window {
  width: max(18%, 310px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  align-self: center;
}
</style>
