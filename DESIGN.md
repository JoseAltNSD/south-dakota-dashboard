# South Dakota SLDS Dashboard: Design Spec and Handoff

_Last updated 2026-10-20. This is the source of truth for anyone (human or agent) continuing work on the mock-up. Where this file and the original design system disagree, **this file wins**: it records decisions the project owner made during review._

---

## 1. What this is

An **illustrative mock-up** of a public-facing web app for the South Dakota Department of Education's Statewide Longitudinal Data System (SLDS). It follows students from high school into college, and gives the public access to embedded **Power BI** reports with plain-language context (glossary, data dictionary, guides).

- **Client:** South Dakota DOE, SLDS team (Joe Moran, Michael Ochoa, Evelyn Watson, Wendy Caveny). TA partners are Mathematica and DL.
- **Stack the client is committed to:** Azure, Power BI, Microsoft Purview. No Tableau or Google tools.
- **Audience:** state leaders, researchers, district administrators, K-12 staff and postsecondary staff. Students and families are not the priority, but the site is public.
- **Layout model:** the Nebraska insights site (insights.nswers.org), adapted. It is question-led, has friendly explanatory text, uses icon tool buttons ("What am I seeing?", "Data dictionary", "FAQ", "Download data"), and has "Why is this important?" and "Which students am I seeing?" intro blocks.

### Where the work lives

| Artifact | Location | Notes |
|---|---|---|
| Design canvas (primary) | Claude Design artifact `https://claude.ai/code/artifact/00261ff1-f72b-42ca-aad6-78d129e8a1ea` | Files: `project/canvas.json`, `project/Main.dc.html` (Home), `project/Explore.dc.html`, `project/Learn.dc.html` (Glossary and help). Logo asset: `/_blob/4ddb38be886e185773c2993b57276a4a` |
| Design system | `https://claude.ai/code/artifact/df7908ff-b3d2-4fcc-9f9b-62e3f7840a62` ("South Dakota SLDS Dashboard") | Installed in the canvas at `project/ds/sd-slds/tokens.json` |
| React project | This repository, `github.com/JoseAltNSD/south-dakota-dashboard` (React 18, Vite 5, react-router-dom 6, HashRouter). Originally delivered as `sd-slds-dashboard-react.zip`. | Has the same content as the canvas, refactored into components with CSS variables. Since 2026-10-19 it also draws sample charts in the report frame (see §4). |
| Live site | GitHub Pages, `https://<owner>.github.io/<repo>/` | `.github/workflows/deploy.yml` builds and publishes `dist/` on every push to `main`. In the repo's Settings → Pages, Source must be **GitHub Actions**. |
| Static export | `sd-slds-dashboard-static.zip` (index.html, explore.html, learn.html) | Generated from the canvas files with a small runtime. Regenerate it rather than hand-edit it. |

**Keep the canvas and the React project in sync.** A change to one should be applied to the other unless the owner says otherwise.

---

## 2. Owner decisions (do not undo)

These came out of review rounds. They override the original design system README.

1. **Minimal and uncluttered.** The page background is **white** (`#ffffff`). Do not use the beige "sand" (`#f6f2e8`) anywhere; the owner rejected it.
2. **No colored top borders on cards** on Home and Explore. Stages are told apart by a **colored eyebrow label** (text) and, in the Explore tabs, a **10px colored dot**. Do not add left-border accents to cards either. The one exception is the Explore intro blocks (see §5), which the owner approved on 2026-10-20.
3. **Sections are full-width bands with no divider lines between them.** Bands alternate between white and a subtle gray "well":
   - Well: `background: #f7f7f7; box-shadow: inset 0 1px 3px rgba(31,26,28,0.06), inset 0 -1px 3px rgba(31,26,28,0.06);`
   - Bands are edge to edge, with content in a `max-width: 1200px` container and `24px` side padding.
   - Rejected alternatives: tinted per-section backgrounds, rounded inset well boxes inside the margins, and hairline dividers between sections.
