/**
 * Title: Environment
 * Description: Setting the project environment
 * Author: Md. Tareq Munawar
 * Date: 07/11/23
 */

// app object- module scaffolding
const environment = {};

//
environment.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'djdjdjdjdj',
  maxChecks: 5,
  twilio: {
    fromPhone: '+16076540120',
    accountSid: 'ACf9aafa778b673471bb9010a4791b1df3',
    authToken: '64a948feb22acf15a7f19dcaed32de46',
  },
};
environment.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'dkdkdkdk',
  maxChecks: 5,
  twilio: {
    fromPhone: '+16076540120',
    accountSid: 'ACf9aafa778b673471bb9010a4791b1df3',
    authToken: '64a948feb22acf15a7f19dcaed32de46',
  },
};

//
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//
const envToExport = typeof environment[currentEnv] === 'object' ? environment[currentEnv] : environment.staging;

// export the environment
module.exports = envToExport;
