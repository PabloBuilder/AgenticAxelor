import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('MCP browser scoped interactions and session routing', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-browser-mcp-'));
  const server = http.createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!doctype html><button onclick="document.querySelector('dialog').showModal()">Open</button>
      <dialog aria-label="Editor"><label for="value">Name</label><input id="value">
      <button title="Close" onclick="document.querySelector('dialog').close()">Close</button></dialog>`);
  });
  let client;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    fs.cpSync(path.resolve('dist'), path.join(dir, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    fs.symlinkSync(path.resolve('node_modules'), path.join(dir, 'node_modules'), 'junction');
    fs.writeFileSync(path.join(dir, '.sessions.json'), JSON.stringify({ version: 1, sessions: [{
      id: 'test-session', name: 'fixture', url: `http://127.0.0.1:${server.address().port}`,
      cookie: 'JSESSIONID=fixture', active: true, updatedAt: new Date().toISOString(),
    }] }));
    client = new Client({ name: 'browser-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(dir, 'dist/index.js')], cwd: dir, env: process.env, stderr: 'pipe' }));
    const call = async (name, args = {}) => {
      const result = await client.callTool({ name, arguments: { sessionId: 'test-session', ...args } });
      assert.notEqual(result.isError, true, JSON.stringify(result));
      return result;
    };
    await call('axelor_browser_open');
    await call('axelor_browser_act', { action: 'click', role: 'button', name: 'Open' });
    const scope = { role: 'dialog', name: 'Editor' };
    await call('axelor_browser_act', { action: 'fill', by: 'label', name: 'Name', value: 'Example', scope });
    assert.match(JSON.stringify(await call('axelor_browser_observe', { scope })), /Example/);
    await call('axelor_browser_act', { action: 'click', by: 'title', name: 'Close', scope });
    await call('axelor_browser_act', { action: 'wait_hidden', role: 'dialog', name: 'Editor' });
    await call('axelor_browser_close');
  } finally {
    if (client) await client.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
