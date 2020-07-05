const puppeteer = require('puppeteer'); // Headless Browser
var Pbf = require('pbf'); // Decodes the Protobuf properly
const EventEmitter = require("events");
const fs = require('fs'), path = require('path'), util = require('util'); // Basic Utilities we need <3
const ROLE_STRINGS = {
  CREATOR: "j\t\u0012\u0007creator�\u0001\u0014\n",
  MODERATOR: "j\u000b\u0012\tmoderator�\u0001\u0014\n",
};

module.exports = class Client extends EventEmitter {
  constructor(settings) {
    super();
    this.headless = true;
    this.agent = "Trovo Chatbot Client created by Bioblaze Payne";
    this.viewport = { width: 800, height: 600 };
    if (settings) {
      this.headless = !settings.headless ? this.headless : settings.headless;
      this.headless = !settings.agent ? this.agent : settings.agent;
      this.headless = !settings.viewport ? this.viewport : settings.viewport;
    }
    this.page = null;
  }
  async newPage() {
    this.browser = await puppeteer.launch({
      headless: this.headless
    });

    var page = await this.browser.newPage();

    return page;
  }
  async login(url, email, password) {
    this.page = await this.newPage();

    // console.log(this.page);
    // Setting User Agent
    if (this.agent) {
      await this.page.setUserAgent(this.agent);
    }
    // Setting the Viewport Size.
    await this.page.setViewport(this.viewport);

    // Opens the Website itself.
    await this.page.goto(url, {
      waitUntil: 'networkidle2'
    });

    // console.log(this.page)

    // All Dialog's that popup from the website are auto declined, but a Emit for Dialog's message is triggered.
    this.page.on('dialog', async dialog => this.dialogResponse(dialog));

    // All Console Output is redirected too the Emit for Console.
    this.page.on('console', msg => this.consoleResponse(msg));
    this.page._client.on('Network.webSocketClosed', (data) => {
      // So far i have not figured out a way to identify which websocket has closed. which is annoying me.
      this.emit("wsClosed", data);
    })
    this.page._client.on('Network.webSocketCreated', (data) => {
      this.emit("wsCreated", data);
    });
    this.page._client.on('Network.webSocketFrameReceived', async (data) => {

      try {
        var json = JSON.parse(data.response.payloadData);
        switch (json.type) {
          case 'data':
            var name = Object.keys(json.payload.data)[0];
            var payload = json.payload.data[name];
            this.emit("jsonData", name, payload);
            break;
          default:

        }
      } catch(e) {

        var binary = Buffer.from(data.response.payloadData, 'base64')
        var decode_struct = {
          seq: binary.readUInt32BE(10),
          operation: binary.readUInt16BE(8),
          validator: {
            length: binary.length,
            binary: binary.readUInt32BE(0)
          },
          packet: binary.slice(binary.readUInt16BE(8) === 8 ? 18 : 22, binary.readUInt32BE(0))
        };
        // operation = 3 is the Chat Operation we wanna work with. This could be ALOT of things to be honest, but the most common triggered thing is specifically the Chat Messages.
        // Will add more Documentation and Triggers for all Associated Operation Triggers that Trovo has, most of them are pretty simple... LoL
        if (decode_struct.operation != 3) return null;
        var pbf = new Pbf(decode_struct.packet);
        var PackedData = null;
        pbf.readFields(function (tag) {
          switch (tag) {
            case 1:
                PackedData = pbf.readBytes();
              break;
            default:
              pbf.skip();
          }
        });
        var n_pbf = new Pbf(PackedData);
        var MData = {};
        n_pbf.readFields(function (tag) {
          MData[tag] = n_pbf.readString();
        });
        var message = {
          user: {
            name: MData[3],
            role: this.getUserRole(MData[6]),
          },
          content: MData[5]
        };
        if (message && message.user) {
          this.emit("chatMessage", message);
        }
      }
    });
    //This clicks the Login Button.
    var login_xpath = "div > nav > div.uinfo-wrapper.flex > button:nth-child(4)";
    await this.page.click(login_xpath);

    // This waits for the Login Window to Appear Correctly <3
    await this.page.waitFor('div.login-box > div.content-box > div.content-left > div > div:nth-child(2) > div > input');
    console.log("Geschafft!")

    // Location of the Email Div you must click in order to trigger the Input box.
    var email_click_path = "div.login-box > div.content-box > div.content-left > div > div:nth-child(2) > div.input-box.border-bottom > span";
    await this.page.click(email_click_path);

    // Location of the Input box you will need to type the Email in.
    var email_path = "div.login-box > div.content-box > div.content-left > div > div:nth-child(2) > div > input";
    await this.page.type(email_path, email);

    // Location of the Passsword Div you must click in order to trigger the Input box.
    var pass_click_path = "div.login-box > div.content-box > div.content-left > div > div:nth-child(4) > div.input-box.border-bottom > span";
    await this.page.click(pass_click_path);

    // Location of the Input Box you will need to Type the Password in.
    var pass_path = "div.login-box > div.content-box > div.content-left > div > div:nth-child(4) > div > input";
    await this.page.type(pass_path, password);

    // Location of the Login Button
    var login_button_path = "div.login-box > div.content-box > div.content-left > div > button";
    await this.page.click(login_button_path);

    await this.page.waitForNavigation();

  }
  async sendMessage(message) {
    /*
    These steps are used to Properly handle the Chat Window.
    */
    // Trigger the Chat Window to Open.
    var chat_toggle = "#live-fullscreen > svg";
    await this.page.click(chat_toggle);

    // Wait for the Chat Window to Finish Opening.
    await this.page.waitFor('div > div > div.live-wrap.base-main > div > div.chat-wrap.open > div.chat-list > section > div.input-container > div.input-wrap.flex.justify-between.align-end > div');

    // Click on the Chat Message Div to Trigger the Input Box to work.
    var input_box_path = "div > div > div.live-wrap.base-main > div > div.chat-wrap.open > div.chat-list > section > div.input-container > div.input-wrap.flex.justify-between.align-end > div";
    await this.page.click(input_box_path);

    // Click on the Chat Message Input Box and type into it the Message we are going to be Sending.
    var input_path = "div > div > div.live-wrap.base-main > div > div.chat-wrap.open > div.chat-list > section > div.input-container > div.input-wrap.flex.justify-between.align-end > div > div.editor";
    await this.page.type(input_path, message);

    // Click the Send Button, since yeah. You need todo this LoL
    var button_path = "div > div > div.live-wrap.base-main > div > div.chat-wrap.open > div.chat-list > section > div.input-container > div.input-feature-box.align-center.justify-between > button.cat-button.btn-send.normal.primary";
    await this.page.click(button_path);

    // Click the Close Chat Window, to Reset the State to be used by this Command at a Later time.
    var close_path = "div > div > div.live-wrap.base-main > div > div.chat-wrap.open > svg.svg-icon.cursor-pointer.toggle-icon.hover-highlight";
    await this.page.click(close_path);

  }
  async dialogResponse(dialog) {
    this.emit("dialogMessage", dialog.message());
    await dialog.dismiss();
  }
  consoleResponse(msg) {
    this.emit("consoleMessage", msg.text());
  }
  parseBinaryMessage(data) {
    data = Buffer.from(data, 'base64')
    var decode_struct = {
      seq: data.readUInt32BE(10),
      operation: data.readUInt16BE(8),
      validator: {
        length: data.length,
        data: data.readUInt32BE(0)
      },
      packet: data.slice(data.readUInt16BE(8) === 8 ? 18 : 22, data.readUInt32BE(0))
    };
    // operation = 3 is the Chat Operation we wanna work with. This could be ALOT of things to be honest, but the most common triggered thing is specifically the Chat Messages.
    // Will add more Documentation and Triggers for all Associated Operation Triggers that Trovo has, most of them are pretty simple... LoL
    if (decode_struct.operation != 3) return null;
    var pbf = new Pbf(decode_struct.packet);
    var PackedData = null;
    pbf.readFields(function (tag) {
      switch (tag) {
        case 1:
            PackedData = pbf.readBytes();
          break;
        default:
          pbf.skip();
      }
    });
    var n_pbf = new Pbf(PackedData);
    var MData = {};
    n_pbf.readFields(function (tag) {
      MData[tag] = n_pbf.readString();
    });
    return {
      name: MData[3],
      content: MData[5]
    };
  }
  getUserRole(data){
    for (var role in ROLE_STRINGS) {
      if(data.includes(ROLE_STRINGS[role])){
        return role;
      }
    }
    return "USER";
  }
}