4. **No "Essential Questions" or "EQ" wording** anywhere visible. The Education-to-Workforce framework is not of interest to users.
5. **"Illustrative" must stay visible:** as a lime badge in the header, and as an outlined badge plus disclaimer text in the footer. The banner strip under the nav was **removed** at the owner's request. Do not re-add it.
6. **The DOE logo** (white, transparent PNG) is used in the **header** (48px tall, linking to Home) and the **footer** (244px wide). It was cropped from an image the owner supplied, and the official file must come from DOE Communications.
7. **No "Download data" button in the top nav.** Downloads are reached from the Explore tool button, the Home help tile and the Glossary and help "Download data" section.
8. **Explore filters are all dropdowns**, laid out in a labeled grid: Level, District, School, School year, Student group. A sentence-style ("Show results for… in… for…") layout was tried and **rejected**, as were segmented buttons and year buttons.
9. **One single Power BI section per stage** on Explore, spanning the full content width. Do not split the report into per-indicator embeds, KPI tiles or a separate district-comparison embed. Those are now **pages inside the one report**.
10. **No "On this page:" jump-link row** on Explore. It was removed.
11. **Explore uses horizontal stage tabs.** A left sidebar index was tried, and was removed so the bands could run full width. Tabs also match the client's "three tabs" requirement.
12. The owner wants to be able to **revert**. Before large changes, keep a copy of the current files.

---

## 3. Design tokens

Colors come from the DOE brand. The PMS values are approximate conversions and need confirmation from DOE Communications. Teal, gold and plum extend the official palette and need DOE sign-off.

### Color

| Token | Hex | Use |
|---|---|---|
| `prairie-red` | `#7c2629` | Header and footer background, page H1, primary button |
| `signal-red` | `#af272f` | Links, focus ring, text buttons ("Reset filters", "Show in report") |
| `on-red` | `#ffffff` | Text on red |
| `ink` | `#1f1a1c` | Body text, headings, selected Power BI page button |
| `muted` | `#5e5558` | Secondary text, captions |
| `hairline` | `#ddd5c4` | Card borders, table rules, stage-tab baseline |
| `control-border` | `#857e80` | Inputs, selects, secondary buttons |
| `band` (well) | `#f7f7f7` | Gray bands, key-finding box, notes |
| hover gray | `#f5f5f5` | Secondary button hover, stage-tab hover, question-link background, active side-nav item |
| `lime-accent` / `on-lime` | `#babf10` / `#2a2d02` | "ILLUSTRATIVE" badge on the red header **only** |
| `readiness` | `#1f6f78` | Readiness stage color, and the primary data color |
| `transition` | `#8a6d1f` | Transition dot/fill (use `transition-ink` for text) |
| `transition-ink` | `#7a5f18` | Transition text |
| `postsecondary` | `#5b3550` | Postsecondary stage color |
| Stage tints (`readiness-tint`, `transition-tint`, `postsecondary-tint`) | `#e3f0f1`, `#f3ebd6`, `#efe6ec` | Selected Explore stage tab, and small stage chips in the data dictionary |
| `suppressed` hatch | `repeating-linear-gradient(135deg, #cfc8bc 0 6px, #e8e2d7 6px 12px)` | "Coming later" or suppressed items |
| Data ramp | `#e3f0f1 → #a9d1d4 → #5fa8ae → #1f6f78 → #134850` | Maps and heat tables (Power BI theme) |
| Sample heat ramp | `color-mix(in srgb, <stage color> 12–60%, white)`, 5 steps | District heat table in the React sample report. Capped at 60% so ink text stays readable. |
| Power BI chrome | `#f3f2f1` bar, `#fafafa` canvas, `#ececec` sample panel borders | Embed placeholder and sample report |

**Data rules:** never use red in data marks, never pair red with lime, and never use tan or lime for text. Do not rely on color alone; always add labels.

### Type

The font family is `"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, system-ui, Helvetica, Arial, sans-serif`, chosen to match Power BI. Use weights 400, 600 and 700 only.

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| display | 40 / 44 | 600 | Home hero question (prairie red) |
| h1 | 32 / 38 | 600 | Page title (prairie red) |
| h2 | 24 / 30 | 600 | Section headings |
| h3 | 18 / 24 | 600 | Card titles, sub-sections |
| body | 16 / 24 | 400 | Explanatory text |
| body-sm | 14 / 20 | 400 | Card body, labels, tables |
| caption | 12 / 16 | 400 | Sources, notes (muted) |
| eyebrow | 12 / 16, letter-spacing 0.06em, uppercase | 600 | Stage labels, indicator names |
| kpi | 44 / 48 | 700 | Headline numbers (chart guide only) |

