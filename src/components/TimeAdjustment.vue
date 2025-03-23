<script setup>
import { computed } from 'vue'
import { useTimezoneStore } from '@/stores/timezones'
const timezoneStore = useTimezoneStore()

// Time adjustment functions
function adjustTime(hours, minutes) {
  timezoneStore.adjustTime(hours, minutes)
}

function resetTime() {
  timezoneStore.resetTime()
}

// Computed property for formatted time offset
const formattedTimeOffset = computed(() => {
  const totalMinutes = Math.floor(timezoneStore.timeOffset / (1000 * 60))
  const isNegative = totalMinutes < 0
  const absMinutes = Math.abs(totalMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60

  let offsetText = ''
  if (isNegative) {
    offsetText = '-'
  }
  if (hours !== 0) {
    offsetText += `${hours}h `
  }
  if (minutes !== 0 || hours === 0) {
    offsetText += `${minutes}m`
  }

  return offsetText.trim() || '0m'
})
</script>
<template>
  <!-- Time adjustment controls -->
  <div
    class="md:fixed mt-8 md:mt-0 bottom-28 left-0 right-0 z-50 flex flex-col gap-2 justify-center items-center"
  >
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <button
          @click="adjustTime(-1, 0)"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-lg"
        >
          -1h
        </button>
        <button
          @click="adjustTime(1, 0)"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-lg"
        >
          +1h
        </button>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="adjustTime(0, -15)"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-lg"
        >
          -15m
        </button>
        <button
          @click="adjustTime(0, 15)"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors shadow-lg"
        >
          +15m
        </button>
      </div>
      <button
        @click="resetTime"
        class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors shadow-lg"
      >
        Reset
      </button>
    </div>
    <div class="text-gray-600 font-mono text-xs">Current offset: {{ formattedTimeOffset }}</div>
  </div>
</template>
