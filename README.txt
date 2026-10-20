Vibe Room v1.11.9 lock-screen synchronization fix

Upload index.html and sw.js to the root of your existing GitHub repository, replacing the previous files. Do not change the GitHub Pages URL, remove the Home Screen app, or clear Safari website data.

Fixes: one owner for Lock Screen media controls; explicit play/pause on the same audio element; preserves skip preferences; no automatic reload while pausing.

After GitHub Pages publishes, fully close and reopen Vibe Room. Check the version in Room settings. Test play/pause in both directions with the phone locked. iOS may still block background playback in some situations; this patch cannot override OS restrictions.
