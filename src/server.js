const Hapi = require('hapi')
const redis = require('redis')
const { replyMessage } = require('./line')
const { fetchOnePlus5Price } = require('./oneplusPriceFetcher')
const { getPrettyObjectString } = require('./utils')

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
    const data = await fetchOnePlus5Price(client)
    reply(getPrettyObjectString(data, '<br>'))
  }
})

server.route({
  method: 'POST',
  path: '/',
  handler: async (request, reply) => {
    reply(request.payload)
    console.log(JSON.stringify(request.payload, null, 2))
    const { events } = request.payload
    const data = await fetchOnePlus5Price(client)
    events.forEach(event => {
      if (event.message.text.match(/ราคา/)) {
        replyMessage(event.replyToken, getPrettyObjectString(data))
      }
    })
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})
