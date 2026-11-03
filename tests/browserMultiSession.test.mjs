import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { BrowserService } from '../dist/services/browserService.js';
import { SessionStore } from '../dist/services/sessionStore.js';

test('two browser sessions remain separate and reject changed sessions', async () => {
  const requests = [];
  const server = http.createServer((req, res) => {
    requests.push(req.headers.cookie);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<html><body><h1>Session page</h1></body></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;
  let aSession = { url, cookie: 'JSESSIONID=one' };
  const a = new BrowserService(() => aSession);
  const b = new BrowserService(() => ({ url, cookie: 'JSESSIONID=two' }));
  const legacy = SessionStore.loadSession;
  SessionStore.loadSession = () => { throw new Error('unexpected legacy read'); };
  try {
    await Promise.all([a.open(), b.open()]);
    assert.ok(requests.includes('JSESSIONID=one'));
    assert.ok(requests.includes('JSESSIONID=two'));
    await a.close();
    assert.match((await b.observe()).snapshot, /Session page/);
    await a.open();
    aSession = { url, cookie: 'JSESSIONID=changed' };
    await assert.rejects(a.observe(), /modifiée/);
    assert.match((await b.observe()).snapshot, /Session page/);
  } finally {
    await Promise.all([a.close(), b.close()]);
    SessionStore.loadSession = legacy;
    await new Promise(resolve => server.close(resolve));
  }
});
