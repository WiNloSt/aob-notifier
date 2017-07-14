const Hapi = require('hapi')
const redis = require('redis')
const { replyMessage } = require('./line')
const { fetchDataFromKey } = require('./oneplusPriceFetcher')
const { getPrettyObjectString } = require('./utils')
const R = require('ramda')

const client = redis.createClient({
  url: process.env.REDIS_URL
})

const server = new Hapi.Server()
server.connection({
  port: process.env.PORT || 3000
})

server.route({
  method: 'GET',
  path: '/',
  handler: async (request, reply) => {
    const data = await fetchDataFromKey(client, 'data')
    reply(getPrettyObjectString(data, '<br>'))
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
            objectString => `Last Updated: ${new Date(lastUpdate)}\n${objectString}`,
            getPrettyObjectString
          )(data)
        )
      }
    })

    reply(request.payload)
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
