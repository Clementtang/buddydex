// Google Analytics 4 initialization.
// Extracted from index.html inline script to allow strict CSP
// (script-src 'self' https://www.googletagmanager.com) without
// relying on 'unsafe-inline'. The gtag.js loader itself remains
// as an async external <script> tag in index.html <head>.
//
// See docs/prd.md Phase 0 task 0.A.1 and devils-advocate-review-round2.md R2-C1.

const GA_MEASUREMENT_ID = "G-1CTR65SW2P";

window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

gtag("js", new Date());
gtag("config", GA_MEASUREMENT_ID);

// Expose gtag on window so callers outside this module (e.g., Phase 1
// Feature 1 share event tracking) can use the same canonical gtag()
// API without each caller having to re-derive it from dataLayer.
// See docs/devils-advocate-review-round4.md R4-M1.
window.gtag = gtag;
