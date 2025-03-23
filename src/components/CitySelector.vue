<script setup>
import { ref, watch } from 'vue'
import { useTimezoneStore } from '@/stores/timezones'

const timezoneStore = useTimezoneStore()
const searchQuery = ref('')
const places = ref([])
const isLoading = ref(false)
const error = ref('')
const nickname = ref('')
const selectedPlace = ref(null)
const timezone = ref('')
const isOpen = ref(false)
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

const emit = defineEmits(['city-selected'])

// Close popup when clicking outside
const handleClickOutside = (event) => {
  // Only close if clicking the overlay background (the semi-transparent black area)
  if (event.target.classList.contains('bg-black/50')) {
    isOpen.value = false
  }
}

// Add/remove click outside listener
watch(isOpen, (newValue) => {
  if (newValue) {
    document.addEventListener('click', handleClickOutside)
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('click', handleClickOutside)
    // Restore body scroll when popup is closed
    document.body.style.overflow = ''
  }
})

// Reset form when closing
const closePopup = () => {
  isOpen.value = false
  searchQuery.value = ''
  nickname.value = ''
  selectedPlace.value = null
  places.value = []
  error.value = ''
}

// Debounce function
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

const getTimezoneFromCoordinates = async (location) => {
  try {
    const response = await fetch('/.netlify/functions/getTimezone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location.latitude,
        longitude: location.longitude,
      }),
    })

    const data = await response.json()
    console.log('Timezone API response:', data)

    if (data.status === 'OK') {
      return data.timeZoneId
    }

    // More descriptive error based on the status
    let errorMessage = 'Failed to get timezone: '
    switch (data.status) {
      case 'INVALID_REQUEST':
        errorMessage += 'Invalid request parameters'
        break
      case 'OVER_DAILY_LIMIT':
        errorMessage += 'API quota exceeded'
        break
      case 'OVER_QUERY_LIMIT':
        errorMessage += 'Too many requests, please try again later'
        break
      case 'REQUEST_DENIED':
        errorMessage += 'API key is invalid or request was denied'
        break
      case 'ZERO_RESULTS':
        errorMessage += 'No timezone found for this location'
        break
      default:
        errorMessage += `${data.status || 'Unknown error'} - ${data.errorMessage || ''}`
    }
    throw new Error(errorMessage)
  } catch (err) {
    // If it's our custom error, pass it through
    if (err.message.startsWith('Failed to get timezone:')) {
      throw err
    }
    // For network or other errors
    console.error('Network or parsing error:', err)
    throw new Error(`Failed to get timezone: Network or server error - ${err.message}`)
  }
}

