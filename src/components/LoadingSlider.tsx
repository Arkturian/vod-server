import React, { useEffect, useMemo, useRef, useState } from 'react'

type LoadingSliderProps = {
  label?: string
  durationMs?: number
  sizePx?: number
  heightRem?: number
  className?: string
  style?: React.CSSProperties
  progress?: number
  onComplete?: () => void
}

function clamp(value: number, min: number, max: number){
  return Math.max(min, Math.min(max, value))
}

export default function LoadingSlider({
  label = 'Loading',
  durationMs = 3000,
  sizePx = 230,
  heightRem = 2.625,
  className,
  style,
  progress,
  onComplete
}: LoadingSliderProps){
  const [internalProgress, setInternalProgress] = useState(0)
  const rafRef = useRef(0)
  const startRef = useRef<number | null>(null)
  const completeRef = useRef(false)

  const isControlled = typeof progress === 'number'
  const effectiveProgress = clamp(isControlled ? progress! : internalProgress, 0, 100)

  useEffect(()=>{
    if(isControlled) return
    function step(ts: number){
      if(startRef.current == null) startRef.current = ts
      const elapsed = ts - startRef.current
      const pctLinear = clamp(elapsed / durationMs, 0, 1)
      const pctEased = easeOutCubic(pctLinear)
      const pct = Math.round(pctEased * 100)
      setInternalProgress(pct)
      if(pct < 100){
        rafRef.current = requestAnimationFrame(step)
      } else if(!completeRef.current){
        completeRef.current = true
        onComplete?.()
      }
    }
    rafRef.current = requestAnimationFrame(step)
    return ()=> cancelAnimationFrame(rafRef.current)
  }, [durationMs, isControlled, onComplete])

  const uid = useMemo(()=> `ls-${Math.random().toString(36).slice(2, 9)}`, [])

  const css = useMemo(()=>{
    const root = `.loading-slider-${uid}`
    return `
${root}{ position:relative; --width:${sizePx}; --height:${heightRem}rem; color:white; width: min(calc(var(--width) * 1px), calc(100vw - 2rem)); }
${root} .slider{ position:relative; display:flex; align-items:center; border-radius:100px; }
${root} .slider__track{ flex:1; height:var(--height); position:relative; container-type:inline-size; }
${root} .slider__fill{ position:absolute; left:0; top:50%; translate:0 -50%; height:100%; width:100%; border-radius:100px; display:grid; place-items:center; clip-path: inset(0 calc(90% - ((var(--slider-complete, 0) / 100) * 90%)) 0 0 round 120px); background: linear-gradient(90deg, oklch(0.32 0.15 259.94), oklch(0.61 0.2 247.14), oklch(0.71 0.24 313.75), oklch(0.72 0.28 349.83), oklch(0.72 0.23 3.74)); }
${root} .slider__fill span{ font-family: 'Grand Hotel', cursive; font-size: calc(var(--height) * 0.65); letter-spacing:.1ch; font-weight:400; font-style:italic; line-height:1; }
${root} .slider__indicator{ position:absolute; top:50%; left:0; translate: calc((((var(--slider-complete, 0) / 100) * (100cqi - 54%)) - 28%)) -56%; height:144%; aspect-ratio:1; border-radius:50%; background:hsl(0 0% 0%); box-shadow: 0 12px 8px -2px hsl(0 0% 10% / 0.25), 0 8px 12px -4px hsl(0 0% 20% / 0.45), 0 16px 16px -10px hsl(0 0% 30% / 0.45), 0 24px 24px -8px hsl(0 0% 40% / 0.45), 0 32px 32px -2px hsl(0 0% 50% / 0.45), 0 -6px 10px 0 hsl(0 0% 100% / 0.6) inset; pointer-events:none; }
${root} .shines{ position:absolute; inset:0; overflow:hidden; border-radius:50%; z-index:3; }
${root} .shines::before{ content:''; position:absolute; width:70%; height:50%; background: linear-gradient(#fff, hsl(222 53% 93% / 0.9)); filter: blur(20px); top:12%; left:50%; translate:-50% 0; }
${root} .shines::after{ content:''; width:60%; aspect-ratio:1; background: radial-gradient(circle at 50% 0, #fff 50%, hsl(0 0% 100% / 1)); filter: blur(7px); position:absolute; top:10%; left:50%; translate:-50% 0; border-radius:50%; }
${root} .arrows-holder{ position:absolute; inset:0; z-index:4; mask: radial-gradient(circle at 50% 30%, #fff 25%, #0000 65%); clip-path: circle(50%); }
${root} .arrows{ position:absolute; height:182%; aspect-ratio:1; border-radius:50%; left:50%; top:0; translate:-50% 0; }
${root} .arrows svg{ filter: drop-shadow(0 0 1px hsl(0 0% 50%)); width:1.35rem; position:absolute; color:hsl(0 0% 30%); left:50%; top:50%; transform: translate(-50%, -50%) rotate(calc(var(--i, 0) * 90deg)) translate(10%, -2.25rem); }
${root} .arrows svg:nth-of-type(1){ --i:0; }
${root} .arrows svg:nth-of-type(2){ --i:1; }
${root} .arrows svg:nth-of-type(3){ --i:2; }
${root} .arrows svg:nth-of-type(4){ --i:3; }
${root} .noise-holder{ position:absolute; inset:0; overflow:hidden; border-radius:50%; mask: radial-gradient(circle at 50% 40%, #0000 0%, #fff 75%); pointer-events:none; }
${root} .noise{ height:182%; aspect-ratio:1; border-radius:50%; left:50%; position:absolute; translate:-50% 0; display:grid; opacity:0.3; }
${root} .noise div{ grid-area:1 / 1; }
${root} .noise div:nth-of-type(1){ background:black; filter:url(#noiseshow-${uid}) contrast(2); }
${root} .noise div:nth-of-type(2){ background:hsl(0 0% 50%); mix-blend-mode:saturation; }
${root} .sr-only{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border-width:0; }
${root} .percent{ position:absolute; right:0; top:-1.25rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; font-size:.75rem; color: color-mix(in lch, canvasText, transparent 30%); }
    `
  }, [uid, sizePx, heightRem])

  const styleVars: React.CSSProperties & Record<string, string | number> = {
    ...(style || {}),
    ['--slider-complete']: effectiveProgress
  }

  return (
    <div className={`loading-slider-${uid}${className ? ` ${className}` : ''}`} style={styleVars} aria-live="polite" aria-label={`${label} ${effectiveProgress}% complete`}>
      <style>{css}</style>
      <svg className="sr-only" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={`noiseshow-${uid}`}>
            <feTurbulence type="turbulence" baseFrequency="0.6" numOctaves={10} result="noise"></feTurbulence>
          </filter>
        </defs>
      </svg>
      <div className="slider">
        <div className="slider__track">
          <div className="slider__fill"><span>{label}</span></div>
          <div className="slider__indicator">
            <div className="shines"></div>
            <div className="noise-holder">
              <div className="noise">
                <div></div>
                <div></div>
              </div>
            </div>
            <div className="arrows-holder">
              <div className="arrows" aria-hidden>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <svg key={idx} viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M71.5542 7.10156C71.5542 7.10156 91.68 18.4986 100.553 26.104C111.053 35.104 112.553 39.104 112.053 42.604C111.553 46.104 104.614 51.1058 97.6141 55.6058C89 61.1435 72.5003 72.1101 72.5003 72.1101M7 42.6126C7 42.6126 36.3395 36.643 56 36.6103C75.9938 36.5771 109 40.6102 109 40.6102" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="percent">{effectiveProgress}%</div>
      </div>
    </div>
  )
}

function easeOutCubic(x: number){
  return 1 - Math.pow(1 - x, 3)
}

