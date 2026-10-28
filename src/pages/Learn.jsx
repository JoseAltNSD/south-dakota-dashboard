import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { SECTIONS, TERMS, DICTIONARY, DOWNLOADS, ABOUT, FAQ, READ_STEPS, READ_SYMBOLS, READ_PAGES } from '../data/help.js';
import { LEAD, PARTNERS } from '../data/agencies.js';
import { downloadData } from '../downloads.js';

export default function Learn() {
  const [params, setParams] = useSearchParams();
  const section = SECTIONS.some((s) => s.key === params.get('section')) ? params.get('section') : 'glossary';
  const [query, setQuery] = useState('');

  function select(key) {
    setParams({ section: key }, { replace: true });
  }

  const q = query.trim().toLowerCase();
  const terms = TERMS.filter((t) => !q || t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q));

  return (
    <>
      <div className="container stack gap-8" style={{ paddingTop: 32, paddingBottom: 8 }}>
        <nav aria-label="Breadcrumb" className="crumbs"><Link to="/">Home</Link> / Glossary and help</nav>
        <h1 className="h1">Glossary and help</h1>
        <p style={{ maxWidth: 720 }}>
          Everything you need to read the results with confidence: what the terms mean, how each number is
          calculated, and where the data come from.
        </p>
      </div>

      <div className="container learn-layout">
        <nav aria-label="Help topics" className="card side-nav">
          {SECTIONS.map((s) => (
            <button key={s.key} type="button" aria-current={s.key === section ? 'page' : undefined} onClick={() => select(s.key)}>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="learn-content">
          {section === 'glossary' && (
            <section aria-labelledby="g-h" className="stack gap-16">
              <div className="report-head">
                <h2 id="g-h" className="h2">Glossary</h2>
                <span className="body-sm muted">{terms.length} {terms.length === 1 ? 'term' : 'terms'}</span>
              </div>
              <div className="field">
                <label htmlFor="g-q">Search terms</label>
                <input id="g-q" className="input" type="search" placeholder="Try cohort, FAFSA or suppression" value={query} onChange={(e) => setQuery(e.target.value)} style={{ fontSize: 16 }} />
              </div>
              {terms.length > 0 ? (
                <dl className="card glossary" style={{ padding: 0 }}>
                  {terms.map((t) => (
                    <div key={t.term}><dt>{t.term}</dt><dd>{t.def}</dd></div>
                  ))}
                </dl>
              ) : (
                <p className="empty">No terms match. Try a shorter word, or contact the dashboard team.</p>
              )}
            </section>
          )}

          {section === 'dictionary' && (
            <section aria-labelledby="d-h" className="stack gap-16">
              <h2 id="d-h" className="h2">Data dictionary</h2>
              <p>How each indicator is calculated and which students are counted.</p>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Indicator</th><th scope="col">Stage</th><th scope="col">Definition</th>
                      <th scope="col">Students counted</th><th scope="col">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DICTIONARY.map((r) => (
                      <tr key={r.name}>
                        <th scope="row" className="strong">{r.name}</th>
                        <td><span className="stage-chip" style={{ color: r.ink, background: r.tint }}>{r.stage}</span></td>
                        <td>{r.def}</td>
                        <td>{r.pop}</td>
                        <td className="muted">{r.src}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="caption">Results are available for the state, each district and each high school. Student group results are shown for the state only.</p>
            </section>
          )}

          {section === 'read' && (
            <section aria-labelledby="r-h" className="stack gap-24">
              <div className="stack gap-16">
                <h2 id="r-h" className="h2">How to read the charts</h2>
                <p>Each indicator has its own page in the report, and every indicator page is laid out the same way.</p>
                <div className="anatomy">
                  <AnatomyDemo />
                  <ol>
                    {READ_STEPS.map(([title, text]) => <li key={title}><strong>{title}.</strong> {text}</li>)}
                  </ol>
                </div>
              </div>
              <div className="stack gap-12">
                <h3 className="h3">What the symbols mean</h3>
                <dl className="symbols">
                  {READ_SYMBOLS.map((sym) => (
                    <div key={sym.key}>
                      <dt><SymbolSwatch kind={sym.key} /><span className="strong">{sym.label}</span></dt>
                      <dd>{sym.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="stack gap-12">
                <h3 className="h3">The other report pages</h3>
                <dl className="symbols symbols--pages">
                  {READ_PAGES.map(([title, text]) => (
                    <div key={title}><dt className="strong">{title}</dt><dd>{text}</dd></div>
                  ))}
                </dl>
              </div>
            </section>
          )}

          {section === 'download' && (
            <section aria-labelledby="dl-h" className="stack gap-16">
              <h2 id="dl-h" className="h2">Download data</h2>
              <p>Get the numbers behind every chart. Files include all years, levels and student groups that can be shown publicly.</p>
              <div className="grid grid--4">
                {DOWNLOADS.map((f) => (
                  <div key={f.title} className="card stack gap-8" style={{ padding: 16, borderTop: `4px solid ${f.color}` }}>
                    <span className="strong">{f.title}</span>
                    <span className="body-sm muted">{f.text}</span>
                    <span className="caption">{f.meta}</span>
                    <button type="button" className="btn btn--primary btn--sm" style={{ alignSelf: 'flex-start', marginTop: 4 }} onClick={() => downloadData(f.file)}>
                      <Icon name="download" size={16} strokeWidth={2} /> {f.btn}
                    </button>
                  </div>
                ))}
              </div>
              <p className="caption">Suppressed values are left blank and marked “Yes” in the Suppressed column.</p>
            </section>
          )}

          {section === 'about' && (
            <section aria-labelledby="a-h" className="stack gap-16">
              <h2 id="a-h" className="h2">About the data</h2>
              <p>
                The dashboard is led by the {LEAD.name} in partnership with the {PARTNERS.map((p) => p.name).join(' and the ')}.
              </p>
              <div className="grid grid--4">
                {ABOUT.map((a) => (
                  <div key={a.title} className="card stack gap-8" style={{ padding: '16px 20px' }}>
                    <h3 className="h3">{a.title}</h3>
                    <p className="body-sm">{a.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {section === 'faq' && (
            <section aria-labelledby="f-h" className="stack gap-16">
              <h2 id="f-h" className="h2">Frequently asked questions</h2>
              <div className="card faq" style={{ padding: 0 }}>
                {FAQ.map((x) => (
                  <details key={x.q}>
                    <summary>{x.q}</summary>
                    <p>{x.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <aside className="card contact-strip">
            <span className="body-sm"><strong>Still have a question?</strong> The dashboard team can help you find or interpret data.</span>
            <span className="body-sm strong">Contact us at [CONTACT EMAIL]</span>
          </aside>
        </div>
      </div>
    </>
  );
}

// A simplified indicator page for the chart guide, numbered to match READ_STEPS. Decorative: the list carries the
// meaning. Values follow the sample attendance trend for a district against South Dakota.
const DEMO_PLACE = [82, 73, 77, 79, 81];
const DEMO_STATE = [78, 69, 72, 74, 76];

function AnatomyDemo() {
  const x = (i) => 16 + i * 52;
  const y = (v) => 66 - ((v - 60) / 30) * 58;
  const line = (values) => values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
  const bars = [['Brookings 05-1', 81, true], ['Sioux Falls 49-5', 77, false], ['Pierre 32-2', 72, false]];

  return (
    <div className="card anatomy__demo" aria-hidden="true">
      <div className="anatomy__row"><span className="num">1</span><span className="h3">Are students attending school consistently?</span></div>
      <div className="anatomy__row">
        <span className="num">2</span>
        <span className="stack">
          <span className="rpt__label">Consistent attendance · 2025–26</span>
          <span className="anatomy__value">81%</span>
        </span>
      </div>
      <div className="anatomy__row"><span className="num">3</span><span className="body-sm muted">South Dakota: 76%</span></div>
      <div className="anatomy__row">
        <span className="num">4</span>
        <svg viewBox="0 0 240 72" className="anatomy__chart">
          <rect x={x(4) - 12} y={4} width={24} height={64} fill="var(--pbi-chrome)" />
          <polyline points={line(DEMO_STATE)} fill="none" stroke="var(--data-ref)" strokeWidth="2" strokeLinejoin="round" />
          <polyline points={line(DEMO_PLACE)} fill="none" stroke="var(--readiness)" strokeWidth="2" strokeLinejoin="round" />
          {DEMO_PLACE.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="var(--readiness)" />)}
        </svg>
      </div>
      <div className="anatomy__row">
        <span className="num">5</span>
        <div className="anatomy__bars">
          {bars.map(([name, v, picked]) => (
            <div key={name} className="anatomy__bar-row">
              <span className={picked ? 'strong' : undefined}>{name}</span>
              <span className="anatomy__track">
                <span style={{ width: `${v}%`, opacity: picked ? 1 : 0.45 }} />
                <i style={{ left: '76%' }} />
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="anatomy__row"><span className="num">6</span><span className="caption">Source: South Dakota Department of Education and partners, 2025–26.</span></div>
    </div>
  );
}

// A small drawing of each chart symbol, in the same colors the report uses.
function SymbolSwatch({ kind }) {
  return (
    <svg className="symbols__swatch" viewBox="0 0 32 16" aria-hidden="true">
      {kind === 'ref' && <><line x1="2" y1="8" x2="20" y2="8" stroke="var(--data-ref)" strokeWidth="2" /><rect x="25" y="1" width="2" height="14" fill="var(--data-ref)" /></>}
      {kind === 'dashed' && <line x1="2" y1="8" x2="30" y2="8" stroke="var(--readiness)" strokeWidth="2" strokeDasharray="6 4" />}
      {kind === 'break' && <><line x1="2" y1="11" x2="12" y2="9" stroke="var(--readiness)" strokeWidth="2" /><line x1="16" y1="1" x2="16" y2="15" stroke="var(--muted)" strokeWidth="2" strokeDasharray="3 3" /><line x1="20" y1="5" x2="30" y2="4" stroke="var(--readiness)" strokeWidth="2" /></>}
      {kind === 'hatch' && <foreignObject x="2" y="2" width="28" height="12"><div className="hatch" style={{ width: '100%', height: '100%' }} /></foreignObject>}
      {kind === 'now' && <rect x="10" y="0" width="12" height="16" fill="var(--pbi-chrome)" stroke="#d6d4d2" />}
    </svg>
  );
}
