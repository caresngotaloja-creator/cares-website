import { useState } from 'react'
import { NavLink, Link, Outlet } from 'react-router-dom'
import { useSettings, digits } from '../lib/settings.jsx'
import { configured, configError } from '../lib/supabase'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About Us' },
  { to: '/volunteer', label: 'Volunteer' },
  { to: '/events', label: 'Events & Gallery' },
  { to: '/contact', label: 'Contact Us & Donations' },
]

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const { s } = useSettings()
  const wa = digits(s.whatsapp || s.phone)

  const linkCls = ({ isActive }) =>
    `block rounded-lg px-3 py-2 font-bold transition ${
      isActive ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-slate-100'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 sm:px-6">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <img src="/logo.png" alt="C.A.R.E.S. logo" className="h-12 w-auto" />
            <span className="hidden text-sm font-bold leading-tight text-brand-dark sm:block">
              Child n Adult Rehab<br />and Education Society
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls}>{l.label}</NavLink>
            ))}
          </nav>

          <button
            className="rounded-lg border border-slate-300 p-2 lg:hidden"
            aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
        {open && (
          <nav className="border-t border-slate-200 px-4 pb-3 lg:hidden" aria-label="Mobile">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkCls} onClick={() => setOpen(false)}>{l.label}</NavLink>
            ))}
          </nav>
        )}
      </header>

      {!configured && (
        <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
          {configError || 'Preview mode: the database is not connected yet, so forms and live content are switched off.'}
        </div>
      )}

      <main id="main" className="flex-1"><Outlet /></main>

      {wa && (
        <a
          href={`https://wa.me/${wa.length === 10 ? '91' + wa : wa}`}
          target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp"
          className="fixed bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 transition"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5z"/><path d="M9 8.5c0 3.5 3 6.5 6.500 6.500l1-1.500-2-1-1 .8c-1-.4-2-1.400-2.400-2.400l.8-1-1-2z" fill="currentColor" stroke="none"/></svg>
        </a>
      )}

      <footer className="bg-brand-dark text-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
          <div>
            <img src="/logo.png" alt="" className="mb-3 h-14 w-auto rounded bg-white p-1" />
            <p className="text-sm text-white/80">{s.org_full_name}</p>
            <p className="mt-1 text-sm text-white/80">{s.tagline}</p>
          </div>
          <div>
            <h3 className="mb-2 font-sans text-base font-bold text-white">Pages</h3>
            <ul className="space-y-1 text-sm text-white/80">
              {links.map((l) => (
                <li key={l.to}><Link className="hover:underline" to={l.to}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-sans text-base font-bold text-white">Contact</h3>
            <ul className="space-y-1 text-sm text-white/80">
              <li>{s.address}</li>
              {s.phone && <li><a className="hover:underline" href={`tel:${s.phone}`}>{s.phone}</a></li>}
              <li><a className="hover:underline" href={`mailto:${s.email}`}>{s.email}</a></li>
              {s.registration && <li>Reg. No.: {s.registration}</li>}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 py-3 text-center text-xs text-white/60">
          © {new Date().getFullYear()} {s.org_name} · <Link to="/admin" className="hover:underline">Staff login</Link>
        </div>
      </footer>
    </div>
  )
}
