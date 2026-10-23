import { Link } from 'react-router-dom';
import AgencyLogos from './AgencyLogos.jsx';
import { useFeedback } from './Feedback.jsx';
import { LEAD } from '../data/agencies.js';

export default function Footer() {
  const openFeedback = useFeedback();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__about">
          <img src={LEAD.logo} alt={LEAD.alt} className="site-footer__logo" />
          <span style={{ fontSize: 16, fontWeight: 600 }}>South Dakota Statewide Longitudinal Data System</span>
          <span className="badge-outline">ILLUSTRATIVE</span>
          <span>
            Illustrative mock-up for design review. Agency names show intended branding only; this is not an
            official publication of the South Dakota Department of Education, the South Dakota Board of Regents or the
            South Dakota Board of Technical Education.
          </span>
        </div>
        <div className="site-footer__side">
          <nav aria-label="Footer">
            <Link to="/learn?section=about">About the data</Link>
            <Link to="/learn?section=about">Accessibility</Link>
            <Link to="/learn?section=about">Privacy</Link>
            <Link to="/learn?section=faq">Contact the SLDS team</Link>
            <button type="button" className="footer-link" onClick={openFeedback}>Feedback</button>
          </nav>
          <AgencyLogos on="dark" showLead={false} />
        </div>
      </div>
    </footer>
  );
}
