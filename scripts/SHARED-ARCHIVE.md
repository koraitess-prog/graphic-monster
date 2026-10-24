# Shared creature archive

The existing static site connects to the `graphic-monster-archive` Supabase project in the Graphic Monster organization. The project was created on the Free plan. No subscription or payment details were added.

`src/archive-config.js` contains the public URL, browser-safe publishable key and publication cutoff. Never put a secret/service-role key or database password in this repository.

Apply `shared-archive.sql` once to a new project and enable anonymous sign-ins. It creates a public collection with authenticated, owner-only inserts and description updates. A database trigger preserves the original anatomy and identity. Public users cannot delete records; management remains in the Supabase dashboard. The database limits each anonymous owner to 25 new creatures a day; the service also applies its anonymous sign-in rate limit.

New creatures created after the cutoff are public. Earlier IndexedDB creatures stay local and retain their original scenes. IndexedDB remains the local backup and retry queue. Opening the archive retries new local creatures that have not been shared. Reading the collection does not create an anonymous user; writing does. The original browser retains its anonymous session to update descriptions.

The collection refreshes on opening, returning to the tab and every 30 seconds while its grid is visible. A failed connection shows an explicit fallback message instead of claiming that a local save was published. Hosting these client changes is still required before the public GitHub Pages site can use this archive.
