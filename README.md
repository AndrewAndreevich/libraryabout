# libraryabout.com — static site (GitHub Pages)

Static hosting for the **libraryabout.com** domain, served via GitHub Pages.

- `index.html` — apex, redirects to `/svaneti/ushba.html`
- `svaneti/` — the Ushba Mountain video-impostor demo
  - `ushba.html` — web viewer
  - `ar.html` — AR.js marker viewer ("Ushba Mountain" pattern marker)
  - `qr/` — QR code + printable AR marker sheet
- `CNAME` — custom domain (`libraryabout.com`)
- `.nojekyll` — serve files verbatim (no Jekyll build)

Content is built by the WebInpostors pipeline (separate repo) and copied here.
