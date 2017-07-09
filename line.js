const line = require('@line/bot-sdk')

const client = new line.Client({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
})

exports.replyMessage = (replyToken, message) =>
  client.replyMessage(replyToken, {
    type: 'text',
    text: message
  })
    .then(() => {
      console.log('success')
    })
    .catch((err) => {
      console.error('error occured', err)
    })

exports.pushMessage = (receiverId, message) =>
  client.pushMessage(receiverId, {
    type: 'text',
    text: message
  })
    .then(() => {
      console.log('success')
    })
    .catch((err) => {
      console.error('error occured', err)
    })