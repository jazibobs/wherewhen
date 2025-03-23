const fetch = require('node-fetch')

exports.handler = async function (event) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { latitude, longitude } = JSON.parse(event.body)
    const API_KEY = process.env.GOOGLE_TIMEZONE_API_KEY

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${latitude},${longitude}&timestamp=${Math.floor(
        Date.now() / 1000,
      )}&key=${API_KEY}`,
    )

    const data = await response.json()
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  } catch (error) {
    console.error('Function error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch timezone',
        details: error.message,
      }),
    }
  }
}
