import { useState } from 'react'
import { NavLink, Navigate, Outlet, Link } from 'react-router-dom'
import { useAuth } from './auth.jsx'

const nav = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/donations', label: 'Donations' },
  { to: '/admin/volunteers', label: 'Volunteers' },
  { to: '/admin/events', label: 'Events & Gallery' },
  { to: '/admin/messages', label: 'Messages & Settings' },
]

export default function AdminLayout() {
  const { user, role, loading, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (loading) return <div className="p-8 text-center">Loading…</div>
  if (!user || !role) return <Navigate to="/admin/login" replace />

  const cls = ({ isActive }) =>
    `block rounded-lg px-3 py-2 font-bold ${isActive ? 'bg-brand text-white' : 'text-ink hover:bg-slate-100'}`

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="border-b border-slate-200 bg-white md:min-h-screen md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between p-4">
          <Link to="/admin" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-10" />
            <span className="font-bold text-brand-dark">Admin</span>
          </Link>
          <button className="rounded border px-2 py-1 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open}>Menu</button>
        </div>
        <nav className={`${open ? 'block' : 'hidden'} space-y-1 px-3 pb-4 md:block`}>
          {nav.map((n) => <NavLink key={n.to} to={n.to} end={n.end} className={cls} onClick={() => setOpen(false)}>{n.label}</NavLink>)}
          <hr className="my-3" />
          <Link to="/" className="block px-3 py-2 text-sm text-brand underline">View website</Link>
          <p className="px-3 text-xs text-slate-500">{user.email} ({role})</p>
          <button onClick={signOut} className="btn-outline btn-sm mx-3 mt-2">Sign out</button>
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8"><Outlet /></main>
    </div>
  )
}
