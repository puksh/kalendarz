<template>
  <teleport to="body">
    <div v-if="show" class="mobile-warning-overlay">
      <div class="mobile-warning">
        <h3>{{ MESSAGES.MOBILE_WARNING_TITLE }}</h3>
        <p>{{ MESSAGES.MOBILE_WARNING_TEXT }}</p>
        <p>{{ MESSAGES.MOBILE_WARNING_INSTRUCTION }}</p>
        <button @click="$emit('close')" class="warning-button">
          {{ MESSAGES.MOBILE_WARNING_OK_BUTTON }}
        </button>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { MESSAGES } from '@/constants/messages';

export default {
  name: 'MobileWarningModal',
  props: {
    show: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close'],
  setup() {
    return {
      MESSAGES
    };
  }
};
</script>

<style scoped>
.mobile-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: var(--z-index-modal);
}

.mobile-warning {
  background-color: var(--glass-bg-color);
  color: var(--color-text);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  border-radius: 8px;
  padding: 20px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.mobile-warning h3 {
  color: #ff5252;
  margin-top: 0;
}

.mobile-warning p {
  margin: 15px 0;
}

.warning-button {
  background-color: #4caf50;
  color: var(--color-text);
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  margin-top: 10px;
  cursor: pointer;
}
</style>
