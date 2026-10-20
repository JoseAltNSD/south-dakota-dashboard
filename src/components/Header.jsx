import { Link, NavLink } from 'react-router-dom';
import logo from '../assets/sd-doe-logo-white.png';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <img src={logo} alt="South Dakota Department of Education" className="brand__logo" />
          <span className="brand__divider" aria-hidden="true" />
          <span className="stack gap-4">
            <span className="brand__title">SLDS Data Dashboard</span>
            <span className="badge-lime">ILLUSTRATIVE</span>
          </span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/explore">Explore the data</NavLink>
          <NavLink to="/learn">Glossary and help</NavLink>
        </nav>
      </div>
    </header>
  );
}
