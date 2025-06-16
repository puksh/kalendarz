<template>
  <section
    class="shift-counts-window"
    :class="{ 'show-salaries': showSalaries }"
  >
    <h3 style="margin: 8px">{{ MESSAGES.SHIFT_COUNT_TITLE }}</h3>

    <!-- Toggle button for salary view -->
    <button
      @click="toggleSalaryView"
      class="salary-toggle-btn"
      :class="{ active: showSalaries }"
    >
      <svg
        class="dollar-icon"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="7"
          width="20"
          height="10"
          rx="2"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
        <path
          d="M12 10.5V13.5M10.5 12H13.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
      {{ showSalaries ? MESSAGES.SALARY_HIDE : MESSAGES.SALARY_SHOW }}
    </button>

    <Teleport to="body">
      <component
        v-if="AuthorizationModal && showPasswordModal"
        :is="AuthorizationModal"
        :show="showPasswordModal"
        @close="showPasswordModal = false"
        @authorized="handleSalaryAuthorization"
        :aria-label="MESSAGES.AUTH_SALARY_ACCESS_ARIA"
        :title="MESSAGES.AUTH_SALARY_ACCESS_TITLE"
        mode="salary"
      />
    </Teleport>

    <div class="columns-container">
      <div class="column">
        <h4
          style="
            margin: 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          "
        >
          {{ MESSAGES.ROLE_RATOWNIK_PLURAL }}
          <p v-if="showSalaries" style="color: var(--color-success) !important">
            |
            {{ salaryRates.ratownik }} / godz.
          </p>
        </h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => p.ratownik)"
            :key="person.id"
            class="shift-count-item"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong>
            <span v-if="showSalaries" class="salary-info">
              |
              {{ formatCurrency(calculateNetto(person.shiftCount || 0, true)) }}
              zł netto
            </span>
          </li>
        </ul>
      </div>
      <div class="column">
        <h4
          style="
            margin: 8px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
          "
        >
          {{ MESSAGES.ROLE_NURSE_PLURAL }}
          <p v-if="showSalaries" style="color: var(--color-success) !important">
            |
            {{ salaryRates.nurse }} / godz.
          </p>
        </h4>
        <ul class="shift-counts">
          <li
            v-for="person in people.filter((p) => !p.ratownik)"
            v-bind:key="person.id"
            class="shift-count-item"
          >
            {{ person.name }}:
            <strong>{{ person.shiftCount || 0 }}</strong>
            <span v-if="showSalaries" class="salary-info">
              |
              {{
                formatCurrency(calculateNetto(person.shiftCount || 0, false))
              }}
              zł netto
            </span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Total summary when salaries are shown -->
    <div v-if="showSalaries" class="salary-summary">
      <h4>{{ MESSAGES.SALARY_SUMMARY_MONTHLY }}</h4>
      <p>
        <strong
          >{{ MESSAGES.SALARY_TOTAL_RATOWNIK }}
          {{ formatCurrency(getTotalSalary(true)) }} zł netto</strong
        >
      </p>
      <p>
        <strong
          >{{ MESSAGES.SALARY_TOTAL_NURSE }}
          {{ formatCurrency(getTotalSalary(false)) }} zł netto</strong
        >
      </p>
      <p class="total-all">
        <strong
          >{{ MESSAGES.SALARY_TOTAL_ALL }}
          {{ formatCurrency(getTotalSalary(true) + getTotalSalary(false)) }} zł
          netto</strong
        >
      </p>
    </div>
  </section>
</template>

<script lang="ts">
import { MESSAGES } from '@/constants/messages';

