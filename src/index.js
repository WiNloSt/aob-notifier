const redis = require('redis')

const { processOnePlus5Price } = require('./oneplusPriceFetcher')
const { pushMessage } = require('./line')
const { getPrettyObjectString } = require('./utils')

const client = redis.createClient({
  url: process.env.REDIS_URL
})

const async = async () => {
  const { updated, data } = await processOnePlus5Price(client)

  if (updated) {
    console.log('posting to Line')
    console.log(data)
    const receiverId = process.env.LINE_GROUP_ID
    pushMessage(receiverId, `
New price detected!!
${getPrettyObjectString(data, '\n')}
`)
  }
}

async()
  .then(() => client.quit())
  .catch(() => client.quit())
