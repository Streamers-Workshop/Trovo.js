const trovo = require('./lib/client/BrowserClient.js')

const settings = require('../settings.dev.json');

//console.log(settings);
const client = new trovo({ headless: false });
    client.login(
      settings.trovo.page,
      settings.trovo.email,
      settings.trovo.password,
    );
