<template>
  <section v-if="show" class="modal">
    <div class="modal-content">
      <h3>Autoryzacja</h3>
      <p>Wpisz hasło aby zapisać zmiany:</p>
      <div class="input-container">
        <input
          type="password"
          v-model="password"
          @keyup.enter="authorize"
          placeholder="Hasło..."
          autocomplete="current-password"
          ref="passwordInput"
        />
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
          Anuluj</button
        ><button
          v-if="import.meta.env.MODE !== 'production'"
          @click="debugEnvironment"
          class="debug-button"
          style="position: absolute; bottom: 10px; left: 10px; font-size: 10px"
        >
          Debug
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
    };
  },
  methods: {
    async authorize() {
      if (this.isAuthorizing) return;
      this.isAuthorizing = true;

      try {
        // Password verification
        const CryptoJS = await import("crypto-js");
        const password = this.password;
        const salt = import.meta.env.VITE_AUTH_SALT.toString();

        const iterations = 100000;
        const keySize = 256 / 32;
        const derivedKey = CryptoJS.PBKDF2(password, salt, {
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
    debugEnvironment() {
      const debugInfo = {
        salt: import.meta.env.VITE_AUTH_SALT || "Not set",
        passwordHash: import.meta.env.VITE_AUTH_PASSWORD || "Not set",
      };

      console.table(debugInfo);
      alert(`Salt: ${debugInfo.salt}\nHash: ${debugInfo.passwordHash}`);
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

.modal-content input[type="password"] {
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

.modal-content input[type="password"]:focus {
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.4);
  border-color: #4caf50;
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

.primary-button {
  background-color: #4caf50;
  color: white;
}

.secondary-button {
  background-color: transparent;
  border: 1px solid var(--glass-border-color, rgba(255, 255, 255, 0.2));
  color: var(--color-text, #333);
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

.primary-button:active,
.secondary-button:active {
  transform: translateY(1px);
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
</style>
