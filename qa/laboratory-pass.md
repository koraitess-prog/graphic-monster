# Living material / local implementation

- Intro opens directly, without the paper-clearing gate. Existing illustrated lettering is retained, with a usable Begin action and archive entry.
- Five DNA decisions still accept one sample each. Drag, tap and keyboard activation are supported. Retained material samples show the experiment's history.
- Formation now leads into a quiet observation field. The long comic fall is removed from the default reveal; its existing choreography and QA sources remain untouched by this pass.
- Observation maps proximity, abrupt pointer motion and placed stimuli to supported existing family performances. Repeated inputs are rate limited; autonomous movement uses the original family cadence. These are bounded rules, not learning or AI.
- Archive presents one moving specimen and a lazy-rendered strip of static navigation specimens. Selection survives collection refreshes. Existing saved scenes, identifiers and shared storage contracts are unchanged.
- Stories remain accessible as Field notes. Pause, reduced motion, offscreen suspension and listener disposal are retained.

## Verification

- Fourteen focused tests passed: observation across eight families, interaction rate limiting, pause/reduced motion, collection identity, paper drop boundaries, family rig integrity and shared archive persistence.
- Static build, changed JavaScript syntax, module path checks and `git diff --check` passed.
- Local HTTP checks returned 200 for the app, laboratory CSS and observation module.
- The full pre-focused run had 82/83 passing tests. `paper-dna.test.mjs` reports `00010 idle`, event 1, phase .5: `body~paper-0: out of artboard`. Reproduced from a separate export of HEAD, before this implementation. Anatomy was deliberately not changed to conceal this pre-existing failure.
- Browser inspection was unavailable in this session (computer-use inventory returned no enabled browsers/apps). Desktop/mobile visual approval and live drag/gesture inspection remain necessary; no screenshot verification is claimed.

No commit, push or deployment was performed. Earlier uncommitted questionnaire and upper-frame paper changes were preserved. Rare collapse choreography is preserved in source but is not newly wired into observation triggers in this pass.
