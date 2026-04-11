import { SPECIES } from "../data/species.js";

/**
 * Validate and decode a URL hash against the known species allowlist.
 * Returns the matched species id, or `null` when the hash is absent,
 * malformed, or points at an unknown species.
 *
 * Never throws — all error paths call console.warn and return null.
 *
 * See:
 * - docs/prd.md Feature 1 (parseHashSpecies reference implementation)
 * - devils-advocate-review-round2.md R2-M1 (hash as untrusted input)
 * - devils-advocate-review-round3.md R3-m4 (preserve query string),
 *   R3-m5 (decodeURIComponent failure handling)
 * - devils-advocate-review-round4.md R4-m2 (embed reference impl)
 */
export function parseHashSpecies(
  hashValue = typeof window !== "undefined" ? window.location.hash : "",
) {
  if (typeof hashValue !== "string") return null;

  const raw = hashValue.startsWith("#") ? hashValue.slice(1) : hashValue;
  if (!raw) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    // Malformed percent-encoding, e.g. '%E0%A4%A'
    console.warn("[buddydex] invalid hash encoding, ignoring");
    return null;
  }

  const matched = SPECIES.find((s) => s.id === decoded);
  if (!matched) {
    console.warn("[buddydex] unknown species id in hash:", decoded);
    return null;
  }
  return matched.id;
}

/**
 * Clear the URL hash while keeping the path and query string intact.
 * Used when an invalid hash is detected on page load, or when the
 * modal is closed. Prefers `history.replaceState` so that:
 *   (a) the back button still takes the user back to the pre-modal
 *       navigation state
 *   (b) UTM / analytics query parameters survive the clear (R3-m4)
 */
export function clearHash() {
  if (!window.location.hash) return;
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
}
