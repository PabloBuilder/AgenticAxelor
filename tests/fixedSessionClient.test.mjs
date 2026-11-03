import test from 'node:test';
import assert from 'node:assert/strict';
import { AxelorClient } from '../src/services/axelorClient.ts';
import { SessionStore } from '../src/services/sessionStore.ts';

test('fixed-session clients isolate concurrent requests and never consult or mutate the legacy store', async () => {
  const originalLoad = SessionStore.loadSession;
  const originalSave = SessionStore.saveSession;
  SessionStore.loadSession = () => { throw new Error('unexpected legacy read'); };
  SessionStore.saveSession = () => { throw new Error('unexpected legacy write'); };
  try {
    const a = AxelorClient.forSession({ url: 'https://one.test/erp', cookie: 'JSESSIONID=one' });
    const b = AxelorClient.forSession({ url: 'https://two.test/erp', cookie: 'JSESSIONID=two' });
    const seen = [];
    for (const client of [a, b]) {
      client.http.defaults.adapter = async config => {
        await new Promise(resolve => setImmediate(resolve));
        seen.push({ baseURL: config.baseURL, cookie: config.headers.Cookie });
        return { data: { status: 0, data: [] }, status: 200, statusText: 'OK', headers: {}, config };
      };
    }
    await Promise.all([a.search('Example'), b.search('Example')]);
    assert.deepEqual(seen.sort((x, y) => x.baseURL.localeCompare(y.baseURL)), [
      { baseURL: 'https://one.test/erp', cookie: 'JSESSIONID=one' },
      { baseURL: 'https://two.test/erp', cookie: 'JSESSIONID=two' },
    ]);
    assert.equal(a.getBaseUrl(), 'https://one.test/erp');
    assert.equal(b.getBaseUrl(), 'https://two.test/erp');
    assert.throws(() => a.setSession({ url: 'https://other.test', cookie: 'JSESSIONID=other' }), /fixed-session/);
  } finally {
    SessionStore.loadSession = originalLoad;
    SessionStore.saveSession = originalSave;
  }
});
