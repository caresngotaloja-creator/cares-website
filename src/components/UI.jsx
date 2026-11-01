import { Link } from 'react-router-dom'

export function PageHeader({ title, intro }) {
  return (
    <div className="bg-gradient-to-br from-brand-soft via-white to-leaf-soft">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {intro && <p className="mt-3 max-w-2xl text-lg text-slate-700">{intro}</p>}
      </div>
    </div>
  )
}

export function Notice({ type = 'info', children }) {
  const cls = {
    info: 'border-brand/30 bg-brand-soft text-brand-dark',
    ok: 'border-leaf/30 bg-leaf-soft text-leaf-dark',
    err: 'border-red-300 bg-red-50 text-red-800',
    warn: 'border-amber-300 bg-amber-50 text-amber-900',
  }[type]
  return <div role={type === 'err' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${cls}`}>{children}</div>
}

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  )
}

export function Empty({ children }) {
  return <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">{children}</div>
}

export function CTA({ to, children, cls = 'btn-primary' }) {
  return <Link to={to} className={cls}>{children}</Link>
}

/** Honeypot field: real people never see it, bots fill it. */
export function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={value} onChange={onChange} /></label>
    </div>
  )
}
