<script setup>
import { ref, watch } from 'vue'

const isAboutOpen = ref(false)

// Close popup when clicking outside
const handleClickOutside = (event) => {
  if (
    event.target.closest('.about-popup') === null &&
    event.target.closest('.about-link') === null
  ) {
    isAboutOpen.value = false
  }
}

// Add/remove click outside listener
watch(isAboutOpen, (newValue) => {
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

const closeAboutPopup = () => {
  isAboutOpen.value = false
}
</script>

<template>
  <header
    class="flex justify-between items-center p-4 h-20 bg-white/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50"
  >
    <h1 class="text-2xl font-semibold">Where When</h1>
    <nav>
      <ul class="flex gap-6 items-center">
        <li>
          <button
            @click.stop="isAboutOpen = true"
            class="about-link cursor-pointer underline hover:text-blue-500 transition-colors"
            aria-label="About Where When"
          >
            About
          </button>
        </li>
        <li>
          <a
            class="cursor-pointer underline hover:text-blue-500 transition-colors"
            href="https://github.com/jazibobs/wherewhen"
            >GitHub</a
          >
        </li>
        <li>
          <a
            class="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-lg"
            href="https://ko-fi.com/jazibobs"
            >Buy me a coffee</a
          >
        </li>
      </ul>
    </nav>

    <!-- About Popup -->
    <Teleport to="body">
      <div
        v-if="isAboutOpen"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4"
      >
        <div
          class="about-popup bg-white/95 backdrop-blur-sm rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto z-[100] font-mono"
        >
          <div class="p-4 border-b">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold tracking-tight">About Where When</h2>
              <button
                @click="closeAboutPopup"
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

          <div class="p-4 space-y-4">
            <p class="text-gray-700 leading-relaxed">
              Where When is a timezone converter that helps you visualise the current time in
              different cities. It uses the Google Places API to provide accurate city information
              and timezone data.
            </p>

            <p class="text-gray-700 leading-relaxed">
              I created this app to help me figure out meeting times for my remote team who are
              currently building our new game
              <a
                class="underline text-blue-500"
                href="https://store.steampowered.com/app/2705650/Mithra/?utm=wherewhen"
                >Mithra (wishlist on Steam)</a
              >
              and I hope that it can be useful for you too.
            </p>

            <p class="text-gray-700 leading-relaxed">
              If you like this app, please consider
              <a class="underline text-blue-500" href="https://ko-fi.com/jazibobs"
                >buying me a coffee</a
              >.
            </p>
            <p class="text-gray-700 leading-relaxed">- Jared</p>
          </div>
        </div>
      </div>
    </Teleport>
  </header>
</template>

<style scoped>
.about-popup {
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
