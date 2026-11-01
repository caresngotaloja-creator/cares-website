import { useEffect, useState, useCallback } from 'react'
import { supabase, publicUrl, BUCKET } from '../lib/supabase'
import { Notice, Field } from '../components/UI.jsx'
import { shrinkImage } from './utils'

async function upload(file) {
  const blob = await shrinkImage(file)
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: 'image/jpeg' })
  if (error) throw error
  return path
}

const blank = { id: null, title: '', event_date: '', description: '', image_url: '', visible: true }

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [photos, setPhotos] = useState([])
  const [f, setF] = useState(blank)
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [caption, setCaption] = useState('')

  const load = useCallback(async () => {
    const [e, g] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: false }),
      supabase.from('gallery').select('*').order('created_at', { ascending: false }),
    ])
    setEvents(e.data || []); setPhotos(g.data || [])
  }, [])
  useEffect(() => { load() }, [load])

  async function saveEvent(e) {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const row = { title: f.title.trim(), event_date: f.event_date || null, description: f.description.trim() || null, image_url: f.image_url || null, visible: f.visible }
      const { error } = f.id ? await supabase.from('events').update(row).eq('id', f.id) : await supabase.from('events').insert(row)
      if (error) throw error
      setF(blank); setMsg({ t: 'ok', m: 'Event saved.' }); load()
    } catch (err) { setMsg({ t: 'err', m: err.message }) }
    setBusy(false)
  }
  async function eventImage(e) {
    const file = e.target.files?.[0]; if (!file) return
    setBusy(true)
    try { setF({ ...f, image_url: await upload(file) }) } catch (err) { setMsg({ t: 'err', m: err.message }) }
    setBusy(false)
  }
  async function delEvent(id) {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id); load()
  }
  async function addPhotos(e) {
    const files = [...(e.target.files || [])]; if (!files.length) return
    setBusy(true); setMsg(null)
    try {
      for (const file of files) {
        const path = await upload(file)
        const { error } = await supabase.from('gallery').insert({ image_url: path, caption: caption.trim() || null })
        if (error) throw error
      }
      setCaption(''); setMsg({ t: 'ok', m: `${files.length} photo(s) added.` }); load()
    } catch (err) { setMsg({ t: 'err', m: err.message }) }
    setBusy(false); e.target.value = ''
  }
  const toggle = async (p) => { await supabase.from('gallery').update({ visible: !p.visible }).eq('id', p.id); load() }
  const delPhoto = async (p) => {
    if (!confirm('Delete this photo?')) return
    await supabase.from('gallery').delete().eq('id', p.id)
    if (!p.image_url.startsWith('http')) await supabase.storage.from(BUCKET).remove([p.image_url])
    load()
  }
  const saveCaption = async (p, v) => { if (v !== (p.caption || '')) await supabase.from('gallery').update({ caption: v || null }).eq('id', p.id) }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Events & Gallery</h1>
      {msg && <Notice type={msg.t}>{msg.m}</Notice>}

      <section>
        <h2 className="text-2xl font-bold">Events</h2>
        <form onSubmit={saveEvent} className="card mt-3 grid gap-3 sm:grid-cols-2">
          <h3 className="text-lg font-bold sm:col-span-2">{f.id ? 'Edit event' : 'Add a new event'}</h3>
          <Field label="Title *"><input required className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} maxLength={150} /></Field>
          <Field label="Date"><input type="date" className="field" value={f.event_date || ''} onChange={(e) => setF({ ...f, event_date: e.target.value })} /></Field>
          <div className="sm:col-span-2"><Field label="Description"><textarea rows="3" className="field" value={f.description || ''} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
          <Field label="Photo (optional)" hint="Please do not use photos showing children's faces unless parents have agreed.">
            <input type="file" accept="image/*" onChange={eventImage} />
          </Field>
          <div className="flex items-center gap-3">
            {f.image_url && <img src={publicUrl(f.image_url)} alt="" className="h-16 rounded" />}
            <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Show on website</label>
          </div>
          <div className="flex gap-2 sm:col-span-2">
            <button className="btn-primary" disabled={busy}>{f.id ? 'Update event' : 'Add event'}</button>
            {f.id && <button type="button" className="btn-outline" onClick={() => setF(blank)}>Cancel</button>}
          </div>
        </form>

        <div className="mt-4 space-y-2">
          {events.map((e) => (
            <div key={e.id} className="card flex flex-wrap items-center gap-3 !p-3">
              {e.image_url && <img src={publicUrl(e.image_url)} alt="" className="h-14 w-20 rounded object-cover" />}
              <div className="min-w-0 flex-1"><p className="font-bold">{e.title}</p><p className="text-xs text-slate-500">{e.event_date} {e.visible ? '' : '· hidden'}</p></div>
              <button className="btn-outline btn-sm" onClick={() => { setF({ ...e }); window.scrollTo(0, 0) }}>Edit</button>
              <button className="btn-danger btn-sm" onClick={() => delEvent(e.id)}>Delete</button>
            </div>
          ))}
          {!events.length && <p className="text-slate-500">No events yet.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Gallery</h2>
        <div className="card mt-3 space-y-3">
          <Notice type="warn">Photos are resized automatically and their hidden location (GPS) data is removed. Do not upload clear photos of children's faces without parents' written permission.</Notice>
          <Field label="Caption for the photos you are adding (optional)"><input className="field" value={caption} onChange={(e) => setCaption(e.target.value)} maxLength={150} /></Field>
          <input type="file" accept="image/*" multiple onChange={addPhotos} disabled={busy} />
          {busy && <p className="text-sm">Uploading…</p>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          {photos.map((p) => (
            <div key={p.id} className="card !p-2">
              <img src={publicUrl(p.image_url)} alt={p.caption || ''} className={`h-32 w-full rounded object-cover ${p.visible ? '' : 'opacity-40'}`} />
              <input className="field mt-2 !py-1 text-sm" defaultValue={p.caption || ''} placeholder="Caption" onBlur={(e) => saveCaption(p, e.target.value)} />
              <div className="mt-2 flex gap-1">
                <button className="btn-outline btn-sm flex-1" onClick={() => toggle(p)}>{p.visible ? 'Hide' : 'Show'}</button>
                <button className="btn-danger btn-sm" onClick={() => delPhoto(p)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
        {!photos.length && <p className="mt-3 text-slate-500">No photos yet.</p>}
      </section>
    </div>
  )
}
