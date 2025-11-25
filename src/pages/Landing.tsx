 
import HeroDualPhones from '../components/HeroDualPhones'
import BigTextSection from '../components/BigTextSection'
import FlatCardGrid from '../components/FlatCardGrid'
import FAQ from '../components/FAQ'

export default function Landing(){
  return (
    <main role="main">
      <HeroDualPhones />
      <section id="work" className="section" aria-labelledby="work-title">
        <h2 id="work-title" className="h2">Selected Work</h2>
        <p className="muted">A few deep dives into recent builds and experiments.</p>
        {/* Keep existing cards from App if needed later */}
      </section>
      <BigTextSection />
      <FlatCardGrid />
      <FAQ />
    </main>
  )
}

