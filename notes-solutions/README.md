# Solution Bank

Edit catalog.json to add chapters and exercises. Each entry uses a verified Google Drive file ID with viewer sharing and download/print/copy restrictions applied in Drive. Never place PDF files or OAuth credentials in this repository.

After updating the catalog, run: node notes-solutions/build.mjs
Then commit/push the catalog and generated pages. The generator creates directory index pages for the fixed QR URLs. GitHub Pages may redirect the no-trailing-slash version to the equivalent directory URL; QR links remain usable.

Password gate remembers this browser for one year when selected. It is a basic client-side gate, not server-side access control. Anyone with a Drive link can view that PDF. Drive restrictions do not prevent screenshots.

Unknown exercise URLs render the coming-soon screen through 404.html, with HTTP 404 for genuinely ungenerated paths (GitHub Pages cannot return a dynamic 200 fallback). Add a placeholder exercise to the catalog and rebuild if a future QR target must return 200 before its PDF is ready. Known 4a has an explicit placeholder page.

Manual checks: wrong password, correct password, remember-device reload, all four Drive viewers, previous/next, phone width and 4a placeholder. Physical phone camera QR scanning requires a real phone.

