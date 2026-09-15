# CumRocket port

## Request

> look at readem, know that this a a differnt app but more features are alread in implemnted in /Users/armenmerikyan/Desktop/wd/spotadog
>
> so lok at reamed and implement all the feature you see in the other plugin here remember to brand this accoringly and style the buttons for this brand and pink ..

## Implementation

Ported the `spot` Chrome extension source, build tooling, unit tests and browser tests. Source reference: `/Users/armenmerikyan/Desktop/wd/spotadog/spot`. The source application was left untouched.

Updated UI names, manifest metadata, export filenames/format, storage keys, content-script identifiers and highlight namespaces to CumRocket. Replaced the paw artwork with an editable rocket SVG and regenerated all nine PNG sizes. Pink controls cover primary/secondary buttons, tabs, checkboxes, range controls, focus outlines and app surfaces; keyword highlight colors remain user-configurable.

Preserved the original README as the video-search roadmap and documented the distinction between ported functionality and planned video-specific features. Detailed feature and architecture documents are adapted from the source implementation. No source Git history, credentials, user data, generated builds or historical marketing artwork was imported.

## Verification

- `npm ci`: installed development dependencies; audit reported zero vulnerabilities.
- `npm run icons`: generated all nine rocket PNG sizes; PNG signatures and dimensions verified.
- `npm test`: all 169 tests passed.
- `npm run build`: final extension bundle built successfully.
- `npm run test:browser`: full real-MV3 browser suite passed, including navigation, ad skipping, profile transfers, AI mocks, histories and restart persistence. The first run timed out on the popup-history UI assertion after stored counts passed; an unchanged-behavior rerun passed. The assertion now reports rendered history and the storage snapshot on failure. This intermittent test failure is not claimed as a fixed product defect.
- Inspected popup and settings screenshots for pink styling, rocket branding and readable layout. Browser layout checks also passed.
- Verified source/scripts/tests file parity with the reference, all local documentation links, and absence of old brand namespaces in implementation files.
- Live AI provider calls, native desktop toolbar/sidebar interactions and live served ads were not exercised.
