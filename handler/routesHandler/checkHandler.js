/**
 * Title: Check handler
 * Description: Handler to handle check related routes
 * Author: Md. Tareq Munawar
 * Date: 11/19/23
 */

//
const data = require('../../lib/data');
const { parseJSON, createRandomString } = require('../../helpers/utlities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

// handler object- module scaffolding
const handler = {};

// user handler handler method to handle
handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete'];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

//
handler._check = {};

handler._check.post = (requestProperties, callback) => {
  const protocol = typeof requestProperties.body.protocol === 'string'
        && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
    ? requestProperties.body.protocol
    : false;

  const url = typeof requestProperties.body.url === 'string'
        && requestProperties.body.url.trim().length > 0
    ? requestProperties.body.url
    : false;

  const method = typeof requestProperties.body.method === 'string'
        && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
    ? requestProperties.body.method
    : false;

  const successCodes = typeof requestProperties.body.successCodes === 'object'
        && requestProperties.body.successCodes instanceof Array
    ? requestProperties.body.successCodes
    : false;

  const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number'
        && requestProperties.body.timeoutSeconds % 1 === 0
        && requestProperties.body.timeoutSeconds >= 1
        && requestProperties.body.timeoutSeconds <= 5
    ? requestProperties.body.timeoutSeconds
    : false;
  if (protocol && url && method && successCodes && timeoutSeconds) {
    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
    data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = JSON.parse(tokenData).phone;
        data.read('users', userPhone, (err1, userData) => {
          if (!err1 && userData) {
            tokenHandler._token.verify(token, userPhone, (isValid) => {
              if (isValid) {
                const userObj = parseJSON(userData);
                const userChecks = typeof userObj.checks === 'string' && userObj.checks instanceof Array ? userObj.checks : [];
                if (userChecks.length < maxChecks) {
                  const checkId = createRandomString(20);
                  const checkObj = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  data.create('checks', checkId, checkObj, (err2) => {
                    if (!err2) {
                      userObj.checks = userChecks;
                      userObj.checks.push(checkId);
                      data.update('users', userPhone, userObj, (err3) => {
                        if (!err3) {
                          // return data about the new check
                          callback(200, checkObj);
                        } else {
                          callback(502, { error: 'There is a problem in the server side!' });
                        }
                      });
                    } else {
                      callback(501, { error: 'There is a problem in the server side!' });
                    }
                  });
                } else {
                  callback(401, { error: 'User has already reached max check limit!' });
                }
              } else {
                callback(403);
              }
            });
          } else {
            callback(404, { error: 'User not found' });
          }
        });
      } else {
        callback(403);
      }
    });
  } else {
    callback(400);
  }
};

handler._check.get = (requestProperties, callback) => {
  // const id =  requestProperties.querystringObject.id === 'string'
  //  && requestProperties.querystringObject.id.trim().length === 20
  //   ? requestProperties.querystringObject.id : false;
  // console.log(id);typeof
  const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;
  if (id) {
    data.read('checks', id, (err, checkData) => {
      // looking up the user
      if (!err && checkData) {
        const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
        console.log(token);
        tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (isValid) => {
          if (isValid) {
            callback(200, parseJSON(checkData));
          } else {
            callback(403, { error: 'Authentication problem!' });
          }
        });
      } else {
        callback(500);
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};

// @TODO: Authentication
handler._check.put = (requestProperties, callback) => {
  const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
  const protocol = typeof requestProperties.body.protocol === 'string'
  && ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
    ? requestProperties.body.protocol
    : false;

  const url = typeof requestProperties.body.url === 'string'
  && requestProperties.body.url.trim().length > 0
    ? requestProperties.body.url
    : false;

  const method = typeof requestProperties.body.method === 'string'
  && ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
    ? requestProperties.body.method
    : false;

  const successCodes = typeof requestProperties.body.successCodes === 'object'
  && requestProperties.body.successCodes instanceof Array
    ? requestProperties.body.successCodes
    : false;

  const timeoutSeconds = typeof requestProperties.body.timeoutSeconds === 'number'
  && requestProperties.body.timeoutSeconds % 1 === 0
  && requestProperties.body.timeoutSeconds >= 1
  && requestProperties.body.timeoutSeconds <= 5
    ? requestProperties.body.timeoutSeconds
    : false;
  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', id, (err, checkData) => {
        if (!err && checkData) {
          const checkObj = parseJSON(checkData);
          const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
          tokenHandler._token.verify(token, checkObj.userPhone, (isValid) => {
            if (isValid) {
              if (protocol) {
                checkObj.protocol = protocol;
              }
              if (url) {
                checkObj.url = url;
              }
              if (method) {
                checkObj.method = method;
              }
              if (successCodes) {
                checkObj.successCodes = successCodes;
              }
              if (timeoutSeconds) {
                checkObj.timeoutSeconds = timeoutSeconds;
              }
              // update the check object
              data.update('checks', id, checkObj, (err1) => {
                if (!err1) {
                  callback(200);
                } else {
                  callback(500, { error: 'There is an error in the server side' });
                }
              });
            } else {
              callback(403, { error: 'Authentication problem' });
            }
          });
        }
      });
    } else {
      callback(400, { error: 'You must provide at least a field to update' });
    }
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};

// @TODO: Authentication
handler._check.delete = (requestProperties, callback) => {
  const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;
  if (id) {
    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
    data.read('tokens', token, (err, tokenData) => {
      if (!err && tokenData) {
        const userPhone = parseJSON(tokenData).phone;
        tokenHandler._token.verify(token, userPhone, (isValid) => {
          if (isValid) {
            data.delete('checks', id, (err1) => {
              if (!err1) {
                data.read('users', userPhone, (err2, userData) => {
                  if (!err2 && userData) {
                    const uData = parseJSON(userData);
                    // instanceof operator
                    const userChecks = typeof uData.checks === 'object' && uData.checks instanceof Array ? uData.checks : [];
                    const indexOfCheck = userChecks.indexOf(id);
                    if (indexOfCheck > -1) {
                      // at position x, remove 1 element
                      userChecks.splice(indexOfCheck, 1);
                      uData.checks = userChecks;
                      data.update('users', userPhone, uData, (err3) => {
                        if (!err3) {
                          callback(200);
                        } else {
                          callback(503);
                        }
                      });
                    } else {
                      callback(502);
                    }
                  } else {
                    callback(501);
                  }
                });
              } else {
                callback(500);
              }
            });
          } else {
            callback(403);
          }
        });
      } else {
        callback(501);
      }
    });
  } else {
    callback(404, { error: 'You have a problem in your request' });
  }
};

//
module.exports = handler;