### Space, shape and elevation

- 4px grid. Card padding is 16–24px, grid gutters 16–24px, and band padding 48–64px vertically (Explore uses 56px).
- Radii: 2px for chips and badges, 4px for buttons and inputs, 8px for cards, panels and embeds.
- **No drop shadows on cards.** Cards are white with a 1px `hairline` border. The only shadow is the inset band shadow.
- The content container is 1200px wide.

---

## 4. Global components

**Header** (prairie red, all pages)
- Left: the logo (48px tall), a 1px white divider at 50% opacity, then "SLDS Data Dashboard" (16/22, 600) with the lime "ILLUSTRATIVE" badge under it. The whole block links to Home.
- Right: the main nav (Home, Explore the data, Glossary and help). Links are 14px, 600 weight, 44px tall. The active page has a 3px white underline and `aria-current="page"`.
- The header wraps on narrow screens.

**Footer** (prairie red)
- Logo (244px), then "South Dakota Statewide Longitudinal Data System" (16, 600), an outlined "ILLUSTRATIVE" badge, and the disclaimer: *"Illustrative mock-up for design review. Agency names show intended branding only; this is not an official publication of the South Dakota Department of Education or the South Dakota Board of Regents."*
- Links: About the data, Accessibility, Privacy, Contact the SLDS team, Feedback.

**Buttons**
- Primary: prairie red, turning ink on hover.
- Secondary: white with a `control-border` border, turning `#f5f5f5` on hover. When a secondary button toggles a panel, it is underlined and gets an ink border while open (`aria-expanded`).
- Text button: signal red, underlined.
- The touch target is at least 44px (32px for inline text buttons).

**Focus:** a 2px solid `signal-red` outline with a 2px offset. Use white instead inside the header and footer.

**Power BI report frame**
- A white card with a hairline border and 8px radius, full width.
- **With an `embedUrl`** on the stage (a "Publish to web" link in `stages.js`), the frame shows the real report in an iframe (`aspect-ratio: 16/9; min-height: 420px`). The sample bottom bar is hidden, because that report has its own page navigation.
- **Without one** (the current state for all stages), the canvas (`#fafafa`, `min-height: 420px`, 20px padding, height follows content) shows **sample report pages** drawn from sample data, followed by the bottom bar.
- The bottom bar (`#f3f2f1`) has "Microsoft Power BI" on the left, page buttons in the center (the selected one is ink with white text), and "Full screen" on the right.
- Report pages per stage: **Overview**, then one page per available indicator, then **District comparison**.
- For Power BI Embedded, the iframe is swapped for `powerbi-client-react`. The page buttons map to `report.setPage()` and the filters to `report.setFilters()`.
- *Superseded:* the earlier gray skeleton (title bar, card outlines, bar and table panels) with a centered "Power BI embedded report / Page: {name}" label was removed from React when the sample charts were added. The canvas artboard may still show it.

**Sample report pages** (React, `SampleReport.jsx`)
- Every page has a header: the h3 title (the indicator question, or "{Stage}: {page}") and a caption with the current filters plus "Sample data".
- Panels are white with a 1px `#ececec` border and 4px radius. Labels are 12px, 600, muted. Headline values are 32/38 (600, tabular numbers), or 44/50 on indicator pages.
- **Overview:** one tile per indicator (auto-fit grid, 220px minimum) with the value, the change from the year before ("+2 pts from 2024–25", or "Not comparable with the year before" at a series break) and a compact five-year bar strip.
- **Indicator page:** two panels. Left: the headline value for the selected place and year, the state value when Level is not State, and a 200px five-year bar chart with the selected year labeled. Right: horizontal bars for every district plus South Dakota (in `control-border` gray), sorted high to low. When a district is selected it is bold and the other districts fade to 45%.
- **District comparison:** a heat table (districts × indicators, state row at the bottom), shaded per indicator with the sample heat ramp. It scrolls sideways under 560px.
- Bars use the stage color. Years other than the selected one are at 45% opacity. A series break (`breakAt`) is a 2px dashed muted line before that year, with a caption.
- Suppressed values (fewer than 10 students) use the hatch fill, show "Suppressed" or "*", and have a caption explaining the asterisk. The `[Alternative school]` is always suppressed, and some district × indicator cells are too.
- Each bar chart has `role="img"` and an `aria-label` that lists every year's value. Bars and cells have `title` tooltips.

