import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import AgencyLogos from '../components/AgencyLogos.jsx';
import heroImage from '../assets/hero-students.jpg';
import { STAGES, STAGE_ORDER } from '../data/stages.js';

const HELP = [
  { title: 'Glossary', text: 'Plain-language meanings of terms like cohort and persistence.', icon: 'book', section: 'glossary' },
  { title: 'Data dictionary', text: 'How each indicator is calculated and who is counted.', icon: 'table', section: 'dictionary' },
  { title: 'How to read the charts', text: 'A short guide to each part of a report page.', icon: 'chart', section: 'read' },
  { title: 'Download data', text: 'Get the numbers behind every chart as a spreadsheet.', icon: 'download', section: 'download' },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container hero__copy">
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
        {/* Decorative, so it has empty alt text. Fills the right half on wide screens; hidden below 900px. */}
        <img className="hero__image" src={heroImage} alt="" />
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
