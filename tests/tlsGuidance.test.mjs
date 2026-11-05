import test from 'node:test';
import assert from 'node:assert/strict';
import { addTlsGuidance } from '../dist/services/tlsGuidance.js';

test('adds a guide to certificate errors without losing the original error', () => {
  const original = { isError: true, content: [{ type: 'text', text: 'Error: unable to verify the first certificate' }] };
  const result = addTlsGuidance(original);
  assert.equal(result.content[0].text, original.content[0].text);
  assert.match(result.content[1].text, /axelor-tls-troubleshooting\.md/);
  assert.equal(result.isError, true);
  assert.equal(original.content.length, 1);
});

test('leaves unrelated errors and successful responses unchanged', () => {
  for (const value of [
    { isError: true, content: [{ type: 'text', text: 'HTTP 403 forbidden' }] },
    { content: [{ type: 'text', text: 'unable to verify the first certificate' }] },
    null,
  ]) assert.equal(addTlsGuidance(value), value);
});

test('recognizes certificate expiry and common TLS codes', () => {
  for (const text of ['CERT_HAS_EXPIRED', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'self signed certificate in certificate chain']) {
    const response = addTlsGuidance({ isError: true, content: [{ type: 'text', text }] });
    // Node sometimes reports human-readable messages rather than error codes.
    assert.equal(response.content.length, 2, text);
  }
});
