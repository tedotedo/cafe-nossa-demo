# Cafe Nossa — Static Concept Website (`cafe-nossa-demo`)

> **Concept Disclaimer:** Concept design by Mark Aszkenasy – not the official website of Cafe Nossa. Created strictly as a local web design demonstration (`noindex, nofollow`).

## Overview

A sunlit Lisbon *pastelaria* and Portuguese *azulejo* tile-inspired static concept website for **Cafe Nossa** (`109 High Street, Yarm TS15 9BB`), an independent Portuguese delicatessen, brunch, and speciality coffee shop open 7 days a week.

### Key Architecture & Compliance Highlights

- **100% Self-Hosted & Offline-Ready:** Zero external CDN, font, analytics, or script requests. Variable `Domine` (`400–700`) and `Figtree` (`300–800`) `.woff2` fonts are served locally from `fonts/`.
- **Verified Facts Only:** Built strictly around verified public details (`109 High Street, Yarm TS15 9BB`, `01642 640274`, open 7 days a week, voted `#1 Coffee` on *This Is Yarm*, featured in *The Northern Echo*). All unverified hours, prices, and menu specifics use styled `.ph` placeholder badges.
- **WCAG AA+ Contrast & Mobile-First:** Cobalt azulejo (`#184377`), deep night (`#102B4E`), sun-washed lime (`#FBF9F4`), and high-contrast toasted custard-terracotta buttons (`#9E4F12`), zero horizontal overflow at `360px`, `390px`, and `1440px`, keyboard-accessible mobile menu (`Escape` closes), and a solid opaque mobile sticky action bar.
- **Client-Side Pre-Order Demo:** Accessible form validation on `boxes-preorder.html` with live summary updates and safe client-side demo confirmation.

## File Structure

```text
cafe-nossa-demo/
├── .nojekyll
├── index.html            # High Street hero, acclaim, deli preview & 7-day hours
├── menu-deli.html        # Filterable Café/Brunch & Portuguese Wine/Deli counters
├── boxes-preorder.html   # Interactive Grazing Platter & Pastry Box pre-order form
├── favicon.svg           # Custom Portuguese azulejo tile SVG favicon
├── css/
│   └── styles.css        # Self-hosted @font-face, azulejo SVG divider & layout
├── fonts/
│   ├── domine-latin.woff2
│   └── figtree-latin.woff2
├── images/
│   ├── logo-mark.svg     # Custom geometric azulejo emblem
│   ├── hero.jpg          # Illustrative editorial hero image (1440x803)
│   └── feature.jpg       # Illustrative Iberian grazing box image (1200x896)
├── js/
│   └── main.js           # Mobile nav, counter tabs & accessible form logic
├── PITCH.md              # Walk-in sales script, domain check & launch checklist
└── README.md             # Project documentation
```

## Preview Locally

Open `index.html` directly in any modern browser, or serve the folder over a local static server:

```bash
python3 -m http.server 8080
```
