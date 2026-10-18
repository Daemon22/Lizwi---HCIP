import assert from 'node:assert/strict';
import handler from '../api/realtime-token.mjs';

const saved = {
  key:process.env.OPENAI_API_KEY,
  code:process.env.LIZWI_VOICE_ACCESS_CODE,
  fetch:globalThis.fetch
};
const request = (headers = {}, method = 'POST') => new Request('https://lizwi.example/api/realtime-token', {method, headers:{origin:'https://lizwi.example', ...headers}});
const code = 'v'.repeat(32);

try{
  delete process.env.OPENAI_API_KEY;
  delete process.env.LIZWI_VOICE_ACCESS_CODE;
  assert.equal((await handler(request())).status, 503, 'missing deployment access code fails closed');

  process.env.LIZWI_VOICE_ACCESS_CODE = code;
  assert.equal((await handler(request({'x-lizwi-voice-code':code}))).status, 503, 'missing provider key fails closed');
  assert.equal((await handler(request({'x-lizwi-voice-code':'wrong'}))).status, 401, 'invalid access code rejected');
  assert.equal((await handler(request({'x-lizwi-voice-code':code}, 'GET'))).status, 405, 'GET rejected');
  assert.equal((await handler(new Request('https://lizwi.example/api/realtime-token', {method:'POST', headers:{origin:'https://attacker.example','x-lizwi-voice-code':code}}))).status, 403, 'cross-origin request rejected');

  process.env.OPENAI_API_KEY = 'server-only-test-key';
  let upstreamRequest;
  globalThis.fetch = async (url, options) => {
    upstreamRequest = {url, options};
    return Response.json({value:'ephemeral-test-token', expires_at:123});
  };
  const response = await handler(request({'x-lizwi-voice-code':code}));
  const body = await response.json();
  assert.equal(response.status, 200, 'valid configured request creates a session token');
  assert.equal(body.value, 'ephemeral-test-token');
  assert.equal('apiKey' in body, false, 'provider key is never returned');
  assert.equal(response.headers.get('cache-control'), 'no-store, max-age=0', 'ephemeral token response is non-cacheable');
  assert.equal(upstreamRequest.options.headers.authorization, 'Bearer server-only-test-key', 'server uses the secret key');
  assert.equal(upstreamRequest.options.body.includes('gpt-realtime-2.1'), true, 'session is configured for the realtime twin');
  assert.equal(upstreamRequest.options.body.includes('sign'), true, 'voice twin is instructed to clarify uncertain sign context');
} finally {
  if(saved.key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = saved.key;
  if(saved.code === undefined) delete process.env.LIZWI_VOICE_ACCESS_CODE; else process.env.LIZWI_VOICE_ACCESS_CODE = saved.code;
  globalThis.fetch = saved.fetch;
}

console.log('Lizwi voice tests: all passed');
