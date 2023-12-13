/**
 * Title: Token handler
 * Description: Handler to handle token related routes
 * Author: Md. Tareq Munawar
 * Date: 11/19/23
 */

//
const data = require('../../lib/data');
const { hash, parseJSON } = require('../../helpers/utlities');
const { createRandomString } = require('../../helpers/utlities');

// handler object- module scaffolding
const handler = {};

// user handler handler method to handle
handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethod = ['get', 'post', 'put', 'delete'];
  if (acceptedMethod.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

//
handler._token = {};

handler._token.post = (requestProperties, callback) => {
  const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;
  const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;
  if (phone && password) {
    data.read('users', phone, (err, userData) => {
      const hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        const tokenId = createRandomString(20);
        const expires = Date.now() + 60 * 60 * 1000;
        const tokenObj = {
          phone,
          id: tokenId,
          expires,
        };
        data.create('tokens', tokenId, tokenObj, (error) => {
          if (!error) {
            callback(200, { message: 'Token created successfully!' });
          } else {
            callback(500, { error: 'There was an error in the server side!' });
          }
        });
      } else {
        callback(400, { error: 'Password is not valid!' });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request!' });
  }
};

handler._token.get = (requestProperties, callback) => {
  const id = typeof requestProperties.queryStringObject.id === 'string'
        && requestProperties.queryStringObject.id.trim().length === 20
    ? requestProperties.queryStringObject.id
    : false;
  if (id) {
    data.read('tokens', id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(500, { error: 'There was a error in the server side!' });
      }
    });
  } else {
    callback(400, { error: 'You have a problem in your request' });
  }
};

handler._token.put = (requestProperties, callback) => {
  const id = typeof requestProperties.body.id === 'string' && requestProperties.body.id.trim().length === 20 ? requestProperties.body.id : false;
  const extend = !!(typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true);
  if (id && extend) {
    data.read('tokens', id, (err, tokenData) => {
      const tokenObj = { ...parseJSON(tokenData) };
      if (tokenObj.expires > Date.now()) {
        tokenObj.expires = Date.now() + 60 * 60 * 1000;
        data.update('tokens', id, tokenObj, (err1) => {
          if (!err1) {
            callback(200, { message: 'Token updated successfully' });
          } else {
            callback(500, { error: 'Error in the server side!' });
          }
        });
      } else {
        callback(500, { error: 'Oops! Token already expired!' });
      }
    });
  } else {
    callback(404, { error: 'You have a problem in your request' });
  }
};

// @TODO: Authentication
handler._token.delete = (requestProperties, callback) => {
  const id = typeof requestProperties.queryStringObject.id === 'string' && requestProperties.queryStringObject.id.trim().length === 20 ? requestProperties.queryStringObject.id : false;
  if (id) {
    data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        data.delete('tokens', id, (err1) => {
          if (!err1) {
            callback(200, { message: 'Token was deleted successfuly' });
          } else {
            callback(500, { error: 'There was a problem in the server side' });
          }
        });
      } else {
        callback(500, { error: 'There is a problem in the server side' });
      }
    });
  } else {
    callback(404, { error: 'You have a problem in your request' });
  }
};
handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (err, tokenData) => {
    if (!err && tokenData) {
      if (parseJSON(tokenData).phone === phone && parseJSON(tokenData).expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

//
module.exports = handler;
