module.exports = {
  BrowserClient: require('./client/BrowserClient.js'),
  ENUMS: require('./data/enums.js'),
  GraphqlAPI: require('./api/TrovoApollo.js'),
  RestfulAPI: require('./api/TrovoRestful'),
  SocketClient: require('./client/SocketClient.js'),
};
