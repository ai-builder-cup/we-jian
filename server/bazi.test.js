import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// The BaZi explanation route must send an OBJECT, not a bare string.
//
// This exact mismatch shipped to production: the agent returns a plain string,
// the route forwarded it as-is, and the browser read `.explanation` off a
// string, got undefined, and quietly used the composed reading instead. Gemini
// was called and billed on every single view, and its output was discarded
// without one error being logged. Nothing failed loudly, so nothing surfaced.
const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');

test('the BaZi explanation route wraps the text in an object', () => {
  const route = source.slice(source.indexOf("route === 'POST /api/bazi/explanation'"));
  const body = route.slice(0, route.indexOf('return;'));

  assert.ok(/sendJson\(response,\s*200,\s*\{\s*explanation\s*\}\)/.test(body),
    'route must send { explanation }, not the bare string');
  assert.ok(!/sendJson\(response,\s*200,\s*await explainBaziReflection/.test(body),
    'route must not forward the agent result directly');
});

test('the route still refuses chart and birth data', () => {
  const route = source.slice(source.indexOf("route === 'POST /api/bazi/explanation'"));
  const body = route.slice(0, route.indexOf('return;'));
  for (const field of ['pillars', 'stem', 'branch', 'birth', 'date']) {
    assert.ok(body.includes(`'${field}'`), `guard must still list ${field}`);
  }
});
