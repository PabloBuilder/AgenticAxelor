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
<button onclick="document.getElementById('dialog').showModal()">Open dialog</button>
<button>Duplicate</button><button>Duplicate</button>
<dialog id="dialog" aria-label="Edit client">
  <label for="modal-name">Customer name</label><input id="modal-name" placeholder="Enter customer">
  <button title="Close dialog" onclick="document.getElementById('dialog').close()">Close</button>
  <button>Duplicate</button><button onclick="setTimeout(() => document.getElementById('async').hidden = false, 1200)">Load field</button>
  <input id="async" aria-label="Delayed" hidden>
  <section role="region" aria-label="Unnamed field"><input></section>
  <select aria-label="Category"><option>Alpha</option><option>Beta</option></select>
  <div role="combobox" aria-label="Custom category" onclick="document.getElementById('options').hidden=false">Choose</div>
  <div role="listbox" id="options" hidden><div role="option" onclick="this.textContent='Chosen'">Choice</div></div>
</dialog>
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
    await service.act('wait_visible', undefined, 'Ready', undefined, { by: 'text' });
    await assert.rejects(service.act('click', 'button', 'Fail'), /ne pas répéter.*HTTP 403/);
    await assert.rejects(service.act('click', 'button', 'Missing', undefined, { timeoutMs: 300 }), /introuvable/);
    await assert.rejects(service.act('click', 'button', 'Duplicate', undefined, { timeoutMs: 300 }), /ambigu/);
    await service.act('click', 'button', 'Open dialog');
    const scope = { role: 'dialog', name: 'Edit client' };
    assert.match((await service.observe(scope)).snapshot, /Customer name/);
    assert.match((await service.observe({ role: 'dialog' })).snapshot, /Customer name/);
    await service.act('fill', 'textbox', '', 'Unnamed', { scope: { role: 'region', name: 'Unnamed field' } });
    await service.act('fill', undefined, 'Customer name', 'Example', { by: 'label', scope });
    assert.equal(await service.page.getByLabel('Customer name').inputValue(), 'Example');
    await service.act('fill', undefined, 'Enter customer', 'Changed', { by: 'placeholder', scope });
    assert.equal(await service.page.getByLabel('Customer name').inputValue(), 'Changed');
    await service.act('click', 'button', 'Duplicate', undefined, { scope });
    await service.act('click', 'button', 'Load field', undefined, { scope });
    await service.act('wait_visible', 'textbox', 'Delayed', undefined, { scope });
    await service.act('select', 'combobox', 'Category', 'Beta', { scope });
    assert.equal(await service.page.getByLabel('Category', { exact: true }).inputValue(), 'Beta');
    await assert.rejects(service.act('select', 'combobox', 'Custom category', 'Choice', { scope, timeoutMs: 300 }), /potentiellement effectuée/);
    await service.act('click', 'combobox', 'Custom category', undefined, { scope });
    await service.act('click', 'option', 'Choice', undefined, { scope });
    assert.match((await service.observe(scope)).snapshot, /Chosen/);
    await service.act('press', undefined, 'Close dialog', 'Tab', { by: 'title', scope });
    await service.act('click', undefined, 'Close dialog', undefined, { by: 'title', scope });
    await service.act('wait_hidden', 'dialog', 'Edit client');
    await assert.rejects(service.observe(scope), /Zone introuvable|Timeout/);
  } finally {
    await service.close();
    SessionStore.loadSession = original;
    await new Promise(resolve => server.close(resolve));
  }
});
