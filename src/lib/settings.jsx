import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, configured } from './supabase'

/** Default values. The admin can change every one of these from Admin > Messages & Settings. */
export const DEFAULTS = {
  org_name: 'C.A.R.E.S.',
  org_full_name: 'Child n Adult Rehab and Education Society',
  tagline: 'Care, rehabilitation and education for children, women and senior citizens in Taloja.',
  email: 'caresngo.taloja@gmail.com',
  phone: '',
  whatsapp: '',
  address: 'Taloja, Panvel, Maharashtra',
  timings: '',
  map_embed: '',
  upi_id: '',
  upi_name: '',
  qr_url: '',
  bank_details: '',
  registration: '',
  tax_80g: '',
  donation_use: '',
  stat1_value: '', stat1_label: '',
  stat2_value: '', stat2_label: '',
  stat3_value: '', stat3_label: '',
}

const Ctx = createContext({ s: DEFAULTS, reload: () => {} })
export const useSettings = () => useContext(Ctx)

export function SettingsProvider({ children }) {
  const [s, setS] = useState(DEFAULTS)

  const load = async () => {
    if (!configured) return
    const { data } = await supabase.from('settings').select('key,value')
    if (data) {
      const next = { ...DEFAULTS }
      data.forEach((r) => { if (r.value !== null && r.value !== '') next[r.key] = r.value })
      setS(next)
    }
  }
  useEffect(() => { load() }, [])

  return <Ctx.Provider value={{ s, reload: load }}>{children}</Ctx.Provider>
}

export const digits = (v) => (v || '').replace(/\D/g, '')
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
