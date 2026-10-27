const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Json}=require('../lib/paypalhttp/serializer/json');
const {FormEncoded}=require('../lib/paypalhttp/serializer/form_encoded');
test('JSON serializer round trips a value',()=>{const s=new Json();assert.deepEqual(s.decode(s.encode({body:{example:123}})),{example:123});});
test('form serializer escapes values',()=>{assert.equal(new FormEncoded().encode({body:{note:'hello & goodbye'}}),'note=hello%20%26%20goodbye');});
