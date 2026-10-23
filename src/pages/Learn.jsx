import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { SECTIONS, TERMS, DICTIONARY, DOWNLOADS, ABOUT, FAQ } from '../data/help.js';
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
                <p className="empty">No terms match. Try a shorter word, or contact the SLDS team.</p>
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
            <section aria-labelledby="r-h" className="stack gap-16">
              <h2 id="r-h" className="h2">How to read the charts</h2>
              <p>Every indicator page in the report has the same five parts, in the same order.</p>
              <div className="anatomy">
                <div className="card anatomy__demo" aria-hidden="true" style={{ padding: 20 }}>
                  <div className="anatomy__row"><span className="num">1</span><span className="h3">Are students attending school consistently?</span></div>
                  <div className="anatomy__row"><span className="num">2</span><span style={{ fontSize: 44, lineHeight: '48px', fontWeight: 700 }}>77.8%</span></div>
                  <div className="anatomy__row"><span className="num">3</span><span className="caption">Grades 9–12 · 2025–26 · South Dakota</span></div>
                  <div className="anatomy__row" style={{ alignItems: 'flex-end' }}>
                    <span className="num">4</span>
                    <div className="mini-bars"><div style={{ height: 62 }} /><div style={{ height: 50 }} /><div style={{ height: 54 }} /><div style={{ height: 57 }} /><div style={{ height: 60 }} /></div>
                  </div>
                  <div className="anatomy__row"><span className="num">5</span><span className="caption">Source: South Dakota SLDS, 2025–26.</span></div>
                </div>
                <ol>
                  <li><strong>The question.</strong> What the indicator helps you answer.</li>
                  <li><strong>The headline value.</strong> The result for the place, year and group you chose.</li>
                  <li><strong>The context line.</strong> Which students are counted, the school year and the place.</li>
                  <li><strong>The trend.</strong> The last five years. The darker bar is the year you selected. A dashed line marks a change in how the data were collected.</li>
                  <li><strong>Source and notes.</strong> Where the data come from and any limits.</li>
                </ol>
              </div>
              <div className="key-finding body-sm">
                Gray bars beside a teal bar show the state value, so you can compare a district or school with South
                Dakota as a whole. Striped cells mean the value is suppressed to protect privacy.
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
                The SLDS is led by the {LEAD.name} in partnership with the {PARTNERS.map((p) => p.name).join(' and the ')}.
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
            <span className="body-sm"><strong>Still have a question?</strong> The SLDS team can help you find or interpret data.</span>
            <span className="body-sm strong">Contact us at [SLDS EMAIL]</span>
          </aside>
        </div>
      </div>
    </>
  );
}
