import { LEAD, PARTNERS } from '../data/agencies.js';

/**
 * DOE logo followed by "In partnership with" and the partner logos.
 * `centered` puts the label on the center line above one row holding all the logos.
 * `on="dark"` (red footer) renders every logo white; `on="light"` renders every logo in one dark tone.
 * Logos without a matching official version are recolored with a CSS filter; swap in the
 * official white and one-color files from each agency when they arrive.
 */
export default function AgencyLogos({ on = 'light', showLead = true, centered = false }) {
  const tone = (a) =>
    (on === 'dark' ? (a.tone === 'white' ? '' : ' agency-logo--white') : ' agency-logo--ink') + (a.matte ? ' agency-logo--matte' : '');

  const lead = showLead && <img src={LEAD.logo} alt={LEAD.alt} className={`agency-logo agency-logo--lead${tone(LEAD)}`} />;
  const partners = PARTNERS.map((p) => <img key={p.name} src={p.logo} alt={p.alt} className={`agency-logo${tone(p)}`} />);

  if (centered) {
    return (
      <div className={`agencies agencies--${on} agencies--centered`}>
        <span className="agencies__label">In partnership with</span>
        <div className="agencies__row">{lead}{partners}</div>
      </div>
    );
  }

  return (
    <div className={`agencies agencies--${on}`}>
      {lead}
      <div className="agencies__partners">
        <span className="agencies__label">In partnership with</span>
        <div className="agencies__row">{partners}</div>
      </div>
    </div>
  );
}
