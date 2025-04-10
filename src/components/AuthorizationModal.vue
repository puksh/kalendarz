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
          <span class="button-text">{{
            isAuthorizing ? "Weryfikacja..." : "Zapisz"
          }}</span>
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

<script>
import { addNotification } from "./NotificationMessage.vue";

export default {
  name: "AuthorizationModal",
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    localData: {
      type: Object,
      required: true,
    },
  },
  emits: ["close", "authorized"],
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
        // Dynamically import crypto-js only when needed
        const cryptoModule = await import("crypto-js/md5");
        const MD5 = cryptoModule.default;

        const hashedPassword = import.meta.env.VITE_AUTH_PASSWORD;
        const enteredPasswordHash = MD5(this.password).toString();

        if (enteredPasswordHash === hashedPassword) {
          try {
            // Prepare data for committing
            const encodedContent = await this.encodeLargeData(this.localData);

            if (!encodedContent) {
              console.error("Failed to encode data");
              addNotification("Brak zakodowanych danych", "red");
              return;
            }

            const response = await fetch(
              "https://mc.kot.li/?key=shiftData.json",
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  key: "shiftData",
                  value: encodedContent,
                }),
              },
            );

            if (!response.ok) {
              throw new Error("Nie udało się zaktualizować danych na serwerze");
            }

            addNotification("Zmiany zapisano!", "green");
            this.$emit("authorized"); // Notify parent of successful authorization
          } catch (error) {
            console.error("Error updating server data:", error);
            addNotification(
              error.message || "Nie udało się zaktualizować danych",
              "red",
            );
          }
        } else {
          addNotification("Złe hasło", "red");
          console.error("Incorrect password entered");
        }
      } catch (error) {
        console.error("Failed to load crypto library:", error);
        addNotification("Błąd weryfikacji hasła", "red");
      } finally {
        this.isAuthorizing = false;
        this.closeModal();
      }
    },
    closeModal() {
      this.password = "";
      this.$emit("close"); // Notify parent to close the modal
    },
    async encodeLargeData(data) {
      try {
        // Remove the toggle value before encoding
        localStorage.removeItem("isEditingMode");

        // Convert data to a JSON string
        const jsonString = JSON.stringify(data, null, 2);

        // Create a Blob from the JSON string
        const blob = new Blob([jsonString], { type: "application/json" });

        // Use FileReader to convert Blob to base64
        const reader = new FileReader();

        const base64String = await new Promise((resolve, reject) => {
          reader.onloadend = () => {
            // Resolve the base64 encoded string
            resolve(reader.result.split(",")[1]); // Remove the "data:..." prefix
          };

          reader.onerror = () => reject(new Error("Failed to read the Blob"));

          // Read the Blob as data URL (base64)
          reader.readAsDataURL(blob);
        });

        localStorage.setItem("isEditingMode", JSON.stringify(true));

        return base64String;
      } catch (error) {
        console.error("Error encoding large data:", error);
        addNotification("Nie udało się zakodować danych", "red");

        localStorage.setItem("isEditingMode", JSON.stringify(true));

        return null;
      }
    },
    cancel() {
      this.closeModal();
    },
  },
  mounted() {
    // Focus the password input when modal appears
    this.$nextTick(() => {
      this.$refs.passwordInput?.focus();
    });
  },
};
</script>

<style scoped>
/* Modal Styles */
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
  color: var(--color-text-dark, #333);
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
  color: var(--color-text-dark, #333);
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
  color: var(--color-text-dark, #333);
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
