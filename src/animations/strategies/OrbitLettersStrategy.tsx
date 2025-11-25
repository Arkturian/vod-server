// import * as THREE from 'three'
import React from 'react'
// @ts-ignore
import { Text3D } from '@react-three/drei'
import type { IAnimationStrategy, AnimationComponentProps } from './IAnimationStrategy'
import { useAnimationStore } from '../../state/useAnimationStore'

const FONT_URL = 'https://unpkg.com/three@0.158.0/examples/fonts/helvetiker_regular.typeface.json'

const OrbitLettersAnimation: React.FC<AnimationComponentProps> = ({ text }) => {
  const radius = useAnimationStore(s => (s.config.radius ?? 5) as number)
  const speed = useAnimationStore(s => (s.config.orbitSpeed ?? 0.6) as number)
  const time = (Date.now() % 100000) / 1000

  const letters = text.split('')
  const angleStep = (Math.PI * 2) / Math.max(1, letters.length)

  return (
    <group>
      {letters.map((char, i) => {
        const angle = i * angleStep + time * speed
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        return (
          <Text3D key={`${char}-${i}`} font={FONT_URL} position={[x, 0, z]} size={0.8}>
            {char}
            <meshStandardMaterial color="white" />
          </Text3D>
        )
      })}
    </group>
  )
}

const OrbitControls: React.FC = () => {
  const radius = useAnimationStore(s => (s.config.radius ?? 5) as number)
  const orbitSpeed = useAnimationStore(s => (s.config.orbitSpeed ?? 0.6) as number)
  const setConfig = useAnimationStore(s => s.setConfig)
  return (
    <div style={{ display:'grid', gap:8 }}>
      <label htmlFor="o-radius">Radius</label>
      <input id="o-radius" type="range" min={1} max={15} step={0.5} value={radius}
        onChange={(e)=> setConfig({ radius: parseFloat(e.target.value) })} />

      <label htmlFor="o-speed">Orbit Speed</label>
      <input id="o-speed" type="range" min={0} max={3} step={0.05} value={orbitSpeed}
        onChange={(e)=> setConfig({ orbitSpeed: parseFloat(e.target.value) })} />
    </div>
  )
}

export class OrbitLettersStrategy implements IAnimationStrategy {
  public readonly id = 'orbit'
  public readonly name = 'Orbit Letters'

  public getAnimationComponent(){
    return OrbitLettersAnimation
  }

  public getControlComponent(){
    return OrbitControls
  }
}

