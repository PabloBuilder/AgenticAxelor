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
  <div role="combobox"><input placeholder="Address"><span onclick="document.getElementById('address-result').textContent='Address opened'">add</span></div>
  <div role="combobox"><input placeholder="Other"><span>add</span></div><div id="address-result"></div>
  <div role="listbox" id="options" hidden><div role="option" onclick="this.textContent='Chosen'">Choice</div></div>
</dialog>
<button onclick="document.getElementById('ax-modal').hidden=false">Open Axelor modal</button>
<div class="_modal-content_fixture" id="ax-modal" hidden><h1>Address</h1><input placeholder="City"><button onclick="document.getElementById('ax-modal').hidden=true">Close</button></div>
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
    await service.page.evaluate(() => {
      const el = document.createElement('div');
      el.id = 'race-fixture';
      el.innerHTML = '<div class="_container_fixture"><div class="_title_fixture"><label>Client</label></div><div class="_content_fixture"><input><div role="checkbox" aria-checked="false">Check</div><div role="spinbutton" aria-valuenow="1">Spin</div></div></div>';
      document.querySelector('dialog').append(el);
    });
    const field = { role: 'axelor_field', name: 'Client' };
    assert.match((await service.observe(field)).snapshot, /textbox/);
    await service.act('fill', 'textbox', '', 'Safe', { scope: field });
    assert.equal(await service.page.locator('#race-fixture input').inputValue(), 'Safe');
    await service.page.locator('#race-fixture').evaluate(el => el.insertAdjacentHTML('beforeend', el.innerHTML));
    await assert.rejects(service.act('fill', 'textbox', '', 'Unsafe', { scope: field }), /ambigu/);
    await service.page.locator('#race-fixture').evaluate(el => el.lastElementChild.remove());
    const originalMatch = service.matchLocator;
    service.matchLocator = function (...args) {
      const locator = originalMatch.apply(this, args);
      const originalLocator = locator.locator.bind(locator);
      locator.locator = (...locatorArgs) => {
        const visible = originalLocator(...locatorArgs);
        const acquire = visible.elementHandle.bind(visible);
        visible.elementHandle = async (...handleArgs) => {
          const handle = await acquire(...handleArgs);
          await service.page.locator('#race-fixture').evaluate(el => { el.innerHTML = el.innerHTML; });
          return handle;
        };
        return visible;
      };
      return locator;
    };
    try {
      await assert.rejects(service.act('fill', 'textbox', '', 'Unsafe', { scope: field }), /modifi|ambigu/);
      assert.equal(await service.page.locator('#race-fixture input').inputValue(), '');
    } finally { service.matchLocator = originalMatch; }
    service.matchLocator = function (...args) {
      const locator = originalMatch.apply(this, args);
      const originalLocator = locator.locator.bind(locator);
      locator.locator = (...locatorArgs) => {
        const visible = originalLocator(...locatorArgs);
        const acquire = visible.elementHandle.bind(visible);
        visible.elementHandle = async (...handleArgs) => {
          const handle = await acquire(...handleArgs);
          const fill = handle.fill.bind(handle);
          handle.fill = async (...fillArgs) => {
            await service.page.locator('#race-fixture').evaluate(el => { el.innerHTML = el.innerHTML; });
            return fill(...fillArgs);
          };
          return handle;
        };
        return visible;
      };
      return locator;
    };
    try {
      await assert.rejects(service.act('fill', 'textbox', '', 'Unsafe', { scope: field }), /potentiellement effectuée/);
      assert.equal(await service.page.locator('#race-fixture input').inputValue(), '');
    } finally { service.matchLocator = originalMatch; }
    await service.page.locator('#race-fixture ._content_fixture').evaluate(el => el.insertAdjacentHTML('beforeend', '<input>'));
    await assert.rejects(service.act('fill', 'textbox', '', 'Unsafe', { scope: field }), /ambigu/);
    await service.page.locator('#race-fixture ._content_fixture input').last().evaluate(el => el.remove());
    await assert.rejects(service.act('navigate', undefined, undefined, '/', { scope: field }), /incompatible/);
    await service.page.locator('#race-fixture').evaluate(el => el.insertAdjacentHTML('beforeend', '<div class="_container_other"><div class="_title_other"><label>Client</label></div><div class="_content_other"><input placeholder="Unique"></div></div>'));
    const filteredField = { ...field, contains: { by: 'placeholder', name: 'Unique' } };
    await assert.rejects(service.observe(filteredField), /contains interdit/);
    await assert.rejects(service.act('fill', undefined, 'Unique', 'Unsafe', { by: 'placeholder', scope: filteredField }), /contains interdit/);
    assert.equal(await service.page.getByPlaceholder('Unique').inputValue(), '');
    await service.page.locator('._container_other').evaluate(el => el.remove());
    await service.page.locator('#race-fixture ._content_fixture').evaluate(el => el.insertAdjacentHTML('beforeend', '<div class="_container_child"><div class="_title_child"><label>Enfant</label></div><div class="_content_child"><input placeholder="Enfant unique"></div></div>'));
    await assert.rejects(service.observe(field), /imbriqué/);
    await assert.rejects(service.act('fill', undefined, 'Enfant unique', 'Unsafe', { by: 'placeholder', scope: field }), /imbriqué/);
    assert.equal(await service.page.getByPlaceholder('Enfant unique').inputValue(), '');
    await service.act('fill', undefined, 'Enfant unique', 'Child', { by: 'placeholder', scope: { role: 'axelor_field', name: 'Enfant' } });
    assert.equal(await service.page.getByPlaceholder('Enfant unique').inputValue(), 'Child');
    await service.page.locator('._container_child').evaluate(el => el.remove());
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
    await assert.rejects(service.act('click_text', undefined, 'add', undefined, { scope, timeoutMs: 300 }), /ambigu/);
    const addressScope = { role: 'combobox', contains: { by: 'placeholder', name: 'Address' } };
    await service.act('click_text', undefined, 'add', undefined, { scope: addressScope });
    await service.act('wait_visible', undefined, 'Address opened', undefined, { by: 'text' });
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
    await service.act('click', 'button', 'Open Axelor modal');
    const axScope = { role: 'axelor_modal', name: 'Address' };
    assert.match((await service.observe(axScope)).snapshot, /City/);
    await service.act('fill', undefined, 'City', 'Example', { by: 'placeholder', scope: axScope });
    await service.act('click', 'button', 'Close', undefined, { scope: axScope });
    await assert.rejects(service.observe(axScope), /Zone introuvable/);
    await assert.rejects(service.observe({ role: 'axelor_modal' }), /titre exact/);
  } finally {
    await service.close();
    SessionStore.loadSession = original;
    await new Promise(resolve => server.close(resolve));
  }
});
