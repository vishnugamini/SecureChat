const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const { setTimeout: delay } = require('node:timers/promises');
const io = require('socket.io-client');

let server;
let baseUrl;
let output = '';
const clients = [];

before(async () => {
  assert.ok(process.env.MONGODB_URI, 'Set MONGODB_URI to an isolated test database.');
  const listener = net.createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  baseUrl = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['index.js'], {
    env: { ...process.env, PORT: String(port), NODE_ENV: 'test' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  server.stdout.on('data', data => { output += data; });
  server.stderr.on('data', data => { output += data; });
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(server.exitCode, null, `Server exited: ${output}`);
    try {
      const response = await fetch(`${baseUrl}/stats`, { signal: AbortSignal.timeout(500) });
      if (response.ok) return;
    } catch {}
    await delay(100);
  }
  throw new Error(`App/database did not become ready: ${output}`);
}, { timeout: 65000 });

after(async () => {
  for (const client of clients) client.disconnect();
  if (server && server.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    const killTimer = setTimeout(() => server.kill('SIGKILL'), 3000);
    try { await exited; } finally { clearTimeout(killTimer); }
  }
});

async function connect() {
  const client = io(baseUrl, { transports: ['websocket'], forceNew: true, reconnection: false });
  clients.push(client);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Socket connection timed out')), 5000);
    client.once('connect', () => { clearTimeout(timer); resolve(); });
    client.once('connect_error', error => { clearTimeout(timer); reject(error); });
  });
  return client;
}

function emit(client, event, payload) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${event} acknowledgement timed out`)), 5000);
    client.emit(event, payload, error => { clearTimeout(timer); resolve(error); });
  });
}

function nextMessage(client, event, predicate) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      client.off(event, handler);
      reject(new Error(`${event} timed out`));
    }, 5000);
    function handler(message) {
      if (!predicate(message)) return;
      clearTimeout(timer);
      client.off(event, handler);
      resolve(message);
    }
    client.on(event, handler);
  });
}

test('serves pages, the Socket.IO client, and the custom 404', async () => {
  for (const route of ['/', '/create.html', '/chat.html', '/statistics', '/blogs', '/socket.io/socket.io.js']) {
    const response = await fetch(`${baseUrl}${route}`);
    assert.equal(response.status, 200, route);
    assert.ok((await response.text()).length > 0, route);
  }
  assert.equal((await fetch(`${baseUrl}/missing-page`)).status, 404);
});

test('creates a protected room, enforces access/capacity, and relays messages', { timeout: 30000 }, async () => {
  const alice = await connect();
  const bob = await connect();
  const eve = await connect();
  const room = '123456';
  assert.equal(await emit(alice, 'create', { username: 'alice', room, password: 'test-password', roomSize: 2 }), undefined);
  assert.equal(await emit(bob, 'join', { username: 'bob', room, password: 'wrong' }), 'Incorrect password!');
  assert.equal(await emit(bob, 'join', { username: 'bob', room, password: 'test-password' }), undefined);
  assert.equal(await emit(eve, 'join', { username: 'eve', room, password: 'test-password' }), 'Room is full');

  const received = nextMessage(bob, 'message', message => message.text === 'encrypted-test-payload');
  assert.equal(await emit(alice, 'sendMessage', 'encrypted-test-payload'), undefined);
  assert.equal((await received).username, 'alice');

  const location = nextMessage(bob, 'locationMessage', message => message.username === 'alice');
  assert.equal(await emit(alice, 'sendLocation', { latitude: 34.02, longitude: -118.28 }), undefined);
  assert.equal((await location).url, 'https://google.com/maps?q=34.02,-118.28');

  const departed = nextMessage(bob, 'roomData', data => data.users.length === 1);
  alice.disconnect();
  assert.equal((await departed).users[0].username, 'bob');
  assert.equal(server.exitCode, null, output);
});
