import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import PowerBIEmbed from '../components/PowerBIEmbed.jsx';
import SampleReport, { picksOf } from '../components/SampleReport.jsx';
import Select from '../components/Select.jsx';
import { useFeedback } from '../components/Feedback.jsx';
import { downloadData } from '../downloads.js';
import { STAGES, STAGE_ORDER, YEARS, LEVELS, DISTRICTS, SCHOOLS, SCHOOL_PLACES, INSTITUTION_LEVEL, INSTITUTIONS, GROUPS, EW_FRAMEWORK_URL } from '../data/stages.js';

const TOOLS = [
  { key: 'seeing', label: 'What am I seeing?', icon: 'info' },
  { key: 'dict', label: 'Data dictionary', icon: 'book' },
  { key: 'faq', label: 'FAQ', icon: 'chat' },
  { key: 'download', label: 'Download data', icon: 'download' },
];

// Districts, schools, institutions and student groups are lists in pick order, never empty. Schools are
// "School, District" values from SCHOOL_PLACES, always in one of the picked districts.
const firstSchool = (district) => `${SCHOOLS[0]}, ${district}`;
const DEFAULT_FILTERS = {
  level: 'State', districts: [DISTRICTS[1]], schools: [firstSchool(DISTRICTS[1])], institutions: [INSTITUTIONS[0]], year: YEARS[0], groups: ['All students'],
};
const NOUNS = { District: ['district', 'districts'], School: ['school', 'schools'], Institution: ['institution', 'institutions'] };
// Keeps the valid values of a repeated URL parameter (`?district=A&district=B`), or the fallback when none are.
const listParam = (params, name, valid, fallback) => {
  const list = [...new Set(params.getAll(name).filter((v) => valid.includes(v)))];
  return list.length ? list : fallback;
};
const INST = INSTITUTION_LEVEL.value;
// The institution level is offered only on a stage with at least one indicator reported by institution.
const levelsFor = (stage) => (stage.indicators.some((i) => i.byInstitution) ? [...LEVELS, INST] : LEVELS);

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const openFeedback = useFeedback();
  const stageKey = STAGE_ORDER.includes(params.get('stage')) ? params.get('stage') : 'readiness';
  const stage = STAGES[stageKey];

  const [panel, setPanel] = useState(null);
  // `?indicator=` opens that indicator's report page; anything else opens the Overview (page 0).
  const [reportPage, setReportPage] = useState(() => stage.indicators.filter((i) => !i.later).findIndex((i) => i.id === params.get('indicator')) + 1);
  const [filters, setFilters] = useState(() => {
    const districts = listParam(params, 'district', DISTRICTS, DEFAULT_FILTERS.districts);
    return {
      ...DEFAULT_FILTERS,
      level: levelsFor(stage).includes(params.get('level')) ? params.get('level') : DEFAULT_FILTERS.level,
      districts,
      schools: [firstSchool(districts[0])],
      institutions: listParam(params, 'institution', INSTITUTIONS, DEFAULT_FILTERS.institutions),
    };
  });
  const levels = levelsFor(stage);
  const byInstitution = filters.level === INST;

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
  // The framework metadata below the report follows the open tab; other tabs have no single indicator.
  const openIndicator = pages[activePage].indicator;

  // Names one pick, or counts several ("3 districts").
  const picks = picksOf(filters);
  const name = (list, noun) => (list.length === 1 ? list[0].label : `${list.length} ${noun}`);
  const state = filters.level === 'State';
  // "All students" checked beside other groups is only the gray comparison line, so it isn't counted.
  const place = state ? 'South Dakota' : name(picks, NOUNS[filters.level][1]);
  const group = state && picks.length ? name(picks, 'student groups') : 'All students';
  const viewing = `${place} · ${filters.year} · ${group}`;

  function selectStage(key) {
    const next = new URLSearchParams(params);
    next.set('stage', key);
    setParams(next, { replace: true });
    setPanel(null);
    setReportPage(0);
    if (!levelsFor(STAGES[key]).includes(filters.level)) setFilters((f) => ({ ...f, level: 'State' }));
  }

  function update(field) {
    return (value) => {
      setFilters((f) => {
        const next = { ...f, [field]: value };
        // Student group results are shown for the state only (suppression rules).
        if (field === 'level' && value !== 'State') next.groups = ['All students'];
        // Schools stay within the picked districts; if none are left, the first school of the first district.
        const schools = next.schools.filter((v) => next.districts.includes(SCHOOL_PLACES.find((p) => p.value === v).district));
        next.schools = schools.length ? schools : [firstSchool(next.districts[0])];
        return next;
      });
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
                  <li>The report is an interactive Power BI report. Use the tabs along its top to move between indicators, and hover to see exact values.</li>
                  <li>The filters above apply to every page of the report.</li>
                  <li>When you pick a district, school or institution, the reports show the state value for comparison. Pick several to compare them side by side.</li>
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
                  <p className="body-sm">Files include all years, levels and student groups that can be shown publicly. Suppressed values are left blank.</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => downloadData(stageKey)}>{stage.short} data (CSV)</button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => downloadData('all')}>All stages (CSV)</button>
                    <button type="button" className="btn btn--secondary btn--sm" onClick={() => downloadData('dictionary')}>Data dictionary (CSV)</button>
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
                Pick a level, then one or more places to compare, and a school year. Student group results are shown for
                the state only, so small groups can’t be identified.
              </p>
            </div>
            <button type="button" className="link-btn" onClick={() => setFilters(DEFAULT_FILTERS)}>Reset filters</button>
          </div>
          <div role="search" aria-labelledby="flt-h" className="filters__grid">
            <Field id="f-lvl" label="Level" value={filters.level} onChange={update('level')} options={levels.map((l) => (l === INST ? INSTITUTION_LEVEL : l))} />
            <Field id="f-dist" label="District" value={filters.districts} onChange={update('districts')} options={DISTRICTS} noun="districts" disabled={filters.level === 'State' || byInstitution} />
            {/* The School slot lists institutions while the institution level is picked. Schools are listed for
                the picked districts. */}
            {byInstitution
              ? <Field id="f-sch" label="Institution" value={filters.institutions} onChange={update('institutions')} options={INSTITUTIONS} noun="institutions" />
              : <Field id="f-sch" label="School" value={filters.schools} onChange={update('schools')} options={SCHOOL_PLACES.filter((p) => filters.districts.includes(p.district)).map((p) => p.value)} noun="schools" disabled={filters.level !== 'School'} />}
            <Field id="f-yr" label="School year" value={filters.year} onChange={update('year')} options={YEARS} />
            <Field id="f-grp" label="Student group" value={filters.groups} onChange={update('groups')} options={GROUPS} noun="student groups" disabled={filters.level !== 'State'} />
          </div>
        </div>
      </section>

      <section className="band" style={{ paddingTop: 56, paddingBottom: 56 }} aria-labelledby="report-h">
        <div className="container stack gap-16" style={{ '--stage': stage.color, '--stage-tint': stage.tint }}>
          <div className="report-head">
            <h2 id="report-h" className="h2" style={{ scrollMarginTop: 16 }}>{stage.short} report</h2>
            <span className="body-sm muted">{viewing}</span>
          </div>
          <PowerBIEmbed title={stage.short} pages={pages} activePage={activePage} onPageChange={setReportPage} embedUrl={stage.embedUrl}>
            <SampleReport stage={stage} page={pages[activePage]} indicators={ready} filters={filters} subtitle={viewing} />
          </PowerBIEmbed>
          <p className="caption">Source: South Dakota Department of Education and partners, {filters.year}. Sample data. Values are suppressed where fewer than 10 students are counted.</p>
          {openIndicator?.metric && (
            <div className="key-finding">
              <span className="body-sm strong">About this indicator: {openIndicator.name}</span>
              <span className="caption">Recommended metric from the Education-to-Workforce Indicator Framework</span>
              <p>{openIndicator.metric}</p>
              <a href={`${EW_FRAMEWORK_URL}/${openIndicator.framework}`} target="_blank" rel="noreferrer" className="body-sm strong">
                Learn about this indicator (EW framework)
              </a>
            </div>
          )}
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
          <span className="body-sm muted">The dashboard team can help you find or interpret results. [CONTACT EMAIL]</span>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" style={{ minHeight: 44, padding: '0 16px' }} onClick={openFeedback}>Send feedback</button>
      </section>
    </>
  );
}

// A filter drop-down; an array `value` makes it a multi-select, counted with `noun`.
function Field({ id, label, value, onChange, options, noun, disabled = false }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <Select id={id} value={value} onChange={onChange} options={options} multiple={Array.isArray(value)} noun={noun} disabled={disabled} />
    </div>
  );
}
