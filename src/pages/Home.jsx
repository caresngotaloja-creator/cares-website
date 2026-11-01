import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, configured, publicUrl } from '../lib/supabase'
import { useSettings, fmtDate } from '../lib/settings.jsx'

const WHAT = [
  { t: 'Child development & rehabilitation', d: 'Therapy and support for children with developmental, communication, sensory, motor or learning difficulties, with parent counselling.', c: 'brand' },
  { t: "Women's health & empowerment", d: 'Wellness awareness, fitness, counselling, peer support and skill development for women.', c: 'leaf' },
  { t: 'Senior citizen well-being', d: 'Healthy ageing and social participation, including time spent with children.', c: 'brand' },
]

export default function Home() {
  const { s } = useSettings()
  const [events, setEvents] = useState([])

  useEffect(() => {
    if (!configured) return
    supabase.from('events').select('*').eq('visible', true)
      .order('event_date', { ascending: false }).limit(3)
      .then(({ data }) => setEvents(data || []))
  }, [])

  const stats = [1, 2, 3].map((i) => ({ v: s[`stat${i}_value`], l: s[`stat${i}_label`] })).filter((x) => x.v && x.l)

  return (
    <>
      <section className="bg-gradient-to-br from-brand-soft via-white to-leaf-soft">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wider text-leaf">Taloja, Panvel</p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Every child, every adult, every senior deserves to be cared for.</h1>
            <p className="mt-4 text-lg text-slate-700">{s.tagline}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/volunteer" className="btn-primary">Become a volunteer</Link>
              <Link to="/contact#donate" className="btn-green">Support our work</Link>
            </div>
          </div>
          <div className="flex justify-center">
            <img src="/logo.png" alt="C.A.R.E.S. logo: two hands holding a spine of blue dots" className="w-64 mix-blend-multiply sm:w-80" />
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="border-y border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-center sm:grid-cols-3 sm:px-6">
            {stats.map((x) => (
              <div key={x.l}>
                <p className="font-display text-4xl font-bold text-brand">{x.v}</p>
                <p className="text-sm text-slate-600">{x.l}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <h2 className="text-3xl font-bold">What we do</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {WHAT.map((w) => (
            <div key={w.t} className={`card border-t-4 ${w.c === 'leaf' ? 'border-t-leaf' : 'border-t-brand'}`}>
              <h3 className="text-xl font-bold">{w.t}</h3>
              <p className="mt-2 text-slate-700">{w.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-6"><Link to="/about" className="font-bold text-brand underline">Read more about us →</Link></p>
      </section>

      <section className="bg-slate-50">
        <div className="section">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-bold">Latest events</h2>
            <Link to="/events" className="font-bold text-brand underline">All events & gallery →</Link>
          </div>
          {events.length === 0 ? (
            <p className="mt-4 text-slate-600">New events will be posted here soon.</p>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {events.map((e) => (
                <article key={e.id} className="card overflow-hidden !p-0">
                  {e.image_url && <img src={publicUrl(e.image_url)} alt={e.title} className="h-44 w-full object-cover" loading="lazy" />}
                  <div className="p-5">
                    <p className="text-xs font-bold text-leaf">{fmtDate(e.event_date)}</p>
                    <h3 className="mt-1 text-lg font-bold">{e.title}</h3>
                    <p className="mt-1 line-clamp-3 text-sm text-slate-700">{e.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="rounded-2xl bg-brand-dark p-8 text-white md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="!text-white text-2xl font-bold">We are looking for volunteers</h2>
            <p className="mt-2 max-w-xl text-white/85">Young people can help with teaching and activities. Senior citizens are warmly invited to spend time and interact with our children.</p>
          </div>
          <Link to="/volunteer" className="btn mt-4 bg-white text-brand-dark hover:bg-brand-soft md:mt-0">Join as a volunteer</Link>
        </div>
      </section>
    </>
  )
}
