'use strict';

class Json {
  encode(request) {
    return JSON.stringify(request.body);
  }

  decode(body) {
    if (typeof body === 'string' && body.charCodeAt(0) === 0xFEFF) {
      body = body.slice(1);
    }

    return JSON.parse(body);
  }

  contentType() {
    return /^application\/json/;
  }
}

module.exports.Json = Json;
