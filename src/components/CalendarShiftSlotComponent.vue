<template>
  <div
    class="shift-slot"
    :class="getShiftSlotClasses()"
    @dragover.prevent
    @drop="$emit('drop')"
    @click="isEditing && $emit('reset')"
    :aria-label="getShiftAriaLabel()"
    :title="getShiftTooltip()"
    role="button"
    tabindex="0"
  >
    <div class="assigned-person" v-if="day[shiftType]">
      {{ day[shiftType + 'Name'] }}
    </div>
    <div
      class="assigned-person deleted"
      v-else-if="day[shiftType + 'UserChanged']"
    >
      {{ MESSAGES.SHIFT_DELETED }}
    </div>
    <div class="empty-slot" v-else>
      {{
        shiftType.includes('day')
          ? MESSAGES.SHIFT_DAY_INITIAL
          : MESSAGES.SHIFT_NIGHT_INITIAL
      }}
    </div>
  </div>
</template>

<script lang="ts">
import { ShiftType } from '@/types/calendar';
import { MESSAGES } from '../constants/messages';

export default {
  name: 'CalendarShiftSlotComponent',
  emits: ['drop', 'reset'],
  props: {
    day: {
      type: Object,
      required: true
    },
    shiftType: {
      type: String as () => ShiftType,
      required: true
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      MESSAGES
    };
  },
  computed: {
    isNightShift(): boolean {
      return this.shiftType.includes('night');
    },
    isDayShift(): boolean {
      return this.shiftType.includes('day');
    },
    shiftName(): string {
      return this.isDayShift
        ? this.MESSAGES.SHIFT_DAY
        : this.MESSAGES.SHIFT_NIGHT;
    },
    hasAssignedPerson(): boolean {
      return !!this.day[this.shiftType];
    },
    assignedPersonName(): string {
      return this.day[this.shiftType + 'Name'];
    },
    isUserChanged(): boolean {
      return this.day[this.shiftType + 'UserChanged'];
    },
    isRatownik(): boolean {
      return this.day[this.shiftType + 'Ratownik'] === true;
    },
    isPielegniarka(): boolean {
      return this.day[this.shiftType + 'Ratownik'] === false;
    }
  },
  methods: {
    getShiftSlotClasses() {
      return {
        day: this.isDayShift,
        night: this.isNightShift,
        ratownik: this.isRatownik,
        pielegniarka: this.isPielegniarka,
        userChanged: this.isUserChanged,
        clickable: this.isEditing && this.hasAssignedPerson
      };
    },
    getShiftAriaLabel(): string {
      if (this.isEditing) {
        return this.hasAssignedPerson
          ? `${this.shiftName}: ${this.assignedPersonName}. ${this.MESSAGES.SHIFT_CLICK_TO_REMOVE}.`
          : `${this.shiftName}: ${this.MESSAGES.SHIFT_EMPTY}. ${this.MESSAGES.SHIFT_DRAG_TO_ASSIGN}.`;
      }
      return this.hasAssignedPerson
        ? `${this.shiftName}: ${this.assignedPersonName}`
        : `${this.shiftName}: ${this.MESSAGES.SHIFT_EMPTY}.`;
    },
    getShiftTooltip(): string {
      if (this.isEditing) {
        return this.hasAssignedPerson
          ? `${this.shiftName}: ${this.assignedPersonName} (${this.MESSAGES.SHIFT_CLICK_TO_DELETE})`
          : `${this.MESSAGES.SHIFT_DRAG_TO_ASSIGN_SPECIFIC} - ${this.shiftName.toLowerCase()}`;
      }
      return this.hasAssignedPerson
        ? `${this.shiftName}: ${this.assignedPersonName}`
        : `${this.shiftName}: ${this.MESSAGES.NOT_ASSIGNED}`;
    }
  }
};
</script>

<style scoped>
.shift-slot {
  margin-top: var(--spacing-small);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 42px;
}

.shift-slot:has(.empty-slot) {
  filter: saturate(0.3) opacity(0.7);
  border: 2px solid var(--color-empty-slot) !important;
  font-weight: 600;
}

.shift-slot.clickable {
  cursor: pointer;
}
.shift-slot.clickable:hover {
  filter: saturate(0.2);
}
.userChanged {
  color: var(--color-user-changed) !important;
  border: 2px solid var(--color-user-changed);
}

.empty-slot {
  color: var(--color-text);
  padding: var(--spacing-small);
  height: var(--height-empty-slot);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
  width: 100%;
  background-color: transparent !important;
}

.assigned-person {
  padding: var(--spacing-small);
  background-color: transparent;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-medium);
  font-weight: bolder;
  transition: all 0.2s ease;
  width: 100%;
  color: var(--color-text);
}

.assigned-person.deleted {
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
