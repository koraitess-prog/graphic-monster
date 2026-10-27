# Answer-driven anatomy / rendering version 7

Previously the creation seed selected seed % 8 before any quiz answer. Version 6
and earlier remain unchanged for saved creatures. New creations use version 7.

- Material and organization choose an authored anatomical family through a readable
  answer table; neither random seed nor an anatomy override can choose that family.
- All five dimensions change the carrier geometry. Material affects mass width,
  organization the lean, gaze the face/body width and eye configuration, density
  the body proportions and attached cut fins, and attitude the hip height / leg
  proportion. One coherent map also adapts every motion joint and attachment.
- Clarity yields one fitted focal eye; expression yields at least three, including
  the accordion with minimal surface detail. Apertures stay inside the face.
- Seed varies paper construction / print detail and expressive performances, not
  the body, eye plan or limb roots. Geometry fitting uses carriers, not random cuts.
- Version 7 archives and resumes explicitly; completed version-6 snapshots retain
  their exact generation rules. Unarchived v6 question drafts can adopt v7 on load.
- The eight approved illustration families remain the authored vocabulary. This
  does not claim unbounded or entirely synthesized anatomy.

Verification: all 80 answer paths validated, compared across six seed values;
all five single-answer counterfactuals change body geometry; all eight families
reachable. New joint maps checked through six actions without modifying source
scenes. Saved v6 and v7 states/records round-trip exactly. Native visual sheet:
qa/refinement/answer-anatomy.png. Local comparison page: qa/answer-dna.html.

A pre-existing v6 regression test still fails on 00010 idle because body~paper-0
crosses the old strict artboard boundary. That legacy renderer is intentionally
unchanged; the version-7 anatomy checks pass. Browser playback not visually
verified here. No commit or push performed in this pass.
