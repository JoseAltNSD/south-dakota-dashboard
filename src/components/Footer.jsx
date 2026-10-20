import { Link } from 'react-router-dom';
import logo from '../assets/sd-doe-logo-white.png';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__about">
          <img
            src={logo}
            alt="South Dakota Department of Education: Learning. Leadership. Service."
            className="site-footer__logo"
          />
          <span style={{ fontSize: 16, fontWeight: 600 }}>South Dakota Statewide Longitudinal Data System</span>
          <span className="badge-outline">ILLUSTRATIVE</span>
          <span>
            Illustrative mock-up for design review. Agency names show intended branding only; this is not an
            official publication of the South Dakota Department of Education or the South Dakota Board of Regents.
          </span>
        </div>
        <nav aria-label="Footer">
          <Link to="/learn?section=about">About the data</Link>
          <Link to="/learn?section=about">Accessibility</Link>
          <Link to="/learn?section=about">Privacy</Link>
          <Link to="/learn?section=faq">Contact the SLDS team</Link>
          <Link to="/learn?section=faq">Feedback</Link>
        </nav>
      </div>
    </footer>
  );
}