// Function to get country code from coordinates
const getCountryCode = async (location) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.latitude},${location.longitude}&key=${apiKey}`,
    )
    const data = await response.json()
    if (data.status === 'OK' && data.results.length > 0) {
      // Find the country component in the address components
      const countryComponent = data.results[0].address_components.find((component) =>
        component.types.includes('country'),
      )
      return countryComponent ? countryComponent.short_name : ''
    }
    return ''
  } catch (err) {
    console.error('Error getting country code:', err)
    return ''
  }
}

const performTextSearch = async () => {
  if (!searchQuery.value.trim()) {
    places.value = []
    return
  }

  isLoading.value = true
  error.value = ''

  const url = 'https://places.googleapis.com/v1/places:searchText'
  const headers = {
    'Content-Type': 'application/json',
    'X-Goog-Api-Key': apiKey,
    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.id',
  }

  const requestBody = {
    textQuery: searchQuery.value,
    locationBias: {
      circle: {
        center: {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        radius: 500.0,
      },
    },
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    places.value = data.places || []
  } catch (err) {
    error.value = 'Error searching for places. Please try again.'
    console.error('Error in place search:', err)
  } finally {
    isLoading.value = false
  }
}

// Create debounced search function
const debouncedSearch = debounce(performTextSearch, 300)

// Watch for search query changes
watch(searchQuery, (newValue, oldValue) => {
  // Only trigger search if:
  // 1. The value has actually changed
  // 2. We're not in the middle of selecting a place
  // 3. The user is actively typing (value is different from selected place)
  if (
    newValue !== oldValue &&
    !selectedPlace.value &&
    newValue.trim() &&
    (!selectedPlace.value || newValue !== selectedPlace.value.displayName.text)
  ) {
    debouncedSearch()
  } else if (!newValue.trim()) {
    places.value = []
  }
})

const selectPlace = async (place) => {
  try {
    // Store the current search query
    const currentQuery = searchQuery.value
    selectedPlace.value = place
    // Update search query without triggering a new search
    searchQuery.value = place.displayName.text
    // Clear the places list after selection
    places.value = []
    timezone.value = await getTimezoneFromCoordinates(place.location)
    const countryCode = await getCountryCode(place.location)

    // Store the country code in the selected place
    selectedPlace.value.countryCode = countryCode

    emit('city-selected', {
      city: place.displayName.text,
      nickname: nickname.value,
      timezone: timezone.value,
      countryCode,
    })
  } catch (err) {
    error.value = 'Error getting place details. Please try again.'
    console.error('Error in place selection:', err)
  }
}

const handleSubmit = () => {
  if (selectedPlace.value && timezone.value) {
    try {
      timezoneStore.addCity({
        id: Date.now(),
        city: selectedPlace.value.displayName.text,
        nickname: nickname.value || selectedPlace.value.displayName.text,
        timezone: timezone.value,
        countryCode: selectedPlace.value.countryCode || '',
      })
      // Close the popup after successfully adding the city
      closePopup()
    } catch (err) {
      error.value = 'Error adding city. Please try again.'
      console.error('Error adding city:', err)
    }
  }
}
</script>

<template>
  <!-- Fixed position button -->
  <button
    @click.stop="isOpen = true"
    class="add-city-button fixed bottom-8 md:bottom-13 right-8 cursor-pointer bg-blue-500 text-white p-4 rounded-full shadow-xl hover:bg-blue-600 transition-colors z-[100]"
    aria-label="Add new city"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  </button>

  <!-- Popup overlay -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
    >
      <!-- Popup content -->
      <div
        class="city-selector-popup bg-white/95 backdrop-blur-sm rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-[100] font-mono"
      >
        <div class="p-4 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold tracking-tight">Add New City</h2>
            <button
              @click="closePopup"
              class="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-4">
          <div class="mb-4">
            <div class="flex gap-2">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search for a city..."
                class="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          <div v-if="isLoading" class="mb-4 text-gray-600">
            <div class="flex items-center gap-2">
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              Searching...
            </div>
          </div>

          <div v-if="error" class="mb-4 text-red-500 text-sm">
            {{ error }}
          </div>

          <div v-if="places.length > 0" class="mb-4 max-h-60 overflow-y-auto">
            <ul class="space-y-2">
              <li
                v-for="place in places"
                :key="place.id"
                class="p-2 border rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{ 'bg-blue-50': selectedPlace?.id === place.id }"
                @click="selectPlace(place)"
              >
                {{ place.displayName.text }} - {{ place.formattedAddress }}
              </li>
            </ul>
          </div>

          <div v-if="selectedPlace" class="space-y-4">
            <div class="p-3 bg-gray-50/80 backdrop-blur-sm rounded-md">
              <h3 class="font-medium text-gray-900">Selected Place:</h3>
              <p class="text-gray-600">{{ selectedPlace.displayName.text }}</p>
              <p class="text-sm text-gray-500">{{ selectedPlace.formattedAddress }}</p>
            </div>

            <div>
              <label for="nickname" class="block text-sm font-medium text-gray-700 mb-1">
                Nickname (optional)
              </label>
              <input
                id="nickname"
                v-model="nickname"
                type="text"
                placeholder="Enter a nickname for this place"
                class="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <button
              @click="handleSubmit"
              class="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              :disabled="!selectedPlace || !timezone"
            >
              Add City
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.city-selector-popup {
  animation: slideIn 0.3s ease-out;
  position: relative;
}

@keyframes slideIn {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
