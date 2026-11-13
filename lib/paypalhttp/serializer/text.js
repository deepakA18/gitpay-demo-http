'use strict';

class Text {
  encode(request) {
    if (request.body === null || request.body === undefined) {
      return '';
    }
    if (typeof request.body === 'string') {
      return request.body;
    }
    if (request.body instanceof Uint8Array && !Buffer.isBuffer(request.body)) {
      return Buffer.from(request.body.buffer, request.body.byteOffset, request.body.byteLength).toString('utf8');
    }
    return request.body.toString();
  }

  decode(body) {
    if (body instanceof Uint8Array) {
      return Buffer.from(body.buffer, body.byteOffset, body.byteLength).toString('utf8');
    }
    if (body === null || body === undefined) {
      return '';
    }
    if (typeof body === 'string') {
      return body;
    }
    return body.toString();
  }

  contentType() {
    return /^text\/.*/;
  }
}

module.exports.Text = Text;