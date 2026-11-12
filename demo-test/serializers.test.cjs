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

test('form encoding omits scalar null and undefined values', () => {
  assert.equal(
    new FormEncoded().encode({body: {before: 'one', nullValue: null, undefinedValue: undefined, after: 'two'}}),
    'before=one&after=two'
  );
});

test('form encoding retains scalar empty strings, zero, and false', () => {
  assert.equal(
    new FormEncoded().encode({body: {empty: '', zero: 0, disabled: false}}),
    'empty=&zero=0&disabled=false'
  );
});

test('form encoding supports scalar strings, booleans, and finite numbers', () => {
  assert.equal(
    new FormEncoded().encode({body: {text: 'hello', enabled: true, zero: 0, amount: 12.5}}),
    'text=hello&enabled=true&zero=0&amount=12.5'
  );
});

test('form encoding rejects unsupported scalar values', () => {
  const unsupportedValues = [
    {},
    () => {},
    Symbol('unsupported'),
    1n,
    NaN,
    Infinity,
    -Infinity
  ];

  for (const value of unsupportedValues) {
    assert.throws(
      () => new FormEncoded().encode({body: {value}}),
      {name: 'TypeError', message: 'Unsupported form field value for "value"'}
    );
  }
});

test('form encoding supports array strings, booleans, and finite numbers', () => {
  assert.equal(
    new FormEncoded().encode({
      body: { tag: ['hello', true, 0, 12.5] }
    }),
    'tag=hello&tag=true&tag=0&tag=12.5'
  );
});

test('form encoding rejects unsupported array elements', () => {
  const unsupportedValues = [
    {},
    [],
    () => {},
    Symbol('unsupported'),
    1n,
    NaN,
    Infinity,
    -Infinity
  ];

  for (const value of unsupportedValues) {
    assert.throws(
      () => new FormEncoded().encode({ body: { tag: [value] } }),
      { name: 'TypeError', message: 'Unsupported form field value for "tag"' }
    );
  }
});

test('form encoding preserves existing nullish array-item behavior', () => {
  assert.equal(
    new FormEncoded().encode({ body: { tag: [null, undefined] } }),
    'tag=null&tag=undefined'
  );
});

test('JSON decoder accepts one leading Unicode BOM', () => {
  assert.deepEqual(new Json().decode('\uFEFF{"example":123}'), {example: 123});
});

test('JSON decoder preserves ordinary objects, arrays and scalar values', () => {
  const decoder = new Json();
  for (const value of [{example: 123}, [1, 'two', null], 'hello', 42, true, false, null]) {
    assert.deepEqual(decoder.decode(JSON.stringify(value)), value);
  }
});

test('JSON decoder preserves Unicode BOM inside string values', () => {
  assert.deepEqual(new Json().decode('{"text":"before\uFEFFafter"}'), {text: 'before\uFEFFafter'});
  assert.equal(new Json().decode('"\uFEFFinside"'), '\uFEFFinside');
});

test('JSON decoder still rejects invalid JSON and strips only one leading BOM', () => {
  for (const body of ['{invalid}', '\uFEFF{invalid}', '\uFEFF\uFEFF{"example":123}', 'x{"example":123}', '\uFEFF']) {
    assert.throws(() => new Json().decode(body), SyntaxError);
  }
});

const { Text } = require('../lib/paypalhttp/serializer/text');

test('text serializer handles nullish bodies', () => {
  const serializer = new Text();

  for (const body of [null, undefined]) {
    assert.equal(serializer.encode({ body }), '');
    assert.equal(serializer.decode(body), '');
  }

  assert.equal(serializer.encode({}), '');
});

test('text serializer preserves existing conversions', () => {
  const serializer = new Text();
  const cases = [
    ['', ''],
    ['hello', 'hello'],
    ['café ☕', 'café ☕'],
    [0, '0'],
    [false, 'false'],
    [Buffer.from('café ☕', 'utf8'), 'café ☕']
  ];

  for (const [body, expected] of cases) {
    assert.equal(serializer.encode({ body }), expected);
    assert.equal(serializer.decode(body), expected);
  }
});

