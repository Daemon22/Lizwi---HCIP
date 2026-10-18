import { timingSafeEqual } from 'node:crypto';

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store, max-age=0',
  'vary': 'Origin'
};

function json(status, body){
  return new Response(JSON.stringify(body), {status, headers:JSON_HEADERS});
}

function safeCodeMatch(supplied, expected){
  if(typeof supplied !== 'string' || typeof expected !== 'string') return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export default async function handler(request){
  if(request.method !== 'POST'){
    return json(405, {error:'Use POST to request a voice session.'});
  }

  const origin = request.headers.get('origin');
  const requestOrigin = new URL(request.url).origin;
  if(!origin || origin !== requestOrigin){
    return json(403, {error:'This voice endpoint only accepts same-origin browser requests.'});
  }

  const requiredCode = process.env.LIZWI_VOICE_ACCESS_CODE || '';
  if(requiredCode.length < 24){
    return json(503, {error:'Set a 24-character-or-longer LIZWI_VOICE_ACCESS_CODE on the deployment.'});
  }
  if(!safeCodeMatch(request.headers.get('x-lizwi-voice-code') || '', requiredCode)){
    return json(401, {error:'Voice access code is missing or incorrect.'});
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey){
    return json(503, {error:'The cloud voice provider key is not configured on the deployment.'});
  }

  try{
    const upstream = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
      method:'POST',
      headers:{
        authorization:'Bearer ' + apiKey,
        'content-type':'application/json'
      },
      body:JSON.stringify({
        expires_after:{anchor:'created_at', seconds:60},
        session:{
          type:'realtime',
          model:'gpt-realtime-2.1',
          instructions:'You are LIZWI, the English-speaking communication twin paired with ARA, the visual perception twin. Speak clearly and naturally, keep replies concise, and treat the user as the source of their own meaning. You may receive carefully selected text context from ARA, but do not claim to see camera or screen content unless it is included in that context. Never infer emotion from appearance. If a sign transcript or visual cue is unclear, ask a short clarification question.',
          output_modalities:['audio'],
          audio:{
            input:{
              transcription:{model:'gpt-4o-mini-transcribe', language:'en'},
              turn_detection:{type:'semantic_vad'}
            },
            output:{voice:'marin'}
          },
          max_output_tokens:512
        }
      })
    });
    const payload = await upstream.json().catch(()=>({}));
    if(!upstream.ok){
      return json(502, {error:'The cloud voice provider did not create a session.'});
    }
    const value = payload.value || payload.client_secret?.value;
    if(typeof value !== 'string' || !value){
      return json(502, {error:'The cloud voice provider returned an invalid session token.'});
    }
    return json(200, {value, expires_at:payload.expires_at});
  }catch{
    return json(502, {error:'The cloud voice provider could not be reached.'});
  }
}
