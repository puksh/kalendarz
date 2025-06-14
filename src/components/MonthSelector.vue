<!-- filepath: c:\Users\PIuksha\GitHub\vueCalendar\src\components\MonthSelector.vue -->
<template>
  <section class="monthChange">
    <button
      class="buttonMonthChange prev-month"
      @click="handleMonthChange(-1)"
      aria-label="Poprzedni miesiąc"
      title="Idź do poprzedniego miesiąca"
    >
      &#8249;
    </button>
    <span :class="{ changing: isChanging }" role="heading" aria-level="2">
      {{ formattedMonthYear }}
    </span>
    <button
      class="buttonMonthChange next-month"
      @click="handleMonthChange(1)"
      aria-label="Następny miesiąc"
      title="Idź do następnego miesiąca"
    >
      &#8250;
    </button>
  </section>
</template>

<script lang="ts">
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
      isChanging: false
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
    }
  },
  mounted() {
    // Add keyboard event listener when component mounts
    document.addEventListener('keydown', this.handleKeyDown);
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
          event.preventDefault();
          this.handleMonthChange(-1);
          break;
        case 'ArrowRight':
        case '>':
          event.preventDefault();
          this.handleMonthChange(1);
          break;
        case 'PageUp':
          event.preventDefault();
          this.handleMonthChange(-1);
          break;
        case 'PageDown':
          event.preventDefault();
          this.handleMonthChange(1);
          break;
        case 'ArrowUp':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.handleMonthChange(12); // Previous year
          }
          break;
        case 'ArrowDown':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            this.handleMonthChange(-12); // Next year
          }
          break;
      }
    },
    handleMonthChange(delta) {
      if (this.hasUnsavedChanges) {
        const confirmSwitch = confirm(
          'Masz niezapisane zmiany. Czy na pewno chcesz zmienić miesiąc? Twoje zmiany zostaną utracone.'
        );

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
</style>
