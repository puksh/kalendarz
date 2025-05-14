<template>
  <section class="people-list">
    <!-- People List Section -->
    <h3 style="font-weight: bold">Zespół</h3>
    <div class="people-list-content">
      <!-- Ratownik List -->
      <h4>Ratowniczki/cy</h4>
      <div class="person-lists">
        <div
          v-for="person in people.filter((p) => p.ratownik)"
          :key="person.id"
          class="person-item ratownik"
          :class="{
            draggable: isEditingMode,
            'being-touched': touchedPerson?.id === person.id,
          }"
          :style="{
            borderRadius: isEditingMode ? 'var(--border-radius)' : '0',
          }"
          :draggable="isEditingMode"
          @dragstart="isEditingMode ? startDrag(person) : null"
          @dragend="handleDragEnd"
        >
          {{ person.name }}
        </div>
      </div>

      <!-- Non-Ratownik List -->
      <h4>Pielęgniarki/rze</h4>
      <div class="person-lists">
        <div
          v-for="person in people.filter((p) => !p.ratownik)"
          :key="person.id"
          class="person-item pielegniarka"
          :class="{
            draggable: isEditingMode,
            'being-touched': touchedPerson?.id === person.id,
          }"
          :style="{
            borderRadius: isEditingMode ? 'var(--border-radius)' : '0',
          }"
          :draggable="isEditingMode"
          @dragstart="isEditingMode ? startDrag(person) : null"
        >
          {{ person.name }}
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: "PeopleListWindow",
  props: {
    people: {
      type: Array as () => { id: number; name: string; ratownik: boolean }[],
      required: true,
    },
    isEditingMode: {
      type: Boolean,
      required: true, // Ensure the parent always provides this prop
    },
  },
  data() {
    return {
      draggedPerson: null,
      touchedPerson: null,
      touchStartTime: 0,
      touchTimer: null,
      isDragging: false,
    };
  },
  methods: {
    startDrag(person) {
      localStorage.setItem("draggedPerson", JSON.stringify(person));
    },
    handleDragEnd() {
      localStorage.removeItem("draggedPerson");
    },
  },
};
</script>

<style scoped>
.people-list {
  width: 405px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  align-self: center;
  margin: 10px 0;
  line-height: 1ch;
  box-sizing: border-box;
  contain: layout paint;
  color: var(--color-text);
}

.person-lists {
  gap: var(--spacing-small);
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  text-wrap: wrap;
  margin: var(--spacing-small) auto;
  color: var(--color-text);
}
/* Individual draggable people items */
.person-item {
  min-height: 8px;
  min-width: 46px;
  padding: 1ch;
  width: auto 30%;
  color: var(--color-text);
  border: 1px solid var(--glass-border-color);
  font-weight: bold;
  transition:
    transform 0.2s ease,
    border-radius 0.2s ease;
  user-select: none;
  line-height: 1.5ch;
  touch-action: none; /* Prevents browser handling of touch events */
  user-select: none; /* Prevents text selection during touch */
}
.person-item:draggable {
  cursor: grab;
}
.person-item.draggable:hover {
  cursor: grabbing;
  transform: scale(1.1);
  transition: transform 0.2s ease; /* Smooth transition */
}
.person-item.being-touched {
  opacity: 0.7;
  transform: scale(1.05);
  background-color: rgba(76, 175, 80, 0.4);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.6);
}
.shift-slot.touch-hover {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px dashed #4caf50;
}
.touch-toast {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: var(--color-text);
  padding: 12px 24px;
  border-radius: 8px;
  z-index: var(--z-index-top-bar);
  font-size: 16px;
}
</style>
