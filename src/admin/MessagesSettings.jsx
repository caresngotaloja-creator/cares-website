import { useEffect, useState, useCallback } from 'react'
import { supabase, BUCKET } from '../lib/supabase'
import { Notice, Field } from '../components/UI.jsx'
import { useSettings, DEFAULTS } from '../lib/settings.jsx'
import { dt, shrinkImage } from './utils'

const GROUPS = [
  { title: 'Contact details', fields: [
    ['phone', 'Phone number'], ['whatsapp', 'WhatsApp number (digits only)'], ['email', 'Email'],
    ['address', 'Address', 'area'], ['timings', 'Timings', 'area'], ['map_embed', 'Google Maps embed link (the src="…" of the embed)'],
  ] },
  { title: 'Donation details', fields: [
    ['upi_id', 'UPI ID'], ['upi_name', 'Name shown in UPI apps'], ['bank_details', 'Bank details (account name, number, IFSC, branch)', 'area'],
    ['donation_use', 'How donations are used', 'area'],
  ] },
  { title: 'Trust information', fields: [['registration', 'Registration number'], ['tax_80g', '80G details', 'area']] },
  { title: 'Home page', fields: [
    ['tagline', 'Short tagline', 'area'],
    ['stat1_value', 'Highlight 1: number'], ['stat1_label', 'Highlight 1: label'],
    ['stat2_value', 'Highlight 2: number'], ['stat2_label', 'Highlight 2: label'],
    ['stat3_value', 'Highlight 3: number'], ['stat3_label', 'Highlight 3: label'],
  ] },
]

function Settings() {
  const { s, reload } = useSettings()
  const [v, setV] = useState({})
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { setV({ ...s }) }, [s])

  async function save(e) {
    e.preventDefault(); setBusy(true); setMsg(null)
    const keys = Object.keys(DEFAULTS)
    const rows = keys.map((key) => ({ key, value: v[key] ?? '' }))
    const { error } = await supabase.from('settings').upsert(rows)
    setBusy(false)
    if (error) setMsg({ t: 'err', m: error.message }); else { setMsg({ t: 'ok', m: 'Saved. The website is updated.' }); reload() }
  }
  async function qr(e) {
    const file = e.target.files?.[0]; if (!file) return
    setBusy(true)
    try {
      const blob = await shrinkImage(file, 800, 0.9)
      const path = `qr-${Date.now()}.jpg`
      const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
      if (error) throw error
      setV({ ...v, qr_url: path })
      setMsg({ t: 'ok', m: 'QR uploaded. Press "Save settings" to apply it.' })
    } catch (err) { setMsg({ t: 'err', m: err.message }) }
    setBusy(false)
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {msg && <Notice type={msg.t}>{msg.m}</Notice>}
      {GROUPS.map((g) => (
        <section key={g.title} className="card space-y-3">
          <h3 className="text-xl font-bold">{g.title}</h3>
          {g.fields.map(([k, label, kind]) => (
            <Field key={k} label={label}>
              {kind === 'area'
                ? <textarea rows="3" className="field" value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />
                : <input className="field" value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} />}
            </Field>
          ))}
          {g.title === 'Donation details' && (
            <Field label="UPI QR code image"><input type="file" accept="image/*" onChange={qr} />{v.qr_url && <span className="text-xs text-leaf"> QR attached ✓</span>}</Field>
          )}
        </section>
      ))}
      <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
    </form>
  )
}

function Messages() {
  const [rows, setRows] = useState([])
  const load = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false })
    setRows(data || [])
  }, [])
  useEffect(() => { load() }, [load])
  const mark = async (id, is_read) => { await supabase.from('messages').update({ is_read }).eq('id', id); load() }
  const del = async (id) => { if (confirm('Delete this message?')) { await supabase.from('messages').delete().eq('id', id); load() } }

  return (
    <div className="space-y-3">
      {rows.map((m) => (
        <article key={m.id} className={`card !p-4 ${m.is_read ? '' : 'border-l-4 border-l-brand'}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-bold">{m.name} {!m.is_read && <span className="badge bg-brand text-white">New</span>}</h3>
              <p className="text-xs text-slate-500">{dt(m.created_at)}</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline btn-sm" onClick={() => mark(m.id, !m.is_read)}>{m.is_read ? 'Mark unread' : 'Mark read'}</button>
              <button className="btn-danger btn-sm" onClick={() => del(m.id)}>Delete</button>
            </div>
          </div>
          <p className="mt-2 whitespace-pre-line">{m.message}</p>
          <p className="mt-2 text-sm">
            {m.email && <a className="text-brand underline" href={`mailto:${m.email}`}>{m.email}</a>}
            {m.email && m.phone && ' · '}
            {m.phone && <a className="text-brand underline" href={`tel:${m.phone}`}>{m.phone}</a>}
          </p>
        </article>
      ))}
      {!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-slate-500">No messages yet.</p>}
    </div>
  )
}

export default function MessagesSettings() {
  const [tab, setTab] = useState('messages')
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Contact Messages & Settings</h1>
      <div role="tablist" className="inline-flex rounded-xl bg-slate-200 p-1">
        {[['messages', 'Messages'], ['settings', 'Website settings']].map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`rounded-lg px-4 py-2 font-bold ${tab === k ? 'bg-white text-brand shadow' : 'text-slate-600'}`}>{l}</button>
        ))}
      </div>
      {tab === 'messages' ? <Messages /> : <Settings />}
    </div>
  )
}
