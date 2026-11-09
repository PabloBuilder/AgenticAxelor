import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

for (const [value, enabled] of [[undefined, false], ['true', false], ['1', true]]) {
  test(`experimental browser exposure: ${value ?? 'unset'}`, async () => {
    const env = { ...process.env };
    if (value === undefined) delete env.AXELOR_ENABLE_EXPERIMENTAL_BROWSER;
    else env.AXELOR_ENABLE_EXPERIMENTAL_BROWSER = value;
    const client = new Client({ name: 'browser-availability-test', version: '1.0.0' });
    try {
      await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.resolve('dist/index.js')], env, stderr: 'pipe' }));
      const names = (await client.listTools()).tools.map(tool => tool.name);
      for (const name of ['axelor_browser_open', 'axelor_browser_observe', 'axelor_browser_act', 'axelor_browser_close']) {
        assert.equal(names.includes(name), enabled, name);
      }
      assert.ok(names.includes('query_axelor_data'));
    } finally {
      await client.close();
    }
  });
}
