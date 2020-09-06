module.exports = {
  ENUMS: require('./data/enums.js'),
  GraphqlAPI: require('./api/TrovoApollo.js'),
  SocketClient: require('./client/SocketClient.js'),
  BrowserClient: require('./client/BrowserClient.js'),
  RestfulAPI: require('./api/TrovoRestful.js')
};
