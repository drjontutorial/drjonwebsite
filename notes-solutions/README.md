# Solution Bank

Student accounts (lightweight model chosen by Dr Jon, same as his ESAT/TMUA portal):

- Data lives in Firebase Realtime Database, project `tmua-esat-homework`, under
  `esatTmuaGate7f2Kx9Lw/solutionBank/`:
  - `catalog` — courses → chapters → exercises (slug, title, Google Drive file ID)
  - `students/<code>` — `{ name, password, active, access: { <course>: { <exercise>: true } } }`
- Students sign in at `/login/`; `bank.js` re-checks the account on every page and shows only assigned exercises.
- Admin (not linked anywhere): `/notes-solutions/admin/` — create students, set passwords, tick exercises.
- Never commit student lists, passwords, or the catalog with Drive IDs to this repo.

This is a convenience gate, not server-enforced security: the database path is readable by anyone who knows it, and anyone holding a Drive link can open that PDF.

Adding new exercise URLs (e.g. new QR codes): add the slugs to `routes.json`, run `node notes-solutions/build.mjs`, commit. Then add the titles + Drive IDs to the Firebase catalog.
