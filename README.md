# CumRocket Chrome Extension

Find and highlight the words that matter as you browse, with keyword profiles, regular expressions, optional AI suggestions, automatic scrolling, and video ad skipping. CumRocket uses a pink interface and a rocket toolbar icon.

## Install

Requires Node.js 20+ and Chrome 120+.

```sh
npm ci
npm run build
```

1. Open `chrome://extensions` and enable **Developer mode**.
2. Choose **Load unpacked** and select this repository’s `dist/` directory.
3. Pin **CumRocket**, then click its icon to open the editor.
4. Create a profile, add positive or negative keywords, save it, and visit a webpage.
5. Open **Settings** to configure ad skipping, scrolling, location checks, or optional AI credentials.

**Creating a profile:** You can type a keyword and click **Add Keyword** to keep it and enter another. **Save profile** validates and saves all entered positive and negative keywords, including the row still being edited. Until you save the profile, its keywords remain an unsaved draft; closing the popup discards that draft. Duplicate or invalid entries show an error beside the keyword.

After rebuilding, reload the extension in Chrome. Keep using the same `dist/` directory to retain its identity and saved data. **Use sidebar** switches between the full popup editor and Chrome’s side panel.

## Implemented features

The working extension is adapted from the local Spotadog `spot` plugin, including its complete extension source and regression suite. The separate website and X Profile Scout application are not bundled; their exported scout data can be imported.

- **Profiles:** Create, edit, delete, enable, select and search named profiles. Save individual keywords independently; maintain separate positive and negative lists.
- **Matching:** 17 keyword criteria, including literal words/phrases, text operations, lengths, numbers, URLs, emails, hashtags, mentions and validated advanced regex. See [match criteria](docs/keyword-match-criteria.md).
- **Highlights:** Per-keyword preset/custom colors, independent positive/negative matches, dynamic page rescanning, and a global pause. Highlight colors retain their meaning; the app’s controls use pink.
- **AI suggestions:** Optional OpenAI and Anthropic provider configuration, model selection, reviewed seed-based suggestions, dismissal and explicit approval into either list. Manual matching needs no API key.
- **Automatic navigation:** Per-tab Auto Scroll, adjustable speed, pause/resume, supported next-page navigation, and an Alt+Shift+R resume shortcut (Option+Shift+R on Mac). Disable Auto Scroll to stop.
- **Matching post controls:** Pause or slow down at a configurable viewport level, with selectable auto-pause highlight colors.
- **Location checks:** Import X Profile Scout JSON and restrict keyword-triggered pauses to authors whose uploaded account location matches the configured location.
- **Counts:** Optional cumulative per-URL keyword occurrence counts, including repeated and unique text contexts.
- **History:** Optional session/all-time URL visit and popup/overlay histories, search, pagination and clearing.
- **Backups:** Validated single-profile and full-collection JSON imports/exports. CumRocket uses its own `cumrocket.profiles` format and storage namespace.
- **Ad skipping:** Off by default. Enable **Settings → Automatic ad skipping** to activate eligible, visible skip-ad controls beside a prominent playing video, including supported MGP and overlay players. Countdown controls are not bypassed.

See [detailed features](docs/features.md), [requirements](docs/requirements.md), and [privacy architecture](docs/privacy-architecture.md).

## Video-search roadmap and limits

The [original video-search plan](docs/video-search-roadmap.md) is preserved. This implementation brings over the features already present in Spotadog. Dedicated transcript/caption extraction, timestamped video results, semantic passage ranking, agent-assisted query refinement with usage limits, video playback pause controls, and user-configurable navigation page limits **are not implemented**.

Matching operates on available rendered webpage text, including visible titles, descriptions or transcript text when a site renders them. Phrases do not span separate text nodes. Iframes, shadow roots, canvas text, PDFs and browser-restricted pages are not scanned. Automatic pagination and ad skipping depend on recognizable page/player markup. Live website compatibility is not guaranteed by fixture tests.

## Privacy

Scanning, matching, counts, URL history, popup history and uploaded location records stay in this browser. There is no analytics service or developer backend. HTTP/HTTPS access allows automatic scanning; storage, scripting, sidePanel and webNavigation support persistence, scanner reloads, sidebar display and optional visit tracking.

Choosing **Get suggestions** sends only the seed text you explicitly enter to the configured AI provider. It does not attach page contents or browsing history. Provider usage may incur charges. API keys are stored locally, unencrypted, and restricted to trusted extension contexts; keys are not included in profile exports. Uninstalling removes the extension’s local data.

## Development and verification

```sh
npx playwright install chromium
npm run check
```

`check` runs unit tests, builds the extension, and loads the real extension in isolated Chromium for browser regression tests. Provider responses are mocked; live API calls, native toolbar/sidebar gestures and live served advertisements require manual verification. Browser screenshots are written to ignored `test-results/`.

Edit `src/icons/icon.svg` and run `npm run icons` to regenerate the packaged PNG icons. `npm run build` bundles local source only; there are no remote runtime scripts.

- `src/`: extension UI, background worker, content scanner, matching, storage, navigation, ad skipping and AI adapters.
- `tests/`: unit and browser regression coverage.
- `scripts/`: build and icon generation.
- `docs/port-notes.md`: port scope and verification record.
- [GITHUB_FLOW.md](GITHUB_FLOW.md): repository Git workflow.
