VIBE ROOM v1.11.11 - PLAYBACK DIAGNOSTICS

PURPOSE
This is a DIAGNOSTIC release, not a proven fix. It leaves music playback, sound processing,
record storage (IndexedDB), and both lock-screen playback modes as in v1.11.10.

INSTALL
1. Keep your existing GitHub Pages repository and URL.
2. Replace index.html AND sw.js in the repository with the files in this ZIP. Commit both.
3. Wait until GitHub Pages finishes publishing, then fully close/reopen the iPhone web app.
4. In Room settings, check that the bottom reads web v1.11.11. Do not uninstall the app.
5. DO NOT clear Safari website data or the app's storage; your records live there.

REPRODUCE AND GET THE LOG
1. Open Room settings > Playback diagnostics. Tap 'Start fresh test'.
2. Close settings, start playback in Vibe Room, then pause IN THE APP.
3. Lock the phone. Press Play on the LOCK SCREEN. If it stays silent, unlock the phone.
4. Without pressing Play again in Vibe Room, open Room settings > Playback diagnostics.
5. Tap 'Mark failure' then 'Copy log'. Paste the log into this ChatGPT conversation.
6. If copy does not work on iOS, select/copy the text in the log box manually.

OPTIONAL COMPARISON
Repeat with Settings > Lock screen Play/Pause set to the other mode.
Use 'Start fresh test' before each run and send both logs separately.

INTERPRETATION NOTES
The log records play/pause/playing/waiting/stalled events, page visibility, iOS media
handler requests (in custom mode), audio ready/network states and approximate timeline.
For native iPhone mode, Safari does not expose the lock-screen command itself to JS.
While locked, iOS may suspend JavaScript, so the absence of an event does not prove
that a button press was never delivered. The log is evidence, not a definitive verdict.
No audio files, cover images, song titles or track IDs are included. Logs stay
on-device in localStorage until 'Start fresh test' replaces them.

FILES
index.html - complete player with local diagnostics
sw.js - matching offline cache version
The existing manifest.webmanifest and icons are unchanged: keep them in your repo.
