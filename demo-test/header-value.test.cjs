'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const headerValue = require('../lib/paypalhttp/header_value');

test('matches header names ignoring case and preserves original values', () => {
  const value = ['text/plain'];
  assert.strictEqual(headerValue({ 'Content-Type': value }, 'cOnTeNt-TyPe'), value);
});
test('missing headers or matches return undefined', () => {
  for (const headers of [null, undefined, {}]) assert.equal(headerValue(headers, 'X-Test'), undefined);
  assert.equal(headerValue({ Accept: 'json' }, 'missing'), undefined);
});
test('inherited headers are ignored', () => {
  const headers = Object.create({ 'X-Private': 'hidden' });
  headers.Accept = 'json';
  assert.equal(headerValue(headers, 'x-private'), undefined);
  assert.equal(headerValue(headers, 'accept'), 'json');
});
test('falsy values are preserved', () => {
  for (const value of [0, false, '']) assert.strictEqual(headerValue({ 'X-Test': value }, 'x-test'), value);
});
test('input is never mutated', () => {
  const headers = Object.freeze({ Accept: 'json', 'X-Test': 0 });
  assert.equal(headerValue(headers, 'accept'), 'json');
  assert.equal(headerValue(headers, 'absent'), undefined);
  assert.deepEqual(headers, { Accept: 'json', 'X-Test': 0 });
});
