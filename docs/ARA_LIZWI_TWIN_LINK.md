# ARA ↔ LIZWI Twin Link

This is the direct semantic connection between the two twins.

**ARA** contributes understanding of the experienced environment.

**LIZWI** contributes understanding of human communication.

Neither twin becomes the other, and this connection does not route through DIBAKU.

## Contract

Protocol: `ara-lizwi-twin-link`  
Version: `1.0`

The link carries semantic messages only:

- `ara.context` — privacy-checked environmental/experiential context from ARA.
- `lizwi.communication` — structured human communication signals from LIZWI.
- `twin.ack` — acknowledgement of receipt.
- `twin.heartbeat` — liveness.
- `twin.consent` — consent/privacy state.
- `twin.session` — session lifecycle.

Raw camera frames, screen captures, microphone recordings, raw video, and raw sign/gesture media do **not** cross the boundary.

## Why the link exists

A human communication signal can refer to something ARA perceives.

An ARA observation can give LIZWI the context required to interpret a human signal.

Example:

1. LIZWI receives a human utterance equivalent to "look at that".
2. LIZWI emits a semantic communication signal.
3. ARA contributes the relevant environmental context.
4. The twin field correlates the two signals using the same session.
5. The resulting understanding retains provenance and uncertainty.

The relationship is therefore reciprocal:

> ARA experiences the world. LIZWI understands human communication. Together they understand the human-in-the-world.

## Privacy boundary

The twin link is not a media transport. It is a semantic boundary.

A producer must reduce its local raw material before transmission. If a signal is sensitive or consent is absent, the producer must restrict or deny the payload rather than forwarding raw material.

## XNLP and other language processors

LIZWI remains the whole Human Communication Intelligence Platform.

XNLP is one language-specific capability inside LIZWI. Other language processors and communication modalities can be added without changing the twin-link contract.

The contract therefore remains language- and modality-independent.
