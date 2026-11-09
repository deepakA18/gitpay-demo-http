'use strict';

module.exports = function headerValue(headers, name) {
  if (headers == null || typeof name !== 'string') return undefined;
  var target = name.toLowerCase();
  var keys = Object.keys(headers);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].toLowerCase() === target) return headers[keys[i]];
  }
  return undefined;
};
