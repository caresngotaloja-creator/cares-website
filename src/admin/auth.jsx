import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, configured } from '../lib/supabase'

const Ctx = createContext(null)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }) {
  const [state, setState] = useState({ loading: true, user: null, role: null })

  async function resolve(session) {
    const user = session?.user ?? null
    if (!user) return setState({ loading: false, user: null, role: null })
    const { data } = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle()
    setState({ loading: false, user, role: data?.role ?? null })
  }

  useEffect(() => {
    if (!configured) return setState({ loading: false, user: null, role: null })
    supabase.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => resolve(session))
    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  return <Ctx.Provider value={{ ...state, signIn, signOut }}>{children}</Ctx.Provider>
}
