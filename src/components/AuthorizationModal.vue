<template>
  <section v-if="show" class="modal">
    <div class="modal-content">
      <h3>Autoryzacja</h3>
      <p>Wpisz hasło aby zapisać zmiany:</p>
      <div class="input-container">
        <input
          :type="showPassword ? 'text' : 'password'"
          v-model="password"
          @keyup.enter="authorize"
          placeholder="Hasło..."
          autocomplete="current-password"
          ref="passwordInput"
        />
        <button
          type="button"
          class="toggle-password-button"
          @click="togglePasswordVisibility"
          :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
          :title="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
        >
          <span class="eye-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="white"
              stroke-width="2"
            >
              <!-- Eye shape (always visible) -->
              <g :class="{ 'eye-hidden': !showPassword }">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </g>

              <!-- Animated crossing line -->
              <line
                class="eye-slash"
                :class="{ 'eye-slash-hidden': showPassword }"
                x1="2"
                y1="2"
                x2="22"
                y2="22"
              ></line>
            </svg>
          </span>
        </button>
      </div>

      <div class="button-container">
        <button
          class="primary-button"
          @click="authorize"
          :disabled="isAuthorizing"
        >
          <span>{{ isAuthorizing ? "Weryfikacja..." : "Zapisz" }}</span>
          <span v-if="isAuthorizing" class="spinner"></span>
        </button>
        <button
          class="secondary-button"
          @click="cancel"
          :disabled="isAuthorizing"
        >
          Anuluj
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import NotificationMessage from "./NotificationMessage.vue";
import { addNotification } from "./NotificationMessage.vue";

export default {
  name: "AuthorizationModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["close", "authorized"],
  components: {
    NotificationMessage,
  },
  data() {
    return {
      password: "",
      isAuthorizing: false,
      showPassword: false,
    };
  },
  methods: {
    async authorize() {
      if (this.isAuthorizing) return;
      this.isAuthorizing = true;
      this.showPassword = false;

      try {
        // Password verification
        const PBKDF2 = await import("crypto-js/pbkdf2");
        const salt = import.meta.env.VITE_AUTH_SALT.toString();

        const iterations = 100000;
        const keySize = 256 / 32;
        const derivedKey = PBKDF2.default(this.password, salt, {
          keySize: keySize,
          iterations: iterations,
        }).toString();

        const storedHash = import.meta.env.VITE_AUTH_PASSWORD;

        if (derivedKey !== storedHash) {
          addNotification("Nieprawidłowe hasło", "red");
          this.password = "";
          this.isAuthorizing = false;
          return;
        }

        // Collect all data from localStorage except isEditingMode
        const collectedData = {};

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key !== "isEditingMode" && key !== "currentPage") {
            try {
              collectedData[key] = JSON.parse(localStorage.getItem(key));
            } catch {}
          }
        }

        if (Object.keys(collectedData).length === 0) {
          addNotification("Brak zmian do zapisania", "yellow");
          this.isAuthorizing = false;
          return;
        }

        // Encode and send to server
        const jsonString = JSON.stringify(collectedData);
        const blob = new Blob([jsonString], { type: "application/json" });
        const reader = new FileReader();

        const base64Data = await new Promise((resolve, reject) => {
          reader.onloadend = () =>
            resolve(reader.result.toString().split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        const response = await fetch("https://mc.kot.li/?key=shiftData.json", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "shiftData",
            value: base64Data,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        addNotification("Zmiany zapisano pomyślnie!", "green");
        this.$emit("authorized");
        this.closeModal();
      } catch (error) {
        console.error(error);
        addNotification("Nie udało się zaktualizować danych", "red");
      } finally {
        this.isAuthorizing = false;
      }
    },

    closeModal() {
      this.password = "";
      this.$emit("close");
    },

    cancel() {
      if (!this.isAuthorizing) {
        this.closeModal();
      }
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.$refs.passwordInput?.focus();
    });
  },
};
</script>

<style scoped>
.modal {
  position: fixed;
  z-index: 1111;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
}

.modal-content {
  background-color: var(--glass-bg-color, rgba(255, 255, 255, 0.15));
  backdrop-filter: blur(var(--glass-blur, 12px));
  -webkit-backdrop-filter: blur(var(--glass-blur, 12px));
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  box-shadow: var(--glass-box-shadow, 0 4px 30px rgba(0, 0, 0, 0.1));
  padding: var(--spacing-large, 1.5rem);
  border-radius: var(--border-radius, 8px);
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: modalEnter 0.3s ease-out;
  color: var(--color-text, #333);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-small, 0.75rem);
  font-weight: 600;
}

.input-container {
  margin: var(--spacing-medium, 1rem) 0;
  position: relative;
}

.modal-content input[type="password"],
.modal-content input[type="text"] {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  border-radius: var(--border-radius, 8px);
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--color-text, #333);
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.button-container {
  display: flex;
  justify-content: center;
  gap: var(--spacing-small, 0.75rem);
  margin-top: var(--spacing-medium, 1rem);
}

.primary-button,
.secondary-button {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: var(--border-radius, 8px);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.eye-icon svg {
  overflow: visible; /* Allow line to extend outside viewBox */
  margin-top: 4px;
}

.eye-hidden {
  opacity: 0.5;
  animation: blink 0.2s ease-in-out;
  transform-origin: center;
}

.eye-slash {
  stroke-dasharray: 30;
  transition: all 0.3s ease;
  stroke-dashoffset: 0;
}

.eye-slash-hidden {
  stroke-dashoffset: 30;
  opacity: 0;
}
.primary-button {
  background-color: #4caf50;
  color: white;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  color: var(--color-text, #333);
}
.toggle-password-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted, #666);
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  z-index: 2;
  width: 34px;
  height: 34px;
  border-radius: 4px;
}

@media not all and (hover: none) {
  .primary-button:active,
  .secondary-button:active {
    transform: translateY(1px);
  }

  .primary-button:hover {
    background-color: #3d8b40;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .secondary-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
  .modal-content input[type="password"]:focus {
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.4);
    border-color: #4caf50;
  }

  .toggle-password-button:hover {
    opacity: 1;
  }

  .toggle-password-button:focus {
    outline: none;
    opacity: 1;
  }
  .toggle-password-button:active {
    transform: translateY(-50%);
  }

  .toggle-password-button:hover {
    opacity: 1;
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }
}
.primary-button:disabled,
.secondary-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
  margin-left: 8px;
}

.button-text {
  white-space: nowrap;
}

@keyframes modalEnter {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes blink {
  0% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(0.2);
  }
  100% {
    transform: scaleY(1);
  }
}
</style>
