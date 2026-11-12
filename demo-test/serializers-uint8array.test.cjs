'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Text } = require('../lib/paypalhttp/serializer/text');

test('text encoder decodes UTF-8 Uint8Array bodies including empty, Unicode and newlines', () => {
  const serializer = new Text();
  for (const text of ['', 'hello world', 'café ☕', 'line one\nline two', 'Ω≈ç√∫ ̃μ≤']) {
    const bytes = Uint8Array.from(Buffer.from(text, 'utf8'));
    assert.equal(serializer.encode({ body: bytes }), text);
  }
});

test('text encoder respects Uint8Array subarray byteOffset and byteLength', () => {
  const content = Buffer.from('café ☕', 'utf8');
  const bytes = Uint8Array.from(Buffer.concat([Buffer.from('BAD'), content, Buffer.from('BAD')]));
  assert.equal(new Text().encode({ body: bytes.subarray(3, 3 + content.length) }), 'café ☕');
});

test('text encoder preserves leading and embedded BOM characters from Uint8Array', () => {
  const text = '\uFEFFfirst\uFEFFlast';
  assert.equal(new Text().encode({ body: Uint8Array.from(Buffer.from(text, 'utf8')) }), text);
});

test('text encoder does not mutate a Uint8Array or its backing bytes', () => {
  const bytes = Uint8Array.from(Buffer.from('!hello?', 'utf8'));
  const before = Uint8Array.from(bytes);
  assert.equal(new Text().encode({ body: bytes.subarray(1, 6) }), 'hello');
  assert.deepEqual(bytes, before);
});

test('text encoder preserves string, Buffer, nullish and toString behavior', () => {
  const serializer = new Text();
  assert.equal(serializer.encode({ body: 'plain text' }), 'plain text');
  assert.equal(serializer.encode({ body: Buffer.from('café ☕', 'utf8') }), 'café ☕');
  assert.equal(serializer.encode({ body: Buffer.from('!abc?', 'utf8').subarray(1, 4) }), 'abc');
  assert.equal(serializer.encode({ body: null }), '');
  assert.equal(serializer.encode({ body: undefined }), '');
  assert.equal(serializer.encode({}), '');
  assert.equal(serializer.encode({ body: 0 }), '0');
  assert.equal(serializer.encode({ body: false }), 'false');
});
