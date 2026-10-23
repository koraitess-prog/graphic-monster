# Verification — interactive experience

- Eight Node test suites pass, including all 80 complete answer paths, anatomical validity, deterministic scene generation, question-to-feature mapping, navigation/edit/reset, and sampled interrupted morphs. Another 1,920 intermediate poses cover every possible single-answer change, with face containment and visible-eye collision checks.
- All 80 final images rendered twice with matching byte hashes and distinct images. Contact sheets inspected for all five body families. `qa/system/report.json` contains the per-image hashes.
- Browser flow exercised through all five questions and reveal. Enter selection, arrow-key focus, automatic advance, manual Next, editing an earlier answer, and refresh restoration checked.
- Browser image export produced `design-monsters-serif-jumble-01111.png`, an 1800 × 2520 PNG. Export uses the final selected scene, independent of the current animation frame.
- The actual motion host was tested with a controlled requestAnimationFrame clock: interrupted pose continuity, static reduced motion, preference changes during a morph, and zero idle animation frames.
- A settled browser eye morph recorded 25 frames with a 12.20 ms p95 draw cost. This is an observation on this desktop, not a guarantee across hardware.
- Smaller-screen question layout checked at 560px with no horizontal overflow. Restart returns to the intro and the next start opens a fresh questionnaire.
- No backend, deployment, push, network service, or runtime dependency was added. All work is inside DESIGN MONSTERS.
