# Living collection verification — 2026-10-23

- 20 Node tests pass, including encoded route identities, HTML escaping,
  read-only record preservation, archive identity and all 80 creature anatomies.
- Browser journey completed on localhost: five questions → Milo reveal → archive
  → Milo profile → archive → New monster → five questions → Nori reveal → archive.
  Both new records and the pre-existing record remained after reloading.
- The actual 127.0.0.1 archive retained Margot, Moss and Juniper. Margot opened
  with her saved personality and Color / Order / Clarity / Rich / Playful traits.
  A direct profile URL restored correctly after reloading.
- Isolated fixture exercised 0, 1, 6, 12 and 30 records. Thirty records were written,
  reopened and deduplicated in a separate QA database; product records were untouched.
- Desktop uses four equal columns. At 390px the collection uses two equal columns;
  both gallery and profile had no horizontal overflow. Full silhouettes fit windows.
- Observed a greeting in one visible window while its neighbors remained at rest.
  After scrolling to the bottom, the first row had offscreen state and 1px buffers;
  only six nearby windows held rendered buffers in the 30-record fixture.
- Keyboard activation and back-to-archive navigation were exercised. Accessible
  names identify every window. Collection and profile honor the existing reduced-
  motion media query and visibility-aware scheduler; no new animation loop is used.
- No deployment workflow existed. This is a static frontend with browser-local
  IndexedDB records. Deployment to a different origin starts a separate collection.
