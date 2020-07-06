const fs = require('fs'), path = require('path'), util = require('util');

require('dotenv').config({ path: path.join(__dirname, ".env") });

var trovojs = require('trovo.js');

var bot = new trovojs.Client();
var online = false;
bot.on('ready', () => {
  console.log("Bot has completed everything!")
});
bot.on("wsCreated", (data) => {
  console.log("wsCreated", data);
})
bot.on("wsClosed", (data) => {
  console.log("wsClosed", data);
})
bot.on("jsonData", (name, data) => {
  console.log("jsonData", name, data);
})
bot.on("chatMessage", (data) => {

  console.log("chatMessage", data);
})
bot.on("dialogMessage", (data) => {
  console.log("dialogMessage",data);
})
bot.on("consoleMessage", (data) => {
  console.log(data);
})
bot.on("chatEvent", (type, data) => {
  console.log("chatEvent", type, data);
})
bot.login(process.env.TROVO_PAGE, process.env.TROVO_EMAIL, process.env.TROVO_PASSWORD);
