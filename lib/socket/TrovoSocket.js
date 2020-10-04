const path = require('path');
const WebSocket = require('ws');
const protobuf = require('protobufjs');
const Pbf = require('pbf');
const TrovoApollo = require('../api/TrovoApollo');

const DATA_ENUMS = require('../data/enums.js');

const URL = 'wss://chat.trovo.live/sub';

// https://github.com/Bioblaze/Trovo.js/blob/master/lib/client/TrovoClient.js
function messageOptions(tag, obj, pbf) {
  if (tag === 1) obj.key = pbf.readString();
  else if (tag === 2) obj.value = pbf.readString();
}
function badgesOptions(tag, obj, pbf) {
  if (tag === 2) obj.value = pbf.readString();
}
function decoreOptions(tag, obj, pbf) {
  if (tag === 1) obj.value = pbf.readString();
}
function messageLayer(tag, obj, pbf) {
  if (tag === 1) obj.unknownInt = pbf.readVarint(true);
  else if (tag === 2) obj.identifier = pbf.readString();
  else if (tag === 3) obj.user = pbf.readString();
  else if (tag === 5) obj.content = pbf.readString();
  else if (tag === 6) obj.id = pbf.readVarint(true);
  else if (tag === 7) obj.chatType = pbf.readVarint(true);
  else if (tag === 8) obj.something = pbf.readVarint(true);
  else if (tag === 9) obj.anotherIdentifier = pbf.readString();
  else if (tag === 11) obj.iconURL = pbf.readString();
  else if (tag === 12) obj.accountName = pbf.readString();
  else if (tag === 13) {
    if (obj.badges === undefined) {
      obj.badges = [];
    }
    const data = pbf.readMessage(badgesOptions, {});
    obj.badges.push(data.value);
  } else if (tag === 14) {
    if (obj.decore === undefined) {
      obj.decore = [];
    }
    const data = pbf.readMessage(decoreOptions, {});
    obj.decore.push(data.value);
  } else if (tag === 20) {
    const data = pbf.readMessage(messageOptions, {});
    obj[data.key] = data.value;
  }
}

function baseLayer(tag, layer, pbf) {
  if (tag === 1) layer.id = pbf.readString();
  else if (tag === 2) layer.type = pbf.readVarint(true);
  else if (tag === 3) {
    if (layer.data === undefined) {
      layer.data = [];
    }
    layer.data.push(pbf.readMessage(messageLayer, {}));
  } else if (tag === 5) layer.ud1 = pbf.readVarint(true);
  else if (tag === 6) layer.ud2 = pbf.readVarint(true);
}

function pt(e, t) {
  const n = new Uint8Array(e.byteLength + t.byteLength);
  return n.set(new Uint8Array(e), 0), n.set(new Uint8Array(t), e.byteLength), n.buffer;
}

function encodePacket(e = 1, t = 1, n) {
  const r = new ArrayBuffer(18);
  const o = new DataView(r);
  return o.setInt32(0, 18 + n.byteLength),
  o.setInt16(4, 18),
  o.setInt16(6, 1),
  o.setInt16(8, e),
  o.setInt32(10, t),
  o.setInt16(14, 0),
  o.setInt16(16, 0),
  pt(r, n);
}

function decodePacket(data) {
  const dv = new DataView(data, 0);
  const size = dv.getInt32(0);
  if (size !== dv.byteLength) {
    return;
  }
  const operation = dv.getInt16(8);
  return {
    seq: dv.getInt32(10),
    operation,
    body: {
      startPosition: 18,
      endPosition: size,
      packView: data.slice && data.slice(operation === 8 ? 18 : 22, size),
    },
  };
}

class TrovoSocket {
  constructor(channelID, emitter, trovoApollo = null) {
    this.channelID = channelID;
    this.emitter = emitter;
    this.trovoApollo = trovoApollo || new TrovoApollo();

    this.token = null;
    this.bufferToken = null;

    this.ws = null;
    this.seq = 1;
    this.checkTime = 30;
    this.heartTimer = undefined;
    this.logs = [];
  }

