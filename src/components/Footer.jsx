import { Link } from 'react-router-dom';
import AgencyLogos from './AgencyLogos.jsx';
import { useFeedback } from './Feedback.jsx';

export default function Footer() {
  const openFeedback = useFeedback();

  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__about">
          <span style={{ fontSize: 16, fontWeight: 600 }}>High school to postsecondary transition dashboard</span>
          <span className="badge-outline">ILLUSTRATIVE</span>
          <span>
            Illustrative mock-up for design review. Agency and program names show intended branding only; this is not
            an official publication of the South Dakota Data Collaborative, the South Dakota Department of Education,
            the South Dakota Board of Regents or the South Dakota Board of Technical Education.
          </span>
        </div>
        <div className="site-footer__side">
          <nav aria-label="Footer">
            <Link to="/learn?section=about">About the data</Link>
            <Link to="/learn?section=about">Accessibility</Link>
            <Link to="/learn?section=about">Privacy</Link>
            <Link to="/learn?section=faq">Contact the dashboard team</Link>
            <button type="button" className="footer-link" onClick={openFeedback}>Feedback</button>
          </nav>
          <AgencyLogos on="dark" />
        </div>
      </div>
    </footer>
  );
}
