const Hapi = require('hapi')
const redis = require('redis')

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
      reply(Object.keys(data)
        .map(key =>
        `${key}: ${data[key]}`
        ).join('<br/>')
      )
    })
  }
})

server.route({
  method: 'POST',
  path: '/',
  handler: (request, reply) => {
    reply(request.payload)
    console.log(request.payload)
  }
})

server.start((err) => {
  if (err) {
    throw err
  }
  console.log(`Server running at: ${server.info.uri}`)
})