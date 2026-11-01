import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { downloadCSV, dt } from './utils'

const STATUSES = ['New', 'Contacted', 'Joined', 'Not available']
const TONE = { New: 'bg-amber-100 text-amber-800', Contacted: 'bg-brand-soft text-brand', Joined: 'bg-leaf-soft text-leaf-dark', 'Not available': 'bg-slate-200 text-slate-700' }

export default function Volunteers() {
  const [rows, setRows] = useState([])
  const [track, setTrack] = useState('All')
  const [status, setStatus] = useState('All')
  const [q, setQ] = useState('')

  const load = useCallback(async () => {
    const { data } = await supabase.from('volunteers').select('*').order('created_at', { ascending: false })
    setRows(data || [])
  }, [])
  useEffect(() => { load() }, [load])

  const update = async (id, patch) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    await supabase.from('volunteers').update(patch).eq('id', id)
  }
  const remove = async (id) => {
    if (!confirm('Delete this application?')) return
    await supabase.from('volunteers').delete().eq('id', id); load()
  }

  const shown = rows.filter((r) =>
    (track === 'All' || r.track === track) && (status === 'All' || r.status === status) &&
    (!q || `${r.name} ${r.phone} ${r.email}`.toLowerCase().includes(q.toLowerCase())))

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Volunteers</h1>
      <div className="flex flex-wrap items-center gap-3">
        <select className="field !w-auto" value={track} onChange={(e) => setTrack(e.target.value)} aria-label="Track">
          <option>All</option><option>Youth</option><option>Senior Citizen</option>
        </select>
        <select className="field !w-auto" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
          <option>All</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <input className="field !w-56" placeholder="Search name or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-outline btn-sm ml-auto" onClick={() => downloadCSV('volunteers.csv', shown.map((r) => ({
          Date: dt(r.created_at), Name: r.name, Age: r.age, Track: r.track, Phone: r.phone, Email: r.email,
          Availability: r.availability, Message: r.message, Status: r.status, Notes: r.notes })))}>Download CSV</button>
      </div>

      <div className="space-y-3">
        {shown.map((r) => (
          <article key={r.id} className="card !p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold">{r.name} <span className="text-sm font-normal text-slate-500">({r.age ?? '–'} yrs)</span></h2>
                <p className="text-sm"><span className={`badge ${r.track === 'Youth' ? 'bg-brand-soft text-brand' : 'bg-leaf-soft text-leaf-dark'}`}>{r.track}</span> · {dt(r.created_at)}</p>
              </div>
              <select aria-label="Status" className={`rounded-full px-3 py-1 text-sm font-bold ${TONE[r.status]}`} value={r.status} onChange={(e) => update(r.id, { status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <p className="mt-2 text-sm">
              <a className="text-brand underline" href={`tel:${r.phone}`}>{r.phone}</a>
              {r.email && <> · <a className="text-brand underline" href={`mailto:${r.email}`}>{r.email}</a></>}
            </p>
            {r.availability && <p className="text-sm"><b>Available:</b> {r.availability}</p>}
            {r.message && <p className="text-sm"><b>Message:</b> {r.message}</p>}
            <div className="mt-3 flex gap-2">
              <input className="field" placeholder="Staff notes (only visible here)" defaultValue={r.notes || ''} onBlur={(e) => e.target.value !== (r.notes || '') && update(r.id, { notes: e.target.value })} />
              <button className="btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
            </div>
          </article>
        ))}
        {!shown.length && <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">No applications to show.</p>}
      </div>
    </div>
  )
}
