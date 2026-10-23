# Questionnaire, living paper and collection review

The user approved publication after requesting illustrated archive lettering and aligned creature rows.

## What changed

- All five approved question headings are now used. Answer keys, ordering, DNA encoding and the eight anatomy families are unchanged. “Pattern” is the visible label for the existing `texture` answer.
- Thirteen large comparison drawings replace the questionnaire's compact metadata icons. Letter fragments, modular layouts, overlapping pigments, silhouettes and repeated marks are drawn with the existing seeded Anidoodle primitives and torn contours. The compact identity symbols remain available in creature metadata.
- Desktop uses one question/choice area alongside the paper cloud. Mobile places the question above the cloud and offers two large choices or a horizontally scrollable row of five. Selected choices have a check, thicker upper rule, lower rule and an accessible pressed state.
- Cloud paper is baked from the actual generated creature materials. Cloud-only torn subdivisions permit 11–79 independent scraps without changing the generator or saved scenes. Each answer changes the settled composition. Count, scale contrast, focus, organization and rhythm accumulate rather than resetting at the next question. A 1.15-second compression/unfold reaction is stronger than idle motion. Full anatomy still assembles only after answer five.
- Prominent reveal/profile names use the intro's engraving plates, pigments and layered paper seams, with whole and constructed letters. Unicode text masks retain spelling, case and shaping. Original accessible text remains in the heading. Names wrap by words, with long-word fallback; functional text stays IBM Plex Mono.
- Archive and All 80 now share open display spaces with a aligned grid, small metadata and no ornamental card frames. Existing opening, filters and comparison remain.
- Pointer entry and keyboard focus call the same visitor greeting: a short notice/look phase followed by the approved anatomy-aware family greeting. The response runs once per entry/focus. Touch also has pointer-down feedback and a first-visible greeting, without requiring a second tap to open. Visitor attention takes priority over unattended automatic performances. At most two large performances run together; invisible canvas buffers are released and reduced motion remains static.

## Checks performed

- Walked the actual local five-answer flow through assembly and reveal.
- Visually inspected desktop (1440 × 1000) and mobile (390 × 844), the new answer drawings, selected cloud reaction, name headings, short/long/Hebrew lettering and archive.
- Verified keyboard visitor greetings activate immediately and return to idle. Both pointer-entry and focus handlers share that tested greeting path. Direct pointer-hover and physical touch-device checks remain manual review items.
- Loaded all 80 entries: only three nearby canvases had backing pixels in the tested desktop view. Filtering to Color produced 16 matching creatures; no browser errors were reported.
- Focused tests passed: interaction refinement, living paper and collection (10 tests). Personal persistence/story checks also passed earlier in this pass, including all 80 answer flows.
- Production build and whitespace review passed. Existing saved scene objects and archive storage code were not modified.

## Review links

- Main experience: http://127.0.0.1:4318/
- Saved collection: http://127.0.0.1:4318/#archive
- All 80: http://127.0.0.1:4318/all-monsters.html
- Short/long/Unicode name study: http://127.0.0.1:4318/qa/refinement/name-lettering.html

## Files changed

- `src/dna.js`: wording only.
- `src/samples.js`: large illustrated choice studies.
- `src/app.js`: labeled choices, reaction dwell, mobile step positioning.
- `src/paper-formation.js`: persistent cloud composition and transition.
- `src/creature-lettering.js`: illustrated name renderer.
- `src/paper-titles.js`: scoped name treatment; restrained question/gallery headings.
- `src/archive-gallery.js`: attention-driven greeting scheduler and touch fallback.
- `src/all-monsters.js`: reuse the shared living-gallery scheduler.
- `night.css`: questionnaire, name and archive presentation.
- `gallery.css`: full collection presentation.
- `tests/living-paper.test.mjs`: updated composition bounds and density expectations.
- `tests/interaction-refinement.test.mjs`: DNA identities, name wrapping, persistent alternatives and greeting priority/reduced motion.
- `qa/refinement/name-lettering.html`: local lettering proof.
- `qa/refinement/living-experience-notes.md`: this review record.

## Remaining

Approved for commit/push after the archive-title and aligned-grid revision. No requested implementation section was deferred. Direct hover and physical-device touch behavior should be reviewed by the user; automated browser verification used keyboard focus and responsive viewport sizes.


## Approved follow-up

The archive heading now uses the same printed paper lettering as prominent creature names; its separate count is preserved. Removed desktop and mobile vertical offsets from Archive and All 80, aligning display spaces and caption baselines in each row. Focused tests and the production build passed again before publication.