  async connect() {
    const { getToken } = await this.trovoApollo.GetToken({
      subinfo: {
        page: {
          scene: 'SCENE_CHANNEL',
          pageID: this.channelID,
        },
        streamerID: this.channelID,
      },
    });
    const { token } = getToken;
    this.token = token;
    this.bufferToken = await this._getTokenBuffer(token);

    this.ws = new WebSocket(URL);
    this.ws.binaryType = 'arraybuffer';
    this.ws.onopen = this._handleOpen.bind(this);
    this.ws.onmessage = this._handleMessage.bind(this);
    this.ws.onerror = this._handleError.bind(this);
    this.ws.onclose = this._handleClose.bind(this);
  }

  async close () {
    this.ws.close()
  }

  async _handleOpen(event) {
    this.emitter.emit('socketOpen', event);
    this._sendToken();
  }

  async _handleMessage(event) {
    this.emitter.emit('socketMessage', event);
    if (event.data) {
      const rootData = decodePacket(event.data);
      if (rootData.operation === 3) {
        const messages = new Pbf(rootData.body.packView).readFields(baseLayer, {});
        if (messages.data && messages.data.length !== 0) {
          messages.data.forEach((m) => this._emitMessageBasedOnType(m));
        }
      } else if (rootData.operation === 2) {
        this.reconnectTime = 3;
        this._sendHeartBeatBuf();
      } else if (rootData.operation === 8) {
        if (!this.heartTimer) {
          this._keepHeartBeat();
        }
      }
    }
  }

  async _handleError(event) {
    this.emitter.emit('socketError', event);
    console.error('SOCKET ERROR');
  }

  async _handleClose(event) {
    this.emitter.emit('socketClose', event);
    console.error('SOCKET CLOSE');
  }

  // === Private func
  async _getTokenBuffer(token) {
    const root = await protobuf.load(path.join(__dirname, 'websocket.proto'));
    const Message = root.lookupType('WebSocket.Message');
    const message = Message.create({ token });
    const buffer = Message.encode(message).finish();
    return buffer;
  }

  _sendToken() {
    const data = encodePacket(1, this.seq++, this.bufferToken);
    this.ws.send(data);
  }

  _sendHeartBeatBuf() {
    const data = encodePacket(7, this.seq++, this.bufferToken);
    this.ws.send(data);
  }

  _keepHeartBeat() {
    this.heartTimer = setTimeout(() => {
      if (this.ws.readyState === this.ws.OPEN) {
        this._sendHeartBeatBuf();
        this._keepHeartBeat();
      }
    }, 1e3 * this.checkTime);
  }

  _emitMessageBasedOnType(op) {
    if (op.__history__ !== undefined) return;
    var temp = Buffer.from(JSON.stringify(op)).toString('base64');
    if (op.chatType !== undefined) {
      if (this.logs.indexOf(temp) > -1) return;
      this.logs.push(temp);
      switch (op.chatType) {
        case DATA_ENUMS.CHAT_TYPES.WELCOME: // User Joined
          this.emitter.emit('chatEvent', 'userJoined', op);
          break;
        case DATA_ENUMS.CHAT_TYPES.FOLLOW: // User Followed
          this.emitter.emit('chatEvent', 'userFollowed', op);
          break;
        case DATA_ENUMS.CHAT_TYPES.SUBSCRIBE_CHANNEL: // User Subbed
          this.emitter.emit('chatEvent', 'userSubbed', op);
          break;
        case DATA_ENUMS.CHAT_TYPES.RAID:
            this.emitter.emit('chatEvent', 'raidUser', op);
            break;
        case DATA_ENUMS.CHAT_TYPES.GIFT: // Gift
          const spelldata = JSON.parse(op.content);
          const spellenum = DATA_ENUMS.SPELLS[spelldata.id];
          const newdata = { ...spelldata, ...DATA_ENUMS.SPELL_DATA[spellenum] };
          op.content = newdata;
          this.emitter.emit('chatEvent', 'giftRecieved', op);
          break;
        default:
          this.emitter.emit('chatMessage', op);
      }
    } else {
      if (this.logs.indexOf(temp) > -1) return;
      this.logs.push(temp);
      this.emitter.emit('chatMessage', op);
    }
  }
}

module.exports = TrovoSocket;
