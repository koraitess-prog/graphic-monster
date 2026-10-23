# GRAPHIC MONSTER

An experimental illustrated creature experience. Run `npm start` and open http://127.0.0.1:4318. No installation, backend, paid API or deployment is needed.

Name an unfinished living painting, make five visual decisions and watch it grow into a finished character. The ending is a living editorial poster, followed by its full personality paragraph and a collection of completed creatures. Final anatomy remains locked.

## Visual refinement

- Patterns are distributed through curved anatomical bands sampled from each body's actual contour. Their scale, direction and spacing respond to the silhouette and DNA. Socket, mouth and counter clearances are reserved; actual curved marks that cross the body or its apertures are omitted. There are no backing panels or rectangular pattern masks.
- The intro uses bold Georgia lettering with seeded hairs grown from sampled glyph contours, clipped internal dry-brush marks, and an accessible heading equivalent. The smaller signature stays restrained.
- The existing canvas moves continuously from the last question into a large poster composition. The questionnaire recedes, the name arrives, the creature greets, then its short statement appears. The complete paragraph lives below the hero. Reduced motion presents the completed layout directly.
- PNG export remains 1800 × 2520, now with a strong name above a large, proportionally fitted creature and the complete paragraph below. Long names wrap or scale; Hebrew/Arabic and CJK names use glyph-bearing system font fallbacks.

## Persistent archive

`src/archive.js` uses a separate, versioned IndexedDB store. Records contain a creation UUID, timestamp, original DNA, seed, exact scene snapshot, chosen name, original paragraph and current paragraph. Atomic identity-based writes prevent duplicate entries after refresh, rerender or description regeneration. Existing scene geometry and DNA cannot be replaced through a later write.

Saving full scene snapshots is intentional: future pattern or parameter changes must not silently change creatures already collected. The latest complete legacy session is migrated with a stable identity. Creatures from older sessions that were never stored cannot be recovered. The collection is local to this browser and origin; clearing browser data removes it and it is not synchronized across devices.

`src/archive-gallery.js` uses one scheduler for visible windows, staggered DNA-specific greetings and the existing pure idle poses. Offscreen windows release canvas buffers. Visible thumbnails use 360 × 456 backing canvases, shared paint materials and approximately 20 fps during short greeting events. Hidden tabs and reduced motion stop animation. The main featured canvas pauses when offscreen too.

## Source map

- `src/dna.js`, `src/evolution.js`, `src/motion.js`: preserved anatomy/DNA grammar, cumulative evolution and pure motion personalities.
- `src/patterns.js`: anatomy-aware printed marks and composition.
- `src/illustrations.js`, `src/anidoodle-kit.js`: unchanged pigment renderer and adapted Anidoodle geometry primitives.
- `src/renderer.js`, `src/paint-cache.js`: persistent morphs and shared seeded paint materials.
- `src/wordmark.js`, `src/typography.js`: contour-driven fur and multilingual display-font selection.
- `src/state.js`, `src/app.js`: existing experience plus stable creation identity and reveal choreography.
- `src/archive.js`, `src/archive-gallery.js`: versioned persistent snapshots and living windows.
- `src/story.js`, `src/poster.js`: local narrative grammar and static editorial PNG compositor.

The original three-character gallery remains at `/studies.html`. Anidoodle geometry and persistent-character / bake-once guidance are credited in `NOTICE.md` and `vendor/anidoodle-LICENSE`.

## Verification

`npm test` runs 18 regression tests covering all 80 anatomies/flows, cumulative stages, 3,920 sampled morph poses, idle geometry, stalk connection, pattern containment, final locks, identity, immutable archive scenes, and 8,000 narrative samples.

Optional rendering checks use the existing bundled `@napi-rs/canvas` installation:

```
node scripts/verify-system.mjs <node_modules>
node scripts/verify-evolution.mjs <node_modules>
node scripts/verify-personal.mjs <node_modules>
node scripts/verify-motion.mjs <node_modules>
node scripts/verify-gallery.mjs <node_modules>
```

`qa/refinement/verification.md` records the visual/browser audit. `qa/refinement/collection.html` is an isolated 80-record IndexedDB stress fixture; it uses a QA-only database and does not add specimens to the product archive. This fixture is not part of the user interface.

## Living collection

The finished reveal links to `#archive`, a separate wall of equal living windows.
Each window opens `#creature=<saved-id>`, a read-only dossier with its original
scene snapshot, name, personality and five design instincts. Previous local
records are reused without migration or regeneration. Browser back/forward and
refresh preserve these routes. The collection belongs to the browser and origin;
it is not shared between localhost and a deployed domain.

One shared animation scheduler renders visible windows only, staggers greetings,
and releases offscreen pixel buffers. Reduced motion keeps the illustrations still.
Profiles use the existing creature renderer and anatomy-aware idle poses.

Run `npm test` for the system and persistence invariants. Open
`/qa/refinement/living-collection.html` for isolated 0/1/6/12/30-record layout
checks; this fixture uses a separate database and never changes the real archive.

This repository is a static frontend. `npm start` serves it locally on port 4318.
No public deployment is configured. Serve the repository root to deploy; no build
step is needed. Retain `assets/paint/`, since these are shared cached paint textures.
