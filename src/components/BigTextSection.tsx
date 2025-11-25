 

export default function BigTextSection(){
  return (
    <section className="section" aria-labelledby="bigtext-title">
      <div className="card" style={{ textAlign:'center' }}>
        <h2 id="bigtext-title" className="h2" style={{ fontSize:'clamp(28px,6vw,56px)'}}>
          Built by designers, for you.
        </h2>
        <p className="muted" style={{ fontSize:'clamp(16px,3.6vw,24px)', maxWidth:800, margin:'0 auto' }}>
          I promote your online initiatives in the most visually engaging way <span style={{color:'#99a'}}>
          possible, to help you stand out online.</span>
        </p>
      </div>
    </section>
  )
}

