/**
 *
 */

// dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handler/routesHandler/notFoundHandler');
const { parseJSON } = require('./utlities');

// handler object- module scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  // request handling
  // get the url and parse it
  const parsedURL = url.parse(req.url, true);

  const path = parsedURL.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');
  const method = req.method.toLowerCase();
  const queryStringObject = parsedURL.query;
  const headerObj = req.headers;

  //
  const requestProperties = {
    parsedURL,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headerObj,
  };

  //
  const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : notFoundHandler;

  //
  const decoder = new StringDecoder('utf-8');
  let realData = '';
  req.on('data', (buffer) => {
    realData += decoder.write(buffer);
  });
  req.on('end', () => {
    realData += decoder.end();

    requestProperties.body = parseJSON(realData);

    chosenHandler(requestProperties, (statusCod, paylod) => {
      const statusCode = typeof statusCod === 'number' ? statusCod : 500;
      const payload = typeof paylod === 'object' ? paylod : {};
      const payloadString = JSON.stringify(payload);

      // return the final response
      // set a header to the response object
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

//
module.exports = handler;
