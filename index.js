const fetch = require('isomorphic-fetch')
const { fetchOnePlus5Price } = require('./oneplusPriceFetcher')
const { pushMessage } = require('./line')
const { getPrettyObjectString } = require('./utils')

const async = async () => {
  const { updated, data } = await fetchOnePlus5Price()

  if (updated) {
    console.log('posting to Line')
    console.log(data)
    const receiverId = process.env.LINE_GROUP_ID
    pushMessage(receiverId,`
New price detected!!
${getPrettyObjectString(data)}
`)
  }
}

async()