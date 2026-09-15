# New-profile keyword entry fix

## Report

> there is a bug when I add a new profile and a key word without saving the profile first I can't add any new key words it doen'st save or that what i suspect i thappening

## Behavior

Previously, Add Keyword appended another empty editor without accepting the previous typed keyword. Save profile then rejected open keyword editors, with the message above the keyword list. The existing explicit Save keyword → Add Keyword flow passed its regression checks.

Add Keyword now validates and accepts pending entries before opening the next row. Save profile also accepts pending entries in both lists when creating a profile. Invalid entries stay editable with a local error, and their tab is revealed. New profiles still require Save profile for persistence. Saved-profile details continue to save independently from unfinished keyword edits.

## Verification

The new browser regression failed against the previous build (both rows still displayed New keyword), then passed against the fix in both popup and sidebar. It covers consecutive entry, duplicate rejection, saving pending positive/negative entries, storage failure/retry and reload persistence. `npm test` passed all 169 tests; the build passed. The complete browser suite passed on rerun after an initial timeout in the unrelated auto-scroll readiness check (`tests/auto-scroll.mjs:110`). No scrolling implementation was changed. `git diff --check` passed.
