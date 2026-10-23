# Grotesque rules v3 — local visual review

New creatures use grotesqueScene(), layered onto the retained deterministic anatomy
builder. Five authored asymmetric contours, unequal arm lengths, smaller secondary
sockets, heavy lids, jagged cavities, uneven tooth rows and clustered skin marks
replace cheeks, waving hands, bright fins and decorative feelers. Existing Anidoodle
sample()/limb() helpers maintain smooth paths and stable part identities.

Rules version is persisted in new sessions and archive scene snapshots. Sessions
without a version and with existing answers retain version 2. Old snapshots render
without grotesque eye flags and use the exact old pure motion and narrative grammar.
The 31 existing pigment PNGs were retained; 30 new swatches were appended and remain
loaded on demand by the existing nonblocking paint cache.

Validation:
- 23 existing tests pass across all 80 anatomies, 1,920 single-answer morph samples,
  cumulative stages, connected motion, pattern containment, archive locks and startup.
- 3 additional tests pass: aggregate SHA-256 equality for all 80 legacy scenes,
  sampled motions and stories; old/new session versions; new grotesque design invariants.
- Gallery scheduler check: 80 records, four active windows, distinct timing, released
  offscreen buffers, paused hidden tabs, static reduced motion and complete cleanup.
- Native 1800×2520 PNG export rendered successfully to poster.png. Real browser export
  from Vesper completed with Saved status.
- Browser: completed all five questions to create Vesper; opened its read-only profile,
  reloaded it with identical text; reopened Nori with its original friendly description.
  New and old records coexist in the same archive. A 390px profile had no overflow.
- comparison.png shows matching DNA: previous rules on top, grotesque rules below.
  exploration.html provides an animated local comparison with the new specimens first.
- Original pigment illustration and Anidoodle primitive hashes remain unchanged.

All work is local and uncommitted. No push or deployment was performed.
