/**
 * Title: User handler
 * Description: Handler to handle user related routes
 * Author: Md. Tareq Munawar
 * Date: 11/19/23
 */

//
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utlities');
const tokenHandler = require('./tokenHandler');

// handler object- module scaffolding
const handler = {};

// user handler handler method to handle
handler.userHandler = (requestProperties, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete'];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

//
handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName = typeof requestProperties.body.firstName === 'string'
    && requestProperties.body.firstName.trim().length > 0
    ? requestProperties.body.firstName
    : false;
  const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
  const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
  const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
  const tosAgreement = typeof requestProperties.body.tosAgreement === 'boolean' && requestProperties.body.tosAgreement ? requestProperties.body.tosAgreement : false;

  //
  if (firstName && lastName && phone && password && tosAgreement) {
    data.read('users', phone, (err1) => {
      if (err1) {
        const userObj = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        data.create('users', phone, userObj, (err2) => {
          if (!err2) {
            callback(200, { message: 'User was created successfully' });
          } else {
            callback(500, {
              error: 'Could not create user',
            });
          }
        });
      } else {
        callback(500, {
          error: 'There was an problem in server side!',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

  if (phone) {
    const token = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read('users', phone, (err, userData) => {
          const user = { ...parseJSON(userData) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, { error: 'Requested user not found' });
          }
        });
      } else {
        callback(403, { error: 'Authentication failed' });
      }
    });
  } else {
    callback(404, { error: 'Requested user not found' });
  }
};

// @TODO: Authentication
handler._users.put = (requestProperties, callback) => {
  const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
  const firstName = typeof requestProperties.body.firstName === 'string'
  && requestProperties.body.firstName.trim().length > 0
    ? requestProperties.body.firstName
    : false;
  const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;
  const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
  if (phone) {
    if (firstName || lastName || password) {
      const tokenId = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
      tokenHandler._token.verify(tokenId, phone, (tokenData) => {
        if (tokenData) {
          data.read('users', phone, (err1, uData) => {
            const userData = { ...parseJSON(uData) };
            if (!err1 && userData) {
              if (firstName) {
                userData.firstName = firstName;
              } if (lastName) {
                userData.lastName = lastName;
              } if (password) {
                userData.password = hash(password);
              }
              data.update('users', phone, userData, (err2) => {
                if (!err2) {
                  callback(200, { message: 'User was updated successfully' });
                } else {
                  callback(500, { error: 'There was a problem in server side' });
                }
              });
            } else {
              callback(500, { error: 'There is a problem in the server side' });
            }
          });
        } else {
          callback(403, { error: 'Authentication failed' });
        }
      });
      // lookup the user
    } else {
      callback(400, { error: 'You have a problem in your request' });
    }
  } else {
    callback(400, { error: 'Invalid phone number, please try again' });
  }
};

// @TODO: Authentication
handler._users.delete = (requestProperties, callback) => {
  // Check the phone number if valid
  const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

  if (phone) {
    const tokenId = typeof requestProperties.headerObj.token === 'string' ? requestProperties.headerObj.token : false;
    tokenHandler._token.verify(tokenId, phone, (isValid) => {
      if (isValid) {
        data.read('users', phone, (err1, userData) => {
          if (!err1 && userData) {
            data.delete('users', phone, (err2) => {
              if (!err2) {
                callback(200, { message: 'User deleted successfully!' });
              } else {
                callback(500, { error: 'There was a server side error!' });
              }
            });
          } else {
            callback(500, { error: 'There was a server side error!' });
          }
        });
      } else {
        callback(403, { error: 'Authentication error!' });
      }
    });
    // Lookup the user
  } else {
    callback(400, { error: 'There was a problem in your request!' });
  }
};

//
module.exports = handler;
