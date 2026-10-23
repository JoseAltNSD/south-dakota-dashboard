# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An illustrative React 18 + Vite 5 mock-up of the South Dakota SLDS public dashboard. It follows students from high
school into college across three stages (High school, Transition, Postsecondary; the first one's key is still
`readiness`). All figures are sample data, and the real charts will come from an embedded Power BI report, which this
app only represents with a placeholder. Bracketed
text such as `[SLDS EMAIL]`, `[YEAR]` or `[pending]` marks facts still to be confirmed with the client; keep those
markers rather than inventing values.

## Commands

Requires Node.js 18+.

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build
```

There is no test runner, linter or formatter configured.

## Architecture

- **Routing**: `HashRouter` (`src/main.jsx`) plus `base: './'` (`vite.config.js`) so `dist/` works from any static
  host or file share. Routes are `/`, `/explore`, `/learn` in `src/App.jsx`, which also sets `document.title` from
  its `TITLES` map (add an entry when adding a route).
- **Content lives in data files, not components.** `src/data/stages.js` holds each stage's copy, FAQ, indicators and
  the filter option lists (`YEARS`, `LEVELS`, `DISTRICTS`, `SCHOOLS`, `GROUPS`); `src/data/help.js` holds glossary,
  dictionary, downloads and FAQ content for Learn. Pages render from these, so copy edits usually belong there.
- **URL query params are the shared state between pages.** Home links into Explore with `?stage=`,
  `?stage=...&indicator=<id>` (opens that indicator's report page and scrolls to it) and `?level=District&district=...`; Explore
  validates them against `STAGE_ORDER`/indicator ids/`LEVELS`/`DISTRICTS` before use.
  Learn uses `?section=` (`glossary`, `dictionary`, `read`, `download`, `about`, `faq`). Keep these deep links working
  when renaming keys or options.
- **Explore → Power BI report pages**: Explore builds the report's page list as Overview + one page per indicator
  without `later: true` + Districts and schools + Student groups. "Show in report" maps an indicator's index to a page index, so the
  order of `indicators` in `stages.js` matters. Indicators with `later: true` appear in the guide as "Coming later"
  but get no report page.
- **Report frame**: `PowerBIEmbed.jsx` shows an iframe when the stage has an `embedUrl`, otherwise its children,
  which Explore sets to `SampleReport.jsx`. The sample pages are drawn from each indicator's `trend` (oldest year
  first, the reverse of `YEARS`) and `breakAt` (series break). `sampleValue()` derives district, school and group
  values from fixed per-name offsets and yearly drifts and returns `null` for suppressed cells. An indicator with
  `parts` (reading and math proficiency) keeps one report tab but each part has its own `trend`: its page shows a
  trend tile per part, and the other pages list the parts separately. Student groups are
  grouped by `GROUP_CATEGORIES` in `stages.js`; `GROUPS` is derived from it. The README's "Connecting Power BI"
  section covers the swap to Power BI Embedded; the hosting model is still undecided.
- **Downloads and feedback**: `src/downloads.js` builds every "Download data" CSV in the browser from
  `sampleValue()`, so files match the charts; `DOWNLOADS` in `help.js` names each card's `file` (a stage key or
  `dictionary`). `Feedback.jsx` provides a modal `<dialog>` to every page through `useFeedback()` (Explore's
  "Send feedback" and the footer link); it has no backend and only shows a thank-you.
- **Drop-downs**: use `src/components/Select.jsx`, not a native `<select>`. Native menus are drawn by the OS and don't
  show when the screen is shared in a meeting.
- **Styling**: one global `src/styles.css` with design tokens as CSS variables on `:root` and BEM-ish class names
  (`.pbi__canvas`, `.btn--secondary`). Stage colors are `--readiness`, `--transition`/`--transition-ink`,
  `--postsecondary`, each with a `--*-tint` for light fills; data files reference them as `var(--...)`. No CSS modules or utility framework.

## Domain rules to preserve

- Student group results are state-level only (suppression rules). Explore enforces this by disabling the group
  filter and resetting it to "All students" when level is not State.
- Values with fewer than 10 students are suppressed; suppressed cells are shown striped/hatched.
- Red (`--prairie-red`, `--signal-red`) is for site chrome only, never for data.
- PMS hex values and the extended palette are approximate pending DOE Communications; the logo in `src/assets/` is a
  placeholder.
