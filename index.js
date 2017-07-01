const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

const data = {}

const fetchOnePlus5Price = async () => {
  const response = await fetch('http://www.aobmobile.net/wc/')
  const DOMString = await response.text()
  const $ = cheerio.load(DOMString)
  const $onePlus = $('span').filter((idx, el) => $(el).text() === 'OnePlus 5')
  const $parent = $onePlus.parents('p')
  const $onePlus5Line = $parent.find('span').filter((idx, el) => $(el).text().match(/^oneplus.?5.+gb.+\d{2},\d{3}.*\n$/i))
  const onePlusArray = []
  $onePlus5Line.each((idx, el) => onePlusArray.push($(el).text()))
  const results = onePlusArray.map(toPhoneObject)
  results.forEach(result => {
    const [variant, price] = result
    data[variant] = +price.replace(',', '')
  })
}

const toPhoneObject = text => text.match(/(.*)(\d{2},\d{3})/).slice(1)

fetchOnePlus5Price()
  .then(() => console.log(data))