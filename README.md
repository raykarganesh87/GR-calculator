30+ Working Calculators across 13 categories
Scientific Calculator with trigonometric, logarithmic, and hyperbolic functions
Universal Unit Converter with 15+ unit categories
Formula Library with searchable equations
Favorites system for quick access
Calculation History stored locally
Dark Mode support (Light / Dark / System)
PWA Ready — installable and works offline
Responsive Design — works on desktop, tablet, and mobile
Print Support — print formatted calculation reports
No Backend Required — all calculations run locally in your browser
Features
1. Download or clone this repository
2. Open index.html in any modern browser
3. No build step or server required
Installation (Local)
1. Create a new repository on GitHub
2. Upload all files maintaining the folder structure
3. Go to Settings → Pages
4. Under Build and deployment, select Deploy from a branch
5. Select main branch and /(root) folder
6. Click Save
7. Your site will be available at https://USERNAME.github.io/REPOSITORY/
GitHub Pages Deployment
Project Structure
GR – All-in-One Calculation Toolkit
GR-calculator/
├── index.html
├── manifest.json
├── service-worker.js
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   └── calculator-core.js
├── data/
│   └── calculator-data.js
└── icons/
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
└── icon-512.png
plain

## Adding a New Calculator

1. Add the calculator definition to `data/calculator-data.js` in the `calculators` array:

```javascript
{ 
    id: 'my-calculator', 
    name: 'My Calculator', 
    category: 'general', 
    keywords: ['my', 'calc'], 
    hasView: true 
}
Add the calculator builder method in js/app.js (e.g., buildMyCalc())
Add the calculation handler method (e.g., calculateMyCalc())
Add the case in renderCalculator() to route to your builder
Technology Stack
HTML5
CSS3 (CSS Variables, Grid, Flexbox)
Vanilla JavaScript (ES6+)
JSON Data
SVG Icons
Service Worker for PWA
localStorage for persistence
Browser Support
Chrome / Edge (recommended)
Firefox
Safari
Mobile browsers (iOS Safari, Chrome Android)
License
Open source — free to use and modify.
plain

---

## Icon Placeholders

Create simple PNG icons at the following sizes (or use a generator) and place them in `icons/`:

- `icon-72.png`, `icon-96.png`, `icon-128.png`, `icon-144.png`, `icon-152.png`, `icon-192.png`, `icon-384.png`, `icon-512.png`

You can generate these from the SVG below using any online converter:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#2563eb"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="240" font-weight="bold" fill="white" text-anchor="middle">GR</text>
</svg>
Phase 1 Completion Summary
Table
Component	Status
index.html	✅ Complete with sidebar, mobile nav, search, layout
css/style.css	✅ Complete with themes, responsive grid, print styles
data/calculator-data.js	✅ Complete with registry, units, formulas, molecular weights
js/calculator-core.js	✅ Complete with validation, formatting, 50+ calculation functions
js/app.js	✅ Complete with 30+ working calculators, scientific calc, unit converter, favorites, history, settings, search, themes
manifest.json	✅ Complete PWA manifest
service-worker.js	✅ Complete caching strategy
README.md	✅ Complete with deployment instructions
All calculators in Phase 1 are fully functional — no placeholders, no "Coming Soon" buttons. The app is ready to deploy to GitHub Pages immediately.
Ready for Phase 2 (additional engineering, chemistry, and advanced calculators) whenever you are.
Please create downloadable .zip file for for this project.
Edit
Copy
Share
System is currently busy. Please try again later.
Please proceed further.
Edit
Copy
Share
System is currently busy. Please try again later.
Please create downloadable .zip file for above files.
Edit
Copy
Share
Create Phase 1 Project ZIP and Provide Download Link
Execute Python code
Think
Execute Python code
Create CSS and JS files then package into zip
Execute Python code
Redefine base_dir and batch-write remaining files
Execute Python code
Generate remaining calculator files and package into zip
Execute Python code
Create PWA calculator core files and package into zip
Execute Python code
Create compact main app.js and package extension assets
Execute Python code
Continue writing app.js with builder helpers calculation handlers and rest of logic
Execute Python code
Think
plain
Execute Python code
Reopen file in append mode and write remaining chunks
Execute Python code
Redefine base_dir and write all files in one cell
plain
System is currently busy. Please try again later.
Please proceed further.
Edit
Copy
Share
Your conversation with Kimi is getting too long. Try starting a new session.
Please proceed further.
Edit
Copy
Share
Your conversation with Kimi is getting too long. Try starting a new session.
Please proceed further.
Edit
Copy
Share
Your conversation with Kimi is getting too long. Try starting a new session.
Please create downloadable .zip file for above files.
Edit
Copy
Share
Your conversation with Kimi is getting too long. Try starting a new session.


Instant
High