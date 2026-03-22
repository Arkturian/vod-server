import * as THREE from 'three'
import React, { useMemo } from 'react'
// @ts-ignore
import { Text3D } from '@react-three/drei'
import type { IAnimationStrategy, AnimationComponentProps } from './IAnimationStrategy'
import { useAnimationStore } from '../../state/useAnimationStore'

const FONT_URL = '/fonts/helvetiker_regular.typeface.json'

const ChaosToOrderAnimation: React.FC<AnimationComponentProps> = ({ text }) => {
  const progress = useAnimationStore(s => (s.config.progress ?? 0.8) as number)
  const spread = useAnimationStore(s => (s.config.spread ?? 6) as number)

  const letters = text.split('')

  const randomPositions = useMemo(() =>
    letters.map(() => new THREE.Vector3(
      (Math.random() * 2 - 1) * spread,
      (Math.random() * 2 - 1) * spread,
      (Math.random() * 2 - 1) * spread
    )), [letters.length, spread])

  const targetPositions = useMemo(() =>
    letters.map((_, i) => new THREE.Vector3(
      (i - (letters.length - 1) / 2) * 1.2,
      0,
      0
    )), [letters.length])

  return (
    <group>
      {letters.map((char, i) => {
        const rp = randomPositions[i]
        const tp = targetPositions[i]
        const pos = new THREE.Vector3().lerpVectors(rp, tp, THREE.MathUtils.clamp(progress, 0, 1))
        return (
          <Text3D key={`${char}-${i}`} font={FONT_URL} position={pos} size={0.8}>
            {char}
            <meshStandardMaterial color="white" />
          </Text3D>
        )
      })}
    </group>
  )
}

const ChaosControls: React.FC = () => {
  const progress = useAnimationStore(s => (s.config.progress ?? 0.8) as number)
  const spread = useAnimationStore(s => (s.config.spread ?? 6) as number)
  const setConfig = useAnimationStore(s => s.setConfig)
  return (
    <div style={{ display:'grid', gap:8 }}>
      <label htmlFor="c-progress">Fortschritt (Chaos → Ordnung)</label>
      <input id="c-progress" type="range" min={0} max={1} step={0.01} value={progress}
        onChange={(e)=> setConfig({ progress: parseFloat(e.target.value) })} />

      <label htmlFor="c-spread">Streuung</label>
      <input id="c-spread" type="range" min={1} max={12} step={0.5} value={spread}
        onChange={(e)=> setConfig({ spread: parseFloat(e.target.value) })} />
    </div>
  )
}

export class ChaosToOrderStrategy implements IAnimationStrategy {
  public readonly id = 'chaos'
  public readonly name = 'Chaos → Ordnung'

  public getAnimationComponent(){
    return ChaosToOrderAnimation
  }

  public getControlComponent(){
    return ChaosControls
  }
}

