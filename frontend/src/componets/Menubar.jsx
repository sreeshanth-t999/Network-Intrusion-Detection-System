import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrafficIcon from '@mui/icons-material/Router';
import CreateIcon from '@mui/icons-material/Create';
import DatasetIcon from '@mui/icons-material/Dataset';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const navItems = [
  { path: '/', label: 'Dashboard', Icon: DashboardIcon },
  { path: '/traffic', label: 'Traffic', Icon: TrafficIcon },
  { path: '/simulate', label: 'Simulate', Icon: CreateIcon },
  { path: '/dataset', label: 'Dataset', Icon: DatasetIcon },
  { path: '/autoSimulate', label: 'Auto Generate', Icon: AutoFixHighIcon },
];

const Menubar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleToggle = () => setOpen((v) => !v);

  useEffect(() => {
    // close menu when route changes
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    // lock body scroll when mobile menu is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="topbar" role="banner">
      <div className="topbar-inner">
        <div className="brand">
          <div className="logo_icon">IDS</div>
          <span className="logo_name">Security Hub</span>
        </div>

        <nav className={`topnav ${open ? 'open' : ''}`} role="navigation" aria-label="Primary">
          <ul>
            {navItems.map(({ path, label, Icon }) => {
              const active = location.pathname === path;
              return (
                <li key={path} className={`topnav-item ${active ? 'active' : ''}`}>
                  <Link to={path} className="menu-link" aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)}>
                    <Icon className="menuicn" />
                    <span className="links_name">{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="top-actions">
          <button
            className="mobile-toggle"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={handleToggle}
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Menubar;
