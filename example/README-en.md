# Example Chatbot

> This is a example bot, showcasing all the various events. Please follow the directions listed below in order to use this example to showcase a working functioning chatbot. :)

Open the `.env` and edit the values listed within.

* TROVO_EMAIL: Is the Email of the Account you will be logging into.
* TROVO_PASSWORD: Is the Password of the Account you will be loggin into.
* TROVO_PAGE: Will be the Page the Bot will be operating in.


## Setup
> Fill in the Values inside of the `.env` file then continue.
> Open Commandline Console, and type the steps listed below.
> Type: `npm install` ~ Once installation has completed continue.
> To start the Bot type: `node ./chatbot_example.js`


This will just show you output data within the console, it is up to you to create a bot from this.


## Example of a Bot Command.
`
bot.on("chatMessage", (data) => {
  if (data.content == '!hello') {
    bot.sendMessage('World!');
  }
})
`

There is other data that can be collected from the other events, but it is up too you to choose what you wanna do with the data. This is just a example. Enjoy <3

Visit the Official Trovo.js Discord if you have Questions: https://discord.gg/Kc7fyx2
