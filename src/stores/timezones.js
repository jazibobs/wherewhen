import { defineStore } from 'pinia'

const STORAGE_KEY = 'wherewhen-cities'

const DEFAULT_CITIES = [
  {
    id: 1,
    city: 'Manchester',
    nickname: 'Manchester',
    timezone: 'Europe/London',
    countryCode: 'GB',
  },
  {
    id: 2,
    city: 'Beijing',
    nickname: 'Beijing',
    timezone: 'Asia/Shanghai',
    countryCode: 'CN',
  },
]

// Helper function to load cities from localStorage
const loadCitiesFromStorage = () => {
  try {
    const savedCities = localStorage.getItem(STORAGE_KEY)
    // If no cities in storage, return default cities
    if (!savedCities) {
      saveCitiesToStorage(DEFAULT_CITIES) // Save defaults to storage
      return DEFAULT_CITIES
    }
    return JSON.parse(savedCities)
  } catch (error) {
    console.error('Error loading cities from storage:', error)
    return DEFAULT_CITIES // Return defaults on error
  }
}

// Helper function to save cities to localStorage
const saveCitiesToStorage = (cities) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cities))
  } catch (error) {
    console.error('Error saving cities to storage:', error)
  }
}

export const useTimezoneStore = defineStore('timezones', {
  state: () => ({
    cities: loadCitiesFromStorage(),
    timeOffset: 0, // Time offset in milliseconds
  }),
  getters: {
    getAllCities: (state) => state.cities, // Optional, since you can access state.cities directly
  },
  actions: {
    addCity(city) {
      this.cities.push(city)
      saveCitiesToStorage(this.cities)
    },
    removeCity(id) {
      this.cities = this.cities.filter((city) => city.id !== id)
      saveCitiesToStorage(this.cities)
    },
    adjustTime(hours, minutes) {
      // Convert hours and minutes to milliseconds
      const msOffset = (hours * 60 + minutes) * 60 * 1000
      this.timeOffset += msOffset
    },
    resetTime() {
      this.timeOffset = 0
    },
  },
})
