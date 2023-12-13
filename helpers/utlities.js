/**
 *
 */

//
const crypto = require('crypto');
const env = require('./environments');

//
const utilities = {};

//
utilities.parseJSON = (jsonString) => {
  let output;
  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};

//
utilities.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto.createHmac('sha256', env.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  }
  return false;
};
utilities.createRandomString = (strlen) => {
  let len = strlen;
  len = typeof strlen === 'number' && strlen > 0 ? strlen : false;
  if (len) {
    const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz1234567890';
    let output = '';
    for (let i = 1; i <= len; i += 1) {
      const randomCharacter = possibleCharacters.charAt(
        Math.floor(Math.random() * possibleCharacters.length),
      );
      output += randomCharacter;
    }
    return output;
  }
  return false;
};

//
module.exports = utilities;
