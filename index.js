/**
 * Title: Uptime Monitoring API
 * Description: A RESTFuL API to monitor up or down time of user defined links
 * Author: Md. Tareq Munawar
 * Date: 11/01/23
 */

// Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');
const { sendTwilioSms } = require('./helpers/notifications');
// const data = require('./lib/data');

// App object- module scaffolding
const app = {};
// @TODO:
// sendTwilioSms('01785521783', 'Hello World!', (err) => {
//   console.log(`The error was ${err}`);
// });
// write data to file system
// data.create('test', 'newFile', { name: 'Bangladesh', language: 'Bangla' }, (error) => {
//   console.log(`error was ${error}`);
// });

// read data from file system
// data.read('test', 'newFile', (err, result) => {
//   console.log(result);
// });

//
// data.update('test', 'newFile', { name: 'England', language: 'English' }, (err) => {
//   console.log(`Error was ${err}`);
// });

//
// data.delete('test', 'newFile', (err) => {
//   console.log(`Error was ${err}`);
// });

// Creating a server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`listening to port ${environment.port} ...`);
  });
};

// Handle request response
app.handleReqRes = handleReqRes;

//
app.createServer();
