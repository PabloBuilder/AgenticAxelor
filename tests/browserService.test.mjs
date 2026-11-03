import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { BrowserService } from '../dist/services/browserService.js';
import { SessionStore } from '../dist/services/sessionStore.js';

const html = `<!doctype html><html><body>
<label><input type="checkbox" aria-label="Flag">Flag</label>
<label>Name <input aria-label="Name"></label>
<div onclick="document.body.insertAdjacentHTML('beforeend', '<button>Ready</button>')">Open section</div>
<button onclick="fetch('/fail', {method:'POST'})">Fail</button>
</body></html>`;

test('browser actions and HTTP failures', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/fail') { res.writeHead(403); res.end('Forbidden'); }
    else { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const original = SessionStore.loadSession;
  SessionStore.loadSession = () => ({ url: `http://127.0.0.1:${server.address().port}/`, cookie: 'JSESSIONID=test' });
  const service = new BrowserService();
  try {
    await service.open();
    await service.act('check', 'checkbox', 'Flag');
    assert.equal(await service.page.getByRole('checkbox', { name: 'Flag' }).isChecked(), true);
    await service.act('check', 'checkbox', 'Flag');
    assert.equal(await service.page.getByRole('checkbox', { name: 'Flag' }).isChecked(), true);
    await service.act('uncheck', 'checkbox', 'Flag');
    assert.equal(await service.page.getByRole('checkbox', { name: 'Flag' }).isChecked(), false);
    await service.act('fill', 'textbox', 'Name', 'test');
    assert.equal(await service.page.getByRole('textbox', { name: 'Name' }).inputValue(), 'test');
    await service.act('click_text', undefined, 'Open section');
    await service.act('wait_visible', 'button', 'Ready');
    await assert.rejects(service.act('click', 'button', 'Fail'), /HTTP 403/);
    await assert.rejects(service.act('click', 'button', 'Missing'), /introuvable ou ambigu/);
  } finally {
    await service.close();
    SessionStore.loadSession = original;
    await new Promise(resolve => server.close(resolve));
  }
});
