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

## Workspace

The popup and sidebar open on your keyword profiles. Use the **Keywords**, **Browse**, **Discover**, and **History** section links to jump between tools. Profile settings come first; browsing preferences, AI discovery and history follow below. Settings use two columns on wider screens and one column on narrow screens.

Use the **Profile enabled** switch beside the selected profile to enable or disable it immediately—no Edit or Save step. Keywords stay saved when the profile is disabled. The switch preserves unfinished keyword/name edits and restores its previous state if saving fails. **Edit** opens the profile name field. New profiles keep their enabled choice in the draft until **Save profile**.

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

## For entertainers and creators: get listed

Want your name highlighted when users come across you on supported adult sites? Add yourself through this public GitHub repository by editing **[src/entertainers/listings.json](src/entertainers/listings.json)**.

### Official payment requirements

**Payments are not configured yet. Do not send payment until maintainers publish every required detail in the `paymentPolicy` section of [the listing file](src/entertainers/listings.json) on this repository’s default branch.** No wallet, blockchain, holding amount, fee amount, or fee asset has been supplied yet. A fork or an unmerged Pull Request is not the official payment source.

Once configured, you must hold the published minimum CUMMIES amount and pay the published monthly maintenance fee using **only the wallet address, blockchain, and fee asset specified there**. Include your transaction ID/hash and the public wallet holding your CUMMIES so maintainers can verify your submission.

**IMPORTANT:** Do not send payment to any wallet address or blockchain other than the ones published in the official repository. We will never ask you to send payment to a different address through a DM, comment, email, or other message. Never include private keys, seed phrases, passwords, or account credentials in a submission. Listing information, public wallet addresses, and transaction hashes are public.

### Add or update your listing

1. Sign in to GitHub and open this repository. Click **Fork** to create your own copy.
2. In your fork, create a branch such as `add-your-stage-name` using the branch selector.
3. Open **`src/entertainers/listings.json`** and click the pencil to edit it. Add an object to the `listings` array, or update your existing object. Keep other entertainers’ entries intact. Separate objects with commas; JSON does not allow comments or trailing commas.
4. Use your public stage name, aliases actually used on sites, labeled profile URLs, and one or more of the predefined category IDs below. Do not change categories, supported sites, or payment policy as part of a listing submission.
5. Once official payments are configured, meet the holding and monthly fee requirements and insert your transaction hash and holding wallet. While payments are unconfigured, you may submit a **pending** listing with those fields empty for review; it cannot be activated yet.
6. For a new submission, use `"status": "pending"` and `"activeUntil": null`. Maintainers set approval and expiry after verification. For an update or renewal, preserve the existing ID, status, and expiry for the maintainer to review.
7. Click **Commit changes** to save to your branch. In your fork, choose **Contribute → Open pull request** (or **Compare & pull request**). Select this original repository’s default branch as the base and your fork’s listing branch as the compare branch.
8. Give the Pull Request a title such as `Add entertainer: Your Stage Name`. Describe your addition/update, link your public profiles, list your categories, and include the payment transaction hash and holding wallet or state that payment configuration is pending. Explain whether this is a new listing or a monthly renewal.
9. Review the **Files changed** tab, then submit the Pull Request. Respond to reviewer requests by editing and committing to the same branch; the Pull Request updates automatically.

Example object to put inside `listings` (replace the example details; do not submit a fictional creator):

```json
{
  "id": "your-stage-name",
  "name": "Your Stage Name",
  "aliases": ["YourOtherPublicName"],
  "profiles": [
    { "site": "Your profile site", "url": "https://example.com/your-profile" }
  ],
  "categories": ["performers", "creators"],
  "payment": {
    "transactionHash": "",
    "holdingWallet": ""
  },
  "status": "pending",
  "activeUntil": null
}
```

| Category ID | Category |
| --- | --- |
| `performers` | Performers |
| `creators` | Independent creators |
| `cam-models` | Cam models |
| `cosplay` | Cosplay creators |
| `couples` | Couples |
| `studios` | Studios |

Use a unique lowercase, hyphenated ID that stays the same for renewals. Names and aliases are limited to 120 characters, with up to 20 aliases. Profile links must use HTTPS. The validator checks the file’s structure; maintainers verify ownership, eligibility, holdings, and payment separately.

### Need help from GPT?

Paste the public example and your proposed listing into GPT and ask:

> Help me prepare a CumRocket entertainer listing Pull Request. Check my JSON and predefined categories, explain how to fork the repository, create a branch, edit src/entertainers/listings.json, and open a Pull Request against the original repository. Keep approval fields for maintainers. Do not invent payment details; use only the configured policy on the official repository’s default branch.

Check GPT’s suggested changes before committing. If you work locally, run `npm ci`, `npm run validate:entertainers`, and `npm run check` before submitting. See [GITHUB_FLOW.md](GITHUB_FLOW.md) for the developer Git workflow.

### Approval, monthly renewals, and availability

Maintainers review the Pull Request, verify profile ownership and the published holding/payment requirements, then set `status` to `approved` and `activeUntil` to the verified paid-through UTC instant (for example, `2026-10-15T00:00:00.000Z`). Approval requires configured payment details, a transaction hash, a holding wallet, and an expiry. New pending or suspended entries never highlight. Renew through another Pull Request with your new monthly transaction hash; maintainers extend the expiry after verification. Maintainers must suspend listings when holding requirements are no longer met. The plugin does not connect to wallets or automatically verify blockchain balances/payments.

Merged listings ship with the next plugin build/release. Users must update their installed extension (or rebuild and reload an unpacked installation); the plugin does not download live GitHub changes. Approved, unexpired names load automatically when the plugin starts. Expired listings stop highlighting, including on pages already open. A stale installed version may retain earlier approval until its bundled expiry, so holding suspensions require a plugin update.

### User controls and supported pages

Open **Settings → Entertainers and creators** to disable the entire directory or individual predefined categories. All categories and the directory switch default to on, including for existing installations. Preferences survive restarts. Selecting no categories hides all directory names; a listing in several categories remains visible when any of them is selected. The plugin’s main highlighting switch also disables these highlights.

The directory currently allows rendered-text matching on `pornhub.com`, `xvideos.com`, `xhamster.com`, `redtube.com`, and `youporn.com`, including their subdomains. Maintainers manage this allowlist in `supportedSites`; live site layouts are not guaranteed. Matching uses public names/aliases as case-insensitive whole words or phrases; profile URLs provide review context, not account identity verification. Matching stays local and follows the scanner limitations above. Directory names use the normal positive highlight style and can participate in positive-match scrolling behavior. They do not create personal keyword profiles or add to personal keyword counts/backups. The directory includes nine pending starter records covering every category; some records belong to multiple categories. These publicly sourced examples were added by the project, not submitted by the named people or studios. Inclusion does not imply endorsement, participation, payment, or verified holdings. They do not highlight until the normal approval requirements are met. See [starter entries and sources](docs/entertainer-starter-sources.md).
