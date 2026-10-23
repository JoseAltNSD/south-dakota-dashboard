import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import AgencyLogos from '../components/AgencyLogos.jsx';
import { STAGES, STAGE_ORDER, DISTRICTS } from '../data/stages.js';

const HELP = [
  { title: 'Glossary', text: 'Plain-language meanings of terms like cohort and persistence.', icon: 'book', section: 'glossary' },
  { title: 'Data dictionary', text: 'How each indicator is calculated and who is counted.', icon: 'table', section: 'dictionary' },
  { title: 'How to read the charts', text: 'A short guide to each part of a report page.', icon: 'chart', section: 'read' },
  { title: 'Download data', text: 'Get the numbers behind every chart as a spreadsheet.', icon: 'download', section: 'download' },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  function findPlace(e) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    const match = q && DISTRICTS.find((d) => d.toLowerCase().includes(q));
    navigate(match ? `/explore?level=District&district=${encodeURIComponent(match)}` : '/explore');
  }

  return (
    <>
      <section className="container hero">
        <div className="hero__copy">
          <span className="eyebrow muted">South Dakota Statewide Longitudinal Data System</span>
          <h1 className="display">How are South Dakota students doing after high school?</h1>
          <p className="hero__lead">
            Follow students from high school into college. See how they attend, learn, plan and progress, for the
            state, each district and each high school.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--primary" to="/explore">Explore the data</Link>
            <Link className="btn btn--secondary" to="/learn">New here? Start with the glossary</Link>
          </div>
        </div>
        <form className="card finder" onSubmit={findPlace}>
          <label htmlFor="find" className="h3">Find your district or school</label>
          <p className="body-sm muted">Jump straight to results for a place you know.</p>
          <div className="finder__row">
            <input id="find" className="input" type="search" placeholder="e.g. Brookings" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" className="btn btn--primary btn--sm" style={{ minHeight: 44 }}>Go</button>
          </div>
          <p className="caption">Or view <Link to="/explore">statewide results</Link>.</p>
        </form>
      </section>

      <section className="band band--well" aria-labelledby="q-h">
        <div className="container stack gap-32">
          <div className="stack gap-4">
            <h2 id="q-h" className="h2">Explore by stage</h2>
            <p className="muted">See how students are doing at each step, from high school into college.</p>
          </div>
          <div className="grid grid--3">
            {STAGE_ORDER.map((key) => {
              const s = STAGES[key];
              return (
                <article key={key} className="card stage-card" style={{ '--stage-tint': s.tint }}>
                  <span className="eyebrow" style={{ color: s.ink }}>{s.short}</span>
                  <h3 className="h3">{s.full}</h3>
                  <p className="body-sm muted">{s.blurb}</p>
                  <ul className="stage-card__questions">
                    {s.indicators.map((i) => (
                      <li key={i.id}>
                        {i.later ? (
                          <span className="question-link question-link--later hatch">
                            <span>{i.name}</span>
                            <span className="caption">Coming later</span>
                          </span>
                        ) : (
                          <Link className="question-link" to={`/explore?stage=${key}&indicator=${i.id}`}>
                            <span>{i.name}</span>
                            <Icon name="arrowRight" size={16} strokeWidth={2} />
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band" aria-labelledby="help-h">
        <div className="container stack gap-32">
          <h2 id="help-h" className="h2">Help and context</h2>
          <div className="grid grid--4">
            {HELP.map((h) => (
              <Link key={h.title} className="card help-tile" to={`/learn?section=${h.section}`}>
                <span className="help-tile__icon"><Icon name={h.icon} size={20} /></span>
                <span className="stack gap-4">
                  <span className="help-tile__title strong">{h.title}</span>
                  <span className="body-sm muted">{h.text}</span>
                </span>
              </Link>
            ))}
          </div>
          <p className="body-sm muted" style={{ maxWidth: 760 }}>
            Looking for school accountability ratings? Those are published in the{' '}
            <a href="https://doe.sd.gov/" target="_blank" rel="noreferrer">South Dakota Report Card</a>.
          </p>
        </div>
      </section>

      <section className="band band--well" aria-label="Partner agencies">
        <div className="container">
          <AgencyLogos on="light" centered />
        </div>
      </section>
    </>
  );
}
