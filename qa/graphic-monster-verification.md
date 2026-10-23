# GRAPHIC MONSTER — UI verification

- SHA-256 regression checks confirm all four approved artwork modules are unchanged.
- All 80 anatomy combinations and 1,920 sampled single-answer transitions remain valid.
- All 80 named flows preserve identity and story through navigation, renaming, refresh and export. Answer changes invalidate and regenerate only the paragraph; explicit narrative regeneration leaves the anatomy untouched.
- 8,000 narrative samples checked: 35–55 words, reproducible per stored seed, with at least 90 different paragraphs per 100 seeds for each DNA.
- Browser: named a legacy creature; renamed Miso to Miso & Moss; checked unchanged paragraph on rename; regenerated only the story; reloaded and confirmed persistence.
- Browser: completed all five fresh decisions as Juniper, renamed during decision three to Juniper Moss, edited the surface afterward, and checked that the new paragraph matched the updated DNA.
- Actual browser PNG downloaded as graphic-monster-Miso-Moss-01110.png. Visually inspected: original creature, exact name and paragraph, small GRAPHIC MONSTER signature; no clipping or overlap.
- Native compositor checks passed for normal, unbroken 48-character Latin, long Hebrew, and 48-character CJK names. Names fit at most two lines; narrative remains clear of the signature.
- Small-screen reveal and question checked with no horizontal overflow. Creature remains visible above usable choices. Keyboard Enter submission/selection and modal name editing checked.
- Existing reduced-motion implementation is preserved; the new CSS disables interactive sample motion when reduced motion is requested.
- No deployment, GitHub push, paid API, external generation service or unrelated-project changes.
