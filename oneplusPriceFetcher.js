const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')
const fs = require('fs')
const redis = require('redis')
const REDIS_URL = process.env.REDIS_URL

const client = redis.createClient({
  url: REDIS_URL
})

const getData = () => {
  return new Promise((resolve, reject) => {
    client.get('data', (err, reply) => {
      if (err) {
        console.error('error', err)
        reject(err)
      }

      const data = JSON.parse(reply.toString())
      resolve(data)
    })
  })
}

let isValueUpdated = false

const fetchOnePlus5Price = async () => {
  const response = await fetch('http://www.aobmobile.net/wc/')
  const DOMString = await response.text()
  const $ = cheerio.load(DOMString)
  const $onePlus = $('span').filter((idx, el) => $(el).text() === 'OnePlus 5')
  const $parent = $onePlus.parents('p')
  const $onePlus5Line = $parent.find('span').filter((idx, el) => $(el).text().match(/^oneplus.?5.+gb.+\d{2},\d{3}.*\n?$/i))
  const onePlusArray = []
  $onePlus5Line.each((idx, el) => onePlusArray.push($(el).text()))
  const results = onePlusArray.map(toPhoneObject)

  let data = await getData()
  console.log('data is', data)
  results.forEach(result => {
    const [variant, price] = result
    const cleanedVariant = variant.split(' ').map(a => a.trim()).filter(a => a).join(' ').slice(0, -1)
    const priceNumber = +price.replace(',', '')
    if (priceNumber < data[cleanedVariant] || data[cleanedVariant] == undefined) {
      data[cleanedVariant] = +price.replace(',', '')
      isValueUpdated = true
      client.set('data', JSON.stringify(data))
    }
  })

  return {
    updated: isValueUpdated,
    data
  }
}

const toPhoneObject = text => text.match(/(.*)(\d{2},\d{3})/).slice(1)

exports.fetchOnePlus5Price = () =>
  fetchOnePlus5Price()
    .then(data => {
      client.quit()
      return data
    })
    .catch(error => client.quit())