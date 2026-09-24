# FoodFolio landing page

Static site, no build step. One HTML page, two stylesheets, three small scripts, and the assets. Works on GitHub Pages, Cloudflare Pages, Netlify or any web host that serves files.

## Before you push

1. `js/config.js`: fill in the booking link (Stripe payment link or Calendly), WhatsApp number, email, phone, the name of the person leading inspections, and the legal trading name and address. Anything left blank stays hidden on the page, and the Book section shows "Booking opens shortly" until at least one contact is set.
2. Domain: the site is set up for `foodfolio.ie`. If the domain is different, change it in `CNAME`, `robots.txt`, `sitemap.xml`, and the `canonical`, `og:url` and `og:image` tags near the top of `index.html`.
3. Open `index.html` in a browser and read the whole page once. The "Why us" line about the trainer and the footer disclaimer are the two places where the wording depends on who is fronting the business.

## Deploy on GitHub Pages

```
cd foodfolio-site
git init
git add .
git commit -m "FoodFolio landing page"
git branch -M main
git remote add origin https://github.com/YOUR-USER/foodfolio-site.git
git push -u origin main
```

Then on GitHub: Settings, Pages, Source "Deploy from a branch", branch `main`, folder `/ (root)`. Under "Custom domain" enter the domain (it reads the `CNAME` file) and tick "Enforce HTTPS" once the certificate is issued, usually within an hour.

At the registrar (for a .ie domain, whoever you bought it from), add DNS records:

- `A` records for the apex domain pointing to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`
- `CNAME` record for `www` pointing to `YOUR-USER.github.io`

Those are GitHub's published Pages addresses; check them against GitHub's current documentation if the setup page shows different ones.

## Files

- `index.html`: the page. Content only; styles live in `css/site.css`.
- `css/the-walk.css`, `js/the-walk.js`, `js/walk-data.js`: the animated inspection walk in the hero. Edit readings and timing in `walk-data.js`. Add `?t=13000` to the address to pause at a point in the loop.
- `js/config.js`: contact details and links. The only file that needs editing to go live.
- `js/site.js`: applies `config.js` to the page.
- `assets/logo/`: FoodFolio marks as SVG (full lockup with tagline, reversed, mark only, icon only).
- `assets/img/`: hero image (AI-generated illustration, two sizes) and the kitchen photograph (Jaz. Mine, Unsplash licence).
- `assets/map/`: Dublin service-area map drawn from Natural Earth boundaries (public domain).
- `assets/og-image.png`: preview image for links shared on WhatsApp, LinkedIn and the like.
- `CNAME`, `.nojekyll`, `robots.txt`, `sitemap.xml`: hosting files for GitHub Pages.

## Claims to keep

The page says "mapped to the FSAI Guide to Food Safety Skills (2025)" and "independent of the FSAI and the HSE". It never says FSAI approved, accredited or endorsed, and it says "mock inspection", never "EHO inspection". Keep that wording in any edit.
