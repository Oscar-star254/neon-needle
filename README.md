# Neon Needle Studio website

React + Vite static site. No backend. Forms post to a form service you configure.

## Edit content
- `src/content.ts`: phone, address, hours, Instagram, artists, pricing, FAQ, portfolio images. Search for `TODO`.
- `src/App.tsx`: page copy.
- `public/`: images. Replace `neon-needle-studio-interior.webp` with your own photo.

## Run locally
    pnpm install
    pnpm dev

## Make the forms work
Booking, contact and newsletter forms POST JSON to `VITE_FORM_ENDPOINT`.
1. Create a free form at formspree.io (or similar) that emails info.neonneedle@gmail.com.
2. Copy its URL (looks like https://formspree.io/f/abcdwxyz).
3. In your host's settings add the environment variable `VITE_FORM_ENDPOINT` with that URL, then redeploy.

Without it, forms open the visitor's email app instead (works, but less reliable).
Booking requests include health notes and date of birth, so use a form service whose privacy terms you are comfortable with.

## Deploy
Vercel: import the repo, accept defaults (build `pnpm build`, output `dist`). `vercel.json` handles page routing.
Netlify / Cloudflare Pages: build `pnpm build`, publish `dist`. `public/_redirects` handles routing.

## After deploying
- Add your domain to `public/robots.txt` as a `Sitemap:` line if you add a sitemap, and set `og:image` (absolute URL) in `index.html` once you have a share image.
- Open /artists, /contact and /book directly to confirm routing.
