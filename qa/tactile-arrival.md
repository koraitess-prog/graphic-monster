# Tactile arrival brief / 25 October 2026

Kind: existing interactive web arrival, not a separate film. Style: approved flat printed paper-cut creatures on #202426. Shape: responsive desktop and mobile viewport. Sound: silent, unchanged. Characters: the same eight saved anatomical families. Duration: retain the approved long descent and recovery. No anatomy, DNA, storage or archive redesign. No push requested.

User's problem: the fall and paper fragments feel very mechanical.

Direction (authored): paper releases in three loose overlapping breaths rather than an even four-sided border. Pieces have different mass/drag, curved departures, small curled edges and decaying angular follow-through. They remain in upper-page world coordinates, never attached to the falling camera. The material clock remains continuous through assembly/flight handoff.

Creature direction (authored): eight weight/lag profiles. One hand catches first; the second follows later. Three finite reflex impulses replace the endlessly repeating flail. Feet trail the torso. Contact preserves the airborne limb pose before relaxing into the heap. Heavy bodies make a small failed first attempt to rise. The camera catches its final distance just after contact, rather than stopping at the same instant as the body.

Anidoodle 0.9.6 inspected: SKILL.md; start-here, interactive, site-art, camera, motion-grammar, working-method, determinism-and-contract, craft-bar. Actual code adaptation: scalar evalSeg spring from engine/src/canvas-core/input.ts into src/tactile-motion.js, credited in NOTICE.md. Reused practices: pure seeded time sampling, different secondary lags, bake once/composite, persistent actor and world-space camera. No audio or generated assets.

Review focus: silhouettes still readable during descent; hands attached; printed material follows limbs and crumple; upper scraps are not a moving mask; family differences express weight without arbitrary jitter. Browser review uses the actual local page, not a claim inferred from passing tests.

## Verification / tactile refinement

- Fifteen focused tests passed: exact initial spring velocity and convergence, sampling-order independence, staggered paper release and bounded continuity, upper-world anchoring, all eight family reflexes, impact limb continuity, finite poses, immutable saved scenes, existing rig integrity, skip/abort/resize/reduced-motion cleanup.
- Static build passed; the browser console returned no errors or warnings on the local review page.
- Inspected actual browser checkpoints for release, fall and contact. Tested 390 x 844 phone emulation (document width 375 <= viewport 390) and 1280 x 900 desktop framing. Playback returned to observation; another family was selectable. This is frame/DOM inspection and emulation, not a claim of physical-phone performance or a continuous video review.
- Added review-only Suspension / Fall / Contact / Rise controls; production interface does not gain a menu of animations.
- Captured proofs: qa/refinement/tactile-paper-release.png and tactile-paper-desktop.png (ignored local QA images).
- Self-critique: edges now form unequal drifts rather than a uniform border; paper retains its printed grain; the silhouette remains the focus and joins remain attached at contact. Full-motion feel still needs the user's judgement; passing geometry tests cannot establish that it feels natural.
- No commit, push, deployment, backend or saved creature changes.
