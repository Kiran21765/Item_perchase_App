import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Icon from './Icon.jsx';

const nav = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/items', label: 'Items', icon: 'inventory' },
  { to: '/item-types', label: 'Item Types', icon: 'types' },
  { to: '/purchases/new', label: 'Create Purchase', icon: 'cart' },
  { to: '/purchases', label: 'Purchases', icon: 'orders', end: true },
  { to: '/stock', label: 'Stock', icon: 'stock' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const title =
    location.pathname === '/' ? `Hey ${user.username} \u{1F44B}, welcome back!` :
    (nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))?.label || 'Purchases');

  const search = (e) => {
    e.preventDefault();
    navigate(`/items?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div className="shell">
      <div className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <span className="logo"><Icon name="inventory" size={20} /></span>
          <span>Invento</span>
        </div>
        <nav onClick={() => setOpen(false)}>
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>
              <Icon name={n.icon} /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="usercard">
          <span className="avatar">{user.username[0].toUpperCase()}</span>
          <div className="who">
            <strong>{user.username}</strong>
            <small>{user.role === 'ADMIN' ? 'Admin' : 'User'}</small>
          </div>
          <button className="icon-btn" title="Logout" aria-label="Logout"
                  onClick={() => { logout(); navigate('/login'); }}>
            <Icon name="logout" />
          </button>
        </div>
      </div>

      <div className="content">
        <header className="topbar">
          <button className="icon-btn menu-btn" aria-label="Menu" onClick={() => setOpen(!open)}>
            <Icon name="menu" />
          </button>
          <h1>{title}</h1>
          <form className="search" onSubmit={search} role="search">
            <Icon name="search" size={16} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..."
                   aria-label="Search products" />
          </form>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
