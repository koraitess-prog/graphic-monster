# GRAPHIC MONSTER

A standalone, browser-based design DNA experiment. Name a living painting,
answer five visual questions, and watch it become a tactile illustrated creature.
The finished creature has a name, personality and an immutable anatomical identity.

## Run locally

```sh
npm start
```

Open http://127.0.0.1:4318/. No package installation, backend, paid API or build
step is required. `npm test` runs 23 regression tests.

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

Five principles — Typography, Grid, Color, Shape and Texture — establish distinct
anatomical families. Four subsequent choices influence organization, gaze, surface
and gesture. All 80 combinations use deterministic vector anatomy and shared seeded
paint textures. The original anatomy generator, morph system and paint renderer are
preserved. Final creatures cannot return to the questionnaire or change their DNA.

The intro has contour-grown furry lettering. The final reveal is a living editorial
poster; PNG export produces an 1800 × 2520 static composition with the name, creature
and complete personality paragraph. Display fonts accommodate long and multilingual
names. The earlier visual exploration remains available at `/studies.html`.

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

The 23 tests cover all 80 anatomies and flows, cumulative stages, morph continuity,
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
