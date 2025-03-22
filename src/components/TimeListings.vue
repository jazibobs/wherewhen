<script setup>
import { useTimezoneStore } from '@/stores/timezones'
import { formatTimeInTimezone, getFlagEmoji, getTimeOfDayGradient } from '@/utils/formatTime'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import CitySelector from '@/components/CitySelector.vue'
import TimeAdjustment from '@/components/TimeAdjustment.vue'
const timezoneStore = useTimezoneStore()

// Ref to store the current time
const currentTime = ref(new Date())

// Function to get the current time in a specific timezone
function getCurrentTime(timezone) {
  const adjustedTime = new Date(currentTime.value.getTime() + timezoneStore.timeOffset)
  return formatTimeInTimezone(timezone, adjustedTime)
}

// Function to get the current time in milliseconds for a timezone
function getTimeInMs(timezone) {
  const adjustedTime = new Date(currentTime.value.getTime() + timezoneStore.timeOffset)
  return new Date(adjustedTime.toLocaleString('en-US', { timeZone: timezone })).getTime()
}

// Computed property for sorted cities
const sortedCities = computed(() => {
  return [...timezoneStore.cities].sort((a, b) => {
    const timeA = getTimeInMs(a.timezone)
    const timeB = getTimeInMs(b.timezone)
    return timeA - timeB
  })
})

// Function to remove a city
function removeCity(id) {
  timezoneStore.removeCity(id)
}

// Function to get the gradient for a city
function getCityGradient(timezone) {
  const adjustedTime = new Date(currentTime.value.getTime() + timezoneStore.timeOffset)
  return getTimeOfDayGradient(timezone, adjustedTime)
}

// Update the time every second
let interval

onMounted(() => {
  interval = setInterval(() => {
    currentTime.value = new Date() // Update the current time
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval) // Clean up the interval
})
</script>

<template>
  <div class="">
    <div
      v-if="timezoneStore.cities.length > 0"
      class="fixed top-20 left-0 right-0 bottom-20 z-50 space-y-4 flex items-center justify-center"
    >
      <!-- City listings -->
      <ul class="px-8 py-4 flex flex-row gap-4">
        <li
          v-for="city in sortedCities"
          :key="city.id"
          class="group relative flex flex-col items-start justify-between p-4 pb-6 rounded-lg shadow-sm bg-white overflow-hidden"
        >
          <!-- Gradient band at bottom -->
          <div
            :class="[
              'absolute bottom-0 left-0 right-0 h-2 transition-colors duration-500',
              getCityGradient(city.timezone).gradient,
            ]"
          ></div>

          <!-- Content -->
          <div class="flex items-center relative z-10">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col">
                <span class="text-xs text-gray-500">
                  {{ getCurrentTime(city.timezone).date }}
                </span>
                <span class="text-2xl font-medium text-gray-900">
                  {{ getCurrentTime(city.timezone).time }}
                </span>
              </div>
              <span class="font-medium text-lg text-gray-900">
                {{ city.city }}{{ city.countryCode ? ` ${getFlagEmoji(city.countryCode)}` : ''
                }}{{ city.nickname !== city.city ? ` - ${city.nickname}` : '' }}
              </span>
            </div>
          </div>
          <button
            @click="removeCity(city.id)"
            class="pt-2 opacity-20 group-hover:opacity-100 transition-all duration-300 hover:underline cursor-pointer relative z-10 text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </li>
      </ul>
    </div>
    <p v-else class="text-gray-500 pt-32 p-8 text-xl text-center my-16">
      Add your first city<br />
      <span class="text-sm text-gray-500">(Use the button in the corner)</span>
    </p>
    <TimeAdjustment />
    <CitySelector />
  </div>
</template>
