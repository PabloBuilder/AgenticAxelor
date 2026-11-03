import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BridgeServer } from '../src/services/bridgeServer.ts';
import { SessionRegistry } from '../src/services/sessionRegistry.ts';

test('bridge manages registry without exposing cookies', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-bridge-'));
  const bridge = new BridgeServer(() => {}, 0, new SessionRegistry(path.join(dir, 'sessions.json')));
  await bridge.start();
  const url = `http://127.0.0.1:${bridge.server.address().port}/api/sessions`;
  const headers = { 'Content-Type': 'application/json', Origin: 'chrome-extension://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' };
  const post = async (body, h = headers) => {
    const response = await fetch(url, { method: 'POST', headers: h, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() };
  };
  try {
    const denied = await post({ action: 'save', url: 'https://one.test', cookie: 'JSESSIONID=secret' }, { 'Content-Type': 'application/json' });
    assert.equal(denied.status, 403);
    const added = await post({ action: 'save', url: 'https://one.test', cookie: 'JSESSIONID=secret' });
    assert.equal(added.status, 200);
    const id = added.body.session.id;
    assert.ok(!JSON.stringify(added.body).includes('secret'));
    const listed = await (await fetch(url)).json();
    assert.equal(listed.sessions.length, 1);
    assert.ok(!JSON.stringify(listed).includes('secret'));
    assert.equal((await post({ action: 'deactivate', id })).status, 200);
    assert.equal((await (await fetch(url)).json()).sessions[0].active, false);
    assert.equal((await post({ action: 'delete', id })).status, 200);
    assert.equal((await (await fetch(url)).json()).sessions.length, 0);
  } finally {
    bridge.stop();
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