export default {
  name: 'ShiftCountWindow',
  props: {
    people: {
      type: Array as () => {
        id: number;
        name: string;
        ratownik: boolean;
        shiftCount?: number;
      }[],
      required: true
    },
    monthDays: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      showSalaries: false,
      showPasswordModal: false,
      AuthorizationModal: null,
      salaryRates: {
        ratownik: 90,
        nurse: 97
      },
      MESSAGES
    };
  },
  async mounted() {
    this.calculateAllShiftCounts();

    // Dynamically import AuthorizationModal
    try {
      const module = await import('./AuthorizationModal.vue');
      this.AuthorizationModal = module.default;
    } catch (error) {
      console.error('Failed to load AuthorizationModal:', error);
    }
  },
  methods: {
    countShiftsForPerson(personId) {
      if (!personId) return 0;
      let tempCount = 0;

      for (let i = 0; i < this.monthDays.length; i++) {
        if (this.monthDays[i].dayShift1 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].dayShift2 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].nightShift1 === personId) {
          tempCount += 1;
        }
        if (this.monthDays[i].nightShift2 === personId) {
          tempCount += 1;
        }
      }
      return tempCount;
    },
    calculateAllShiftCounts() {
      this.people.forEach((person) => {
        person.shiftCount = this.countShiftsForPerson(person.id);
      });
    },
    calculateNetto(totalShifts: number, isRatownik: boolean): number {
      if (!this.showSalaries) return 0;

      let grossTotal = 0;

      if (isRatownik) {
        grossTotal = totalShifts * 12 * this.salaryRates.ratownik;
      } else {
        grossTotal = totalShifts * 12 * this.salaryRates.nurse;
      }

      return grossTotal;
    },
    getTotalSalary(isRatownik: boolean): number {
      return this.people
        .filter((p) => p.ratownik === isRatownik)
        .reduce(
          (total, person) =>
            total + this.calculateNetto(person.shiftCount || 0, isRatownik),
          0
        );
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(amount);
    },

    toggleSalaryView() {
      if (!this.showSalaries) {
        // Show password modal to authorize
        this.showPasswordModal = true;
      } else {
        // Hide salaries immediately
        this.showSalaries = false;
      }
    },

    handleSalaryAuthorization() {
      this.showSalaries = true;
      this.showPasswordModal = false;
    }
  },

  watch: {
    monthDays: {
      handler() {
        this.calculateAllShiftCounts();
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.shift-counts {
  flex-wrap: wrap;
  font-size: 16px;
  line-height: 2.4ch;
  padding: 0;
  margin: 0 0 8px 0;
  list-style: none;
  color: var(--color-text);
}

.shift-count-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(0.8rem, 2vw, 1.2rem);
  padding: 2px 4px;
  margin-bottom: 0px;
}

.shift-counts-window.show-salaries .shift-count-item {
  font-size: clamp(0.7rem, 1.5vw, 1rem);
}

@media (max-width: 600px) {
  .shift-count-item {
    font-size: clamp(0.7rem, 3vw, 0.9rem);
  }
}

@media (max-width: 400px) {
  .shift-count-item {
    font-size: clamp(0.6rem, 4vw, 0.8rem);
  }
}

.shift-counts-window {
  width: max(390px);
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--glass-bg-color);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border-color);
  box-shadow: var(--glass-box-shadow);
  border-radius: 8px;
  align-self: center;
  color: var(--color-text);
  margin: 0;
  padding: 0px;
}

.shift-counts-window.show-salaries {
  width: clamp(520px, 80vw, 900px);
}

.salary-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 4px;
  padding: 8px 16px;
  background-color: var(--glass-bg-color);
  border: 1px solid var(--glass-border-color) !important;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.salary-info {
  color: var(--color-success);
  font-weight: 600;
}

.salary-summary {
  margin-top: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  box-sizing: border-box;
}

.salary-summary h4 {
  margin: 0 0 12px 0;
  color: var(--color-text);
}

.salary-summary p {
  margin: 8px 0;
  color: var(--color-text);
}

.total-all {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 2px solid var(--color-success);
  color: var(--color-success) !important;
  font-size: 1.1em;
}

.columns-container {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  margin: 0;
  padding: 0;
}

.column {
  flex: 1;
  min-width: 0;
  padding: 0 8px;
  min-width: 0;
}
@media (max-width: 768px) {
  .columns-container {
    flex-direction: column;
    gap: 10px;
  }
  .shift-count-item {
    text-align: center !important;
  }
  .column {
    flex: none;
  }
}

/* Even smaller screens */
@media (max-width: 500px) {
  .shift-counts-window {
    width: 95vw;
    padding: 8px;
  }
  .shift-count-item {
    text-align: center !important;
  }

  .shift-counts-window.show-salaries {
    width: 95vw;
  }
}
</style>
