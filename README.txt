Vibe Room v1.11.13 — M4A file picker fix

This update changes ONLY index.html. It is based on your uploaded v1.11.12 source.

Changes:
- Explicitly recognizes MP3, M4A/MP4, AAC, WAV and FLAC in the iPhone Files picker.
- Updates add/edit labels and empty-file messages.
- Updates drag-and-drop extension recognition.
- Keeps the existing offline playback source selector, diagnostics and record database as they were.

INSTALL:
1. Replace index.html in your existing GitHub Pages repository.
2. Commit it and wait until GitHub Pages has deployed.
3. Close and reopen Vibe Room; check Room Settings for web v1.11.13.
4. Try importing Brasilian Skies, An Insatiable High, and Seychelles from Files.

Do NOT delete the Home Screen app or clear Safari website data; your records live in IndexedDB.
No Service Worker change is necessary for this file-picker-only patch. Your existing sw.js can stay as-is.
If a file is still greyed out, check whether it is downloaded onto your iPhone or test opening Files > On My iPhone before selecting it.
