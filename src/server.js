const Hapi = require('hapi')
const redis = require('redis')
const { replyMessage } = require('./line')
const { fetchDataFromKey } = require('./oneplusPriceFetcher')
const { getPrettyObjectString } = require('./utils')
const R = require('ramda')

const client = redis.createClient(process.env.REDIS_URL)

const server = new Hapi.Server()
server.connection({
  port: process.env.PORT || 3000
})

server.route({
  method: 'GET',
  path: '/',
  handler: async (request, reply) => {
    const data = await fetchDataFromKey(client, 'data')
    const lastUpdate = await fetchDataFromKey(client, 'lastUpdate')
    reply(
      R.compose(
        addLastUpdate(lastUpdate, '<br>'),
        R.curry(getPrettyObjectString)(R.__, '<br>')
      )(data)
    )
  }
})

server.route({
  method: 'POST',
  path: '/',
  handler: async (request, reply) => {
    console.log(JSON.stringify(request.payload, null, 2))
    const { events } = request.payload
    const data = await fetchDataFromKey(client, 'data')
    const lastUpdate = await fetchDataFromKey(client, 'lastUpdate')
    events.forEach(event => {
      if (event.message.text.match(/ราคา/)) {
        replyMessage(
          event.replyToken,
          R.compose(
            addLastUpdate(lastUpdate, '\n'),
            getPrettyObjectString
          )(data)
        )
      }
    })

    reply(request.payload)
  }
})

const addLastUpdate = (lastUpdate, separator) => objectString =>
  `Last Updated: ${new Date(lastUpdate).toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }) + separator + objectString}`

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
