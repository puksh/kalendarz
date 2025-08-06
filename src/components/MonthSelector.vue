<template>
  <section class="monthChange">
    <button
      class="buttonMonthChange prev-month"
      @click="handleMonthChange(-1)"
      :disabled="!canGoToPrevious"
      :aria-label="MESSAGES.MONTH_PREVIOUS"
      :title="MESSAGES.MONTH_PREVIOUS_GO_TO"
    >
      &#8249;
    </button>
    <span :class="{ changing: isChanging }" role="heading" aria-level="2">
      {{ formattedMonthYear }}
    </span>
    <button
      class="buttonMonthChange next-month"
      @click="handleMonthChange(1)"
      :disabled="!canGoToNext"
      :aria-label="MESSAGES.MONTH_NEXT"
      :title="MESSAGES.MONTH_NEXT_GO_TO"
    >
      &#8250;
    </button>
  </section>
</template>

<script lang="ts">
import { MESSAGES } from '@/constants';

export default {
  name: 'MonthSelector',
  props: {
    currentMonth: {
      type: Number,
      required: true
    },
    currentYear: {
      type: Number,
      required: true
    },
    locale: {
      type: String,
      default: 'pl'
    },
    hasUnsavedChanges: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isChanging: false,
      MESSAGES,
      // Date range: October 2024 to September 2025
      minYear: 2024,
      minMonth: 10, // October (0-indexed)
      maxYear: 2025,
      maxMonth: 8 // September (0-indexed)
    };
  },
  computed: {
    formattedMonthYear() {
      return new Date(this.currentYear, this.currentMonth)
        .toLocaleString(this.locale, {
          month: 'long',
          year: 'numeric'
        })
        .toUpperCase();
    },
    canGoToPrevious() {
      const currentDate = new Date(this.currentYear, this.currentMonth);
      const minDate = new Date(this.minYear, this.minMonth);
      return currentDate > minDate;
    },
    canGoToNext() {
      const currentDate = new Date(this.currentYear, this.currentMonth);
      const maxDate = new Date(this.maxYear, this.maxMonth);
      return currentDate < maxDate;
    }
  },
  mounted() {
    // Add keyboard event listener when component mounts
    document.addEventListener('keydown', this.handleKeyDown);

    // Check if current date is within allowed range
    this.validateCurrentDate();
  },
  beforeUnmount() {
    // Remove keyboard event listener when component unmounts
    document.removeEventListener('keydown', this.handleKeyDown);
  },
  methods: {
    handleKeyDown(event) {
      // Check if user is typing in an input field
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA' ||
          (activeElement as HTMLElement).isContentEditable)
      ) {
        return; // Don't handle keyboard shortcuts when typing
      }

      switch (event.key) {
        case 'ArrowLeft':
        case '<':
          if (this.canGoToPrevious) {
            event.preventDefault();
            this.handleMonthChange(-1);
          }
          break;
        case 'ArrowRight':
        case '>':
          if (this.canGoToNext) {
            event.preventDefault();
            this.handleMonthChange(1);
          }
          break;
        case 'PageUp':
          if (this.canGoToPrevious) {
            event.preventDefault();
            this.handleMonthChange(-1);
          }
          break;
        case 'PageDown':
          if (this.canGoToNext) {
            event.preventDefault();
            this.handleMonthChange(1);
          }
          break;
        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            // Check if we can go back 12 months
            const targetDate = new Date(
              this.currentYear - 1,
              this.currentMonth
            );
            if (
              this.isDateInRange(
                targetDate.getFullYear(),
                targetDate.getMonth()
              )
            ) {
              event.preventDefault();
              this.handleMonthChange(-12); // Previous year
            }
          }
          break;
        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            // Check if we can go forward 12 months
            const targetDate = new Date(
              this.currentYear + 1,
              this.currentMonth
            );
            if (
              this.isDateInRange(
                targetDate.getFullYear(),
                targetDate.getMonth()
              )
            ) {
              event.preventDefault();
              this.handleMonthChange(12); // Next year
            }
          }
          break;
      }
    },
    validateCurrentDate() {
      const currentDate = new Date(this.currentYear, this.currentMonth);
      const maxDate = new Date(this.maxYear, this.maxMonth);

      // If current date is after September 2025, set to September 2025
      if (currentDate > maxDate) {
        const monthsDiff =
          (this.maxYear - this.currentYear) * 12 +
          (this.maxMonth - this.currentMonth);
        this.$emit('change-month', monthsDiff);
      }
    },
    isDateInRange(year, month) {
      const date = new Date(year, month);
      const minDate = new Date(this.minYear, this.minMonth);
      const maxDate = new Date(this.maxYear, this.maxMonth);
      return date >= minDate && date <= maxDate;
    },
    handleMonthChange(delta) {
      // Calculate the target month and year
      const targetDate = new Date(this.currentYear, this.currentMonth + delta);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();

      // Check if target date is within allowed range
      if (!this.isDateInRange(targetYear, targetMonth)) {
        return; // Don't allow navigation outside the range
      }

      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(MESSAGES.MONTH_CHANGE_UNSAVED);

        if (!confirmSwitch) {
          return; // Cancel the month change
        }

        // User confirmed discarding changes
        this.$emit('discard-changes'); // Signal parent to discard changes
      }
      this.isChanging = true;
      setTimeout(() => {
        this.isChanging = false;
      }, 300); // Match animation duration

      // Emit the month change event with delta
      this.$emit('change-month', delta);
    }
  }
};
</script>

<style scoped>
.monthChange {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  padding: 1ch 0;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: var(--z-index-month-selector);
  height: 44px;
}
.monthChange span {
  font-weight: bold;
  width: 144px !important;
  color: var(--color-text);
  transition: all 0.3s ease;
  display: inline-block;
  animation-duration: 0.3s;
  animation-fill-mode: both;
}
@keyframes textPulse {
  0% {
    filter: opacity(0);
  }
  100% {
    filter: opacity(1);
  }
}

/* Apply animation class programmatically */
.monthChange span.changing {
  animation-name: textPulse;
}
.buttonMonthChange {
  color: var(--color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: xx-large;
  transition: background-color 0.3s ease;
  padding-bottom: var(--spacing-small);
  line-height: 16px;
  transition:
    transform 0.2s ease,
    filter 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
  touch-action: manipulation;
}

@media not all and (hover: none) {
  .buttonMonthChange.prev-month:active {
    transform: translateX(-5px);
  }
  .buttonMonthChange.prev-month:hover {
    transform: translateX(-3px);
  }

  .buttonMonthChange.next-month:active {
    transform: translateX(5px);
  }
  .buttonMonthChange.next-month:hover {
    transform: translateX(3px);
  }
}
.buttonMonthChange:focus-visible {
  outline: 2px solid var(--color-focus-ring, #4caf50);
  outline-offset: 2px;
}

.buttonMonthChange:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
  filter: none !important;
}

.buttonMonthChange:disabled:hover,
.buttonMonthChange:disabled:active {
  transform: none !important;
  filter: none !important;
}
</style>
