import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { PageHeader, Notice, Field, Honeypot } from '../components/UI.jsx'
import { supabase, configured, publicUrl } from '../lib/supabase'
import { useSettings, digits } from '../lib/settings.jsx'

function ContactForm() {
  const [f, setF] = useState({ name: '', email: '', phone: '', message: '' })
  const [trap, setTrap] = useState('')
  const [st, setSt] = useState({ busy: false, ok: false, err: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (trap) return setSt({ busy: false, ok: true, err: '' })
    if (!configured) return setSt({ busy: false, ok: false, err: 'The form is not connected yet (preview mode).' })
    setSt({ busy: true, ok: false, err: '' })
    const { error } = await supabase.from('messages').insert({
      name: f.name.trim(), email: f.email.trim() || null, phone: f.phone.trim() || null, message: f.message.trim(),
    })
    if (error) setSt({ busy: false, ok: false, err: 'Sorry, your message could not be sent. Please try again.' })
    else { setSt({ busy: false, ok: true, err: '' }); setF({ name: '', email: '', phone: '', message: '' }) }
  }

  return (
    <form onSubmit={submit} className="card relative space-y-4">
      <h3 className="text-xl font-bold">Send us a message</h3>
      {st.ok && <Notice type="ok">Thank you! Your message has been sent.</Notice>}
      {st.err && <Notice type="err">{st.err}</Notice>}
      <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
      <Field label="Your name *"><input required className="field" value={f.name} onChange={set('name')} maxLength={100} autoComplete="name" /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email"><input type="email" className="field" value={f.email} onChange={set('email')} maxLength={120} autoComplete="email" /></Field>
        <Field label="Phone"><input type="tel" className="field" value={f.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" /></Field>
      </div>
      <Field label="Message *"><textarea required rows="4" className="field" value={f.message} onChange={set('message')} maxLength={2000} /></Field>
      <button className="btn-primary" disabled={st.busy}>{st.busy ? 'Sending…' : 'Send message'}</button>
    </form>
  )
}

function DonationRecord() {
  const [f, setF] = useState({ donor_name: '', amount: '', reference: '' })
  const [trap, setTrap] = useState('')
  const [st, setSt] = useState({ busy: false, ok: false, err: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    if (trap) return setSt({ busy: false, ok: true, err: '' })
    if (!configured) return setSt({ busy: false, ok: false, err: 'The form is not connected yet (preview mode).' })
    setSt({ busy: true, ok: false, err: '' })
    const { error } = await supabase.from('donations').insert({
      donor_name: f.donor_name.trim(), amount: Number(f.amount), reference: f.reference.trim() || null,
      method: 'UPI/Bank', source: 'online', status: 'Pending',
    })
    if (error) setSt({ busy: false, ok: false, err: 'Sorry, we could not record this. Your donation is safe with the NGO; please try again later.' })
    else { setSt({ busy: false, ok: true, err: '' }); setF({ donor_name: '', amount: '', reference: '' }) }
  }

  return (
    <form onSubmit={submit} className="card relative space-y-4">
      <h3 className="text-xl font-bold">I have donated</h3>
      <p className="text-sm text-slate-600">After paying, you can tell us so the team can thank you and match it with their records. This is optional.</p>
      {st.ok && <Notice type="ok">Thank you for your support! The team will verify and note your donation.</Notice>}
      {st.err && <Notice type="err">{st.err}</Notice>}
      <Honeypot value={trap} onChange={(e) => setTrap(e.target.value)} />
      <Field label="Your name *"><input required className="field" value={f.donor_name} onChange={set('donor_name')} maxLength={100} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Amount (₹) *"><input required type="number" min="1" step="1" className="field" value={f.amount} onChange={set('amount')} /></Field>
        <Field label="UPI / transaction reference" hint="Optional"><input className="field" value={f.reference} onChange={set('reference')} maxLength={60} /></Field>
      </div>
      <button className="btn-green" disabled={st.busy}>{st.busy ? 'Saving…' : 'Let us know'}</button>
    </form>
  )
}

export default function Contact() {
  const { s } = useSettings()
  const { hash } = useLocation()
  const [copied, setCopied] = useState(false)
  const wa = digits(s.whatsapp || s.phone)
  const hasDonation = s.upi_id || s.qr_url || s.bank_details

  useEffect(() => {
    if (hash === '#donate') setTimeout(() => document.getElementById('donate')?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [hash])

  const copy = async () => {
    try { await navigator.clipboard.writeText(s.upi_id); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }
  const upiLink = s.upi_id ? `upi://pay?pa=${encodeURIComponent(s.upi_id)}&pn=${encodeURIComponent(s.upi_name || s.org_name)}&cu=INR` : ''

  return (
    <>
      <PageHeader title="Contact Us & Donations" intro="We would love to hear from you. Reach out to visit the centre, ask about our services, volunteer or support our work." />

      <section className="section grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <div className="card">
            <h2 className="text-2xl font-bold">Get in touch</h2>
            <dl className="mt-4 space-y-3">
              <div><dt className="text-sm font-bold text-leaf">Address</dt><dd>{s.address}</dd></div>
              {s.timings && <div><dt className="text-sm font-bold text-leaf">Timings</dt><dd className="whitespace-pre-line">{s.timings}</dd></div>}
              <div><dt className="text-sm font-bold text-leaf">Phone</dt><dd>{s.phone ? <a className="text-brand underline" href={`tel:${s.phone}`}>{s.phone}</a> : 'Will be added soon'}</dd></div>
              <div><dt className="text-sm font-bold text-leaf">Email</dt><dd><a className="text-brand underline" href={`mailto:${s.email}`}>{s.email}</a></dd></div>
            </dl>
            {wa && (
              <a className="btn-green mt-5" target="_blank" rel="noreferrer" href={`https://wa.me/${wa.length === 10 ? '91' + wa : wa}`}>Chat on WhatsApp</a>
            )}
          </div>
          {s.map_embed ? (
            <iframe title="Map of C.A.R.E.S." src={s.map_embed} className="h-64 w-full rounded-2xl border border-slate-200" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          ) : (
            <a className="btn-outline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/${encodeURIComponent(s.address)}`}>Open in Google Maps</a>
          )}
        </div>
        <ContactForm />
      </section>

      <section id="donate" className="bg-leaf-soft scroll-mt-20">
        <div className="section">
          <h2 className="text-3xl font-bold">Support our work</h2>
          <p className="mt-2 max-w-3xl text-slate-700">
            Donations are optional and go directly to the NGO's own account. We do not use any payment gateway, so there are no extra charges.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="card space-y-4">
              <h3 className="text-xl font-bold">How to donate</h3>
              {!hasDonation && <Notice type="warn">Donation details will be added soon. Please contact the centre directly to donate.</Notice>}
              {s.qr_url && (
                <div className="text-center">
                  <img src={publicUrl(s.qr_url)} alt="UPI QR code to donate" className="mx-auto w-48 rounded-lg border border-slate-200 p-2" />
                  <p className="mt-1 text-xs text-slate-500">Scan with any UPI app</p>
                </div>
              )}
              {s.upi_id && (
                <div>
                  <p className="text-sm font-bold text-leaf">UPI ID</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="rounded bg-slate-100 px-2 py-1">{s.upi_id}</code>
                    <button onClick={copy} className="btn-outline btn-sm">{copied ? 'Copied ✓' : 'Copy'}</button>
                    <a href={upiLink} className="btn-primary btn-sm sm:hidden">Pay with UPI app</a>
                  </div>
                </div>
              )}
              {s.bank_details && (
                <div>
                  <p className="text-sm font-bold text-leaf">Bank transfer</p>
                  <pre className="whitespace-pre-wrap rounded bg-slate-100 p-3 font-sans text-sm">{s.bank_details}</pre>
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-leaf">How your money is used</p>
                <p className="text-sm text-slate-700">{s.donation_use || 'Details will be added soon.'}</p>
              </div>
            </div>
            <DonationRecord />
          </div>
        </div>
      </section>
    </>
  )
}
