'use strict';

const querystring = require('querystring');

class FormEncoded {
  contentType() {
    return /^application\/x-www-form-urlencoded/;
  }

  encode(httpRequest) {
    const parts = [];

for (const item of values) {
  if (
    Array.isArray(value) &&
    item !== null &&
    item !== undefined &&
    !isSupportedValue(item)
  ) {
    throw new TypeError(`Unsupported form field value for "${key}"`);
  }

  parts.push(`${querystring.escape(key)}=${querystring.escape(item)}`);
}

    return parts.join('&');
  }

  decode() {
    throw new Error('FormEncoded does not support deserialization');
  }
}

module.exports.FormEncoded = FormEncoded;
