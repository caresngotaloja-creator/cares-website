import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import PublicLayout from './components/PublicLayout.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Volunteer from './pages/Volunteer.jsx'
import EventsGallery from './pages/EventsGallery.jsx'
import Contact from './pages/Contact.jsx'
import { AuthProvider } from './admin/auth.jsx'
import AdminLogin from './admin/Login.jsx'
import AdminLayout from './admin/AdminLayout.jsx'
import Dashboard from './admin/Dashboard.jsx'
import Donations from './admin/Donations.jsx'
import Volunteers from './admin/Volunteers.jsx'
import AdminEvents from './admin/AdminEvents.jsx'
import MessagesSettings from './admin/MessagesSettings.jsx'

const SITE = 'https://cares-taloja.netlify.app'
const NAME = 'C.A.R.E.S. Taloja'
const META = {
  '/': ['Child Development, Rehabilitation and Education NGO in Taloja, Navi Mumbai', 'C.A.R.E.S. (Child n Adult Rehab and Education Society) in Taloja, Panvel supports children with learning and developmental needs, women and senior citizens. Volunteer or donate.'],
  '/about': ['About Us', 'About C.A.R.E.S., Taloja: our vision, mission, programmes for children, women and senior citizens, and the team behind the work.'],
  '/volunteer': ['Volunteer with Us', 'Join C.A.R.E.S. in Taloja as a volunteer. Youth can help with teaching and activities; senior citizens can spend time with children.'],
  '/events': ['Events and Gallery', 'Photos and updates from events and daily activities at the C.A.R.E.S. centre in Taloja, Navi Mumbai.'],
  '/contact': ['Contact Us and Donate', 'Contact C.A.R.E.S. in Taloja, Panvel, find our address and timings, send a message or support our work with a donation.'],
}

function setMeta(sel, attr, val) {
  let el = document.head.querySelector(sel)
  if (!el) { el = document.createElement(sel.startsWith('link') ? 'link' : 'meta'); document.head.appendChild(el) }
  if (sel.startsWith('link')) { el.setAttribute('rel', 'canonical'); el.setAttribute('href', val) }
  else { const m = sel.match(/\[(\w+):?(\w*)="([^"]+)"\]/); el.setAttribute(m[1] + (m[2] ? ':' + m[2] : ''), m[3]); el.setAttribute('content', val) }
}

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
    const m = META[pathname.replace(/\/+$/, '') || '/']
    if (m && !pathname.startsWith('/admin')) {
      const title = pathname === '/' ? `${NAME} | ${m[0]}` : `${m[0]} | ${NAME}`
      document.title = title
      setMeta('meta[name="description"]', 'name', m[1])
      setMeta('meta[property="og:title"]', 'property', title)
      setMeta('meta[property="og:description"]', 'property', m[1])
      setMeta('meta[property="og:url"]', 'property', SITE + (pathname === '/' ? '/' : pathname))
      setMeta('link[rel="canonical"]', 'rel', SITE + (pathname === '/' ? '/' : pathname))
    } else if (pathname.startsWith('/admin')) {
      document.title = 'Staff | ' + NAME
      setMeta('meta[name="robots"]', 'name', 'noindex, nofollow')
    }
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/events" element={<EventsGallery />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path="/admin/*" element={
          <AuthProvider>
            <Routes>
              <Route path="login" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="donations" element={<Donations />} />
                <Route path="volunteers" element={<Volunteers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="messages" element={<MessagesSettings />} />
              </Route>
            </Routes>
          </AuthProvider>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
