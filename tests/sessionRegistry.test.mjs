import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { SessionRegistry } from '../src/services/sessionRegistry.ts';

test('interrupted legacy sync is replayed and mutations fail closed', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-recovery-'));
  try {
    const file = path.join(dir, 'sessions.json');
    const registry = new SessionRegistry(file);
    const input = { url: 'https://example.test', cookie: 'JSESSIONID=recovery' };
    assert.throws(() => registry.syncLegacy(input, () => { throw new Error('simulated failure'); }), /simulated failure/);
    assert.throws(() => registry.resolve(), /requires recovery/);
    assert.throws(() => registry.save(input), /requires recovery/);
    const reopened = new SessionRegistry(file);
    let applied;
    reopened.recoverLegacy((value) => { applied = value; });
    assert.deepEqual(applied, input);
    assert.equal(reopened.resolve().cookie, input.cookie);
    reopened.recoverLegacy(() => { throw new Error('unexpected replay'); });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('legacy migration is idempotent and sync preserves identity and activation', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-migrate-'));
  try {
    const registry = new SessionRegistry(path.join(dir, 'sessions.json'));
    const original = { url: 'https://example.test', cookie: 'JSESSIONID=old' };
    registry.migrateLegacy(() => original);
    const id = registry.list()[0].id;
    registry.setActive(id, false);
    registry.migrateLegacy(() => { throw new Error('must not reload'); });
    registry.syncLegacy({ ...original, cookie: 'JSESSIONID=new' });
    assert.equal(registry.list().length, 1);
    assert.equal(registry.get(id).cookie, 'JSESSIONID=new');
    assert.equal(registry.get(id).active, false);
    registry.save(original);
    assert.throws(() => registry.syncLegacy(original), /Ambiguous/);
    assert.equal(registry.list().length, 2);
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});

test('isolated sessions persist without exposing cookies in the list', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-registry-'));
  try {
    const file = path.join(dir, 'sessions.json');
    const registry = new SessionRegistry(file);
    const first = registry.save({ url: 'https://example.test/a', cookie: 'JSESSIONID=first' });
    const second = registry.save({ url: 'https://example.test/b', cookie: 'JSESSIONID=second' });
    assert.throws(() => registry.resolve(), /Destination ambiguë/);
    assert.equal(registry.resolve(first.id).cookie, 'JSESSIONID=first');
    assert.equal(registry.resolve(second.id).cookie, 'JSESSIONID=second');
    registry.setActive(first.id, false);
    assert.throws(() => registry.resolve(first.id), /inactive/);
    assert.equal(registry.resolve().id, second.id);
    registry.save({ url: 'https://example.test/b', cookie: 'JSESSIONID=replaced' }, { id: second.id });
    const reloaded = new SessionRegistry(file);
    assert.equal(reloaded.list().length, 2);
    assert.equal(reloaded.get(first.id).cookie, 'JSESSIONID=first');
    assert.equal(reloaded.get(first.id).active, false);
    assert.equal(reloaded.get(second.id).cookie, 'JSESSIONID=replaced');
    assert.ok(!JSON.stringify(reloaded.list()).includes('JSESSIONID'));
    reloaded.remove(first.id);
    assert.equal(reloaded.list().length, 1);
    reloaded.setActive(second.id, false);
    assert.throws(() => reloaded.resolve(), /Aucune session active/);
    assert.throws(() => reloaded.save({ url: 'https://example.test', cookie: 'JSESSIONID=x' }, { id: first.id }), /not found/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('a concurrent mutation fails closed without changing the registry', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-registry-'));
  try {
    const file = path.join(dir, 'sessions.json');
    const registry = new SessionRegistry(file);
    const original = registry.save({ url: 'https://example.test', cookie: 'JSESSIONID=first' });
    fs.writeFileSync(`${file}.lock`, '');
    assert.throws(() => registry.setActive(original.id, false), /locked/);
    assert.equal(registry.get(original.id).active, true);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('corrupt registry is not silently replaced', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'axelor-registry-'));
  try {
    const file = path.join(dir, 'sessions.json');
    fs.writeFileSync(file, '{invalid');
    const registry = new SessionRegistry(file);
    assert.throws(() => registry.save({ url: 'https://example.test', cookie: 'JSESSIONID=x' }));
    assert.equal(fs.readFileSync(file, 'utf8'), '{invalid');
    fs.writeFileSync(file, JSON.stringify({ version: 1, sessions: [{ id: 'broken', active: true }] }));
    assert.throws(() => registry.resolve(), /Invalid session registry/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
