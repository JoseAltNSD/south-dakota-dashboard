import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import PowerBIEmbed from '../components/PowerBIEmbed.jsx';
import SampleReport from '../components/SampleReport.jsx';
import Select from '../components/Select.jsx';
import { STAGES, STAGE_ORDER, YEARS, LEVELS, DISTRICTS, SCHOOLS, GROUPS, EW_FRAMEWORK_URL } from '../data/stages.js';

const TOOLS = [
  { key: 'seeing', label: 'What am I seeing?', icon: 'info' },
  { key: 'dict', label: 'Data dictionary', icon: 'book' },
  { key: 'faq', label: 'FAQ', icon: 'chat' },
  { key: 'download', label: 'Download data', icon: 'download' },
];

const DEFAULT_FILTERS = { level: 'State', district: DISTRICTS[1], school: SCHOOLS[0], year: YEARS[0], group: 'All students' };

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const stageKey = STAGE_ORDER.includes(params.get('stage')) ? params.get('stage') : 'readiness';
  const stage = STAGES[stageKey];

  const [panel, setPanel] = useState(null);
  // `?indicator=` opens that indicator's report page; anything else opens the Overview (page 0).
  const [reportPage, setReportPage] = useState(() => stage.indicators.filter((i) => !i.later).findIndex((i) => i.id === params.get('indicator')) + 1);
  const [filters, setFilters] = useState(() => ({
    ...DEFAULT_FILTERS,
    level: LEVELS.includes(params.get('level')) ? params.get('level') : DEFAULT_FILTERS.level,
    district: DISTRICTS.includes(params.get('district')) ? params.get('district') : DEFAULT_FILTERS.district,
  }));

  const ready = stage.indicators.filter((i) => !i.later);

  // Arriving with `?indicator=` (from Home) scrolls to the report. Waits a frame because App scrolls to the top
  // on every route change, and its effect runs after this one.
  useEffect(() => {
    if (reportPage === 0) return undefined;
    const frame = requestAnimationFrame(() => document.getElementById('report-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    return () => cancelAnimationFrame(frame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = useMemo(
    () => [
      { kind: 'overview', label: 'Overview' },
      ...ready.map((i) => ({ kind: 'indicator', label: i.name, indicator: i })),
      { kind: 'places', label: 'Districts and schools' },
      { kind: 'groups', label: 'Student groups' },
    ],
    [stageKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const activePage = Math.min(reportPage, pages.length - 1);

  const place =
    filters.level === 'State' ? 'South Dakota'
      : filters.level === 'District' ? filters.district
      : `${filters.school}, ${filters.district}`;
  const viewing = `${place} · ${filters.year} · ${filters.group}`;

  function selectStage(key) {
    const next = new URLSearchParams(params);
    next.set('stage', key);
    setParams(next, { replace: true });
    setPanel(null);
    setReportPage(0);
  }

  function update(field) {
    return (value) => {
      setFilters((f) => ({
        ...f,
        [field]: value,
        // Student group results are shown for the state only (suppression rules).
        ...(field === 'level' && value !== 'State' ? { group: 'All students' } : {}),
      }));
    };
  }

  function showInReport(id) {
    setReportPage(ready.findIndex((i) => i.id === id) + 1);
    document.getElementById('report-h')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const panelTitle = panel ? `${TOOLS.find((t) => t.key === panel).label} · ${stage.short}` : '';

  return (
    <>
      <section className="band" style={{ paddingTop: 32, paddingBottom: 56 }} aria-labelledby="page-h">
        <div className="container stack gap-24">
          <nav aria-label="Breadcrumb" className="crumbs">
            <Link to="/">Home</Link> / Explore the data / {stage.short}
          </nav>

          <div role="tablist" aria-label="Stages" className="stage-tabs">
            {STAGE_ORDER.map((key) => {
              const s = STAGES[key];
              return (
                <button key={key} type="button" role="tab" className="stage-tab" aria-selected={key === stageKey} onClick={() => selectStage(key)} style={{ '--stage': s.color, '--stage-tint': s.tint }}>
                  <span className="stage-tab__dot" aria-hidden="true" />
                  <span className="stage-tab__title">{s.short}</span>
                </button>
              );
            })}
          </div>

          <div className="stack gap-12">
            <span className="eyebrow" style={{ color: stage.ink }}>{stage.eyebrow}</span>
            <h1 id="page-h" className="h1">{stage.full}</h1>
            <div role="toolbar" aria-label="Page tools" className="toolbar">
              {TOOLS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className="btn btn--secondary btn--sm"
                  style={{ minHeight: 44, padding: '0 14px' }}
                  aria-expanded={panel === t.key}
                  onClick={() => setPanel(panel === t.key ? null : t.key)}
                >
                  <Icon name={t.icon} />
                  <span className="btn__label">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {panel && (
            <div role="region" aria-label={panelTitle} className="tool-panel">
              <div className="tool-panel__head">
                <h2 className="h3">{panelTitle}</h2>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => setPanel(null)}>
                  <Icon name="close" size={14} strokeWidth={2.2} /> Close
                </button>
              </div>
              {panel === 'seeing' && (
                <ul>
                  <li>Each page of the report answers one question with one indicator.</li>
                  <li>The report is an interactive Power BI report. Use the page buttons along its bottom bar to move between indicators, hover to see exact values, or open it full screen.</li>
                  <li>The filters above apply to every page of the report.</li>
                  <li>When you pick a district or school, the reports show the state value for comparison.</li>
                  <li>A dashed line marks a change in how the data were collected. Striped cells are suppressed to protect privacy.</li>
                </ul>
              )}
              {panel === 'dict' && (
                <>
                  <dl>
                    {stage.indicators.map((i) => (
                      <div key={i.id}><dt>{i.name}</dt><dd>{i.later ? 'Coming later.' : i.definition}</dd></div>
                    ))}
                  </dl>
                  <Link to="/learn?section=dictionary" className="body-sm strong">Open the full data dictionary</Link>
                </>
              )}
              {panel === 'faq' && (
                <div className="stack gap-12 body-sm">
                  {stage.faq.map((f) => (
                    <div key={f.q}><p className="strong">{f.q}</p><p>{f.a}</p></div>
                  ))}
                </div>
              )}
              {panel === 'download' && (
                <>
                  <p className="body-sm">Files include all years, levels and student groups that can be shown publicly.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button type="button" className="btn btn--secondary btn--sm">{stage.short} data (CSV)</button>
                    <button type="button" className="btn btn--secondary btn--sm">All stages (CSV)</button>
                    <button type="button" className="btn btn--secondary btn--sm">Data dictionary (PDF)</button>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="grid grid--intro" style={{ '--stage': stage.color, '--stage-ink': stage.ink }}>
            <div className="stack gap-8 intro-block">
              <h2 className="h3">Why is this important?</h2>
              <p>{stage.why}</p>
            </div>
            <div className="stack gap-8 intro-block">
              <h2 className="h3">Which students am I seeing?</h2>
              <p>{stage.who}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--well band--tight" aria-labelledby="flt-h">
        <div className="container stack gap-16">
          <div className="filters__head">
            <div className="stack gap-4">
              <h2 id="flt-h" className="h3">Choose what to see</h2>
              <p className="body-sm muted">
                Pick a level and place, then a school year. Student group results are shown for the state only, so
                small groups can’t be identified.
              </p>
            </div>
            <button type="button" className="link-btn" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
          </div>
          <div role="search" aria-labelledby="flt-h" className="filters__grid">
            <Field id="f-lvl" label="Level" value={filters.level} onChange={update('level')} options={LEVELS} />
            <Field id="f-dist" label="District" value={filters.district} onChange={update('district')} options={DISTRICTS} disabled={filters.level === 'State'} />
            <Field id="f-sch" label="School" value={filters.school} onChange={update('school')} options={SCHOOLS} disabled={filters.level !== 'School'} />
            <Field id="f-yr" label="School year" value={filters.year} onChange={update('year')} options={YEARS} />
            <Field id="f-grp" label="Student group" value={filters.group} onChange={update('group')} options={GROUPS} disabled={filters.level !== 'State'} />
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 56, paddingBottom: 56 }} aria-labelledby="report-h">
        <div className="container stack gap-16">
          <div className="report-head">
            <h2 id="report-h" className="h2" style={{ scrollMarginTop: 16 }}>{stage.short} report</h2>
            <span className="body-sm muted">{viewing}</span>
          </div>
          <PowerBIEmbed title={stage.short} pages={pages} activePage={activePage} onPageChange={setReportPage} embedUrl={stage.embedUrl}>
            <SampleReport stage={stage} page={pages[activePage]} indicators={ready} filters={filters} subtitle={viewing} />
          </PowerBIEmbed>
          <p className="caption">Source: South Dakota SLDS, {filters.year}. Sample data. Values are suppressed where fewer than 10 students are counted.</p>
          <div className="key-finding">
            <span className="body-sm strong">Key finding</span>
            <p>{stage.finding}</p>
          </div>
        </div>
      </section>

      <section className="band band--well" style={{ paddingTop: 56, paddingBottom: 56 }} aria-labelledby="guide-h">
        <div className="container stack gap-24">
          <div className="stack gap-4">
            <h2 id="guide-h" className="h2">About these indicators</h2>
            <p className="body-sm muted">What each measure shows and how to read it.</p>
          </div>
          <div className="grid grid--2">
            {stage.indicators.map((ind) => (
              <article key={ind.id} id={`ind-${ind.id}`} className="card indicator-card">
                <div className="stack gap-4">
                  <span className="eyebrow" style={{ color: stage.ink }}>{ind.name}</span>
                  <h3 className="h3">{ind.question}</h3>
                </div>
                {ind.later ? (
                  <p className="hatch body-sm" style={{ borderRadius: 4, padding: '12px 14px' }}>
                    <strong>Coming later.</strong> {ind.definition}
                  </p>
                ) : (
                  <>
                    <div className="stack gap-4">
                      <span className="body-sm strong">What is this?</span>
                      <p className="body-sm">{ind.definition}</p>
                    </div>
                    <div className="stack gap-4">
                      <span className="body-sm strong">How to read it</span>
                      <p className="body-sm">{ind.howto}</p>
                    </div>
                    {ind.note && <p className="note"><strong>{ind.noteLabel}</strong> {ind.note}</p>}
                    <div className="indicator-card__actions">
                      <button type="button" className="link-btn" onClick={() => showInReport(ind.id)}>Show in report</button>
                      <a href={`${EW_FRAMEWORK_URL}/${ind.framework}`} target="_blank" rel="noreferrer">Learn about this indicator (EW framework)</a>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Questions" className="container questions-strip">
        <div className="stack gap-4">
          <span className="strong">Questions about this data?</span>
          <span className="body-sm muted">The SLDS team can help you find or interpret results. [SLDS EMAIL]</span>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" style={{ minHeight: 44, padding: '0 16px' }}>Send feedback</button>
      </section>
    </>
  );
}

function Field({ id, label, value, onChange, options, disabled = false }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Select id={id} value={value} onChange={onChange} options={options} disabled={disabled} />
    </div>
  );
}
