import { useEffect, useState } from 'react'
import { PageHeader, Empty } from '../components/UI.jsx'
import { supabase, configured, publicUrl } from '../lib/supabase'
import { fmtDate } from '../lib/settings.jsx'

export default function EventsGallery() {
  const [events, setEvents] = useState([])
  const [photos, setPhotos] = useState([])
  const [big, setBig] = useState(null)

  useEffect(() => {
    if (!configured) return
    supabase.from('events').select('*').eq('visible', true).order('event_date', { ascending: false })
      .then(({ data }) => setEvents(data || []))
    supabase.from('gallery').select('*').eq('visible', true).order('created_at', { ascending: false })
      .then(({ data }) => setPhotos(data || []))
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setBig(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <PageHeader title="Events & Gallery" intro="Activities, programmes and moments from the C.A.R.E.S. centre." />

      <section className="section">
        <h2 className="text-3xl font-bold">Events</h2>
        {events.length === 0 ? (
          <div className="mt-5"><Empty>No events have been posted yet. Please check back soon.</Empty></div>
        ) : (
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <article key={e.id} className="card overflow-hidden !p-0">
                {e.image_url && <img src={publicUrl(e.image_url)} alt={e.title} loading="lazy" className="h-48 w-full object-cover" />}
                <div className="p-5">
                  <p className="text-xs font-bold text-leaf">{fmtDate(e.event_date)}</p>
                  <h3 className="mt-1 text-lg font-bold">{e.title}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{e.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50">
        <div className="section">
          <h2 className="text-3xl font-bold">Gallery</h2>
          <p className="mt-1 text-sm text-slate-600">Photos are shared with the permission of the centre. Children's faces are not shown without parents' consent.</p>
          {photos.length === 0 ? (
            <div className="mt-5"><Empty>Photos will appear here soon.</Empty></div>
          ) : (
            <div className="mt-6 columns-2 gap-4 md:columns-3 lg:columns-4">
              {photos.map((p) => (
                <button key={p.id} onClick={() => setBig(p)} className="mb-4 block w-full overflow-hidden rounded-xl text-left shadow-sm focus-visible:ring-2 focus-visible:ring-brand">
                  <img src={publicUrl(p.image_url)} alt={p.caption || 'C.A.R.E.S. photo'} loading="lazy" className="w-full" />
                  {p.caption && <span className="block bg-white px-3 py-2 text-xs text-slate-700">{p.caption}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {big && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setBig(null)}>
          <figure className="max-h-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <img src={publicUrl(big.image_url)} alt={big.caption || ''} className="max-h-[80vh] rounded-lg" />
            {big.caption && <figcaption className="mt-2 text-center text-white">{big.caption}</figcaption>}
          </figure>
          <button className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 font-bold" onClick={() => setBig(null)}>Close ✕</button>
        </div>
      )}
    </>
  )
}
