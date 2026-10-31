'use strict';


const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Json } = require('../lib/paypalhttp/serializer/json');
const { FormEncoded } = require('../lib/paypalhttp/serializer/form_encoded');

test('JSON serializer round trips a value', () => {
  const serializer = new Json();
  const encoded = serializer.encode({ body: { example: 123 } });

  assert.deepEqual(serializer.decode(encoded), { example: 123 });
});

test('form serializer escapes values', () => {
  const result = new FormEncoded().encode({
    body: { note: 'hello & goodbye' }
  });

  assert.equal(result, 'note=hello%20%26%20goodbye');
});

test('form serializer encodes an empty body as an empty string', () => {
  assert.equal(new FormEncoded().encode({ body: {} }), '');
});

test('form serializer preserves an empty field name', () => {
  const result = new FormEncoded().encode({
    body: { '': 'a&b' }
  });

  assert.equal(result, '=a%26b');
});

test('form serializer escapes field names and values', () => {
  const result = new FormEncoded().encode({
    body: {
      'a&b': 'value & =',
      'x=y': 'value/with? reserved',
      'with space': 'spaces are escaped',
      'café': 'naïve ☕',
      ordinary: 'ascii'
    }
  });

  assert.equal(
    result,
    'a%26b=value%20%26%20%3D&x%3Dy=value%2Fwith%3F%20reserved&with%20space=spaces%20are%20escaped&caf%C3%A9=na%C3%AFve%20%E2%98%95&ordinary=ascii'
  );
});

test('form arrays omit null and undefined elements', () => {
  const values = ['red', null, undefined, '', 'blue'];

  assert.equal(
    new FormEncoded().encode({
      body: { before: 'one', tag: values, after: 'two' }
    }),
    'before=one&tag=red&tag=&tag=blue&after=two'
  );
  assert.deepEqual(values, ['red', null, undefined, '', 'blue']);
});

test('form arrays produce repeated pairs', () => {
  assert.equal(new FormEncoded().encode({body: {tag: ['red', 'blue']}}),
    'tag=red&tag=blue');
});
test('form arrays escape names and elements', () => {
  assert.equal(new FormEncoded().encode({body: {'a&b': ['x=y', 'hello world', 'café']}}),
    'a%26b=x%3Dy&a%26b=hello%20world&a%26b=caf%C3%A9');
});
test('form empty arrays emit no pairs and mixed fields retain order', () => {
  assert.equal(new FormEncoded().encode({body: {before: 'one', empty: [], tag: ['red', 'blue'], after: 'two'}}),
    'before=one&tag=red&tag=blue&after=two');
});
test('form arrays retain empty strings', () => {
  assert.equal(new FormEncoded().encode({body: {tag: ['', 'x']}}), 'tag=&tag=x');
});
test('form encoding does not mutate array inputs', () => {
  const tags = Object.freeze(['red', 'blue']);
  const body = Object.freeze({tag: tags});
  assert.equal(new FormEncoded().encode({body}), 'tag=red&tag=blue');
  assert.deepEqual(body, {tag: ['red', 'blue']});
});

