<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";

const props = defineProps<{
  modelValue: Date | null;
  enableDate?: boolean;
  enableTime?: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: Date | null): void;
}>();

const open = ref(false);
const selectedDate = ref(
  props.modelValue ? new Date(props.modelValue) : new Date()
);
const viewMonth = ref(selectedDate.value.getMonth());
const viewYear = ref(selectedDate.value.getFullYear());
const selectedHour = ref<number>(selectedDate.value.getHours());
const selectedMinute = ref<number>(selectedDate.value.getMinutes());

const hourOptions: SelectItem[] = Array.from({ length: 24 }, (_, i) => ({
  label: String(i).padStart(2, "0"),
  value: i,
}));

const minuteOptions: SelectItem[] = Array.from({ length: 60 }, (_, i) => ({
  label: String(i).padStart(2, "0"),
  value: i,
}));

watch([selectedHour, selectedMinute], () => {
  const d = new Date(
    selectedDate.value.getFullYear(),
    selectedDate.value.getMonth(),
    selectedDate.value.getDate(),
    selectedHour.value,
    selectedMinute.value
  );
  selectedDate.value = d;
  emit("update:modelValue", d);
});

watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      const d = new Date(v);
      selectedDate.value = d;
      viewMonth.value = d.getMonth();
      viewYear.value = d.getFullYear();
      selectedHour.value = d.getHours();
      selectedMinute.value = d.getMinutes();
    }
  }
);

const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const calendar = computed(() => {
  const first = new Date(viewYear.value, viewMonth.value, 1);
  const startDay = first.getDay();
  const daysInMonth = new Date(
    viewYear.value,
    viewMonth.value + 1,
    0
  ).getDate();
  const prevMonthDays = new Date(viewYear.value, viewMonth.value, 0).getDate();
  const dates = [];
  for (let i = 0; i < 42; i++) {
    const dayNumber = i - startDay + 1;
    const date = new Date(viewYear.value, viewMonth.value, dayNumber);
    let isCurrentMonth = true;
    if (dayNumber <= 0) {
      date.setDate(prevMonthDays + dayNumber);
      date.setMonth(viewMonth.value - 1);
      isCurrentMonth = false;
    } else if (dayNumber > daysInMonth) {
      date.setDate(dayNumber - daysInMonth);
      date.setMonth(viewMonth.value + 1);
      isCurrentMonth = false;
    }
    dates.push({ date, isCurrentMonth, key: date.toISOString() });
  }
  return dates;
});

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
}
function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
}

function selectDate(d: Date) {
  const dt = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    selectedHour.value,
    selectedMinute.value
  );
  selectedDate.value = dt;
  viewMonth.value = d.getMonth();
  viewYear.value = d.getFullYear();
  emit("update:modelValue", dt);
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const displayValue = computed(() => {
  const d = selectedDate.value;
  let s = "";
  if (props.enableDate ?? true) {
    s += d.toLocaleDateString();
  }
  if (props.enableTime ?? true) {
    s +=
      (s ? " " : "") +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return s;
});

function confirm() {
  open.value = false;
}
onMounted(() => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") open.value = false;
  });
});
</script>

<template>
  <div class="flex flex-col items-center gap-5">
    <UFormField>
      <UInput
        :model-value="displayValue"
        variant="subtle"
        readonly
        @focus="open = true"
      />
    </UFormField>

    <UCard v-if="open" variant="subtle" class="w-full">
      <div v-if="enableDate">
        <div class="flex items-center justify-between mb-2">
          <button type="button" class="p-1" @click="prevMonth">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span class="font-medium"
            >{{ monthNames[viewMonth] }} {{ viewYear }}</span
          >
          <button type="button" class="p-1" @click="nextMonth">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-7 text-center text-xs mb-1">
          <div v-for="d in dayLabels" :key="d">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 text-center">
          <div
            v-for="item in calendar"
            :key="item.key"
            :class="[
              'p-2 rounded cursor-pointer',
              item.isCurrentMonth ? '' : 'text-gray-400',
              isSameDate(item.date, selectedDate)
                ? 'bg-primary text-white'
                : 'hover:bg-gray-200',
            ]"
            @click="selectDate(item.date)"
          >
            {{ item.date.getDate() }}
          </div>
        </div>
      </div>

      <div
        v-if="enableTime"
        class="mt-4 flex space-x-2 items-center justify-center"
      >
        <USelect
          v-model="selectedHour"
          :items="hourOptions"
          placeholder="Hora"
          class="w-24"
        />
        <span>:</span>
        <USelect
          v-model="selectedMinute"
          :items="minuteOptions"
          placeholder="Minuto"
          class="w-24"
        />
      </div>

      <div class="mt-4 text-right">
        <button
          type="button"
          class="px-3 py-1 rounded bg-primary text-white"
          @click="confirm"
        >
          OK
        </button>
      </div>
    </UCard>
  </div>
</template>
