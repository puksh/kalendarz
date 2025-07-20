<template>
  <div class="notification-container">
    <div
      v-for="notification in notifications"
      :key="notification.id"
      :class="['notification', notification.type]"
    >
      {{ notification.message }}
      <button
        @click="removeNotification(notification.id)"
        :aria-label="MESSAGES.CLOSE_NOTIFICATION"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          stroke="currentColor"
          stroke-width="2"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import { MESSAGES } from '@/constants';

const notifications = reactive([]);
let notificationId = 0;
export const addNotification = (message, type = 'blue', duration = 3000) => {
  const id = notificationId++;
  notifications.push({ id, message, type });
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};
export const removeNotification = (id) => {
  const index = notifications.findIndex(
    (notification) => notification.id === id
  );
  if (index !== -1) notifications.splice(index, 1);
};

export default {
  name: 'NotificationMessage',
  data() {
    return {
      MESSAGES
    };
  },
  setup() {
    return { notifications, removeNotification };
  }
};
</script>

<style scoped>
.notification-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: var(--z-index-top-bar);
  gap: 6px;
  max-width: 90%;
  width: 280px;
}

.notification {
  padding: 8px 12px;
  border-radius: var(--border-radius, 6px);
  color: white;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease forwards;
  border: none;
}

.notification button {
  background: none;
  border: none;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin-left: 8px;
  flex-shrink: 0;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.notification button:hover {
  opacity: 1;
  background: none;
}

@media (max-width: 900px) {
  .notification-container {
    bottom: 66px;
    width: 250px;
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.green {
  background-color: #4caf50;
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.4);
}

.red {
  background-color: #f44336;
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
}

.blue {
  background-color: #2196f3;
  box-shadow: 0 2px 8px rgba(33, 150, 243, 0.4);
}

.yellow {
  background-color: #ffc107;
  box-shadow: 0 2px 8px rgba(255, 193, 7, 0.4);
  color: #333;
}
</style>
