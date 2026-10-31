'use strict';

const querystring = require('querystring');

class FormEncoded {
  contentType() {
    return /^application\/x-www-form-urlencoded/;
  }

  encode(httpRequest) {
    const parts = [];

    for (const key of Object.keys(httpRequest.body)) {
      const value = httpRequest.body[key];

      if (value === null || value === undefined) {
        continue;
      }

      const values = Array.isArray(value) ? value : [value];

      for (const item of values) {
        if (Array.isArray(value) && (item === null || item === undefined)) {
          continue;
        }
      
        parts.push(`${querystring.escape(key)}=${querystring.escape(item)}`);
      }
    }

    return parts.join('&');
  }

  decode() {
    throw new Error('FormEncoded does not support deserialization');
  }
}

module.exports.FormEncoded = FormEncoded;
