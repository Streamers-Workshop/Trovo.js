const trovo = require('./lib/client/BrowserClient.js')

const settings = require('../settings.dev.json');

console.log(settings);
const main = async function () {
  try {
    //const trovoApollo = new TrovoApollo()
    const client = new trovo({ headless: false });
    await client.login(
      settings.trovo.page,
      settings.owner.email,
      settings.owner.password,
    );
    var data = await client.subs();
    console.log(data);
    //const { getLiveInfo } = await trovoApollo.GetLiveInfo('Pirolyx')
    //console.log(getLiveInfo)

    // SetTitle require login
     //var data = await trovoApollo.getToken();
     //console.log(data);
     //var subs = await trovoApollo.GetSubscribers(0, 10);
     //console.log(subs);
    // await trovoApollo.SetTitle('Bonjour à tous')

  } catch (error) {
    console.error(error)
  }
}

 main()
