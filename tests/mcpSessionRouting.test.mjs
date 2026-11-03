import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

test('MCP routes each call to its resolved active session', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-mcp-routing-'));
  const servers = [];
  let client;
  try {
    fs.cpSync(path.resolve('dist'), path.join(dir, 'dist'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'package.json'), '{"type":"module"}');
    fs.symlinkSync(path.resolve('node_modules'), path.join(dir, 'node_modules'), 'junction');
    const hits = [];
    for (const name of ['one', 'two']) {
      const server = http.createServer((req, res) => {
        hits.push({ name, cookie: req.headers.cookie });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 0, data: [{ destination: name }] }));
      });
      await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
      servers.push(server);
    }
    const sessions = servers.map((server, i) => ({ id: `id-${i}`, name: `session-${i}`, url: `http://127.0.0.1:${server.address().port}`, cookie: `JSESSIONID=secret-${i}`, active: true, updatedAt: new Date().toISOString() }));
    const save = () => fs.writeFileSync(path.join(dir, '.sessions.json'), JSON.stringify({ version: 1, sessions }));
    save();
    client = new Client({ name: 'routing-test', version: '1.0.0' });
    await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(dir, 'dist/index.js')], cwd: dir, stderr: 'pipe' }));
    const tools = await client.listTools();
    const sessionParameter = tools.tools.find(t => t.name === 'query_axelor_data').inputSchema.properties.sessionId;
    assert.match(sessionParameter.description, /list_axelor_sessions/);
    assert.match(sessionParameter.description, /ambiguë/);
    assert.match(tools.tools.find(t => t.name === 'list_axelor_sessions').description, /ask the user/i);
    for (const name of ['axelor_browser_open', 'axelor_browser_observe', 'axelor_browser_act', 'axelor_browser_close']) {
      assert.ok(tools.tools.find(t => t.name === name).inputSchema.properties.sessionId);
    }
    assert.equal((await client.callTool({ name: 'axelor_browser_open', arguments: {} })).isError, true);
    assert.equal((await client.callTool({ name: 'axelor_browser_open', arguments: { sessionId: 'missing' } })).isError, true);
    const list = await client.callTool({ name: 'list_axelor_sessions', arguments: {} });
    assert.ok(!JSON.stringify(list).includes('secret-'));
    const call = sessionId => client.callTool({ name: 'query_axelor_data', arguments: { model: 'Example', ...(sessionId ? { sessionId } : {}) } });
    assert.equal((await call()).isError, true);
    assert.equal((await call('missing')).isError, true);
    assert.equal(hits.length, 0);
    const [one, two] = await Promise.all([call('id-0'), call('id-1')]);
    assert.notEqual(one.isError, true);
    assert.notEqual(two.isError, true);
    assert.match(JSON.stringify(one), /one/);
    assert.match(JSON.stringify(two), /two/);
    assert.deepEqual(hits.sort((a, b) => a.name.localeCompare(b.name)), [{ name: 'one', cookie: 'JSESSIONID=secret-0' }, { name: 'two', cookie: 'JSESSIONID=secret-1' }]);
    sessions[1].active = false;
    save();
    assert.equal((await call('id-1')).isError, true);
    assert.notEqual((await call()).isError, true);
    sessions[0].active = false;
    save();
    assert.equal((await call()).isError, true);
    assert.equal(hits.length, 3);
    sessions[0].active = true;
    sessions[1].active = true;
    save();
    const browserCall = (name, sessionId) => client.callTool({ name, arguments: { sessionId } });
    const opened = await Promise.all([browserCall('axelor_browser_open', 'id-0'), browserCall('axelor_browser_open', 'id-1')]);
    assert.ok(opened.every(result => !result.isError), JSON.stringify(opened));
    const observed = await Promise.all([browserCall('axelor_browser_observe', 'id-0'), browserCall('axelor_browser_observe', 'id-1')]);
    assert.ok(observed.every(result => !result.isError), JSON.stringify(observed));
    assert.ok(JSON.stringify(observed[0]).includes(String(servers[0].address().port)));
    assert.ok(JSON.stringify(observed[1]).includes(String(servers[1].address().port)));
    await browserCall('axelor_browser_close', 'id-0');
    assert.notEqual((await browserCall('axelor_browser_observe', 'id-1')).isError, true);
    await browserCall('axelor_browser_close', 'id-1');
  } finally {
    if (client) await client.close();
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
