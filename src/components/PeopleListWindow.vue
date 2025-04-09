<template>
  <section class="people-list">
    <!-- People List Section -->
    <h3 style="font-weight: bold">Zespół</h3>
    <div>
      <!-- Ratownik List -->
      <h4>Ratowniczki/cy</h4>
      <div class="person-lists">
        <div
          v-for="person in people.filter((p) => p.ratownik)"
          :key="person.id"
          class="person-item ratownik"
          :class="{ draggable: isEditingMode }"
          :style="{
            borderRadius: isEditingMode ? 'var(--border-radius)' : '0',
          }"
          :draggable="isEditingMode"
          @dragstart="isEditingMode ? startDrag(person) : null"
          @dragend="handleDragEnd"
          @touchstart.prevent="$emit('touchstart', $event, person)"
          @touchend.prevent="$emit('touchend', $event)"
          @touchmove.prevent="$emit('touchmove', $event)"
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
          :class="{ draggable: isEditingMode }"
          :style="{
            borderRadius: isEditingMode ? 'var(--border-radius)' : '0',
          }"
          :draggable="isEditingMode"
          @dragstart="isEditingMode ? startDrag(person) : null"
          @touchstart.prevent="$emit('touchstart', $event, person)"
          @touchend.prevent="$emit('touchend', $event)"
          @touchmove.prevent="$emit('touchmove', $event)"
        >
          {{ person.name }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "PeopleListWindow",
  props: {
    people: {
      type: Array,
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
    };
  },
  methods: {
    startDrag(person) {
      localStorage.setItem("draggedPerson", JSON.stringify(person));
    },
    startTouchDrag(person, event) {
      this.draggedPerson = person;
      localStorage.setItem("draggedPerson", JSON.stringify(person));
      event.target.classList.add("dragging");
      document.body.style.overflow = "hidden"; // Disable scrolling
    },
    handleDragEnd() {
      localStorage.removeItem("draggedPerson");
    },
  },
};
</script>

<style scoped>
.people-list {
  width: max(33%, 651px);
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  align-self: center;
  margin: 10px 0;
  line-height: 1ch;
}

.person-lists {
  gap: var(--spacing-small);
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  text-wrap: wrap;
  margin: var(--spacing-small) auto;
}
@media (max-width: 768px) {
  .people-list {
    width: 90%;
  }
}
/* Individual draggable people items */
.person-item {
  padding: 1ch;
  width: auto 30%;
  color: var(--color-text-dark);
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  font-weight: bold;
  transition:
    transform 0.2s ease,
    border-radius 0.2s ease;
  user-select: none;
  line-height: 2ch;
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
  background-color: var(--color-highlight);
}
.shift-slot.touch-hover {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px dashed #4caf50;
}
/* Add touch feedback styles */
@media (hover: none) {
  .person-item:active {
    opacity: 0.7;
    transform: scale(1.05);
  }

  .shift-slot:active {
    background-color: rgba(76, 175, 80, 0.2);
  }
}
</style>
