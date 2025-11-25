import React, { useMemo } from 'react'

type Props = {
  text: string
  durationMs?: number
  fragments?: number
  className?: string
  style?: React.CSSProperties
}

function toFixedPct(value: number){
  return `${Number((value * 100).toFixed(3))}%`
}

export default function TextOnTreadCodepen({
  text,
  durationMs = 8000,
  fragments = 80,
  className,
  style
}: Props){
  // Geometry constants from the CodePen SCSS
  const treadHalf = 8
  const treadRadius = 2
  const treadCircle = 2 * Math.PI * treadRadius
  const treadLength = treadHalf * 4 + treadCircle

  const fragmentWidthRem = useMemo(()=> treadLength / fragments, [treadLength, fragments])

  const keyframesCss = useMemo(()=>{
    const p1 = toFixedPct(treadHalf / treadLength)
    const p2 = toFixedPct((treadHalf + treadCircle * 0.5) / treadLength)
    const p3 = toFixedPct((treadHalf * 2 + treadCircle * 0.5) / treadLength)
    const p4 = toFixedPct((treadHalf * 3 + treadCircle * 0.5) / treadLength)
    const p5 = toFixedPct((treadHalf * 3 + treadCircle) / treadLength)
    return `
@keyframes letter-tread-back {
  from { transform: translate(-50%, -50%) translateX(0) rotateY(0) translateZ(-${treadRadius}rem); }
  ${p1} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(0) translateZ(-${treadRadius}rem); }
  ${p2} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p3} { transform: translate(-50%, -50%) translateX(0) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p4} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-180deg) translateZ(-${treadRadius}rem); }
  ${p5} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-360deg) translateZ(-${treadRadius}rem); }
  to   { transform: translate(-50%, -50%) translateX(0) rotateY(-360deg) translateZ(-${treadRadius}rem); }
}
@keyframes letter-tread-front {
  from { transform: translate(-50%, -50%) translateX(0) rotateY(0) translateZ(${treadRadius}rem); }
  ${p1} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(0) translateZ(${treadRadius}rem); }
  ${p2} { transform: translate(-50%, -50%) translateX(-${treadHalf}rem) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p3} { transform: translate(-50%, -50%) translateX(0) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p4} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-180deg) translateZ(${treadRadius}rem); }
  ${p5} { transform: translate(-50%, -50%) translateX(${treadHalf}rem) rotateY(-360deg) translateZ(${treadRadius}rem); }
  to   { transform: translate(-50%, -50%) translateX(0) rotateY(-360deg) translateZ(${treadRadius}rem); }
}
`}, [treadCircle, treadHalf, treadLength, treadRadius])

  const baseCss = `
.tot { position: relative; width: 20em; height: 20em; perspective: 60rem; }
.tot__layer, .tot__tread { position: absolute; top: 50%; left: 50%; }
.tot__layer {
  color: transparent;
  direction: ltr;
  font-size: 3em;
  font-weight: 900;
  line-height: 1;
  transform: translate(-50%, -50%) rotateX(45deg) rotateZ(45deg);
  transform-style: preserve-3d;
}
.tot__tread {
  animation-name: letter-tread-back;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
  backface-visibility: hidden;
  color: var(--back, hsl(223 90% 5%));
  overflow: hidden;
  height: 100%;
  transform: translate(-50%, -50%);
  transform-style: preserve-3d;
  transition: color var(--trans-dur, 0.3s);
}
.tot__tread-window::before { content: attr(data-text); display: block; white-space: nowrap; transform: rotateY(180deg); }
.tot__layer--front .tot__tread { animation-name: letter-tread-front; color: var(--front, hsl(223 90% 95%)); }
.tot__layer--front .tot__tread-window::before { transform: rotateY(0); }
`

  const fragmentsArray = useMemo(()=> Array.from({ length: fragments }, (_, i)=> i), [fragments])

  return (
    <div className={`tot${className ? ` ${className}` : ''}`} style={style}>
      <style>{keyframesCss + baseCss}</style>
      <Layer text={text} fragmentsArray={fragmentsArray} durationMs={durationMs} fragmentWidthRem={fragmentWidthRem} isFront={false} />
      <Layer text={text} fragmentsArray={fragmentsArray} durationMs={durationMs} fragmentWidthRem={fragmentWidthRem} isFront={true} />
    </div>
  )
}

type LayerProps = {
  text: string
  fragmentsArray: number[]
  durationMs: number
  fragmentWidthRem: number
  isFront: boolean
}

function Layer({ text, fragmentsArray, durationMs, fragmentWidthRem, isFront }: LayerProps){
  return (
    <div className={`tot__layer${isFront ? ' tot__layer--front' : ''}`} aria-hidden={!isFront}>
      {text}
      {fragmentsArray.map(index => {
        const percent = index / fragmentsArray.length
        const delay = isFront
          ? -durationMs + ((percent - 0.5) * durationMs)
          : -durationMs + (percent * durationMs)
        const moveXRem = (isFront ? 1 : -1) * (index * fragmentWidthRem)
        const treadStyle: React.CSSProperties = {
          animationDuration: `${durationMs}ms`,
          animationDelay: `${delay}ms`,
          width: `calc(${fragmentWidthRem}rem + 1px)`
        }
        const windowStyle: React.CSSProperties = { transform: `translateX(${moveXRem}rem)` }
        return (
          <div key={`${isFront ? 'front' : 'back'}-${index}`} className={`tot__tread`} style={treadStyle}>
            <div className={`tot__tread-window`} aria-hidden={true} data-text={text} style={windowStyle}></div>
          </div>
        )
      })}
    </div>
  )
}

