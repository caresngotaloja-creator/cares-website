import { PageHeader } from '../components/UI.jsx'
import { useSettings } from '../lib/settings.jsx'

const PROGRAMMES = [
  {
    t: 'Child development and rehabilitation',
    sub: 'Sai Therapy Centre and Superkids Child Development Centre',
    d: 'Support for children with developmental, communication, behavioural, sensory, motor or learning difficulties. Services include physiotherapy, occupational therapy, speech and language therapy, remedial education, parent counselling and school-readiness support.',
  },
  {
    t: "Women's health and empowerment",
    sub: 'Kusum Sangini',
    d: 'Wellness awareness, exercise and fitness, counselling and peer support, skill development, personality development and livelihood support for women.',
  },
  {
    t: 'Senior citizen well-being',
    sub: '',
    d: 'Encouraging healthy ageing and social participation.',
  },
]

export default function About() {
  const { s } = useSettings()
  return (
    <>
      <PageHeader title="About Us" intro={`${s.org_full_name} (C.A.R.E.S.) is a community-focused organisation in Taloja, Panvel.`} />

      <section className="section">
        <p className="max-w-3xl text-lg text-slate-700">
          C.A.R.E.S. works for the development, rehabilitation, education and empowerment of children and adults, with special emphasis on women, children with developmental needs, families who need support, and senior citizens.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="card border-l-4 border-l-brand">
            <h2 className="text-2xl font-bold">Our vision</h2>
            <p className="mt-2 text-slate-700">An inclusive and compassionate society where every child, adult, woman and senior citizen can live with dignity and independence.</p>
          </div>
          <div className="card border-l-4 border-l-leaf">
            <h2 className="text-2xl font-bold">Our mission</h2>
            <p className="mt-2 text-slate-700">To promote child development, rehabilitation, education, women's empowerment and senior wellness through accessible services, professional support, awareness, training and community participation.</p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="section">
          <h2 className="text-3xl font-bold">Our programmes</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {PROGRAMMES.map((p) => (
              <article key={p.t} className="card">
                <h3 className="text-xl font-bold">{p.t}</h3>
                {p.sub && <p className="mt-1 text-sm font-bold text-leaf">{p.sub}</p>}
                <p className="mt-2 text-slate-700">{p.d}</p>
              </article>
            ))}
          </div>
          <p className="mt-6 max-w-3xl text-slate-700">
            Parents are asked to pay only minimal charges so that the centre can keep running. Academic support for children is also offered.
          </p>
        </div>
      </section>

      <section className="section">
        <h2 className="text-3xl font-bold">Our team</h2>
        <p className="mt-3 max-w-3xl text-slate-700">
          C.A.R.E.S. is run by <strong>Ms. Sangeeta</strong> together with a team of therapists, including <strong>Ms. Shabnam</strong>. Photos and short profiles of the team can be added here by the staff.
        </p>
      </section>

      <section className="bg-leaf-soft">
        <div className="section">
          <h2 className="text-3xl font-bold">Trust and transparency</h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="card"><dt className="text-sm font-bold text-leaf">Registration</dt><dd className="mt-1">{s.registration || 'Details will be added soon.'}</dd></div>
            <div className="card"><dt className="text-sm font-bold text-leaf">80G tax-exemption</dt><dd className="mt-1">{s.tax_80g || 'Details will be added soon.'}</dd></div>
            <div className="card sm:col-span-2"><dt className="text-sm font-bold text-leaf">How donations are used</dt><dd className="mt-1">{s.donation_use || 'Details will be added soon.'}</dd></div>
          </dl>
        </div>
      </section>
    </>
  )
}
