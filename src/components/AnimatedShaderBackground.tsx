import React, { useMemo } from 'react'

type ShaderVariant = 'default' | 'vivid' | 'metal' | 'silk'

type AnimatedShaderBackgroundProps = {
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  variant?: ShaderVariant
  // Visual params
  speedFactor?: number // Bigger = slower
  saturate?: number
  sepia?: number
  hueDegrees?: number
  hueDurationSec?: number // duration for hue rotate cycle
  brightness?: number // 1 = neutral
  contrast?: number // 1 = neutral
  // Images can be url('...') or gradients (e.g. radial-gradient(...))
  img1?: string
  img2?: string
  img3?: string
  // Advanced overrides
  beforeBlendMode?: React.CSSProperties['mixBlendMode']
  afterBlendMode?: React.CSSProperties['mixBlendMode']
  afterDirection?: 'normal' | 'reverse'
  // Layout
  fill?: 'parent' | 'viewport'
}

const FALLBACK_IMG_1 = 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.25) 0%, rgba(0,0,0,0.0) 60%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.0) 55%), radial-gradient(circle at 30% 70%, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 50%)'
const FALLBACK_IMG_2 = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.25), rgba(0,0,0,0) 60%)'
const FALLBACK_IMG_3 = 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.25), rgba(0,0,0,0) 60%)'

export default function AnimatedShaderBackground({
  children,
  className,
  style,
  variant = 'default',
  speedFactor,
  saturate,
  sepia,
  hueDegrees,
  hueDurationSec = 20,
  brightness,
  contrast,
  img1 = FALLBACK_IMG_1,
  img2 = FALLBACK_IMG_2,
  img3 = FALLBACK_IMG_3,
  beforeBlendMode,
  afterBlendMode,
  afterDirection,
  fill = 'parent'
}: AnimatedShaderBackgroundProps){
  const uid = useMemo(()=> `shader-${Math.random().toString(36).slice(2,9)}`, [])

  // Variant defaults
  const defaults = useMemo(()=>{
    switch(variant){
      case 'vivid':
        return { speedFactor: 2, saturate: 16, sepia: 0, hueDegrees: 360, brightness: 1.45, contrast: 1.3, beforeBlend: 'screen' as const, afterBlend: 'screen' as const, afterDir: 'normal' as const }
      case 'metal':
        return { speedFactor: 7, saturate: 0, sepia: 0, hueDegrees: 0, brightness: 1.0, contrast: 1.0, beforeBlend: 'luminosity' as const, afterBlend: 'color-dodge' as const, afterDir: 'normal' as const }
      case 'silk':
        return { speedFactor: 6, saturate: 10, sepia: 1, hueDegrees: 360, brightness: 1.05, contrast: 1.05, beforeBlend: 'multiply' as const, afterBlend: 'hard-light' as const, afterDir: 'reverse' as const }
      default:
        return { speedFactor: 4, saturate: 6, sepia: 1, hueDegrees: 360, brightness: 1.0, contrast: 1.0, beforeBlend: 'hard-light' as const, afterBlend: 'lighten' as const, afterDir: 'reverse' as const }
    }
  }, [variant])

  const computed = {
    speedFactor: speedFactor ?? defaults.speedFactor,
    saturate: saturate ?? defaults.saturate,
    sepia: sepia ?? defaults.sepia,
    hueDegrees: hueDegrees ?? defaults.hueDegrees,
    beforeBlend: beforeBlendMode ?? defaults.beforeBlend,
    afterBlend: afterBlendMode ?? defaults.afterBlend,
    afterDir: afterDirection ?? defaults.afterDir,
    brightness: brightness ?? (defaults as any).brightness,
    contrast: contrast ?? (defaults as any).contrast
  }

  const durBefore = 1 * computed.speedFactor
  const durAfter = 2.5 * computed.speedFactor

  const css = useMemo(()=>{
    const root = `.shader-${uid}`
    const spin = `spin-${uid}`
    const hue = `hue-${uid}`
    return `
${root}{ position:relative; overflow:hidden; background-image: var(--img-1); background-position:center; background-size:cover; animation: ${hue} ${hueDurationSec}s linear infinite; }
${root} > * { position:relative; z-index:3; }
${root}::before, ${root}::after{ content:''; position:absolute; inset:-100%; z-index:1; background-size:cover; aspect-ratio:1; pointer-events:none; animation: ${spin} ${durBefore}s linear infinite; }
${root}::before{ mix-blend-mode: ${computed.beforeBlend}; background-image: var(--img-2); }
${root}::after{ z-index:2; mix-blend-mode: ${computed.afterBlend}; background-image: var(--img-3); animation-duration: ${durAfter}s; animation-direction: ${computed.afterDir}; }
@keyframes ${spin}{ to{ transform: rotate(360deg) } }
@keyframes ${hue}{ from{ filter: saturate(var(--saturate)) contrast(var(--contrast)) brightness(var(--brightness)) sepia(var(--sepia)) hue-rotate(0deg) } to{ filter: saturate(var(--saturate)) contrast(var(--contrast)) brightness(var(--brightness)) sepia(var(--sepia)) hue-rotate(var(--hue)) } }
`
  }, [uid, hueDurationSec, durBefore, durAfter, computed.beforeBlend, computed.afterBlend, computed.afterDir])

  const containerStyle: React.CSSProperties = {
    ...(style || {}),
    ['--speed-factor' as any]: computed.speedFactor,
    ['--saturate' as any]: computed.saturate,
    ['--sepia' as any]: computed.sepia,
    ['--hue' as any]: `${computed.hueDegrees}deg`,
    ['--brightness' as any]: computed.brightness ?? 1,
    ['--contrast' as any]: computed.contrast ?? 1,
    ['--img-1' as any]: img1,
    ['--img-2' as any]: img2,
    ['--img-3' as any]: img3,
    width: fill === 'viewport' ? '100vw' : undefined,
    minHeight: fill === 'viewport' ? '100vh' : undefined
  }

  return (
    <div className={`shader-${uid}${className ? ` ${className}` : ''}`} style={containerStyle}>
      <style>{css}</style>
      {children}
    </div>
  )
}

