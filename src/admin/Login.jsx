import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import { Notice, Field } from '../components/UI.jsx'
import { configured } from '../lib/supabase'

export default function Login() {
  const { user, role, loading, signIn } = useAuth()
  const nav = useNavigate()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && user && role) return <Navigate to="/admin" replace />

  async function submit(e) {
    e.preventDefault()
    setErr(''); setBusy(true)
    const { error } = await signIn(f.email.trim(), f.password)
    setBusy(false)
    if (error) setErr('Wrong email or password.')
    else nav('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-soft to-leaf-soft px-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <img src="/logo.png" alt="C.A.R.E.S." className="mx-auto h-20" />
        <h1 className="text-center text-2xl font-bold">Staff login</h1>
        {!configured && <Notice type="warn">The database is not connected yet, so login is not available.</Notice>}
        {err && <Notice type="err">{err}</Notice>}
        {user && !role && !loading && <Notice type="err">This account is not set up as staff. Please ask the administrator.</Notice>}
        <Field label="Email"><input required type="email" className="field" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="username" /></Field>
        <Field label="Password"><input required type="password" className="field" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></Field>
        <button className="btn-primary w-full" disabled={busy || !configured}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-sm"><Link to="/" className="text-brand underline">← Back to website</Link></p>
      </form>
    </div>
  )
}
