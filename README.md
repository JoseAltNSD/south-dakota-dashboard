# South Dakota SLDS Data Dashboard (illustrative mock-up)

A React + Vite version of the public-facing SLDS dashboard mock-up. It follows South Dakota students from high school
into college across three stages: Readiness, Transition and Postsecondary.

> **Illustrative only.** All figures are sample data. Agency names and the logo show intended branding and do not
> represent an official publication of the South Dakota Department of Education or the Board of Regents. Bracketed
> text such as `[SLDS EMAIL]` marks content still to be confirmed.

## Run it

Requires Node.js 18 or later.

```bash
npm install
npm run dev       # local dev server at http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
```

The build uses relative paths and hash-based routing (`#/explore`), so the `dist/` folder can be dropped onto any
static host or opened from a file share without server configuration. Switch `HashRouter` to `BrowserRouter` in
`src/main.jsx` if your host supports single-page-app fallbacks.

## GitHub Pages

`.github/workflows/deploy.yml` builds the site and publishes `dist/` to GitHub Pages on every push to `main` (or on
demand from the Actions tab). In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. The site
is served at `https://<owner>.github.io/<repo>/`.

## Structure

```
src/
  main.jsx               App entry and router
  App.jsx                Layout and routes: /, /explore, /learn
  styles.css             Design tokens (CSS variables) and all styles
  components/
    Header.jsx           Logo, product name, main navigation
    Footer.jsx           Logo, illustrative disclaimer, footer links
    PowerBIEmbed.jsx     Frame for the Power BI report (iframe when a stage has an embedUrl)
    SampleReport.jsx     Sample report pages drawn from the trend values in stages.js
    Icon.jsx             Small stroke icon set
  pages/
    Home.jsx             Question-led landing page and district finder
    Explore.jsx          Stage tabs, page tools, filters, Power BI report, indicator guide
    Learn.jsx            Glossary (searchable), data dictionary, chart guide, downloads, about, FAQ
  data/
    stages.js            Stage and indicator content, filter options
    help.js              Glossary terms, dictionary rows, downloads, FAQ
  assets/
    sd-doe-logo-white.png  Placeholder logo (replace with the official file from DOE Communications)
```

## Deep links

- `#/explore?stage=transition` opens a stage tab.
- `#/explore?level=District&district=Brookings%2005-1` pre-sets the filters.
- `#/learn?section=dictionary` opens a help topic (`glossary`, `dictionary`, `read`, `download`, `about`, `faq`).

## Connecting Power BI

Until a real report is connected, the report frame shows sample pages from `src/components/SampleReport.jsx`: an
overview of every indicator, one page per indicator (five-year trend lines against the district and state, and a
district comparison), a districts and schools page (small-multiple bar charts, or a table), and a student groups page
(state level only, with per-group trends). They follow the Explore filters and use the sample `trend` values in `src/data/stages.js`.

To show an actual Power BI report for a stage, add `embedUrl: 'https://app.powerbi.com/view?r=...'` (a "Publish to
web" link) to that stage in `stages.js`. The frame then shows the report in an iframe in place of the sample.

To connect a secure report:

1. Choose the hosting model: **Power BI Embedded** (secure, capacity cost) or **Publish to web** (free, public, no
   row-level security). This decision is still open with the client.
2. For Power BI Embedded, add `powerbi-client` and `powerbi-client-react`, replace the `.pbi__canvas` block with
   `<PowerBIEmbed embedConfig={...} />`, and get embed tokens from a small server-side endpoint.
3. Map the page buttons to `report.setPage(pageName)` and the Explore filters (level, district, school, year,
   student group) to `report.setFilters(...)`.
4. Generate the Power BI theme JSON from the design tokens in `styles.css` so the report matches the site.

## Design notes

- Colors, type and spacing come from the "South Dakota SLDS Dashboard" design system. PMS hex values are approximate
  and need confirmation from DOE Communications, as does the extended palette (teal, gold, plum).
- Red is used for the site chrome only, never in data. Student group results are limited to the state level to
  respect suppression rules.
