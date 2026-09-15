# CumRocket workspace redesign

## Request

> can you make the UI different in layout and design so it doesn't look exactly like the other plugin we coppiedx, in general I i don't like tha layout and one problem is that you must click edit before you cand disable a profile fix that also

## Changes

- Replaced the settings-first stack with a profile-first workspace, a compact plum brand header, section navigation, and pink controls.
- Moved profile name fields behind Edit while keeping the profile enable switch visible and usable. Keyword rows use compact separators and a segmented positive/negative selector.
- Grouped scrolling, counts and sidebar preferences under Browsing controls. Kept AI discovery, history and backups accessible through the workspace.
- Reorganized Settings into independent columns on wide screens with a single-column narrow layout.
- Connected the profile switch to the existing atomic `profile.toggle` mutation. Toggling preserves name and keyword drafts, prevents conflicting writes, reports saving failures and restores the prior checkbox state. Existing scanner broadcasts apply activation immediately. New profiles keep their switch state locally until creation.

## Verification

- All 169 unit tests passed; final extension build passed.
- Full real-MV3 browser suite passed, including immediate highlight removal/restoration without Edit, activation persistence, failed-write rollback, keyword/name draft preservation, section navigation, and the existing profile/AI/history/navigation regressions.
- Adjusted the popup-history test to wait for the rendered browser-popup row after storage acknowledgement, resolving the asynchronous assertion race observed during validation.
- Reviewed fresh screenshots at 420px popup, 320px sidebar and 1100px settings widths; no horizontal overflow. Existing layout tests also cover 320/420/680px widths and long content.
- All preexisting HTML control IDs are retained without duplicates. `git diff --check` passed.

Visual review uses the actual unpacked extension in isolated Chromium because the in-app browser bootstrap failed with `Cannot redefine property: process`.
