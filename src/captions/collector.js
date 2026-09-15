import { analyzeCaptions, MAX_CAPTIONS, MAX_LENGTH, normalize } from './analyze.js';
const SELECTOR = 'figcaption,[class*="caption" i],[class*="subtitle" i],[data-caption],article h2,article h3,[class*="video" i] [class*="title" i]';
export class CaptionCollector {
  constructor(doc = document) {
    this.doc = doc; this.win = doc.defaultView; this.enabled = false;
    this.reset();
    this.observer = new this.win.MutationObserver(() => this.schedule());
  }
  reset() { this.url = this.win.location.href; this.captions = []; this.seen = new WeakMap(); this.cues = new Set(); this.limited = false; }
  configure(state) {
    const enabled = state.captionSites?.includes(this.win.location.hostname) === true;
    if (enabled === this.enabled) return;
    this.dispose(); this.enabled = enabled;
    if (!enabled) { this.reset(); return; }
    this.observer.observe(this.doc.documentElement, { childList: true, subtree: true, characterData: true });
    this.interval = this.win.setInterval(() => this.scan(), 1500);
    this.scan();
  }
  schedule() { if (!this.timer && this.enabled) this.timer = this.win.setTimeout(() => { this.timer = null; this.scan(); }, 400); }
  add(text, source) {
    text = text.replace(/\s+/g, ' ').trim();
    if (!normalize(text)) return;
    if (this.captions.length >= MAX_CAPTIONS) { this.limited = true; return; }
    if (text.length > MAX_LENGTH) this.limited = true;
    this.captions.push({ text: text.slice(0, MAX_LENGTH), source });
  }
  scan() {
    if (!this.enabled) return;
    if (this.url !== this.win.location.href) this.reset();
    for (const node of this.doc.querySelectorAll(SELECTOR)) {
      if (node.closest('script,style,[hidden],[aria-hidden="true"],input,textarea,[contenteditable="true"]') || !node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
      if (node.querySelector(SELECTOR)) continue;
      const text = node.textContent.replace(/\s+/g, ' ').trim();
      if (!text || this.seen.get(node) === text) continue;
      this.seen.set(node, text); this.add(text, 'Page caption/title');
    }
    for (const [videoIndex, media] of [...this.doc.querySelectorAll('video,audio')].entries()) {
      for (const [trackIndex, track] of [...media.textTracks].entries()) {
        if (!['captions', 'subtitles'].includes(track.kind)) continue;
        for (const cue of track.cues ?? []) {
          const key = JSON.stringify([videoIndex, media.currentSrc, trackIndex, cue.startTime, cue.endTime, cue.text]);
          if (this.cues.has(key)) continue;
          if (this.cues.size >= MAX_CAPTIONS) { this.limited = true; break; }
          this.cues.add(key); this.add(cue.text, `Subtitle ${cue.startTime.toFixed(1)}s`);
        }
      }
    }
  }
  snapshot() { this.scan(); return { url: this.url, enabled: this.enabled, limited: this.limited, captions: this.captions, report: analyzeCaptions(this.captions) }; }
  clear() { this.reset(); this.scan(); return this.snapshot(); }
  dispose() { this.observer.disconnect(); this.win.clearTimeout(this.timer); this.win.clearInterval(this.interval); this.timer = null; }
}
