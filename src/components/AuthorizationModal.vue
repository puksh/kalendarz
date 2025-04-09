<template>
  <section v-if="show" class="modal">
    <div class="modal-content">
      <p>Wpisz hasło:</p>
      <input type="password" v-model="password" />
      <button @click="authorize">Zapisz</button>
      <button @click="cancel">Anuluj</button>
    </div>
  </section>
</template>

<script>
import { MD5 } from "crypto-js";
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
    };
  },
  methods: {
    async authorize() {
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
              body: JSON.stringify({ key: "shiftData", value: encodedContent }),
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

      this.closeModal();
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
};
</script>

<style scoped>
/* Modal Styles */
.modal {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8); /* Dark semi-transparent background */
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: #1e1e2f; /* Dark background for modal content */
  padding: var(--spacing-large, 1.5rem);
  border-radius: var(--border-radius-large, 12px);
  box-shadow: var(--shadow-modal, 0 4px 10px rgba(0, 0, 0, 0.5));
  text-align: center;
  max-width: 400px;
  width: 90%;
  animation: fadeIn 0.3s ease-out;
  color: #e0e0e0; /* Light text for readability */
}

.modal-content input[type="password"] {
  max-width: 400px;
  padding: 0.8rem;
  margin: 10px 0;
  border: 1px solid #444; /* Subtle border for input */
  border-radius: var(--border-radius-small, 4px);
  background-color: #2e2e3e; /* Dark background for input */
  color: #e0e0e0; /* Light text for input */
  outline: none;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.modal-content input[type="password"]:focus {
  box-shadow: 0 0 5px #7e5bef; /* Purple glow on focus */
  border-color: #7e5bef; /* Purple border on focus */
}

.modal-content button {
  background-color: #7e5bef; /* Purple button background */
  color: #ffffff; /* White text for buttons */
  padding: 0.8rem 1.2rem;
  margin: 5px;
  border: none;
  border-radius: var(--border-radius-small, 4px);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.modal-content button:hover {
  background-color: #9b7ebd; /* Lighter purple on hover */
  transform: scale(1.05);
}

.modal-content button:active {
  transform: scale(0.95);
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
