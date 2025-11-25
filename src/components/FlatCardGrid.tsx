 

type Card = { title:string; subtitle:string; tags?: string[] }

const cards: Card[] = [
  { title:'linkkit', subtitle:'For design conscious people' },
  { title:'Tscheppa-AR Signage', subtitle:'26 stations, QR flows, map UX' },
  { title:'Morph Fields', subtitle:'Resonance-based color and fields' },
  { title:'Arcturian UI', subtitle:'Radial menus, property controls' },
]

export default function FlatCardGrid(){
  return (
    <section className="section" aria-labelledby="flatgrid-title">
      <h2 id="flatgrid-title" className="h2">Featured Layouts</h2>
      <div className="flat-grid">
        {cards.map((c, i)=> (
          <article key={i} className="flat-card" aria-label={c.title}>
            <div className="flat-card-inner">
              <div className="flat-card-title">{c.title}</div>
              <div className="flat-card-sub">{c.subtitle}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

