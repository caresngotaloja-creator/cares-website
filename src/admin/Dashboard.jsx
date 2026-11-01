import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inr } from './utils'

export default function Dashboard() {
  const [c, setC] = useState(null)

  useEffect(() => {
    (async () => {
      const [vol, don, msg, ev, ver] = await Promise.all([
        supabase.from('volunteers').select('id', { count: 'exact', head: true }).eq('status', 'New'),
        supabase.from('donations').select('id', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('donations').select('amount').eq('status', 'Verified'),
      ])
      const total = (ver.data || []).reduce((a, r) => a + Number(r.amount), 0)
      setC({ vol: vol.count, don: don.count, msg: msg.count, ev: ev.count, total })
    })()
  }, [])

  const cards = c && [
    { l: 'New volunteer applications', v: c.vol, to: '/admin/volunteers', tone: 'border-t-brand' },
    { l: 'Donations waiting to be verified', v: c.don, to: '/admin/donations', tone: 'border-t-leaf' },
    { l: 'Unread messages', v: c.msg, to: '/admin/messages', tone: 'border-t-brand' },
    { l: 'Events published', v: c.ev, to: '/admin/events', tone: 'border-t-leaf' },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-1 text-slate-600">A quick look at what needs your attention.</p>
      {!c ? <p className="mt-6">Loading…</p> : (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((x) => (
              <Link key={x.l} to={x.to} className={`card border-t-4 ${x.tone} hover:shadow-md`}>
                <p className="font-display text-4xl font-bold text-brand">{x.v ?? 0}</p>
                <p className="mt-1 text-sm text-slate-700">{x.l}</p>
              </Link>
            ))}
          </div>
          <div className="card mt-4 max-w-sm">
            <p className="text-sm font-bold text-leaf">Total verified donations</p>
            <p className="font-display text-3xl font-bold">{inr(c.total)}</p>
          </div>
        </>
      )}
    </div>
  )
}
