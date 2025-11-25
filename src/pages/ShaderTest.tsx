import { useMemo, useState } from 'react'
import AnimatedShaderBackground from '../components/AnimatedShaderBackground'

export default function ShaderTest(){
  const [variant, setVariant] = useState<'default'|'vivid'|'metal'|'silk'>('default')
  const [speedFactor, setSpeedFactor] = useState(4)
  const [saturate, setSaturate] = useState(6)
  const [sepia, setSepia] = useState(1)
  const [hueDegrees, setHueDegrees] = useState(360)
  const [hueDurationSec, setHueDurationSec] = useState(20)
  const [brightness, setBrightness] = useState(1.45)
  const [contrast, setContrast] = useState(1.3)
  const [beforeBlendMode, setBeforeBlendMode] = useState<React.CSSProperties['mixBlendMode']>('hard-light')
  const [afterBlendMode, setAfterBlendMode] = useState<React.CSSProperties['mixBlendMode']>('lighten')
  const [afterDirection, setAfterDirection] = useState<'normal'|'reverse'>('reverse')

  const blendOptions = useMemo(()=>[
    'normal','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'
  ] as React.CSSProperties['mixBlendMode'][] , [])

  return (
    <main style={{ minHeight:'100vh' }}>
      {/* Full-page background */}
      <AnimatedShaderBackground
        variant={variant}
        speedFactor={speedFactor}
        saturate={saturate}
        sepia={sepia}
        hueDegrees={hueDegrees}
        hueDurationSec={hueDurationSec}
        brightness={brightness}
        contrast={contrast}
        beforeBlendMode={beforeBlendMode}
        afterBlendMode={afterBlendMode}
        afterDirection={afterDirection}
        fill="viewport"
        style={{ position:'fixed', inset:0, zIndex:0 }}
      />

      {/* Control panel */}
      <div style={{ position:'relative', zIndex:1, display:'grid', placeItems:'center', minHeight:'100vh' }}>
        <div style={{ width:'min(720px, 92vw)', background:'color-mix(in lch, white, black 10%)', backdropFilter:'blur(10px)', border:'1px solid color-mix(in lch, black, white 80%)', borderRadius:12, padding:'1.25rem', boxShadow:'0 10px 30px rgba(0,0,0,0.25)' }}>
          <h2 style={{ margin:'0 0 1rem 0' }}>Shader Background Controls</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))', gap:'0.75rem 1rem' }}>
            <label style={{ display:'grid', gap:6 }}>
              <span>Variant</span>
              <select value={variant} onChange={e=> setVariant(e.target.value as any)}>
                <option value="default">default</option>
                <option value="vivid">vivid</option>
                <option value="metal">metal</option>
                <option value="silk">silk</option>
              </select>
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Brightness ({brightness.toFixed(2)})</span>
              <input type="range" min={0.5} max={2} step={0.05} value={brightness} onChange={e=> setBrightness(parseFloat(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Contrast ({contrast.toFixed(2)})</span>
              <input type="range" min={0.5} max={2} step={0.05} value={contrast} onChange={e=> setContrast(parseFloat(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Speed factor ({speedFactor})</span>
              <input type="range" min={1} max={12} step={1} value={speedFactor} onChange={e=> setSpeedFactor(parseInt(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Saturate ({saturate})</span>
              <input type="range" min={0} max={12} step={1} value={saturate} onChange={e=> setSaturate(parseInt(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Sepia ({sepia})</span>
              <input type="range" min={0} max={10} step={1} value={sepia} onChange={e=> setSepia(parseInt(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Hue degrees ({hueDegrees}°)</span>
              <input type="range" min={0} max={720} step={10} value={hueDegrees} onChange={e=> setHueDegrees(parseInt(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Hue cycle duration (s) ({hueDurationSec})</span>
              <input type="range" min={0} max={60} step={1} value={hueDurationSec} onChange={e=> setHueDurationSec(parseInt(e.target.value))} />
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>Before blend</span>
              <select value={beforeBlendMode} onChange={e=> setBeforeBlendMode(e.target.value as any)}>
                {blendOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>After blend</span>
              <select value={afterBlendMode} onChange={e=> setAfterBlendMode(e.target.value as any)}>
                {blendOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6 }}>
              <span>After direction</span>
              <select value={afterDirection} onChange={e=> setAfterDirection(e.target.value as any)}>
                <option value="normal">normal</option>
                <option value="reverse">reverse</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </main>
  )
}

