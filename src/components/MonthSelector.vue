<!-- filepath: c:\Users\PIuksha\GitHub\vueCalendar\src\components\MonthSelector.vue -->
<template>
  <section class="monthChange">
    <button
      class="buttonMonthChange"
      @click="handleMonthChange(-1)"
      aria-label="Poprzedni miesiąc"
      title="Idź do poprzedniego miesiąca"
    >
      &#8249;
    </button>
    <span
      style="
        font-weight: bold;
        width: 144px !important;
        color: var(--color-text-dark);
      "
      role="heading"
      aria-level="2"
    >
      {{ formattedMonthYear }}
    </span>
    <button
      class="buttonMonthChange"
      @click="handleMonthChange(1)"
      aria-label="Następny miesiąc"
      title="Idź do następnego miesiąca"
    >
      &#8250;
    </button>
  </section>
</template>

<script>
export default {
  name: "MonthSelector",
  props: {
    currentMonth: {
      type: Number,
      required: true,
    },
    currentYear: {
      type: Number,
      required: true,
    },
    locale: {
      type: String,
      default: "pl",
    },
    hasUnsavedChanges: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedMonthYear() {
      return new Date(this.currentYear, this.currentMonth)
        .toLocaleString(this.locale, {
          month: "long",
          year: "numeric",
        })
        .toUpperCase();
    },
  },
  methods: {
    handleMonthChange(delta) {
      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(
          "Masz niezapisane zmiany. Czy na pewno chcesz zmienić miesiąc? Twoje zmiany zostaną utracone.",
        );

        if (!confirmSwitch) {
          return; // Cancel the month change
        }

        // User confirmed discarding changes
        this.$emit("discard-changes"); // Signal parent to discard changes
      }

      // Emit the month change event with delta
      this.$emit("change-month", delta);
    },
  },
};
</script>

<style scoped>
.monthChange {
  position: fixed;
  top: 0;
  left: 0;
  padding: 1ch 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  z-index: 1000;
  height: 44px;
}

.buttonMonthChange {
  color: var(--color-text-dark);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: xx-large;
  transition: background-color 0.3s ease;
  padding-bottom: var(--spacing-small);
  line-height: 16px;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.buttonMonthChange:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: scale(1.05);
}

.buttonMonthChange:focus {
  outline: 2px solid var(--color-focus-ring, #4caf50);
  outline-offset: 2px;
}

.buttonMonthChange:active {
  transform: scale(0.95);
}
</style>
