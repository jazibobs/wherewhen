export function formatTimeInTimezone(timezone, date) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: timezone,
  })

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  })

  return {
    time: timeFormatter.format(date),
    date: dateFormatter.format(date),
  }
}

// Convert country code to flag emoji
export function getFlagEmoji(countryCode) {
  if (!countryCode) return ''
  // Convert country code to uppercase
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt())
  return String.fromCodePoint(...codePoints)
}

// Function to determine time of day and its gradient
export function getTimeOfDayGradient(timezone, date) {
  // Get the time in the specified timezone
  const time = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  const hour = time.getHours()

  // Define time periods and their gradients
  if (hour >= 5 && hour < 8) {
    return {
      gradient: 'bg-gradient-to-r from-orange-100 to-blue-100',
      textColor: 'text-gray-900',
    }
  } else if (hour >= 8 && hour < 12) {
    return {
      gradient: 'bg-gradient-to-r from-blue-50 to-cyan-50',
      textColor: 'text-gray-900',
    }
  } else if (hour >= 12 && hour < 16) {
    return {
      gradient: 'bg-gradient-to-r from-cyan-50 to-sky-100',
      textColor: 'text-gray-900',
    }
  } else if (hour >= 16 && hour < 19) {
    return {
      gradient: 'bg-gradient-to-r from-sky-100 to-red-300',
      textColor: 'text-gray-900',
    }
  } else if (hour >= 19 && hour < 22) {
    return {
      gradient: 'bg-gradient-to-r from-cyan-700 to-blue-900',
      textColor: 'text-white',
    }
  } else {
    return {
      gradient: 'bg-gradient-to-r from-blue-900 to-slate-900',
      textColor: 'text-white',
    }
  }
}
