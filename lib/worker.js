/**
 * Title: Workers library
 * Description: Worker related function
 * Author: Md. Tareq Munawar
 * Date: 17/12/23
 */

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utlities');
const data = require('./data');
const { sendTwilioSms } = require('../helpers/notifications');

// worker object- module scaffolding
const worker = {};

// lookup all the checks
worker.gatherAllChecks = () => {
  // get all the checks
  data.check('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the check data
        data.read('checks', check, (err1, originalCheckData) => {
          if (!err1 && originalCheckData) {
            // pass the data to the check validator
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log('Error: reading one of the checks data');
          }
        });
      });
    } else {
      // there is no incoming request, so no callback is needed
      // this was a process function of my system
      console.log('Error: could not find any check to process');
    }
  });
};

// validate individual check data
worker.validateCheckData = (originalCheckData) => {
  const originalData = originalCheckData;
  if (originalCheckData && originalCheckData.id) {
    // স্টেট নামের প্রপার্টি দিয়ে দিচ্ছি
    originalData.state = typeof originalCheckData.state === 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    // লাস্ট কখন চেক করেছি
    originalData.lastChecked = typeof originalCheckData.lastChecked === 'number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;
    worker.performCheck(originalData);
  } else {
    console.log('Error: check was invalid or not properly formatted');
  }
};

// perform check
worker.performCheck = (originalCheckData) => {
  // prepare the initial check outcome
  // চেকের result
  let checkOutcome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  // আমাদের track rakhte hobe, jeno duibar kajta na hoye jay
  // পরের process e pathiye dea hoyeche kina setao akta variable er maddhome track rakhbo
  let outcomeSent = false;
  // parse the hostname and full url from data
  const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
  const hostName = parsedUrl.hostname;
  // we have to consider full url
  const { path } = parsedUrl;
  // construct the request
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };
  const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

  const req = protocolToUse.request(requestDetails, (res) => {
    // grab the status of the response
    const status = res.statusCode;
    // console.log(status);
    // update the check outcome and pass to the next process
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  //
  req.on('error', (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  req.on('timeout', () => {
    checkOutcome = {
      error: true,
      value: 'timeout',
    };
    if (!outcomeSent) {
      worker.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });
  req.end();
};

// save the check outcome to database and send to next process
worker.processCheckOutcome = (originalCheckData, checkOutcome) => {
  // check if the check outome is up or down
  const state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
  // decide whether we should alert the user or not
  const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);
  const newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();
  //
  data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      // if the alert is needed
      // send the check data to the next process
      if (alertWanted) {
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log('No alert is nedded because there is no state change');
      }
    } else {
      console.log('Error updating one of the checks data');
    }
  });
};
//
worker.alertUserToStatusChange = (newCheckData) => {
  // configure the message
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}`;
  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted to a status change via SMS: ${msg}`);
    } else {
      console.log('There was a problem sending sms to one of the user!');
    }
  });
};

// timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 10000);
};

// start the workers
worker.init = () => {
  worker.gatherAllChecks();
  worker.loop();
};

// export the object
module.exports = worker;
