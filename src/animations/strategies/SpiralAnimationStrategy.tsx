import * as THREE from 'three'
import React, { useMemo, useRef } from 'react'
// @ts-ignore: types will be present after deps install
import { useFrame } from '@react-three/fiber'
// @ts-ignore: types will be present after deps install
import { Text3D } from '@react-three/drei'
import type { IAnimationStrategy, AnimationComponentProps } from './IAnimationStrategy'
import { useAnimationStore } from '../../state/useAnimationStore'

const SpiralAnimation: React.FC<AnimationComponentProps> = ({ text }) => {
  const groupRef = useRef<THREE.Group>(null!)
  const tightness = useAnimationStore(state => state.config.tightness ?? 5)

  const curve = useMemo(() => new THREE.CatmullRomCurve3(
    Array.from({ length: Math.max(text.length, 10) }).map((_, i) => 
      new THREE.Vector3(
        Math.sin(i * 0.5) * tightness,
        (i - 5),
        Math.cos(i * 0.5) * tightness
      )
    )
  ), [tightness, text.length])

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3
    }
  })

  return (
    <group ref={groupRef}>
      {text.split('').map((char, index) => (
        <Text3D
          key={index}
          font={'https://unpkg.com/three@0.158.0/examples/fonts/helvetiker_regular.typeface.json'}
          position={curve.getPoint(index / Math.max(1, (text.length - 1)))}
          size={0.8}
        >
          {char}
          <meshStandardMaterial color="white" />
        </Text3D>
      ))}
    </group>
  )
}

const SpiralControls: React.FC = () => {
  const tightness = useAnimationStore(state => state.config.tightness ?? 5)
  const setConfig = useAnimationStore(state => state.setConfig)
  return (
    <div style={{ display:'grid', gap:8 }}>
      <label htmlFor="tightness">Spiralen-Enge</label>
      <input
        id="tightness"
        type="range"
        min={1}
        max={15}
        value={tightness}
        onChange={(e) => setConfig({ tightness: parseFloat(e.target.value) })}
      />
    </div>
  )
}

export class SpiralAnimationStrategy implements IAnimationStrategy {
  public readonly id = 'spiral'
  public readonly name = '3D Spirale'

  public getAnimationComponent(){
    return SpiralAnimation
  }

  public getControlComponent(){
    return SpiralControls
  }
}