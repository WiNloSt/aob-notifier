const fetch = require('isomorphic-fetch')
fetch(process.env.IFTTT_WEBHOOK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    value1: 'debug naja'
  })
})
