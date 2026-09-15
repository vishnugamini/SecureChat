const { test } = require('node:test');
const assert = require('node:assert/strict');
const { generateMessage, generateLocationMessage } = require('../../src/utils/messages');

test('chat messages preserve the encrypted payload and include a timestamp', () => {
  const before = Date.now();
  const message = generateMessage('alice', 'U2FsdGVkX1+encrypted-payload');
  assert.equal(message.username, 'alice');
  assert.equal(message.text, 'U2FsdGVkX1+encrypted-payload');
  assert.ok(message.createdAt >= before && message.createdAt <= Date.now());
});

test('location messages preserve the sender and map URL', () => {
  const url = 'https://google.com/maps?q=34.02,-118.28';
  const message = generateLocationMessage('alice', url);
  assert.equal(message.username, 'alice');
  assert.equal(message.url, url);
  assert.equal(typeof message.createdAt, 'number');
});
