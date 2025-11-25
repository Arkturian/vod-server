import TextOnTreadIsolated from '../components/TextOnTreadIsolated'

export default function TreadTest(){
  return (
    <main style={{ minHeight:'100vh', display:'grid', placeItems:'center', gap:'2rem', padding:'2rem' }}>
      <div style={{ display:'grid', gap:'2rem' }}>
        <div style={{ display:'grid', placeItems:'center' }}>
          <TextOnTreadIsolated text="RESILIENCE" />
        </div>
      </div>
    </main>
  )
}

