# GRAPHIC MONSTER

A standalone, browser-based design DNA experiment. Name a living painting,
answer five visual questions, and watch it become a tactile illustrated creature.
The finished creature has a name, personality and an immutable anatomical identity.

## Run locally

```sh
npm start
```

Open http://127.0.0.1:4318/. No package installation, backend, paid API or build
step is required. `npm test` runs the regression suite.

## The living collection

The personal reveal links to `#archive`, a separate wall of equal living windows.
Each window opens `#creature=<saved-id>`, a read-only dossier containing the
original scene snapshot, name, personality and five design instincts. Browser
back/forward and refresh preserve these routes. The archive has no editing controls.

Existing versioned IndexedDB records are reused without migration or anatomical
regeneration. Atomic identity-based writes prevent duplicates. Full scene snapshots
protect previously collected creatures from later changes to the generator.
Collections belong to their browser and origin: localhost and a deployed domain
have separate collections. Clearing browser storage removes the local collection.

One scheduler animates visible windows only, staggers anatomy-aware greetings and
releases offscreen canvas buffers. Profiles use the same cached illustration renderer
and individual idle poses. Reduced-motion preferences and hidden tabs pause animation.

## Illustration system

New creations use rendering rules v6. Eight anatomical constructions are independent
of five paper vocabularies: Typography, Grid, Color, Shape and Texture. A creation's
visual seed is chosen once, keeping the anatomical identity stable across questions.
Order/Experiment changes the composition and proportions; Clarity/Expression changes
the sockets and gaze; Minimal/Rich changes the actual piece count and overlaps;
Precise/Playful changes posture, limbs and mouth. Question one replaces the physical
cutout vocabulary without choosing a different species.

The library contains 48 contour templates, including 13 patterned paper types.
Typography includes printed newspaper columns, magazine fragments and oversized letters.
Pleat has both the original side-eye arrangement and a large central orbital eye.
The opening is a full-screen physical paper pile: hover/sweep with a mouse, swipe
with a finger, or focus the Enter button to bypass it. Paper movement pauses in
hidden tabs and respects reduced motion. Large headings use individual cut letters.

Fragments fit anatomical carriers, keep inherited layering and protect the existing
facial apertures. Carriers are invisible geometry; individual cutouts provide pigment.
Patterns are printed into their paper before the ink-loss pass. Paper-local texture
coordinates move with jumps, wrist rotations, bending arms and collage reassembly.

The five-question experience remains at the root. Open /qa/paper-dna/index.html for
an isolated body/language comparison with animated reassembly, or /all-monsters.html
for the 80 deterministic DNA examples. The approved v5 Rift eye/motion review stays
at /qa/character-review/rift.html. Versions 2–5 remain available for saved creatures;
archive snapshots are never reinterpreted by v6. The production deployment is unchanged.

PNG export produces an 1800 × 2520 composition with the creature's name and story.

## Source map

- `src/dna.js`, `evolution.js`, `motion.js`: anatomy, cumulative growth and pure idle poses.
- `src/renderer.js`, `paint-cache.js`, `patterns.js`: cached paint and anatomical surface marks.
- `src/app.js`, `state.js`: questionnaire, personal reveal and stable creation identity.
- `src/archive.js`: versioned local snapshots and identity-preserving persistence.
- `src/collection-screen.js`, `archive-gallery.js`: archive routing, dossiers and living windows.
- `src/samples.js`: original abstract answer symbols.
- `src/story.js`, `poster.js`: deterministic narrative grammar and PNG compositor.
- `src/wordmark.js`, `typography.js`: furry lettering and multilingual display fonts.

## Verification

The tests cover all 80 anatomies and flows, cumulative stages, morph continuity,
pattern containment, final locks, immutable snapshots, identity, routes, escaped names,
read-only profiles and narrative variation. Browser verification is documented in
`qa/refinement/living-archive-verification.md`.

Open `/qa/refinement/living-collection.html` for isolated 0/1/6/12/30-record layout
checks. Its dedicated QA database never changes the product collection. The existing
80-record fixture and optional rendering scripts are retained for deeper visual checks;
these scripts use the development environment's bundled `@napi-rs/canvas` package.

## Hosting and attribution

Live site: https://koraitess-prog.github.io/graphic-monster/

GitHub Pages publishes the root of `codex/living-archive` automatically.
The intro appears before optional texture downloads; only the current scene’s
swatches are loaded, with a procedural fallback and bounded archive startup. Keep `assets/paint/`: the PNGs are shared paint
textures, not static monster illustrations.

Adapted Anidoodle geometry and persistent-character techniques are credited in
`NOTICE.md`; its Apache 2.0 license is preserved in `vendor/anidoodle-LICENSE`.
