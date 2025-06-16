<template>
  <button
    :disabled="!canSave"
    @click="$emit('save')"
    class="submit-button"
    :aria-label="MESSAGES.SAVE_CHANGES"
    :title="MESSAGES.SAVE_CHANGES"
  >
    {{ MESSAGES.SAVE_BUTTON_TEXT }}
  </button>
</template>

<script>
import { MESSAGES } from '@/constants/messages';

export default {
  name: 'SubmitButton',
  props: {
    canSave: {
      type: Boolean,
      required: true
    }
  },
  emits: ['save'],
  data() {
    return {
      MESSAGES
    };
  }
};
</script>

<style scoped>
.submit-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: var(--border-radius-small);
  filter: drop-shadow(var(--shadow-drop));
  box-shadow: var(--glass-box-shadow);
  padding: var(--spacing-medium) var(--spacing-large);
  cursor: pointer;
  font-size: var(--font-size-large);
  transition: all 0.3s ease;
  z-index: var(--z-index-submit-button);
}

.submit-button:disabled {
  background-color: var(--color-button-disabled-bg);
  cursor: not-allowed;
  filter: none;
  visibility: hidden;
}
</style>
