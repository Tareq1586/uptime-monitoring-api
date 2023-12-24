/**
 * Title: Uptime Monitoring API
 * Description: A RESTFuL API to monitor up or down time of user defined links
 * Author: Md. Tareq Munawar
 * Date: 11/01/23
 */

// Dependencies
const server = require('./lib/server');
const worker = require('./lib/worker');

// App object- module scaffolding
const app = {};

//
app.init = () => {
  // start the server
  server.init();
  // start the workers
  worker.init();
};

app.init();
