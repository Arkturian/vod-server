import * as THREE from 'three'
import React, { useMemo } from 'react'
// @ts-ignore
import { Text3D } from '@react-three/drei'
import type { IAnimationStrategy, AnimationComponentProps } from './IAnimationStrategy'
import { useAnimationStore } from '../../state/useAnimationStore'

const FONT_URL = '/fonts/helvetiker_regular.typeface.json'

const WaveFieldAnimation: React.FC<AnimationComponentProps> = ({ text }) => {
  const amp = useAnimationStore(s => (s.config.amplitude ?? 0.9) as number)
  const freq = useAnimationStore(s => (s.config.frequency ?? 1.2) as number)
  const speed = useAnimationStore(s => (s.config.speed ?? 1.5) as number)
  const time = (Date.now() % 100000) / 1000

  const letters = text.split('')
  const positions = useMemo(() => letters.map((_, i) => new THREE.Vector3(i * 1.2, 0, 0)), [letters.length])

  return (
    <group position={[-(letters.length - 1) * 0.6, 0, 0]}>
      {letters.map((char, i) => {
        const base = positions[i]
        const y = Math.sin((i * freq) + time * speed) * amp
        return (
          <Text3D key={`${char}-${i}`} font={FONT_URL} position={[base.x, y, 0]} size={0.8}>
            {char}
            <meshStandardMaterial color="white" />
          </Text3D>
        )
      })}
    </group>
  )
}

const WaveControls: React.FC = () => {
  const amplitude = useAnimationStore(s => (s.config.amplitude ?? 0.9) as number)
  const frequency = useAnimationStore(s => (s.config.frequency ?? 1.2) as number)
  const speed = useAnimationStore(s => (s.config.speed ?? 1.5) as number)
  const setConfig = useAnimationStore(s => s.setConfig)
  return (
    <div style={{ display:'grid', gap:8 }}>
      <label htmlFor="w-amp">Amplitude</label>
      <input id="w-amp" type="range" min={0} max={3} step={0.1} value={amplitude}
        onChange={(e)=> setConfig({ amplitude: parseFloat(e.target.value) })} />

      <label htmlFor="w-freq">Frequenz</label>
      <input id="w-freq" type="range" min={0.2} max={3} step={0.1} value={frequency}
        onChange={(e)=> setConfig({ frequency: parseFloat(e.target.value) })} />

      <label htmlFor="w-speed">Geschwindigkeit</label>
      <input id="w-speed" type="range" min={0} max={5} step={0.1} value={speed}
        onChange={(e)=> setConfig({ speed: parseFloat(e.target.value) })} />
    </div>
  )
}

export class WaveFieldStrategy implements IAnimationStrategy {
  public readonly id = 'wave'
  public readonly name = 'Wave Field'

  public getAnimationComponent(){
    return WaveFieldAnimation
  }

  public getControlComponent(){
    return WaveControls
  }
}

