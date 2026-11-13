# Cafe Nossa — Static Concept Website (`cafe-nossa-demo`)

> **Concept Disclaimer:** Concept design by Mark Aszkenasy – not the official website of Cafe Nossa. Created strictly as a local web design demonstration (`noindex, nofollow`).

## Overview

A bespoke **Lisbon Porcelain *Placa Toponímica* & Hand-Painted *Azulejo* Ceramic Bento Mosaic** concept website for **Cafe Nossa** (`109 High Street, Yarm TS15 9BB`), an independent Portuguese delicatessen, brunch, and speciality coffee shop open 7 days a week.

### Key Architecture & Compliance Highlights

- **Lisbon *Placa Toponímica* Header & SVG *Azulejo* Frieze:** Authentic glazed porcelain street-plaque cartouche (`CAFE NOSSA / 109 HIGH STREET · YARM`) with ceramic tile-tab navigation, cobalt telephone badge, and repeating hand-crafted SVG *azulejo* tile border.
- **12-Column Asymmetric Portuguese Bento Mosaic (`index.html`):** Combines a corner-rosetted glazed porcelain statement tile, a tall 2-row sunlit *pastéis de nata* photo tile, a deep kiln-cobalt High Street plaque, and an interactive Custard-Ochre **Quick Nata & Grazing Box Builder** carrying selections straight into `boxes-preorder.html` via query parameters and `localStorage`.
- **100% Self-Hosted & Offline-Ready:** Zero external CDN, font, analytics, or script requests. Variable `Domine` (`400–700`) and `Figtree` (`300–800`) `.woff2` fonts are served locally from `fonts/`.
- **Verified Facts Only:** Built strictly around verified public details (`109 High Street, Yarm TS15 9BB`, `01642 640274`, open 7 days a week, voted `#1 Coffee` on *This Is Yarm*, featured in *The Northern Echo*). All unverified hours, prices, and menu specifics use styled `.ph` placeholder badges.
- **WCAG AA+ Contrast & Mobile-First:** Glazed Azulejo Cobalt (`#123B70`), White Tin-Glaze Porcelain (`#FCFBF7`), Warm Limestone (`#F4EFE4`), and Custard Tart Ochre (`#B85A19` / `#9C470D`), zero horizontal overflow at `360px`, `390px`, and `1440px`, keyboard-accessible mobile menu (`Escape` closes), and a solid opaque mobile sticky action bar.

## File Structure

```text
cafe-nossa-demo/
├── .nojekyll
├── index.html            # Azulejo Bento Mosaic hero, Quick Box Builder, 3-Counter Triptych & 7-day ledger
├── menu-deli.html        # Filterable Pastelaria/Brunch & Portuguese Wine/Deli counters
├── boxes-preorder.html   # Interactive Grazing Platter & Pastry Box pre-order form with pre-fill carry-over
├── favicon.svg           # Custom Portuguese azulejo tile SVG favicon
├── css/
│   └── styles.css        # Self-hosted @font-face, Placa cartouche, Azulejo mosaic & WCAG AA+ tokens
├── fonts/
│   ├── domine-latin.woff2
│   └── figtree-latin.woff2
├── images/
│   ├── logo-mark.svg     # Custom geometric azulejo emblem
│   ├── hero.jpg          # Illustrative editorial hero image (1440x803)
│   └── feature.jpg       # Illustrative Iberian grazing box image (1200x896)
├── js/
│   └── main.js           # Mobile nav, Quick Box Builder carry-over, counter tabs & accessible form logic
├── PITCH.md              # Walk-in sales script, domain check & launch checklist
└── README.md             # Project documentation
```

## Preview Locally

Open `index.html` directly in any modern browser, or serve the folder over a local static server:

```bash
python3 -m http.server 8080
```

## Set D — Fresh From the Oven

- `d/index.html`, `d/css/styles.css`, `d/js/app.js` — Custard yellow and warm white with the pastel de nata as the hero: box builder, a standing Friday office order and a phone stamp card.
- Live at https://tedotedo.github.io/cafe-nossa-demo/d/. Reuses the root `fonts/` and `images/`; same `noindex`, zero external requests and `.ph` placeholder rules as Sets A–C.
- The "baked today" count is made up and labelled as demo. Bake times, box prices, hours and the loyalty offer are placeholders.
