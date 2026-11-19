import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(new URL('../assets/js/apibase.js', import.meta.url), 'utf8');
function baseFor(hostname, saved = null) {
  const window = {};
  vm.runInNewContext(src, { window, location: { hostname }, localStorage: { getItem: () => saved } });
  return window.ALAQAI_API_BASE;
}

test('teacher site alaqai.com talks to /api on the same address', () => {
  assert.equal(baseFor('alaqai.com'), '');
  assert.equal(baseFor('www.alaqai.com'), '');
});
test('alaqai.online (GitHub Pages for now) and others use api.alaqai.online', () => {
  assert.equal(baseFor('alaqai.online'), 'https://api.alaqai.online');
  assert.equal(baseFor('127.0.0.1'), 'https://api.alaqai.online');
  assert.equal(baseFor('notalaqai.com'), 'https://api.alaqai.online');
});
test('a saved test server wins', () => {
  assert.equal(baseFor('alaqai.com', 'http://127.0.0.1:8787'), 'http://127.0.0.1:8787');
});
