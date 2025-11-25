import React from 'react'
// @ts-ignore types included after deps install
import { Canvas } from '@react-three/fiber'
import { useAnimationStore } from '../state/useAnimationStore'
import { availableStrategies, createAnimationStrategy } from '../animations/AnimationStrategyFactory'
import type { IAnimationStrategy } from '../animations/strategies/IAnimationStrategy'

const ControlPanel: React.FC = () => {
  const text = useAnimationStore(s => s.text)
  const setText = useAnimationStore(s => s.setText)
  const selectedStrategyId = useAnimationStore(s => s.selectedStrategyId)
  const setStrategy = useAnimationStore(s => s.setStrategy)
  return (
    <div style={{ display:'grid', gap:12, marginBottom:16 }}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Text"
        style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--ring)' }}
      />
      <select
        value={selectedStrategyId}
        onChange={e => setStrategy(e.target.value)}
        style={{ padding:'10px 12px', borderRadius:8, border:'1px solid var(--ring)' }}
      >
        {availableStrategies.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
    </div>
  )
}

const DynamicControls: React.FC<{ strategy: IAnimationStrategy }> = ({ strategy }) => {
  const ControlComponent = strategy.getControlComponent ? strategy.getControlComponent() : null
  return ControlComponent ? (
    <div style={{ marginTop:8 }}>
      <ControlComponent />
    </div>
  ) : null
}

const AnimationRenderer: React.FC = () => {
  const { text, selectedStrategyId } = useAnimationStore()
  const strategy = createAnimationStrategy(selectedStrategyId)
  const AnimationComponent = strategy.getAnimationComponent()
  return <AnimationComponent text={text} />
}

export default function MotionDesignApp(){
  const selectedStrategyId = useAnimationStore(state => state.selectedStrategyId)
  const currentStrategy = createAnimationStrategy(selectedStrategyId)
  return (
    <div className="section" style={{ paddingTop:100 }}>
      <div className="card" style={{ marginBottom:16 }}>
        <h2 className="h2">Motion Design App</h2>
        <ControlPanel />
        <DynamicControls strategy={currentStrategy} />
      </div>
      <div className="card" style={{ height:600 }}>
        <Canvas camera={{ position:[0,0,15], fov:45 }}>
          <ambientLight intensity={0.8} />
          {/* @ts-ignore types after deps */}
          <pointLight position={[10,10,10]} />
          <React.Suspense fallback={null}>
            <AnimationRenderer />
          </React.Suspense>
        </Canvas>
      </div>
    </div>
  )
}

