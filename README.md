<div align="center">
  <br />
  <p>
    <img src="https://static.trovo.live/cat/img/f4bf211.png" width="200" alt="trovo.js" />
  </p>
  <br />
  <p>
    <a href="https://discord.gg/Kc7fyx2"><img src="https://discord.com/api/guilds/728527921504845884/embed.png" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/trovo.js"><img src="https://img.shields.io/npm/v/trovo.js.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/trovo.js"><img src="https://img.shields.io/npm/dt/trovo.js.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://www.patreon.com/BioblazePayne"><img src="https://img.shields.io/badge/donate-patreon-F96854.svg" alt="Patreon" /></a>
  </p>
</div>

## Table of contents

- [About](#about)
- [Example Usage](#example-usage)
- [Contributing](#contributing)
- [Help](#help)

## About

trovo.js is a powerful [Node.js](https://nodejs.org) module that allows you to easily interact with the
[Trovo API](https://trovo.live/policy/apis-developer-doc.html).


## Example usage

```js
const Trovo = require('trovo.js');
const client = new Trovo.Client();

client.on("chatMessage", (msg) => {
  if (msg.content === 'ping') {
    client.sendMessage('pong');
  }
})

client.login('trovo_user_url', 'email', 'password');
```

## Contributing

Before creating an issue, please ensure that it hasn't already been reported/suggested.

## Help

If you don't understand something in the documentation, you are experiencing problems, or you just need a gentle
nudge in the right direction, please don't hesitate to join our official [Trovo.js Server](https://discord.gg/Kc7fyx2).
