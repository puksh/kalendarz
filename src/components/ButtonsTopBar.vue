<template>
  <nav class="buttons-top-bar">
    <!-- Fixed visible section -->
    <div class="fixed-buttons">
      <!-- Hamburger menu button -->
      <button
        v-if="isMobileView"
        class="hamburger-menu"
        @click="isMenuOpen = !isMenuOpen"
        :class="{ 'is-open': isMenuOpen }"
        :aria-expanded="isMenuOpen"
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Always visible month selector -->
      <MonthSelector
        :currentMonth="currentMonth"
        :currentYear="currentYear"
        :locale="locale"
        :hasUnsavedChanges="hasUnsavedChanges"
        @change-month="$emit('change-month', $event)"
        @discard-changes="$emit('discard-changes')"
      />
    </div>

    <!-- Collapsible buttons container -->
    <div
      :class="[
        'collapsible-buttons',
        {
          'menu-open': isMenuOpen && isMobileView,
          'mobile-view': isMobileView,
          'desktop-view': !isMobileView
        }
      ]"
    >
      <button
        :disabled="!canSave"
        @click="$emit('save')"
        class="submit-button"
        aria-label="Zapisz zmiany"
        title="Zapisz zmiany w harmonogramie"
      >
        Zapisz
      </button>

      <ButtonSwitchView
        :currentComponent="currentComponent"
        @navigate="$emit('navigate', $event)"
      />

      <div class="right-buttons" :class="{ 'mobile-view': isMobileView }">
        <button
          class="top-right-buttons buttonRefresh"
          @click="$emit('refresh')"
          aria-label="Odśwież harmonogram"
          title="Odśwież harmonogram"
        >
          <refresh-icon :class="{ refreshing: isRefreshing }" />
        </button>

        <label
          class="top-right-buttons compact-toggle"
          title="Przełącz tryb edytowania"
        >
          <input
            type="checkbox"
            :checked="isEditingMode"
            @change="
              $emit('toggle-edit', ($event.target as HTMLInputElement).checked)
            "
            aria-label="Przełącz tryb edytowania"
          />
          <PencilIcon :isEditing="isEditingMode" />
        </label>

        <ButtonExport
          v-bind="$attrs"
          :people="people"
          :monthDays="monthDays"
          :selectedMonth="currentMonth"
          :selectedYear="currentYear"
          :current-page="currentComponent"
        />
        <ButtonImport
          :isEditingMode="isEditingMode"
          :people="people"
          :monthDays="monthDays"
          @has-changes="$emit('has-changes', $event)"
          @cells-imported="$emit('cells-imported', $event)"
        />
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ButtonSwitchView from './ButtonSwitchView.vue';
import PencilIcon from './PencilIcon.vue';
import RefreshIcon from './icons/RefreshIcon.vue';
import ButtonExport from './ButtonExport.vue';
import ButtonImport from './ButtonImport.vue';
import MonthSelector from './MonthSelector.vue';

export default defineComponent({
  name: 'ButtonsTopBar',
  components: {
    ButtonSwitchView,
    PencilIcon,
    RefreshIcon,
    ButtonExport,
    ButtonImport,
    MonthSelector
  },
  props: {
    canSave: Boolean,
    currentComponent: String,
    currentMonth: Number,
    currentYear: Number,
    locale: String,
    hasUnsavedChanges: Boolean,
    isEditingMode: Boolean,
    isRefreshing: Boolean,
    people: Array,
    monthDays: Array
  },
  data() {
    return {
      isMenuOpen: false,
      isMobileView: false
    };
  },
  methods: {
    checkMobileView() {
      this.isMobileView = window.innerWidth <= 768;
      if (!this.isMobileView) {
        this.isMenuOpen = false;
      }
    }
  },
  mounted() {
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobileView);
  }
});
</script>

<style scoped>
.buttons-top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  z-index: var(--z-index-topbar);
  padding: 8px;
  height: 48px;
  border-bottom: 1px solid var(--glass-border-color);
}

.fixed-buttons {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.collapsible-buttons {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.right-buttons {
  display: flex;
  gap: 8px;
}

.hamburger-menu {
  display: none;
  position: fixed;
  top: 12px;
  left: 4px;
  z-index: var(--z-index-hamburger);
  padding: 10px;
  background: var(--glass-bg-color-opaque);
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  width: 36px;
  height: 36px;
}

.hamburger-menu span {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--color-text);
  position: absolute;
  left: 8px;
}

.hamburger-menu span:nth-child(1) {
  top: 8px;
}
.hamburger-menu span:nth-child(2) {
  top: 16px;
}
.hamburger-menu span:nth-child(3) {
  top: 24px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .buttons-top-bar {
    border-bottom: none;
  }

  .buttons-top-bar:not(:has(.collapsible-buttons.menu-open)) {
    border-bottom: 1px solid var(--glass-border-color);
  }

  .fixed-buttons {
    position: relative;
    z-index: var(--z-index-hamburger);
    justify-content: space-between;
    padding: 0 10px;
  }

  .hamburger-menu {
    display: flex;
    flex-direction: column;
    order: -1;
  }

  .collapsible-buttons.mobile-view {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    z-index: var(--z-index-mobile-menu);
    flex-direction: column;
    background: var(--glass-bg-color);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    padding: 16px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: top;
    transform: perspective(1000px) rotateX(-90deg);
    opacity: 0;
    visibility: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--glass-border-color);
  }

  .collapsible-buttons.mobile-view.menu-open {
    transform: perspective(1000px) rotateX(0);
    opacity: 1;
    visibility: visible;
  }

  .right-buttons.mobile-view {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
}

/* Desktop Styles */
.collapsible-buttons.desktop-view {
  opacity: 1;
  visibility: visible;
  transform: none;
}
</style>
