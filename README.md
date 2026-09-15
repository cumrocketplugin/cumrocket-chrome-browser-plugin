# CumRocket Chrome Extension

Find relevant videos and the moments inside them faster with keyword search, regular expressions, and AI that understands similar meanings—even when someone uses different words.

## Project status

This project is in the planning stage. This README describes the intended experience; the extension is not implemented or available to install yet.

## What it will do

- **Search by keyword or phrase:** Find exact matches in available video titles, descriptions, captions, and transcripts.
- **Highlight matches:** Make matching words and phrases easy to spot in search results and transcript excerpts.
- **Support regular expressions:** Use regex patterns to search for spelling variations, word combinations, and other custom text patterns.
- **Suggest related searches:** Generate synonyms, related terms, and alternative phrases that users can review and search with.
- **Find similar meanings:** Identify relevant passages even when the speaker expresses an idea differently from the search query.
- **Search with an AI agent when needed:** Offer an optional mode that tries related queries, examines results, and refines the search within user-defined limits.
- **Jump to relevant moments:** Link matches to video timestamps when timestamped captions or transcripts are available.
- **Navigate automatically:** Move from page to page on supported video sites, following search result pages and opening relevant videos to continue the search.
- **Pause as needed:** Pause and resume automatic navigation and agent-assisted search to inspect results, and pause video playback when needed.
- **Automatically skip ads:** Provide an **Auto-click “Skip ad”** switch that clicks the site's skip button when it becomes available.

## Example

Suppose you are looking for a video explaining **“how to fix a slow computer.”**

An exact search could find that phrase. Related searches could also look for:

- “speed up your PC”
- “improve laptop performance”
- “why your computer is sluggish”

Semantic search could surface a passage such as **“These steps will make your machine run faster,”** even though it does not contain the original keywords.

For a more precise text search, a regex such as `\b(slow|sluggish)\s+(computer|PC|laptop)\b` could match several specific word combinations. Case sensitivity should be configurable.

## Intended workflow

1. Open the extension on a supported video page or search results page.
2. Enter a keyword, phrase, regex pattern, or description of what you want to find.
3. Choose exact, regex, or semantic search.
4. Optionally review suggested phrases or enable agent-assisted query refinement.
5. Review results with highlighted excerpts, the match type, and an explanation of why each result is relevant.
6. Open a video or jump to a matching timestamp where available.
7. Optionally enable automatic navigation to continue across pages; pause or resume the search and video playback as needed.
8. Turn **Auto-click “Skip ad”** on or off to control automatic clicks on available ad-skip buttons.

## Navigation and playback controls

- **Automatic navigation:** An optional mode that continues through search result pages and relevant video pages within a user-set page limit. Show the current page and search progress.
- **Pause, resume, and stop:** Keep these controls accessible during automated browsing. Pausing should prevent further navigation and search actions until resumed; stopping should end the current automated search.
- **Video pause:** Allow playback to pause while the user reviews a matching passage or changes search settings.
- **Auto-click “Skip ad”:** A separate switch, off by default, that automatically clicks a visible, enabled “Skip ad” or “Skip ads” button on supported sites. It waits for the site's skip option to become available. Turning the switch off stops automatic ad-skip clicks.

Automatic navigation and ad skipping depend on support for each site's page structure and playback controls.

## Search principles

- **Keep direct search fast:** Exact and regex searches should work independently of AI features.
- **Show the evidence:** Ground results in available source text and distinguish exact matches from AI-estimated relevance.
- **Keep users in control:** Make agent-assisted search optional, show the queries it tries, and allow users to stop it.
- **Make limits clear:** Missing captions, transcripts, or timestamps may reduce search coverage. AI matches may be imperfect.
- **Handle data deliberately:** Explain what content AI features send to an external service before enabling those features, and request only the browser permissions needed.

## Initial implementation scope

1. Extension interface and support for an initial video platform.
2. Available text extraction, keyword search, and match highlighting.
3. Regex search with validation and safeguards for expensive patterns.
4. AI-generated phrase suggestions and semantic matching.
5. Optional agent-assisted search with limits on queries, runtime, and AI usage.
6. Automatic page navigation with page limits and pause, resume, and stop controls.
7. Video pause controls and an optional automatic “Skip ad” button clicker.

Supported platforms, AI providers, transcript sources, and the technical architecture are still to be decided. Installation and development instructions will be added when a working implementation exists.