**Icons:** simple 24px-grid stroke icons (1.8 stroke width): info, book, chat (FAQ), download, chart, table, close, expand, arrow. In production, swap them for Fluent UI System Icons. Do not use emoji.

---

## 5. Page specs

### Home (`/`, `Main.dc.html`)

1. **Hero** (white, 72px vertical padding)
   - Eyebrow "SOUTH DAKOTA STATEWIDE LONGITUDINAL DATA SYSTEM", then the display H1 "How are South Dakota students doing after high school?", then a lead paragraph.
   - Buttons: "Explore the data" (primary) and "New here? Start with the glossary" (secondary).
   - On the right, a **"Find your district or school"** card with a search input and a "Go" button.
2. **Start with a question** (gray well band): three stage cards (Readiness, Transition, Postsecondary). Each card has:
   - a colored eyebrow, the h3 full stage name and a one-line blurb
   - two question links (gray `#f5f5f5` rows with an arrow)
   - a footer showing the indicator count and "See all"
3. **One connected record, from high school to college** (white): four steps.
   - Step 1 K-12 schools, Step 2 Leaving high school and Step 3 College are white cards with colored eyebrow text.
   - "Coming later: Workforce" uses the hatched fill.
4. **Help and context** (gray well): four tiles (Glossary, Data dictionary, How to read the charts, Download data) with icons, plus a line pointing to the state Report Card.

### Explore the data (`/explore`, `Explore.dc.html`)

1. **Top band** (white)
   - Breadcrumb, then the **stage tabs**: a colored dot and the short stage name only (16, 600; 700 when selected), 48px tall with 16px side padding, over a 2px hairline baseline. Unselected tabs are muted with no border. On hover they get a `#f5f5f5` background and a 2px hairline border on the top and sides (4px top radius) that closes on the baseline. The selected tab has no border. The selected tab is filled with its stage tint, has a 4px underline in the stage color, ink text, and a 12px dot. No label above the tabs and no full-name caption (the H1 below gives the full name); the owner prefers less text.
   - *Superseded:* tabs with a full-name caption and a 3px signal-red underline were judged too hard to see.
   - Below the tabs: the eyebrow "STAGE n OF 3 · …", the H1 with the full stage name, and the **tool buttons** "What am I seeing?", "Data dictionary", "FAQ" and "Download data".
   - Each tool button toggles an inline panel (1px control-border box with a "Close" button). Only one panel is open at a time.
   - Then two intro columns: **"Why is this important?"** and **"Which students am I seeing?"** Each has a 4px left border in the stage color with 16px left padding, an h3 heading in the stage text color (`transition-ink` for Transition), and body text in `muted`.
2. **Filters** (gray well band)
   - h3 "Choose what to see" with a helper sentence, and a "Reset filters" text button on the right.
   - A dropdown grid (`repeat(auto-fit, minmax(190px, 1fr))`), each dropdown 44px tall:
     - **Level:** State, District or School.
     - **District:** disabled when Level is State.
     - **School:** disabled unless Level is School.
     - **School year:** 2025–26 down to 2021–22.
     - **Student group:** enabled only when Level is State. It resets to "All students" when Level changes away from State, because of the suppression rule.
3. **Report** (white): h2 "{Stage} report" with the current filters (`Place · Year · Group`) on the right. Below it:
   - the **single Power BI embed**
   - the source caption
   - a "Key finding" box (`#f7f7f7`)
4. **About these indicators** (gray well): a 2-column grid of white cards, one per indicator. Each card has:
   - the indicator name as a colored eyebrow, and the question as h3
   - "What is this?" and "How to read it" text, plus an optional note box
   - two actions, vertically centered on one row: **"Show in report"** (a text button that switches the report page; in React it also scrolls to the report) and **"Download CSV"**
   - "Coming later" indicators show a hatched note instead.
5. **Questions strip** (white): "Questions about this data?" with `[SLDS EMAIL]`, and a "Send feedback" button.

### Glossary and help (`/learn`, `Learn.dc.html`)

