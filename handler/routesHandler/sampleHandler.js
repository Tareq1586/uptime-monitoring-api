/**
 * Title: Sample handler
 * Description: A sample handler
 * Author: Md. Tareq Munawar
 * Date: 01/11/23
 */

// handler object- module scaffolding
const handler = {};

// sample handler method to
handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    message: 'Sample page',
  });
};

//
module.exports = handler;
