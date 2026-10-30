const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Json}=require('../lib/paypalhttp/serializer/json');
const {FormEncoded}=require('../lib/paypalhttp/serializer/form_encoded');
test('JSON serializer round trips a value',()=>{const s=new Json();assert.deepEqual(s.decode(s.encode({body:{example:123}})),{example:123});});
test('form serializer escapes values',()=>{assert.equal(new FormEncoded().encode({body:{note:'hello & goodbye'}}),'note=hello%20%26%20goodbye');});
test('form serializer encodes an empty body as an empty string',()=>{assert.equal(new FormEncoded().encode({body:{}}),'');});
test('form serializer preserves an empty field name', () => {
  assert.equal(
    new FormEncoded().encode({body: {'': 'a&b'}}),
    '=a%26b'
  );
});
test('form serializer escapes field names and values',()=>{
  assert.equal(
    new FormEncoded().encode({body:{
      'a&b':'value & =',
      'x=y':'value/with? reserved',
      'with space':'spaces are escaped',
      'café':'naïve ☕',
      ordinary:'ascii'
    }}),
    'a%26b=value%20%26%20%3D&x%3Dy=value%2Fwith%3F%20reserved&with%20space=spaces%20are%20escaped&caf%C3%A9=na%C3%AFve%20%E2%98%95&ordinary=ascii'
  );
});