test('text serializer does not mutate requests or buffers', () => {
  const serializer = new Text();
  const body = Buffer.from('hello', 'utf8');
  const original = Buffer.from(body);
  const request = Object.freeze({ body });

  assert.equal(serializer.encode(request), 'hello');
  assert.equal(serializer.decode(body), 'hello');
  assert.equal(request.body, body);
  assert.deepEqual(body, original);
});

test('text serializer preserves content type matching', () => {
  const pattern = new Text().contentType();

  assert.equal(pattern.test('text/plain'), true);
  assert.equal(pattern.test('text/html; charset=utf-8'), true);
  assert.equal(pattern.test('application/json'), false);
});

test('JSON Buffer decoding supports plain UTF-8 and one leading BOM', () => {
  const decoder = new Json();
  for (const value of [{text: 'café ☕'}, [1, 'two', null], 'hello', 0, false, null]) {
    for (const prefix of ['', '\uFEFF']) {
      const input = Buffer.from(prefix + JSON.stringify(value), 'utf8');
      assert.deepEqual(decoder.decode(input), value);
    }
  }
});

test('JSON Buffer decoding preserves embedded BOM characters', () => {
  const decoder = new Json();
  for (const value of ['\uFEFFinside', {text: 'before\uFEFFafter'}]) {
    assert.deepEqual(decoder.decode(Buffer.from(JSON.stringify(value), 'utf8')), value);
  }
});

test('JSON Buffer decoding rejects invalid JSON and additional leading BOMs', () => {
  const decoder = new Json();
  for (const input of ['', '{invalid}', '\uFEFF', '\uFEFF{invalid}',
    '\uFEFF\uFEFF{"ok":true}', 'x{"ok":true}']) {
    assert.throws(() => decoder.decode(Buffer.from(input, 'utf8')), SyntaxError);
  }
});

test('JSON Buffer decoding does not mutate its input', () => {
  const input = Buffer.from('\uFEFF{"ok":true}', 'utf8');
  const original = Buffer.from(input);
  assert.deepEqual(new Json().decode(input), {ok: true});
  assert.deepEqual(input, original);
});


test('JSON Uint8Array decodes UTF-8 values with or without one BOM', () => {
  const json = new Json();
  for (const value of [{text: 'café ☕'}, [1, 'two'], 'hello', 42, true, null]) {
    for (const prefix of ['', '\uFEFF']) {
      const bytes = Uint8Array.from(Buffer.from(prefix + JSON.stringify(value), 'utf8'));
      assert.deepEqual(json.decode(bytes), value);
    }
  }
});

test('JSON Uint8Array respects the bounds of a sliced view', () => {
  const content = Buffer.from('\uFEFF{"text":"café"}', 'utf8');
  const bytes = Uint8Array.from(Buffer.concat([Buffer.from('BAD'), content, Buffer.from('BAD')]));
  const view = bytes.subarray(3, 3 + content.length);
  assert.deepEqual(new Json().decode(view), {text: 'café'});
});

test('JSON Uint8Array preserves embedded BOM and does not mutate bytes', () => {
  const bytes = Uint8Array.from(Buffer.from('\uFEFF{"text":"a\uFEFFb"}', 'utf8'));
  const before = Uint8Array.from(bytes);
  assert.deepEqual(new Json().decode(bytes), {text: 'a\uFEFFb'});
  assert.deepEqual(bytes, before);
});

test('JSON Uint8Array rejects invalid JSON and extra leading BOM', () => {
  for (const input of ['', '{', 'BAD{}', '\uFEFF', '\uFEFF\uFEFF{}']) {
    const bytes = Uint8Array.from(Buffer.from(input, 'utf8'));
    assert.throws(() => new Json().decode(bytes), SyntaxError);
  }
});
