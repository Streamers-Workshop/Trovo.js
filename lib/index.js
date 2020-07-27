module.exports = {
  Client: require('./client/TrovoClient.js'),
  ENUMS: require('./data/enums.js'),
  SocketClient: require('./client/ApolloSocketClient.js'),
  GraphqlAPI: require('./api/TrovoApollo.js'),
  RestfulAPI: require('./api/Restful')
};