- Breadcrumb, H1 and intro. Below them, two columns: a **side nav** card on the left and the content on the right. The side nav stacks above the content on phones.
- The side nav lists Glossary, Data dictionary, How to read the charts, Download data, About the data and Questions and answers. The active item has a 3px signal-red left mark and a `#f5f5f5` background.
- **Glossary:** a search input that filters live, a term count, and a white `<dl>` card of terms.
- **Data dictionary:** a scrollable table (Indicator, Stage chip, Definition, Students counted, Source).
- **How to read the charts:** a numbered anatomy demo (question, headline value, context line, trend, source) with a matching list.
- **Download data:** four cards (Readiness CSV, Transition CSV, Postsecondary CSV, Data dictionary PDF).
- **About the data:** four cards (sources, years covered, privacy, known limits).
- **FAQ:** `<details>` accordions.
- A "Still have a question?" strip with `[SLDS EMAIL]` closes the page.
- *Not yet updated to match Home and Explore:* this page has no full-width bands, and its download cards still have 4px colored top borders. Ask the owner before restyling it.

---

## 6. Content

### Stages and indicators

| Stage | Indicators (in order) |
|---|---|
| **Readiness**: High school progress and college readiness | Consistent attendance; GPA; Reading and math proficiency (series break note: Smarter Balanced → ACT); Early college coursework (dual credit) |
| **Transition**: High school completion and transition | ACT participation and performance (series break note); College applications; FAFSA completion (data source note: Board of Regents, agreement pending); High school graduation (optional, also in the Report Card) |
| **Postsecondary**: Postsecondary enrollment and early progress | College enrollment (*added by design to cover enrollment; confirm with client*); First-year credits (24+ credits, gateway courses); Persistence; Degree completion (**coming later**) |

Filter options:
- **Districts** (sample): Aberdeen 06-1, Brookings 05-1, Pierre 32-2, Rapid City Area 51-4, Sioux Falls 49-5.
- **Schools:** placeholders [High school A], [High school B], [Alternative school].
- **Student groups:** All students; Female; Male; American Indian or Alaska Native; Asian; Black or African American; Hispanic or Latino; Two or more races; White; Economically disadvantaged; Not economically disadvantaged.

Each indicator with a report page also has a five-year sample `trend` (oldest year first) and, where the source changed, `breakAt` (Reading and math proficiency at 2024–25, ACT at 2023–24). District, school and group values are derived from these with a fixed offset per name, so the same filters always show the same numbers.

Full text for every stage and indicator lives in `src/data/stages.js` and `src/data/help.js` (React), and in each artboard's `renderVals()` (canvas).

### Voice and writing rules

- **Start with a question.** Headings are plain-language questions or short noun phrases.
- **Write as a helpful analyst.** Use second person for guidance and third person for findings. No exclamation marks and no emoji.
- **Describe, don't judge.** Never call a district "failing", which matters most for proficiency and graduation.
- **Use sentence case** everywhere. Only eyebrows are uppercase.
- Give every number its unit, school year (`2025–26`, with an en dash), level and cohort.
- Spell out acronyms on first use per page, and say "district" rather than "LEA" in the UI.
- Mark all figures as **sample data**, and key findings with "(Sample data.)".
- Mark unknown facts in **[BRACKETS]**. Never invent them.

---

## 7. Accessibility and responsive behavior

- Use real `<button>`, `<a href>`, `<select>` with `<label>`, and `<input>` elements. Tabs use `role="tab"` and `aria-selected`. Toggles use `aria-expanded`. Icon-only SVGs are `aria-hidden`, and the embed has `role="img"` with an `aria-label`.
- Text contrast must be at least 4.5:1. Use `transition-ink` (not `transition`) for gold text.
- Touch targets must be at least 44px.
- At 390px wide there is no horizontal scroll (verified). Grids collapse with `auto-fit` and `minmax(min(100%, Npx), 1fr)`, the header and toolbars wrap, and wide tables scroll inside their container.

---

## 8. Implementation notes

### Canvas (`.dc.html` files)

