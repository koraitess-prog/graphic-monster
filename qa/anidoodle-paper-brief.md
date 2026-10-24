# Living title and opening scraps

Interactive site art, silent, responsive to the existing page. Keep the approved dark, torn-paper/engraved-print house style. No changes to creatures, saved anatomy or questionnaire answers.

User direction: remove the arrow; textures inside CREATE NEW MONSTER should change on hover. The opening pieces pushed aside with mouse/finger should have varied shapes made with Anidoodle.

Implementation choices: five reproducible print states, 420 ms per state during mouse hover over one letter only. Each letter has its own hit region and ink mask; neighbouring letters remain unchanged; a single static texture response for reduced motion. Keyboard focus retains its visible outline without changing textures. Leaving the title restores the original print immediately, including when focus remains. Bake each state once and composite on input. Stop when hidden/offscreen/unmounted. Eight original cover silhouettes use the existing adapted Anidoodle rng, sample and variable-width limb primitives. Broad underlayer scraps preserve full-screen coverage; narrower irregular forms sit above. Keep mouse/touch physics and accessible Enter intact.
