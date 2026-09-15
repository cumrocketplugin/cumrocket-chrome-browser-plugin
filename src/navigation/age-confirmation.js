// Match affirmative age statements, never an unrelated Yes or Continue button.
const affirmative = /^(?:yes[\s,!—–:-]*)?(?:(?:i am|i'm|im)\s+)?(?:over\s+18|18\s*(?:\+|or older|and older|or over)|(?:at least\s+18))(?:\s+years?\s+old)?(?:[\s,!—–:-]*(?:enter|continue|enter site|to continue))?[.!]?$/i;
export function ageConfirmation(doc) {
  for (const node of doc.querySelectorAll('button, a[href], input[type="button"], input[type="submit"], [role="button"]')) {
    const label = (node.getAttribute('aria-label') || node.value || node.textContent || '').replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
    if (!affirmative.test(label)) continue;
    if (node.disabled || node.matches(':disabled') || node.closest('[hidden], [inert], [aria-disabled="true"]')) continue;
    if (node.checkVisibility && !node.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) continue;
    const rect = node.getBoundingClientRect(), win = doc.defaultView;
    const style = win.getComputedStyle(node);
    if (!rect.width || !rect.height || rect.bottom <= 0 || rect.top >= win.innerHeight || style.visibility !== 'visible' || style.pointerEvents === 'none') continue;
    const hit = doc.elementFromPoint(Math.max(0, Math.min(win.innerWidth - 1, rect.left + rect.width / 2)), Math.max(0, Math.min(win.innerHeight - 1, rect.top + rect.height / 2)));
    if (!hit || !node.contains(hit)) continue;
    if (node.hasAttribute('download') || (node.target && node.target !== '_self')) continue;
    const destination = node.getAttribute('href') || node.getAttribute('formaction') || node.form?.getAttribute('action');
    if (destination) {
      try {
        const url = new URL(destination, doc.location.href);
        if (!/^https?:$/.test(url.protocol) || url.origin !== doc.location.origin) continue;
      } catch { continue; }
    }
    if (node.form?.target && node.form.target !== '_self') continue;
    return node;
  }
  return null;
}
