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
test('form serializer encodes array values as repeated pairs',()=>{
  assert.equal(new FormEncoded().encode({body:{tag:['red','blue']}}),'tag=red&tag=blue');
});
test('form serializer escapes array field names and values',()=>{
  assert.equal(
    new FormEncoded().encode({body:{'a&b':['x=y','hello world','café']}}),
    'a%26b=x%3Dy&a%26b=hello%20world&a%26b=caf%C3%A9'
  );
});
test('form serializer omits empty arrays and preserves field order',()=>{
  assert.equal(
    new FormEncoded().encode({body:{before:'one',empty:[],tags:['red','blue'],after:'two'}}),
    'before=one&tags=red&tags=blue&after=two'
  );
});
test('form serializer preserves empty array elements',()=>{
  assert.equal(new FormEncoded().encode({body:{tag:['','x']}}),'tag=&tag=x');
});
test('form serializer does not mutate array fields',()=>{
  const tags=['red','blue'];
  const body={tag:tags};

  new FormEncoded().encode({body});

  assert.deepEqual(body,{tag:['red','blue']});
  assert.deepEqual(tags,['red','blue']);
});
