# 🌿 Project ByteSaver

> **Delete data. Save CO₂. Track your green impact.**

A gamified, green-tech **Carbon Footprint Awareness Platform** that turns digital cleanup into measurable climate action. Built with vanilla HTML, CSS, and JavaScript — zero build tools, zero dependencies, fully static.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-bytesaver-00e676?style=for-the-badge&logo=github)](https://soil-droid.github.io/project-bytesaver/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 🚀 Live Demo

👉 **[https://soil-droid.github.io/project-bytesaver/](https://soil-droid.github.io/project-bytesaver/)**

---

## 📋 Problem Statement

The digital world has a hidden carbon cost: data centers consume over **200 TWh of electricity per year**, mostly storing data nobody accesses. The average user has 3× more photos than they need and an inbox full of emails generating CO₂ daily.

**ByteSaver** makes this invisible problem visible — and gamifies the fix.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Digital Cleanup Dashboard** | Log GB/MB of data deleted or emails cleared, watch your CO₂ savings accumulate in real-time with localStorage persistence |
| 🎯 **CO₂ Equivalency Cards** | See your savings as: km not driven 🚗, phones not charged 📱, tree-years of absorption 🌳 |
| 📈 **Impact Simulator** | Drag sliders (Cloud Storage & Unread Emails) to explore your potential CO₂ savings |
| 🏆 **Club Leaderboard** | Community rankings backed by localStorage — set your club name and compete |
| 📤 **Share Card** | Generate a receipt-style summary card with native Web Share API + clipboard fallback |
| 🤖 **GreenBytes Guide** | Gemini AI-powered chat assistant — asks follow-up OS questions, gives platform-specific cleanup tips |
| ♿ **Accessibility** | Full ARIA labels, keyboard navigation, skip-nav, reduced-motion support |

---

## 🧮 The Math

```
1 GB stored = 0.25 kg CO₂ / year
1,000 emails = 4 g CO₂ (4 g per email)
1 kg CO₂ saved = 4 km not driven
1 kg CO₂ saved = 120 phones not charged
20 kg CO₂ saved = 1 tree-year of absorption
```

*Sources: IEA, EPA, Carbon Trust, USDA*

---

## 🗂️ Project Structure

```
Carbon/
├── index.html              # Main SPA shell (semantic HTML, ARIA, SEO)
├── .env.example            # API key environment variable pattern
├── assets/
│   └── favicon.svg         # Green leaf SVG favicon
├── style/
│   ├── main.css            # Design tokens, dark mode, layout system
│   ├── components.css      # Glassmorphism cards, buttons, forms
│   └── animations.css      # Keyframes, scroll reveals, micro-animations
├── js/
│   ├── main.js             # App bootstrap, particles, modals, routing
│   ├── utils/
│   │   ├── carbon.js       # Pure CO₂ math utilities (fully testable)
│   │   └── format.js       # Number/unit formatting helpers
│   ├── components/
│   │   ├── dashboard.js    # Cleanup log form + running total
│   │   ├── equivalency.js  # Animated impact cards
│   │   ├── leaderboard.js  # Club rankings (localStorage-backed)
│   │   ├── simulator.js    # Range sliders + live CO₂ estimate
│   │   ├── shareCard.js    # Shareable receipt card
│   │   └── tooltip.js      # ARIA-accessible info tooltips
│   └── ai/
│       └── assistant.js    # GreenBytes Guide AI chat (Gemini API)
└── tests/
    ├── carbon.test.js      # 6 unit assertions (pure JS, no framework)
    └── tests.html          # Browser-based test runner
```

---

## 🔧 Running Locally

No build step required. Just serve the files:

```bash
# Using Node.js http-server
npx http-server . -p 8080 --cors -c-1

# Or Python
python -m http.server 8080

# Then open:
http://localhost:8080
```

> ⚠️ Must be served via HTTP (not `file://`) due to ES module imports.

---

## 🤖 AI Chat Setup

1. Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)
2. Click **⚙️ API Key** in the navigation bar
3. Paste your key (stored in `sessionStorage` only — cleared on tab close)
4. Click the 🟢 chat FAB (bottom-right) and start talking to **GreenBytes Guide**

---

## ✅ Running Tests

Open [`tests/tests.html`](tests/tests.html) in your browser (while serving locally):

```
http://localhost:8080/tests/tests.html
```

All 6 assertions should show ✅:
- `gbToCO2Kg(4)` → `1.0`
- `mbToCO2Kg(1024)` → `0.25`
- `co2ToKmDriven(5)` → `20`
- `co2ToPhones(1)` → `120`
- `co2ToTrees(40)` → `2`
- `emailsToCO2Kg(1000)` → `0.004`

---

## 🎨 Design System

- **Dark mode** by default — deep forest green (`#030b06`) background
- **Google Fonts**: Inter (UI) + Space Grotesk (headings)
- **Glassmorphism** cards with `backdrop-filter: blur`
- **CSS custom properties** for all tokens (`--green-*`, `--dark-*`, `--space-*`)
- **Scroll-triggered reveals** via `IntersectionObserver`
- **Particle canvas** with floating 🌿 emoji and geometric shapes

---

## 🔒 Security

- All user input sanitized via `textContent` (no `innerHTML` with user data)
- API key stored in `sessionStorage` only (never hardcoded, never logged)
- No external scripts or CDNs loaded (except Google Fonts CSS)
- Content Security Policy friendly

---

## 📄 License

MIT © 2025 Project ByteSaver
