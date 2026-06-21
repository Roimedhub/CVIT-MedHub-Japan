import { NavLink } from 'react-router-dom'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Schedule', icon: '📅' },
  { path: '/hospital-form', label: 'Potential Hospital', icon: '🏥' },
  { path: '/ffr-feedback', label: 'AutocathFFR Feedback', icon: '💬' },
  { path: '/llm-feedback', label: 'AutocathLLM Feedback', icon: '🤖' },
  { path: '/materials', label: 'Materials', icon: '📎' },
]

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-logo">MH</div>
            <div>
              <div className="brand-title">MedHub Japan</div>
              <div className="brand-sub">CVIT 2026 · Team Portal</div>
            </div>
          </div>
          <nav className="header-nav">
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{icon}</span>
                <span className="nav-label">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="main">{children}</main>
      <footer className="footer">
        <span>MedHub Japan · CVIT 2026 Conference Portal</span>
      </footer>
    </div>
  )
}
