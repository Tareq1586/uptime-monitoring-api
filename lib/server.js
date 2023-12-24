// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

const server = {};
// Creating a server
server.createServer = () => {
  const createServerVariable = http.createServer(server.handleReqRes);
  createServerVariable.listen(environment.port, () => {
    console.log(`listening to port ${environment.port} ...`);
  });
};

// Handle request response
server.handleReqRes = handleReqRes;

//
server.init = () => {
  server.createServer();
};

// export the module
module.exports = server;
