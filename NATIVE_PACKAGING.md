# Getting this running as an installed app on Android and Linux

Everything in this file is written so you can copy/paste commands and get
a real result without depending on a hosted backend. The app is designed
to stay local-first and portable. The only thing that may require internet
on your machine is installing toolchains such as Android SDK components
or Rust crates, when you choose to package beyond the basic local PWA
route. The app itself, the manifest, and the service worker are already
present in this folder and require no online service to run in default
motion-first mode.

## Important: `FaceDetector` and Linux

Quick recap because it changes what to expect: `FaceDetector` is backed
by Android's own face-detection service (Play Services / the OS media
API). There's no equivalent on desktop Linux, so on Linux this app will
always run the motion-based presence fallback, never real face
detection. It still works — it's just the cruder path. If accuracy on
Linux specifically ever becomes the priority, that fallback is the
piece worth improving, not `FaceDetector` (it isn't coming to Linux).

## Option 1 — Installable web app (PWA), fastest path, same on both platforms

This is already built. It just needs to be *served*, not opened as a
bare file — service workers (what makes it installable and offline-
capable) refuse to run from a `file://` URL, that's a browser rule, not
something a config can override.

**Quickest way to serve it locally** (works on both Android via a local
network and Linux):
```bash
cd lizwi-human-communication-intelligence-platform
python3 -m http.server 8080
```
Then open `http://<your-computer's-local-ip>:8080/lizwi.html`
from your phone (same wifi network) or `http://localhost:8080/lizwi.html`
on the Linux machine itself. Your phone's browser should offer "Add to
Home Screen" / "Install app" — that's the PWA installing.

**Permanent, no-terminal-needed way** — host it on GitHub Pages (free):
1. Create a GitHub repo, push this folder's contents to it.
2. Repo Settings → Pages → deploy from the branch.
3. You get a permanent `https://yourname.github.io/repo/lizwi.html`
   URL — install it from there on any device, anytime, no server running
   on your end.

This gets you: home-screen icon, offline reload, standalone window (no
browser address bar) — on both Android and Linux, no SDKs required.

## Option 2 — Real Android APK (via Capacitor)

This wraps the existing HTML/JS in an actual native Android app shell —
installable as a normal APK, not just a home-screen shortcut.

Requires on your machine: Node.js, and Android Studio (for the SDK and
to build/sign the APK).

```bash
cd lizwi-human-communication-intelligence-platform
npm init -y
npm install @capacitor/core @capacitor/android
npx cap init "Lizwi — Human Communication Intelligence Platform" "com.supremeintelligence.lizwi" --web-dir .
npx cap add android
npx cap copy
npx cap open android
```
That last command opens Android Studio with a real Android project
pointed at this app. Build → Build APK from there, same as any Android
project. Camera and microphone permissions need to be confirmed in
`android/app/src/main/AndroidManifest.xml` (Capacitor adds them, but
double check `CAMERA` and `RECORD_AUDIO` are present after `cap add`).

## Option 3 — Real Linux app (via Tauri)

Tauri wraps the app in a lightweight native window and produces a real
`.AppImage` / `.deb`, not just a browser tab.

Requires on your machine: Rust (`rustup`), and Node.js.

```bash
cd lizwi-human-communication-intelligence-platform
npm init -y
npm install --save-dev @tauri-apps/cli
npx tauri init
```
When it asks for your web assets directory, point it at this folder
(where `lizwi.html` lives), and set the app's entry point to
`lizwi.html`. Then:
```bash
npx tauri build
```
This produces a native binary and installable package under
`src-tauri/target/release/bundle/`. Camera/microphone access works the
same way as in a browser — Tauri uses the system webview under the
hood, so no extra permission wiring beyond what's already in this app.

## Which to actually do

If you mostly want it installed and off the browser chrome — Option 1
covers both platforms today, with nothing left to build. Options 2 and
3 are worth it specifically if you want a real app-store-style artifact
(an APK to hand someone, a `.deb` to distribute) — they're more setup
for the same running app, not a different app.
