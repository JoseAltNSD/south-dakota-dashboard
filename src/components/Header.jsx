import { Link, NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="brand">
          <span className="stack gap-4">
            <span className="brand__title">HS to Postsecondary Dashboard</span>
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
