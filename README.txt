VIBE ROOM v1.11.12 - OFFLINE AUDIO STREAM EXPERIMENT

WHAT THIS DOES
Introduces an alternative for iPhone playback, without changing where music is stored.
The app can request each record from a same-origin URL handled by the Service Worker.
The worker reads the existing IndexedDB blob and supports HTTP byte-range requests
(status 206), like a normal web audio endpoint. NO music is uploaded to the internet.
Original blob playback remains available, and load errors automatically fall back.

This is a targeted experiment for the iOS pause-inside-app, lock, resume problem.
It has not been verified on your iPhone and is NOT guaranteed to fix an iOS audio bug.

INSTALL
1. KEEP YOUR CURRENT GITHUB PAGES URL AND REPOSITORY.
2. Replace index.html and sw.js at your repository root with the files in this ZIP.
3. Keep manifest.webmanifest and icons unchanged.
4. Wait for GitHub Pages deployment. Close and reopen Vibe Room, sometimes twice
   so the newer Service Worker takes control. Check web v1.11.12 in Settings.
5. DO NOT uninstall the app or clear website data: your songs are stored there.

TEST
1. Open Settings > iPhone audio source. Select 'Offline local stream (test)'.
2. Verify the note reads 'Local stream available.' If not, close/reopen the app
   again after the new Service Worker activates.
3. Select a record again so the selected audio source is used.
4. Start fresh playback diagnostics test.
5. Press Play in Vibe Room, pause in Vibe Room, lock the iPhone, then press Play
   on the Lock Screen. Repeat multiple times.
6. If it fails, open diagnostics BEFORE pressing Play in the app, mark failure,
   copy the log, and send it to ChatGPT. The 'src=' field should say
   'offline-stream' if the new audio transport was used.
7. You can switch back to 'Original blob player' any time; re-select the record.

Offline functionality: Both transport modes read the same songs stored locally
in the 'vibe-room' IndexedDB database. The worker does not edit or delete records.
It only serves their audio bytes when requested by the app. The cache contains
only the app shell (HTML, manifest and icons), not the songs.

LIMITATIONS
Service Workers can be suspended by iOS; this alternate path might not help.
Other media apps use a variety of playback implementations. This isn't an exact
simulation of SoundCloud's online streaming. JavaScript syntax and browser
request behavior are tested, but background behavior must be tested on your iPhone.
