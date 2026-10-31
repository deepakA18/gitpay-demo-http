'use strict';

const querystring = require('querystring');

function isSupportedValue(value) {
  return typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value));
}

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

      if (!Array.isArray(value) && !isSupportedValue(value)) {
        throw new TypeError(`Unsupported form field value for "${key}"`);
      }

      const values = Array.isArray(value) ? value : [value];

      if (
        item !== null &&
        item !== undefined &&
        !isSupportedValue(item)
      ) {
        throw new TypeError(Unsupported form field value for "${key}");
      }

      for (const item of values) {
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
