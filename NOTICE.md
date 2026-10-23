# Third-party notice

This project includes adapted geometry code from Anidoodle 0.9.4 by Alex Greenshpun (10x Company), licensed under Apache License 2.0.

Original repository: https://github.com/alexgreensh/anidoodle

Modified files: `src/anidoodle-kit.js` adapts the RNG and point sampler from `engine/src/canvas-core/core.ts`, and the variable-radius limb construction from `engine/src/canvas-core/midCentury.ts`. TypeScript annotations and engine dependencies were removed; geometry was packaged as a small standalone browser module. Original monster artwork and paint renderer are in `src/illustrations.js`.

The full original license is preserved in `vendor/anidoodle-LICENSE`.

The evolution upgrade also applies Anidoodle's documented persistent-actor, pure-pose, closed-form spring and bake-once/composite techniques. Thirty-two seeded gouache surface swatches are baked locally with the project's original paint renderer; all creature geometry and motion remain procedural.

IBM Plex Mono (local interface font): Copyright IBM Corp., SIL Open Font License 1.1. See assets/fonts/IBM-Plex-LICENSE.txt.
