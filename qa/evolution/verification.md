# Evolution upgrade verification — 2026-10-23

## Automated

15 passing tests. All 80 final anatomies are deterministic, finite and distinct. All 80 questionnaire paths reveal the correct cumulative stages; 2,000 progressive morph samples and 1,920 answer-change samples maintain visible eye clearances. Sampled idle poses for every DNA remain in bounds and connected, including stalk-eye tip/root checks. All 17 pattern kinds occur in the DNA system.

Final reducer tests reject START, NAME, HOME, BACK, GO, SELECT and ADVANCE after reveal. RESET clears identity, choices and story; REGENERATE changes only the narrative. Session restoration and 8,000 narrative samples pass. The original paint renderer and Anidoodle geometry primitives retain their previous hashes; anatomy and motion have intentionally changed.

The real Canvas host, under a controlled clock, passed transformation interruption, idle-to-morph continuity, quiet wakeups, hidden-tab suspension/resume, reduced motion, preference changes and listener/timer cleanup. Static export is independent of the live view.

## Rendered / inspected

80/80 final PNGs reproduced byte-for-byte with unique image hashes. Five family sheets were inspected. Controlled comparisons are in `answer-comparisons.png`; their held-fixed parameters are recorded in `comparisons.json`. Six stages, five six-frame transformations, stalk full-range samples and five idle families were rendered and inspected. The stalk crown was lowered after the first review to give it a substantial visible neck. Rich surfaces were strengthened with contrasting painted regions. Checker cells and geometric symbols retain distinct corners.

Browser flow completed using the abstract icon choices. Arrow-key focus navigation and Enter selection worked. Final reveal exposes three buttons and zero editing controls. Independent paragraph regeneration retained DNA 41111. Actual downloaded `downloaded-poster.png` is 1800 × 2520. Normal, long Latin, Hebrew and CJK poster names wrapped within two lines with clear text/signature separation.

The smaller-screen reveal had no horizontal overflow at 278 CSS px. Desktop and smaller-screen layouts, fresh reset and the amorphous name screen were checked.

## Performance and limits

Cold procedural paint baking initially stalled transformation frames. The same seeded paint was baked into 32 reusable local PNG materials (about 22 MB total); no static creature images are used. In the visible local Chromium preview, observed 95th-percentile draw costs were 1.2 ms for body organization, 2.9 ms for eye emergence and 12.1 ms for rich pattern growth. These are local observations, not universal device guarantees. Quiet intervals schedule one timer and no render loop; idle event drawing is capped at approximately 30 fps.

The app and texture materials work entirely locally. Browser QA used the in-app Chromium preview; a separate native Chrome session and real mobile hardware were not tested. Cross-browser pixel identity is not promised. No deployment, push or unrelated-project changes were made by this upgrade.