- Each artboard is a PAGE: `"expand":"fill"` and `"is_interactive":true` in `canvas.json`, with a fluid root.
- Style lives inline. `<helmet><style>` is used only for basics, hover and focus rules, and classes such as `.nav`, `.sel`, `.hatch`, `.tool` and `.stage`.
- Logic lives in `renderVals()`. State on Explore is `tab, level, district, school, year, group, panel, reportPage, view`. Holes (`{{path}}`) are lookups only, never expressions.
- Changes are published to the canvas `url` with `root` set to the local folder. Only the changed files are sent. `canvas.json` is sent only when artboards change.

### React

- Routes: `/`, `/explore`, `/learn`, using HashRouter so the site works on any static host.
- Deep links: `#/explore?stage=transition`, `#/explore?level=District&district=…`, `#/learn?section=dictionary`. The Home finder matches a district name and opens Explore with that district selected.
- All tokens are CSS variables in `src/styles.css`. Band classes are `.band` and `.band--well`.
- `PowerBIEmbed.jsx` renders an iframe when the stage has `embedUrl`, otherwise its children (`SampleReport.jsx`). It documents how to swap in `powerbi-client-react`.
- `SampleReport.jsx` exports `sampleValue(indicator, yearIdx, filters)`, which returns a percent or `null` (suppressed). Replace `trend` values in `stages.js` to change the sample charts; don't hard-code numbers in the component.
- Deployment: GitHub Actions (`.github/workflows/deploy.yml`, Node 22, `npm ci && npm run build`) publishes `dist/` to GitHub Pages.

### Static export

- Built by a script that parses each `.dc.html` into JSON and renders it with a small vanilla runtime (supports holes, `sc-for`, `sc-if` and events).
- The logo is embedded in each page as a data URI.
- Regenerate the export after canvas changes; don't edit it by hand.

---

## 9. Open items and placeholders

- **Brand:** confirm the PMS hex values and the extended palette with DOE Communications; get the official logo file (SVG) and any joint DOE and Board of Regents lockup.
- **Power BI hosting:** "Publish to web" or Power BI Embedded (cost vs. security). The client wants a secure endpoint. Build the Power BI theme JSON from the tokens above. `embedUrl` support covers only the "Publish to web" case.
- **Sample charts:** confirm with the owner whether the canvas artboard should get the same sample charts as React, and whether the sample heat table should use the teal data ramp instead of per-stage shades.
- **Data:** FAFSA data-sharing agreement; postsecondary start year (2019–20 or 2020–21); attendance threshold; the year the test changed; subgroup suppression rules (currently state only, fewer than 10 students).
- **Placeholders to replace:** `[SLDS EMAIL]`, `[YEAR]`, `[SCORE]`, `[SIZE]`, `[YEARS]`, the school names, and the Report Card URL (currently doe.sd.gov).
- **Scope to confirm:** the College enrollment indicator, which was added by design; the relationship to the accountability Report Card; whether the Glossary and help page should get the band treatment.

## 10. Change log (summary)

1. **First build:** three linked screens using the design system (sand background, colored top bars).
2. **Background:** changed to white, card shadows removed. Tinted section bands were tried and removed.
3. **Nebraska-style redesign:** tool buttons, intro blocks, question-led sections. Colored top borders replaced by eyebrow labels.
4. **Clean-up:** EQ references removed; "Illustrative" labels added.
5. **Section styling:** wells were tried, then replaced by full-width alternating bands. The sidebar was replaced by tabs.
6. **Branding:** DOE logo added to the footer and header; Download button removed from the nav; banner removed.
7. **Filters:** a sentence-style layout was tried and reverted. All filters are now dropdowns.
8. **Reports:** first replaced by Power BI placeholders, then merged into one full-width report per stage. "On this page" removed; indicator actions aligned.
9. **Exports:** static HTML export, then the React + Vite project.
10. **Repository and hosting (2026-10-19):** React project moved into its own git repo, with a GitHub Pages deployment workflow.
11. **Sample charts (2026-10-19):** the Power BI skeleton in React was replaced by sample report pages (overview tiles, indicator trend and district bars, district heat table) drawn from per-indicator `trend` data, with series breaks and suppression shown. Stages can now take a "Publish to web" `embedUrl`.
12. **Stage tabs (2026-10-20):** made more visible with a stage-tint fill, 4px stage-color underline, hover background and a larger dot. The full-name caption was dropped.
13. **Intro blocks (2026-10-20):** "Why is this important?" and "Which students am I seeing?" got a 4px stage-color left border, stage-colored headings and muted body text.
