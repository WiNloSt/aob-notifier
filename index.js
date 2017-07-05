const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')
const fs = require('fs')

const data = JSON.parse(fs.readFileSync('oneplus5-data.txt', 'utf8'))
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
  results.forEach(result => {
    const [variant, price] = result
    const cleanedVariant = variant.split(' ').map(a => a.trim()).filter(a => a).join(' ').slice(0, -1)
    const priceNumber = +price.replace(',', '')
    if (priceNumber < data[cleanedVariant]) {
      data[cleanedVariant] = +price.replace(',', '')
      isValueUpdated = true
    }
  })
}

const toPhoneObject = text => text.match(/(.*)(\d{2},\d{3})/).slice(1)

const async = async () => {
  await fetchOnePlus5Price()
  if (isValueUpdated) {
    fs.writeFileSync('oneplus5-data.txt', JSON.stringify(data),'utf8')
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
