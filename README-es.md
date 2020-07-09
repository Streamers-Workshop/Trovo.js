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

## Tabla de Contenidos

- [Info](#info)
- [Ejemplo de Uso](#ejemplo-de-uso)
- [Contribuir](#contribuir)
- [Ayuda](#ayuda)

## Info

trovo.js es un poderoso módulo de [Node.js](https://nodejs.org) que te permite interactuar fácilmente con la
[API de Trovo](https://trovo.live/policy/apis-developer-doc.html).


## Ejemplo de Uso

```js
const Trovo = require('trovo.js');
const client = new Trovo.Client();

client.on("chatMessage", (msg) => {
  if (msg.content === 'ping') {
    client.sendMessage('pong');
  }
})

client.login('trovo_user_url', 'email', 'password');
// o para iniciar sesión anónimamente:
client.login('trovo_user_url');
```

## Contribuir

Antes de mandar un "issue", porfavor, primero asegúrate de que no esté ya reportado o sugerido. 

## Ayuda

Si no entiendes alguna cosa en la documentación, estás experimentando errores, o simplemente necesitas un amable
empujón en la dirección correcta, porfavor no dudes en unirte a nuestro [Servidor de Trovo.js](https://discord.gg/Kc7fyx2) oficial.

## Eventos
*  chatEvent ~ Evento para un Grupo de Eventos
* * Sub Eventos
* * * userJoined ~ Cuando un usuario se une al canal
* * * userFollowed ~ Cuando un usuario sigue al canal
* * * userSubbed ~ Cuando un usuario se suscribe al canal
* * * giftRecieved ~ Cuando un usuario manda un regalo al canal
* chatMessage ~ Mensaje por el Chat General de un usuario
* dialog ~ Salida poput del diálogo del navegador [Será eliminado cuando dejemos puppeteer]
* console ~ Salida de la consola del navegador [Será eliminado cuando dejemos puppeteer]
* wsClosed ~ Activado cuando un Websocket se cerrado
* wsCreated ~ Activado cuando un Websocket es creado
* jsonData ~ JsonData recibido

## Funciones
* newPage ~ Abre una nueva página en los buscadores "headless"
* login ~ Inicia sesión con un usuario, en una página específica
* sendMessage ~ Envía un mensaje al canal
* dialogResponse ~ usado cuando un diálogo es activado para enviar un emit [Interno]
* consoleResponse ~ usado cuando la salida de la consola es activada para enviar un emit [Interno]
