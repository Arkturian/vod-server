 

export default function FAQ(){
  return (
    <section className="faq" aria-labelledby="faq-title">
      <div className="faq-inner">
        <h2 id="faq-title">FAQ</h2>
        <details>
          <summary>What's your ideal project? <span className="plus">+</span></summary>
          <p>Anything where nature or real places are augmented with meaning: AR trails, cultural heritage, science exhibits, or experiential product launches.</p>
        </details>
        <details>
          <summary>Do you handle end-to-end? <span className="plus">+</span></summary>
          <p>Yes—concept, UX, 3D, AR build, and film assets. I also collaborate with specialists if the scope demands it.</p>
        </details>
        <details>
          <summary>Can you prototype fast? <span className="plus">+</span></summary>
          <p>Rapidly. I use a modular toolchain (Unity/Three/Blender) and reusable architectures (InterpolatedProperty, Field-Aware Layout).</p>
        </details>
      </div>
    </section>
  )
}

