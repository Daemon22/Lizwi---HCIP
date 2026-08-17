# Lizwi

## Human Communication Intelligence Platform

> **Every voice. Every sign. Every language. One understanding.**

Lizwi is the human communication and perception platform within the Supreme Intelligence ecosystem. It gives intelligence a way to encounter and understand the human world through voice, language, vision, gesture, sign, expression, and environmental context.

This repository contains the current browser-based Lizwi sensing and communication console. It is a modular, local-first prototype for exploring how human signals can be perceived, interpreted, and passed into a broader intelligence system.

## The three-layer architecture

| Layer | Role in Lizwi | Current prototype capabilities |
|---|---|---|
| **Sensory** | Perceives human and environmental signals. | Camera presence, face orientation where supported, motion, distance estimation, hand motion, optional hand landmarks, posture geometry, nod and shake detection, microphone state. |
| **Communication** | Enables expression between people and intelligence. | Personal sign training, sign-to-text transcription, speech synthesis, typed communication, configurable gesture bindings, and a browser event for turn-taking. |
| **Understanding** | Interprets context, intent, and relationships between signals. | Presence-to-engagement state ladder, microphone gating, hysteresis, adaptive conversational turn detection, gesture sensitivity scaling, and explicit telemetry. |

Lizwi does not replace Supreme Intelligence. It provides the interface through which Supreme Intelligence can perceive, interpret, and communicate with people.

## What this prototype does

The console begins by determining whether a person is present, whether they are oriented toward the camera, and whether gesture control can safely be armed. The state ladder is `IDLE`, `PRESENT`, `ENGAGED`, and `CONTROL`. State changes use a short stability window so that incidental movement does not cause rapid transitions.

The sensory layer can use the browser’s `FaceDetector` API when available and falls back to motion-based presence detection when it is not. Optional hand tracking and body-pose tracking can load their models from a CDN in a normal browser session. The microphone is muted by default; enabling it marks an active conversation and disarms gesture control so ordinary conversation is not misread as a command.

The communication layer includes a personal sign trainer. It learns the signs a person explicitly records, stores them as transparent templates, and can match them during a live session. This is intentionally **not** presented as a general ASL, BSL, or other sign-language translator. A shared sign-language recognizer requires properly labeled data from many signers, language-aware modeling, and a separate training program.

Recognized signs can be added to a transcript and spoken through the browser’s built-in speech synthesis. A type-and-speak control provides a direct augmentative and alternative communication fallback even when sign recognition is unavailable.

The understanding layer exposes conversational turn state through a browser event. Hosts can listen for `lizwi:turn` and respond when the state becomes `complete`:

```js
window.addEventListener('lizwi:turn', (event) => {
  if (event.detail.state === 'complete') {
    // Safe point for a conversational system to respond.
  }
});
```

## Privacy and design boundaries

Lizwi is designed to be explicit about what it knows and what it does not know. It does not infer emotion from facial appearance. If a person wants the system to communicate “frustrated,” “tired,” or “I need a break,” that expression must be deliberately recorded as a sign or typed message rather than guessed from appearance.

The application has no backend and processes its active sensing loop in the browser. Camera and microphone access are controlled by the browser’s permission model. A browser tab cannot keep camera access active after the user leaves the browser for another application; that boundary is an operating-system privacy rule.

## Repository contents

| File or directory | Purpose |
|---|---|
| `lizwi.html` | The self-contained Lizwi web application. |
| `manifest.json` | Progressive Web App metadata and installation configuration. |
| `service-worker.js` | Offline app-shell caching. |
| `icons/` | PWA icons and the supplied Lizwi brand logo. |
| `NATIVE_PACKAGING.md` | Guidance for local PWA, Android, and Linux packaging. |

## Running locally

For a quick test, open `lizwi.html` directly in a modern browser. Camera, microphone, gesture, sign, and speech features require browser permissions and device support.

For PWA installation and service-worker behavior, serve the directory over HTTP or HTTPS:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/lizwi.html`. The application can also be opened from another device on the same network using the host computer’s local IP address.

## Verification

Lizwi includes a lightweight Node-based test suite that does not introduce a framework or build step. Run it from the repository root:

```bash
node tests/lizwi-hardening.test.mjs
```

The suite verifies embedded JavaScript and service-worker syntax, valid and invalid sign imports, exact 21-landmark validation, non-finite coordinate rejection, safe handling of script-like labels, fail-closed sign distance, and the presence of camera, microphone, model-fallback, loop, and shutdown safeguards. Browser and physical-device behavior still requires a real permissioned browser session.

## Current limitations

The prototype is intentionally honest about its scope. Detection quality depends on lighting, camera position, distance, device hardware, and browser support. Hand and posture model loading depends on network access to the model CDN. A browser tab cannot control another application or the operating system’s scroll behavior without a native wrapper or accessibility integration. Personal sign templates recognize only the examples that the user records and are not a substitute for a trained language recognizer.

## Position within Supreme Intelligence

Lizwi is a sovereign and extensible human-interface foundation. Its purpose is to turn human expression into structured signals, preserve the context around those signals, and provide meaningful communication channels back to people. Future modules may extend the same architecture to multilingual speech, environmental audio, sign-language datasets, vision-language understanding, expressive avatars, accessibility services, and secure interfaces to Supreme Intelligence.

## License

No license has been declared yet. Add the project’s approved license before external redistribution.
