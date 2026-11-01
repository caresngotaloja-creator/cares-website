import { useState } from 'react'
import { PageHeader, Notice, Field, Honeypot } from '../components/UI.jsx'
import { supabase, configured } from '../lib/supabase'

const TRACKS = {
  Youth: {
    title: 'Youth volunteers',
    who: 'Students and young adults (about 18 to 30 years)',
    points: [
      'Help children with academic support and homework',
      'Join learning and activity sessions',
      'Support events and awareness drives',
    ],
  },
  'Senior Citizen': {
    title: 'Senior citizen volunteers',
    who: 'Senior citizens who would like to spend time with children',
    points: [
      'Interact and talk with the children',
      'Share stories, games and life experience',
      'Be a friendly, caring presence at the centre',
    ],
  },
}

const empty = { name: '', age: '', phone: '', email: '', availability: '', message: '' }

export default function Volunteer() {
  const [track, setTrack] = useState('Youth')
  const [f, setF] = useState(empty)
  const [trap, setTrap] = useState('')
  const [state, setState] = useState({ busy: false, ok: false, err: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const t = TRACKS[track]

  async function submit(e) {
    e.preventDefault()
    if (trap) return setState({ busy: false, ok: true, err: '' }) // bot: pretend success
    if (!configured) return setState({ busy: false, ok: false, err: 'The form is not connected yet (preview mode).' })
    setState({ busy: true, ok: false, err: '' })
    const { error } = await supabase.from('volunteers').insert({
      name: f.name.trim(), age: f.age ? Number(f.age) : null, phone: f.phone.trim(),
      email: f.email.trim() || null, track, availability: f.availability.trim() || null,
      message: f.message.trim() || null,
    })
    if (error) setState({ busy: false, ok: false, err: 'Sorry, something went wrong. Please try again or contact us directly.' })
    else { setState({ busy: false, ok: true, err: '' }); setF(empty) }
  }

  return (
    <>
      <PageHeader title="Volunteer with us" intro="C.A.R.E.S. needs volunteers. Choose the track that suits you and send your details; the team will get in touch." />

      <section className="section">
        <div role="tablist" aria-label="Volunteer track" className="inline-flex rounded-xl bg-slate-100 p-1">
          {Object.keys(TRACKS).map((k) => (
            <button key={k} role="tab" aria-selected={track === k} onClick={() => setTrack(k)}
              className={`rounded-lg px-4 py-2 font-bold transition ${track === k ? 'bg-white text-brand shadow' : 'text-slate-600'}`}>
              {k === 'Youth' ? 'Youth' : 'Senior Citizens'}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold">{t.title}</h2>
            <p className="mt-1 text-sm font-bold text-leaf">{t.who}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-slate-700">
              {t.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>

          <form onSubmit={submit} className="card relative space-y-4 md:col-span-3">
            <h2 className="text-xl font-bold">Volunteer form ({track === 'Youth' ? 'Youth' : 'Senior Citizen'})</h2>
            {state.ok && <Notice type="ok">Thank you! Your details have been sent. The C.A.R.E.S. team will contact you soon.</Notice>}
            {state.err && <Notice type="err">{state.err}</Notice>}
            <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *"><input required className="field" value={f.name} onChange={set('name')} maxLength={100} autoComplete="name" /></Field>
              <Field label="Age *"><input required type="number" min="14" max="100" className="field" value={f.age} onChange={set('age')} /></Field>
              <Field label="Phone number *"><input required type="tel" className="field" value={f.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" /></Field>
              <Field label="Email (optional)"><input type="email" className="field" value={f.email} onChange={set('email')} maxLength={120} autoComplete="email" /></Field>
            </div>
            <Field label="When are you available?" hint="For example: weekends, weekday evenings"><input className="field" value={f.availability} onChange={set('availability')} maxLength={200} /></Field>
            <Field label="Anything you would like to tell us"><textarea rows="3" className="field" value={f.message} onChange={set('message')} maxLength={1000} /></Field>
            <button className="btn-primary" disabled={state.busy}>{state.busy ? 'Sending…' : 'Send my details'}</button>
          </form>
        </div>
      </section>
    </>
  )
}
