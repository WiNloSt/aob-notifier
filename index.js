const fetch = require('isomorphic-fetch')
const { fetchOnePlus5Price } = require('./oneplusPriceFetcher')

const async = async () => {
  const { updated, data } = await fetchOnePlus5Price()

  if (updated) {
    console.log('updating data file and posting to Line')
    console.log(data)
    fetch(process.env.IFTTT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        value1: data
      })
    })
  }
}

async()