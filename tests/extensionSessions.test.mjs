import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class Element {
  constructor() { this.children = []; this.handlers = {}; this.dataset = {}; this.textContent = ''; }
  addEventListener(name, callback) { this.handlers[name] = callback; }
  setAttribute(name, value) { this[name] = value; }
  append(...items) { this.children.push(...items); }
  replaceChildren(...items) { this.children = items; }
}
const flush = () => new Promise(resolve => setImmediate(resolve));

test('popup lists sessions and invokes activate/deactivate/delete without cookies', async () => {
  const elements = Object.fromEntries(['site-host', 'site-context', 'sync-button', 'sync-status', 'sessions-list', 'sessions-status', 'sessions-retry'].map(id => [id, new Element()]));
  const requests = [];
  const session = { id: 'abc', name: 'Recette', url: 'https://example.test', active: true };
  const context = {
    document: { getElementById: id => elements[id], createElement: () => new Element(), addEventListener: (_event, callback) => callback() },
    chrome: { tabs: { query: (_query, callback) => callback([]) }, runtime: {} },
    window: { confirm: () => true }, URL,
    fetch: async (_url, options) => {
      if (!options?.method) return { ok: true, json: async () => ({ success: true, sessions: [session] }) };
      requests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ success: true }) };
    },
  };
  vm.runInNewContext(fs.readFileSync('extension/popup.js', 'utf8'), context);
  await flush();
  const item = elements['sessions-list'].children[0];
  assert.equal(item.children[0].children[1].textContent, 'Recette');
  assert.equal(item.children[0].children[0].dataset.active, 'true');
  assert.equal(item.children[1].children[0].textContent, 'Détails');
  assert.match(item.children[1].children[2].textContent, /activé/);
  const toggle = item.children[0].children[2].children[0];
  assert.equal(toggle.checked, true);
  toggle.checked = false;
  toggle.handlers.change();
  await flush();
  assert.equal(requests[0].action, 'deactivate');
  assert.equal(requests[0].id, 'abc');
  const newItem = elements['sessions-list'].children[0];
  newItem.children[1].children[4].handlers.click();
  await flush();
  assert.equal(requests[1].action, 'delete');
  assert.ok(!JSON.stringify(requests).includes('cookie'));
});

test('cached metadata survives reopening and is read-only when Bridge is offline', async () => {
  const cache = {};
  const session = { id: 'abc', name: 'Recette', url: 'https://example.test', active: true, cookie: 'secret' };
  let online = true;
  const open = async () => {
    const elements = Object.fromEntries(['site-host', 'site-context', 'sync-button', 'sync-status', 'sessions-list', 'sessions-status', 'sessions-retry'].map(id => [id, new Element()]));
    const context = {
      document: { getElementById: id => elements[id], createElement: () => new Element(), addEventListener: (_event, callback) => callback() },
      chrome: { tabs: { query: (_query, callback) => callback([]) }, runtime: {}, storage: { local: { get: async () => cache, set: async data => Object.assign(cache, data) } } },
      window: {}, URL,
      fetch: async () => { if (!online) throw new Error('hors ligne'); return { ok: true, json: async () => ({ success: true, sessions: [session] }) }; },
    };
    vm.runInNewContext(fs.readFileSync('extension/popup.js', 'utf8'), context);
    await flush();
    return elements;
  };
  await open();
  assert.ok(!JSON.stringify(cache).includes('secret'));
  online = false;
  const elements = await open();
  const item = elements['sessions-list'].children[0];
  assert.equal(item.children[0].children[1].textContent, 'Recette');
  assert.equal(item.children[0].children[2].children[0].disabled, true);
  assert.equal(item.children[1].children[4].disabled, true);
  assert.match(elements['sessions-status'].textContent, /potentiellement obsolète/);
});

test('URL session names show only host while preserving custom names', async () => {
  const elements = Object.fromEntries(['site-host', 'site-context', 'sync-button', 'sync-status', 'sessions-list', 'sessions-status', 'sessions-retry'].map(id => [id, new Element()]));
  const url = 'https://gestion.alter-si.fr/axelor-erp';
  const sessions = [{ id: 'a', name: url, url, active: true }, { id: 'b', name: 'Recette', url, active: false }];
  const context = {
    document: { getElementById: id => elements[id], createElement: () => new Element(), addEventListener: (_event, callback) => callback() },
    chrome: { tabs: { query: (_query, callback) => callback([]) }, runtime: {} },
    window: {}, URL,
    fetch: async () => ({ ok: true, json: async () => ({ success: true, sessions }) }),
  };
  vm.runInNewContext(fs.readFileSync('extension/popup.js', 'utf8'), context);
  await flush();
  const items = elements['sessions-list'].children;
  assert.equal(items[0].children[0].children[1].textContent, 'gestion.alter-si.fr');
  assert.equal(items[0].children[1].children[1].textContent, url);
  assert.equal(items[1].children[0].children[1].textContent, 'Recette');
});

test('popup reports an outdated Bridge API and offers retry', async () => {
  const elements = Object.fromEntries(['site-host', 'site-context', 'sync-button', 'sync-status', 'sessions-list', 'sessions-status', 'sessions-retry'].map(id => [id, new Element()]));
  const context = {
    document: { getElementById: id => elements[id], createElement: () => new Element(), addEventListener: (_event, callback) => callback() },
    chrome: { tabs: { query: (_query, callback) => callback([]) }, runtime: {} },
    window: {}, URL,
    fetch: async () => ({ ok: false, status: 404 }),
  };
  vm.runInNewContext(fs.readFileSync('extension/popup.js', 'utf8'), context);
  await flush();
  assert.match(elements['sessions-status'].textContent, /redémarrez le Bridge/);
  assert.equal(elements['sessions-retry'].hidden, false);
});
