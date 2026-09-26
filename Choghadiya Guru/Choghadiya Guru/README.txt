Choghadiya Guru — multi-page SEO site
======================================

STRUCTURE
- build.js         -> generator (Node, no dependencies). Run: node build.js
- dist/             -> the actual static site to deploy (this is what you upload)
- assets/           -> shared style.css + app.js (source; copied into dist/assets by build.js)
- .github/workflows/rebuild.yml -> optional daily auto-rebuild (see below)

PAGES GENERATED (33 total)
- /                          home (today's Choghadiya, New Delhi default)
- /choghadiya/                Choghadiya hub
- /choghadiya/<city>/         25 dedicated city pages (Delhi, Mumbai, Bengaluru, ... — edit TOP_CITIES in build.js to add more)
- /hora/                      Shubh Hora
- /gowri-panchangam/          Gowri Panchangam / Nalla Neram
- /rahu-kaal/                 Rahu Kaal, Yamaganda, Gulika (+7-day table)
- /abhijit-muhurat/           Abhijit Muhurat (+7-day table)
- /shubh-muhurat/             Marriage / vehicle / property / business / mundan / naming
- /what-is-choghadiya/        Guide + FAQ (schema-marked)
- /404.html, /robots.txt, /sitemap.xml

BEFORE YOU DEPLOY
1. Open build.js and change the SITE constant (top of file) from
   "https://choghadiyaguru.example" to your real domain. Then re-run: node build.js
2. Run `node build.js` again any time you edit content — it regenerates dist/ from scratch.
3. Upload the CONTENTS of dist/ to Netlify, GitHub Pages, Vercel, or any static host.
   - Netlify: drag-drop the dist/ folder, or connect the repo and set "Build command: node build.js",
     "Publish directory: dist".
   - GitHub Pages: push dist/ to the gh-pages branch, or point Pages at /dist on main.

WHY IT'S BUILT THIS WAY (SEO notes)
- Every page has its own URL, unique <title>, <meta description>, canonical tag, Open Graph/Twitter
  tags, and a BreadcrumbList schema. FAQ sections also carry FAQPage JSON-LD so Google can show
  rich results.
- The 25 city pages target the highest-volume keyword pattern ("choghadiya for <city>"). Other tools
  (Hora, Gowri, Rahu Kaal, Abhijit) stay as single hub pages with a live city picker — this avoids
  thin/duplicate content across hundreds of near-identical pages. Add more city pages later by
  editing TOP_CITIES in build.js once the first batch is indexed and ranking.
- Slot tables, sunrise/sunset etc. are computed client-side (same astronomy formula as before), but
  all the evergreen explanatory text, headings, and FAQs are static HTML in the page source — so a
  crawler sees real content immediately without depending on JavaScript execution.
- Because "today" changes every day, dist/ should be rebuilt daily so the static intro text/dates in
  the HTML stay current (the interactive tables always self-correct in the browser regardless).
  The included GitHub Action (.github/workflows/rebuild.yml) does this automatically at ~midnight IST
  if you host the repo on GitHub and connect it to Netlify/Pages for auto-deploy on push.

AFTER LAUNCH — GETTING INDEXED
1. Google Search Console (search.google.com/search-console): add your domain (or the dist URL),
   verify ownership, submit https://yourdomain/sitemap.xml.
2. Bing Webmaster Tools: same idea, submit the same sitemap.
3. Internal linking is already in place (nav, footer, "Related pages", "Frequently searched cities").
   Keep it that way as you add pages — it's how Google discovers and ranks them.
4. Page speed: the whole site is a few small static files (no frameworks), so it should score well
   on Core Web Vitals out of the box. Re-check with PageSpeed Insights after deploying.
5. Backlinks and real usage (shares, return visits) matter more than any on-page tweak for ranking —
   there's no shortcut around that.

ADDING MORE CITIES
Edit TOP_CITIES in build.js (format "City|State", must match an entry in CITY_DATA inside
assets/app.js). Re-run node build.js.
