import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'lizwi.html'), 'utf8');
const runtime = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(runtime, 'embedded runtime script exists');
new vm.Script(runtime, {filename: 'lizwi.html'});
new vm.Script(fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8'), {filename: 'service-worker.js'});

const start = runtime.indexOf('function isFiniteLandmark');
const end = runtime.indexOf('function renderSignList', start);
assert.ok(start >= 0 && end > start, 'central validation functions exist');
const validationCode = `const SIGN_SAMPLES = 14;\nfunction resample(seq, n){ if(seq.length === n) return seq; const out = []; for(let i=0;i<n;i++){ const idx = Math.min(seq.length-1, Math.round(i * (seq.length-1) / (n-1))); out.push(seq[idx]); } return out; }\n${runtime.slice(start, end)}\n globalThis.validateImportedSigns = validateImportedSigns;\n globalThis.seqDistance = seqDistance;`;
const context = {globalThis: {}, Number, Array, Math};
vm.runInNewContext(validationCode, context);
const validate = context.globalThis.validateImportedSigns;
const distance = context.globalThis.seqDistance;

const frame = (x = 0, y = 0) => Array.from({length: 21}, (_, i) => ({x: x + i / 100, y: y + i / 100}));
const sequence = () => Array.from({length: 14}, (_, i) => frame(i / 100, i / 200));
const valid = [{label: 'yes', standard: false, sequences: [sequence()]}];

assert.equal(validate(valid).ok, true, 'valid sign import');
assert.equal(validate([]).ok, true, 'empty sign array');
for (const [name, value] of [
  ['malformed JSON', null],
  ['non-array JSON', {}],
  ['missing label', [{standard: false, sequences: [sequence()]}]],
  ['invalid standard', [{label: 'x', standard: 'false', sequences: [sequence()]}]],
  ['missing sequences', [{label: 'x', standard: false}]],
  ['short landmark frame', [{label: 'x', standard: false, sequences: [Array.from({length: 14}, () => Array.from({length: 20}, () => ({x: 0, y: 0})))]}]],
  ['long landmark frame', [{label: 'x', standard: false, sequences: [Array.from({length: 14}, () => Array.from({length: 22}, () => ({x: 0, y: 0})))]}]],
  ['non-finite coordinate', [{label: 'x', standard: false, sequences: [Array.from({length: 14}, () => { const f = frame(); f[0] = {x: Infinity, y: 0}; return f; })]}]],
]) assert.equal(validate(value).ok, false, name);

const scriptLike = [{label: '<img src=x onerror=alert(1)>', standard: false, sequences: [sequence()]}];
assert.equal(validate(scriptLike).ok, true, 'script-like labels remain valid data');
assert.ok(html.includes("label.textContent = t.label"), 'rendering uses textContent for imported labels');
assert.ok(!html.includes('row.innerHTML = `<span>${t.label}'), 'imported labels are not interpolated into HTML');
assert.equal(distance(sequence(), sequence()), 0, 'valid sign distance');
assert.equal(distance([[{x: NaN, y: 0}]], sequence()), Infinity, 'invalid sign distance fails closed');

for (const required of [
  'let micStream = null',
  'let cameraStream = null',
  "micStream.getTracks().forEach(track => track.stop())",
  "cameraStream.getTracks().forEach(track => track.stop())",
  'validateImportedSigns(data)',
  'window.addEventListener(\'pagehide\', stopResources)',
  'frameRequest = requestAnimationFrame(loop)',
]) assert.ok(html.includes(required), `lifecycle safeguard: ${required}`);

console.log('Lizwi hardening tests: all passed');
