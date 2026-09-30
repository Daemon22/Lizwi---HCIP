/**
 * LIZWI side of the direct ARA ↔ LIZWI Twin Link.
 *
 * This is intentionally transport-neutral. A local WebSocket, native bridge,
 * IPC wrapper, or other sovereign transport can bind to this contract later.
 * Raw media is never emitted by this layer.
 */

export const LIZWI_TWIN_PROTOCOL = Object.freeze({
  name: 'ara-lizwi-twin-link',
  version: '1.0'
});

export function createLizwiCommunicationSignal({
  sessionId,
  modality,
  language = null,
  meaning = null,
  intent = null,
  confidence = null,
  provenance = {}
}) {
  if (!sessionId) throw new Error('sessionId is required');
  if (!modality) throw new Error('modality is required');

  return {
    protocol: LIZWI_TWIN_PROTOCOL.name,
    version: LIZWI_TWIN_PROTOCOL.version,
    session_id: sessionId,
    source: 'lizwi',
    target: 'ara',
    type: 'lizwi.communication',
    payload: {
      signal: {
        modality,
        language,
        meaning,
        intent,
        confidence,
        provenance
      }
    },
    privacy: {
      raw_media: false,
      sensitivity: 'normal',
      consent: 'granted'
    }
  };
}
