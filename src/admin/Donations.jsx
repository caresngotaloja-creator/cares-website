import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Notice, Field } from '../components/UI.jsx'
import { downloadCSV, dt, inr } from './utils'

const TONE = { Pending: 'bg-amber-100 text-amber-800', Verified: 'bg-leaf-soft text-leaf-dark', Rejected: 'bg-red-100 text-red-800' }
const blank = { donor_name: '', amount: '', reference: '', method: 'Cash', note: '' }

export default function Donations() {
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('All')
  const [f, setF] = useState(blank)
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false })
    setRows(data || [])
  }, [])
  useEffect(() => { load() }, [load])

  const setStatus = async (id, status) => {
    const { error } = await supabase.from('donations').update({ status }).eq('id', id)
    if (error) setMsg({ t: 'err', m: error.message }); else load()
  }
  const remove = async (id) => {
    if (!confirm('Delete this donation record?')) return
    await supabase.from('donations').delete().eq('id', id); load()
  }
  async function add(e) {
    e.preventDefault()
    const { error } = await supabase.from('donations').insert({
      donor_name: f.donor_name.trim(), amount: Number(f.amount), reference: f.reference.trim() || null,
      method: f.method, note: f.note.trim() || null, source: 'manual', status: 'Verified',
    })
    if (error) setMsg({ t: 'err', m: error.message })
    else { setMsg({ t: 'ok', m: 'Donation added.' }); setF(blank); load() }
  }

  const shown = rows.filter((r) => filter === 'All' || r.status === filter)
  const verified = rows.filter((r) => r.status === 'Verified')
  const total = verified.reduce((a, r) => a + Number(r.amount), 0)
  const byMonth = {}
  verified.forEach((r) => {
    const k = new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    byMonth[k] = (byMonth[k] || 0) + Number(r.amount)
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Donations</h1>
      <Notice>
        Donations go straight to the NGO's own UPI/bank account. Check your bank statement, then mark each entry below as <b>Verified</b>. Only verified entries are counted in totals.
      </Notice>
      {msg && <Notice type={msg.t}>{msg.m}</Notice>}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="text-sm font-bold text-leaf">Verified total</p><p className="font-display text-3xl font-bold">{inr(total)}</p></div>
        <div className="card"><p className="text-sm font-bold text-leaf">Pending</p><p className="font-display text-3xl font-bold">{rows.filter((r) => r.status === 'Pending').length}</p></div>
        <div className="card">
          <p className="text-sm font-bold text-leaf">By month (verified)</p>
          <ul className="text-sm">{Object.entries(byMonth).slice(0, 4).map(([k, v]) => <li key={k}>{k}: {inr(v)}</li>)}{!Object.keys(byMonth).length && <li>No data yet</li>}</ul>
        </div>
      </div>

      <form onSubmit={add} className="card grid gap-3 sm:grid-cols-6">
        <h2 className="text-lg font-bold sm:col-span-6">Add a donation manually (cash, bank, cheque)</h2>
        <div className="sm:col-span-2"><Field label="Donor name *"><input required className="field" value={f.donor_name} onChange={(e) => setF({ ...f, donor_name: e.target.value })} /></Field></div>
        <div><Field label="Amount (₹) *"><input required type="number" min="1" className="field" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field></div>
        <div><Field label="Method"><select className="field" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}><option>Cash</option><option>UPI</option><option>Bank transfer</option><option>Cheque</option></select></Field></div>
        <div className="sm:col-span-2"><Field label="Reference / note"><input className="field" value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} /></Field></div>
        <div className="sm:col-span-6"><button className="btn-green">Add donation</button></div>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        {['All', 'Pending', 'Verified', 'Rejected'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`btn-sm btn ${filter === s ? 'bg-brand text-white' : 'border border-slate-300 bg-white'}`}>{s}</button>
        ))}
        <button className="btn-outline btn-sm ml-auto" onClick={() => downloadCSV('donations.csv', shown.map((r) => ({
          Date: dt(r.created_at), Donor: r.donor_name, Amount: r.amount, Method: r.method, Reference: r.reference, Source: r.source, Status: r.status, Note: r.note })))}>Download CSV</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase"><tr>{['Date', 'Donor', 'Amount', 'Reference', 'Source', 'Status', ''].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 align-top">
                <td className="px-3 py-2 whitespace-nowrap">{dt(r.created_at)}</td>
                <td className="px-3 py-2">{r.donor_name}</td>
                <td className="px-3 py-2 font-bold">{inr(r.amount)}</td>
                <td className="px-3 py-2">{r.reference}{r.note && <div className="text-xs text-slate-500">{r.note}</div>}</td>
                <td className="px-3 py-2">{r.source === 'manual' ? r.method : 'Website'}</td>
                <td className="px-3 py-2"><span className={`badge ${TONE[r.status]}`}>{r.status}</span></td>
                <td className="px-3 py-2 whitespace-nowrap">
                  {r.status !== 'Verified' && <button className="btn-green btn-sm mr-1" onClick={() => setStatus(r.id, 'Verified')}>Verify</button>}
                  {r.status === 'Pending' && <button className="btn-outline btn-sm mr-1" onClick={() => setStatus(r.id, 'Rejected')}>Reject</button>}
                  <button className="btn-danger btn-sm" onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!shown.length && <tr><td colSpan="7" className="px-3 py-6 text-center text-slate-500">No donations here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
