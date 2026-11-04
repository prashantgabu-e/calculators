# Calculators

A responsive, India-focused collection of everyday calculators. The application is a React single-page app (SPA) that runs calculations in the browser and is built as a static site for deployment.

## Highlights

- 25+ calculators across finance, tax, shopping, health, everyday, maths, and utility categories.
- Search the calculator catalogue from the **All calculators** page.
- Star frequently used calculators; favourites are promoted to the top of the catalogue and sidebar.
- Light and dark themes, responsive navigation, and mobile-friendly numeric inputs.
- Indian-number and rupee formatting throughout relevant calculators.
- No account or backend is required. Theme, sidebar preference, and favourites are stored only in the current browser's `localStorage`.

## Calculator catalogue

| Category | Calculators |
| --- | --- |
| Core & Maths | Simple Calculator, Percentage Calculator, Currency / Unit Converter |
| Finance | SIP, EMI, FD, Loan Eligibility / Payment, Compound Interest, Salary / Take-home, Mutual Fund Lumpsum, PPF / EPF, Credit Card EMI, Rent vs Buy, Inflation, Gold / Silver Price |
| Tax | GST Rate Finder + GST Calculator, GST Reverse Calculator, Income Tax Calculator |
| Shopping | Discount Calculator, Unit Price Calculator |
| Everyday | Fuel Cost & Mileage, Split Bill, Date Difference / Working Days |
| Health | BMI, Calorie / BMR |
| Utility | Age Calculator, Currency / Unit Converter |

### Fuel Cost & Mileage

The Fuel Cost Calculator contains two modes:

- **Fuel cost** keeps the original trip and monthly spend estimate. Enter trip distance, vehicle mileage in km/L, fuel price, and monthly trips.
- **Mileage** calculates vehicle efficiency in the Indian-standard `km/L` format. Enter distance travelled and fuel used; an optional fuel price adds total fuel cost and cost per kilometre.

### Unit Price Calculator

Compare pack prices using total price, quantity per item, number of items, and a UOM. It supports ml, litres, grams, kilograms, pieces, and a custom UOM. It shows the price per item, price per measurement unit, total quantity, and a common comparison price per litre or kilogram where applicable.

## Tech stack

- React 19 and TypeScript
- Vite 7
- React Router (`HashRouter`) for static-hosting-friendly navigation
- Plain CSS with responsive and theme variables
- Lucide React icons

## Getting started

### Prerequisites

- Node.js 20+ and npm

### Install and run locally

```bash
npm install
npm run dev
```

Vite prints the local URL, normally `http://localhost:5173`.

### Production build

```bash
npm run build
```

This type-checks the app and writes the static production output to `docs/`. The Vite base path is `/calculators/`, which is configured for project-site hosting.

## Project layout

```text
src/
  App.tsx               App shell, route catalogue, shared controls, and primary calculators
  extraCalculators.tsx  Additional calculator pages, including Fuel Cost & Mileage
  styles.css            Theme, layout, navigation, form, and result-card styles
  main.tsx              React mount point and hash-router setup
public/                 Static assets, app manifest, icons, and service worker
docs/                   Generated production site output
documents/              Feature and architecture reference notes
vite.config.ts          Vite configuration and docs/ output target
build-and-push.ps1      Build, commit, and push helper for the master branch
```

## Browser storage and privacy

The app has no user backend, database, or login. It stores only UI preferences in the browser:

| Storage key | Purpose |
| --- | --- |
| `calcverse-theme` | Selected light or dark theme |
| `calcverse-sidebar-collapsed` | Desktop sidebar collapsed preference |
| `calcverse-favorites` | Starred calculator route slugs |

Calculator input values are calculated in memory and are not intentionally saved after a refresh. Clearing the site’s browser storage resets the preferences and favourites.

Some calculators may request live public data, such as exchange-rate or metal-rate information. They provide built-in fallback values if a request is unavailable.

## Adding a calculator

1. Create the page component in `src/App.tsx` or `src/extraCalculators.tsx`.
2. Add it to `calculatorRoutes` in `src/App.tsx` with a unique slug, title, category, icon, and component.
3. Reuse shared controls (`Field`, `SelectField`, `SegmentedControl`, and `ResultPanel`) where possible so the page matches the rest of the app.
4. Run `npm run build`; a new calculator is automatically included in the dashboard, search, sidebar, and route table.

## Deployment

The tracked `docs/` directory is the production artifact. Build it with `npm run build`, then publish the repository through the configured static-hosting workflow.

For the repository’s existing build-and-push workflow on Windows PowerShell:

```powershell
.\build-and-push.ps1
```

The script builds the site, stages changes, creates a timestamped commit, and pushes to `origin master`. Review the working tree before running it because it stages all changes.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server |
| `npm run build` | Type-checks and builds static output into `docs/` |
| `npm run preview` | Serves Vite’s default preview output |
| `npm run predeploy` | Runs the production build |

## Verification

Run the production build before handoff:

```bash
npm run build
```

Then manually check calculator inputs with positive, zero, and invalid values; responsive sidebar behavior; search; favourite persistence after refresh; and both Fuel Cost & Mileage modes.
