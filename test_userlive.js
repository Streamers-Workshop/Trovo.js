const TrovoJS = require('./lib')
const CHANNEL_NAME = 'Bioblaze'

const settings = require('../settings.dev.json');

const main = async function () {
  const client = new TrovoJS.SocketClient()
  await client.login("Bioblaze", settings.trovo.email, settings.trovo.password, settings.owner.email, settings.owner.password)
  try {
    console.log(CHANNEL_NAME, 'channelID', client.channelId)
    const users = await client.bot.GetAllUser(client.channelId)
    console.log(users.map(u => u.userName))

    const subs = await client.creator.GetAllSubscribers()
    console.log('List of subscribers', subs.map(u => u.userName))
    //console.log(users.map(u => u.userName))
  } catch (err) {
    console.error(err)
  }
}

main()
