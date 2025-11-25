import React, { useMemo } from 'react'

type TextOnTreadProps = {
  text: string
  durationMs?: number
  fragments?: number
  treadHalfRem?: number
  treadRadiusRem?: number
  sizeEm?: number
  fontSizeEm?: number
  className?: string
  style?: React.CSSProperties
}

function toFixedPct(value: number){
  return `${Number((value * 100).toFixed(3))}%`
}

export default function TextOnTread({
  text,
  durationMs = 8000,
  fragments = 80,
  treadHalfRem = 8,
  treadRadiusRem = 2,
  sizeEm = 20,
  fontSizeEm = 3,
  className,
  style
}: TextOnTreadProps){
  const uniqueId = useMemo(()=> `tot-${Math.random().toString(36).slice(2, 9)}` , [])

  const geometry = useMemo(()=>{
    const treadHalf = treadHalfRem
    const treadRadius = treadRadiusRem
    const treadCircle = 2 * Math.PI * treadRadius
    const treadLength = treadHalf * 4 + treadCircle
    return { treadHalf, treadRadius, treadCircle, treadLength }
  }, [treadHalfRem, treadRadiusRem])

  const fragmentWidthRem = useMemo(()=> geometry.treadLength / fragments, [geometry.treadLength, fragments])

  const keyframesCss = useMemo(()=>{
    const sfx = uniqueId
    const { treadHalf, treadRadius, treadCircle, treadLength } = geometry
    const p1 = toFixedPct(treadHalf / treadLength)
    const p2 = toFixedPct((treadHalf + treadCircle * 0.5) / treadLength)
    const p3 = toFixedPct((treadHalf * 2 + treadCircle * 0.5) / treadLength)
    const p4 = toFixedPct((treadHalf * 3 + treadCircle * 0.5) / treadLength)
    const p5 = toFixedPct((treadHalf * 3 + treadCircle) / treadLength)
    return `
@keyframes letter-tread-back-${sfx} {
  from { transform: translate(-50%, -50%) translateX(0) rotateY(0) translateZ(-${treadRadius}rem); }
  ${p1} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(0) translateZ(-${treadRadius}rem); }
  ${p2} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p3} { transform: translate(-50%, -50%) translateX(0) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p4} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p5} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-360deg) translateZ(-${treadRadius}rem); }
  to   { transform: translate(-50%, -50%) translateX(0) rotateY(-360deg) translateZ(-${treadRadius}rem); }
}
@keyframes letter-tread-front-${sfx} {
  from { transform: translate(-50%, -50%) translateX(0) rotateY(0) translateZ(${treadRadius}rem); }
  ${p1} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(0) translateZ(${treadRadius}rem); }
  ${p2} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p3} { transform: translate(-50%, -50%) translateX(0) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p4} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p5} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-360deg) translateZ(${treadRadius}rem); }
  to   { transform: translate(-50%, -50%) translateX(0) rotateY(-360deg) translateZ(${treadRadius}rem); }
}
`
  }, [geometry, uniqueId])

  const baseCss = useMemo(()=>{
    const sfx = uniqueId
    const root = `.tot-${sfx}`
    return `
${root} { position: relative; width: ${sizeEm}em; height: ${sizeEm}em; perspective: 60rem; }
${root}__layer, ${root}__tread { position: absolute; top: 50%; left: 50%; }
${root}__layer {
  color: transparent;
  direction: ltr;
  font-size: ${fontSizeEm}em;
  font-weight: 900;
  line-height: 1;
  transform: translate(-50%, -50%) rotateX(45deg) rotateZ(45deg);
  transform-style: preserve-3d;
}
${root}__tread { 
  backface-visibility: hidden;
  overflow: hidden;
  height: 100%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  will-change: transform;
  color: var(--back, hsl(223 90% 5%));
}
${root}__tread--back { animation-name: letter-tread-back-${sfx}; animation-timing-function: linear; animation-iteration-count: infinite; }
${root}__tread--front { animation-name: letter-tread-front-${sfx}; animation-timing-function: linear; animation-iteration-count: infinite; color: var(--front, hsl(223 90% 95%)); }
${root}__tread-window::before { content: attr(data-text); display: block; white-space: nowrap; transform: rotateY(180deg); will-change: transform; }
${root}__tread--front ${root}__tread-window::before { transform: rotateY(0); }
`
  }, [uniqueId, sizeEm, fontSizeEm])

  const fragmentsArray = useMemo(()=> Array.from({ length: fragments }, (_, index) => index), [fragments])

  return (
    <div className={`tot-${uniqueId}${className ? ` ${className}` : ''}`} style={style}>
      <style>
        {keyframesCss + baseCss}
      </style>
      <Layer uniqueId={uniqueId} text={text} fragmentsArray={fragmentsArray} durationMs={durationMs} fragmentWidthRem={fragmentWidthRem} isFront={true} />
      <Layer uniqueId={uniqueId} text={text} fragmentsArray={fragmentsArray} durationMs={durationMs} fragmentWidthRem={fragmentWidthRem} isFront={false} />
    </div>
  )
}

type LayerProps = {
  uniqueId: string
  text: string
  fragmentsArray: number[]
  durationMs: number
  fragmentWidthRem: number
  isFront: boolean
}

function Layer({ uniqueId, text, fragmentsArray, durationMs, fragmentWidthRem, isFront }: LayerProps){
  const root = `tot-${uniqueId}`
  return (
    <div className={`${root}__layer`} aria-hidden={!isFront}>
      {text}
      {fragmentsArray.map(index => {
        const percent = index / fragmentsArray.length
        const delay = isFront
          ? -durationMs + ((percent - 0.5) * durationMs)
          : -durationMs + (percent * durationMs)
        const moveXRem = (isFront ? 1 : -1) * (index * fragmentWidthRem)
        const treadStyle: React.CSSProperties = {
          animationName: `letter-tread-${isFront ? 'front' : 'back'}-${uniqueId}`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationDuration: `${durationMs}ms`,
          animationDelay: `${delay}ms`,
          width: `calc(${fragmentWidthRem}rem + 1px)`
        }
        const windowStyle: React.CSSProperties = { transform: `translateX(${moveXRem}rem)` }
        const treadVars: React.CSSProperties = { ['--moveX' as any]: `${moveXRem}rem` }
        return (
          <div key={`${isFront ? 'front' : 'back'}-${index}`} className={`${root}__tread ${root}__tread--${isFront ? 'front' : 'back'}`} style={{...treadStyle, ...treadVars}}>
            <div className={`${root}__tread-window`} aria-hidden={true} data-text={text} style={windowStyle}></div>
          </div>
        )
      })}
    </div>
  )
}

