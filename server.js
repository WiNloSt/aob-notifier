const Hapi = require('hapi')
const redis = require('redis')
const { replyMessage } = require('./line')
const { fetchOnePlus5Price } = require('./oneplusPriceFetcher')

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
  handler: function (request, reply) {
    client.get('data', (err, res) => {
      if (err) {
        console.error('error', err)
      }

      const data = JSON.parse(res.toString())
      reply(getPrettyObjectString(data))
    })
  }
})

server.route({
  method: 'POST',
  path: '/',
  handler: async (request, reply) => {
    reply(request.payload)
    console.log(JSON.stringify(request.payload, null, 2))
    const { events } = request.payload
    events.forEach(event => {
      if (event.message.text.match(/ราคา/)) {
        const data = await fetchOnePlus5Price()
        replyMessage(event.replyToken, getPrettyObjectString(data))
        continue
      }
      replyMessage(event.replyToken, `you said: ${event.message.text}`)
    })
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})

const getPrettyObjectString = objectString =>
  Object.keys(data)
    .map(key =>
    `${key}: ${data[key]}`
    ).join('<br/>')