import { useEffect, useMemo, useRef, useState } from 'react'

type Props = {
  src: string
  title?: string
  artist?: string
  size?: number // px, default 520
}

export default function RadialAudioPlayer({ src, title, artist, size = 520 }: Props){
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [timeStr, setTimeStr] = useState('00:00')

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1

  const config = useMemo(()=>({
    outerRadius: size * 0.46,
    innerRadius: size * 0.38,
    ringWidth: 2,
    tickCount: 180,
  }), [size])

  useEffect(()=>{
    const cvs = canvasRef.current
    if(!cvs) return
    const ctx = cvs.getContext('2d')!
    const width = size
    const height = size
    cvs.width = Math.floor(width * dpr)
    cvs.height = Math.floor(height * dpr)
    cvs.style.width = width + 'px'
    cvs.style.height = height + 'px'
    ctx.scale(dpr, dpr)
  }, [size, dpr])

  function formatTime(sec:number){
    const s = Math.floor(sec)
    const m = Math.floor(s / 60)
    const r = s % 60
    return `${m.toString().padStart(2,'0')}:${r.toString().padStart(2,'0')}`
  }

  function drawFrame(){
    const cvs = canvasRef.current
    const ctx = cvs?.getContext('2d')
    const analyser = analyserRef.current
    if(!cvs || !ctx) return
    ctx.clearRect(0,0,size,size)

    const cx = size/2; const cy = size/2
    // base concentric rings
    ctx.save()
    ctx.strokeStyle = 'rgba(254,67,101,0.4)'
    ctx.lineWidth = config.ringWidth
    ctx.beginPath(); ctx.arc(cx, cy, config.innerRadius, 0, Math.PI*2); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, config.outerRadius, 0, Math.PI*2); ctx.stroke()
    ctx.restore()

    // animated ticks
    if(analyser){
      const bins = 256
      const arr = new Uint8Array(bins)
      analyser.getByteFrequencyData(arr)
      const count = config.tickCount
      for(let i=0;i<count;i++){
        const angle = (i / count) * Math.PI * 2
        const dirx = Math.cos(angle); const diry = Math.sin(angle)
        const v = arr[Math.floor((i/count)*bins)]/255
        // ease the height
        const h = 6 + v * 34
        const x1 = cx + dirx * (config.outerRadius - h)
        const y1 = cy + diry * (config.outerRadius - h)
        const x2 = cx + dirx * (config.outerRadius)
        const y2 = cy + diry * (config.outerRadius)
        const grd = ctx.createLinearGradient(x1,y1,x2,y2)
        grd.addColorStop(0, '#FE4365')
        grd.addColorStop(1, 'rgba(255,255,255,0.9)')
        ctx.strokeStyle = grd
        ctx.lineWidth = 2
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke()
      }
    } else {
      // idle dotted ring
      ctx.save(); ctx.strokeStyle = 'rgba(254,67,101,0.7)'; ctx.setLineDash([2,6]); ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(cx, cy, config.outerRadius, 0, Math.PI*2); ctx.stroke(); ctx.restore()
    }

    rafRef.current = requestAnimationFrame(drawFrame)
  }

  async function ensureAudio(){
    if(ctxRef.current) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const aud = audioRef.current!
    // Ensure cross-origin so we can attach to WebAudio without security errors
    try { (aud as any).crossOrigin = 'anonymous' } catch {}
    try {
      const node = ctx.createMediaElementSource(aud)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8
      node.connect(analyser)
      analyser.connect(ctx.destination)
      // Resume context on user gesture
      try { await ctx.resume() } catch {}
      ctxRef.current = ctx
      sourceRef.current = node
      analyserRef.current = analyser
    } catch (e) {
      // Fallback: if node creation fails (cross-origin), still try to resume context so HTMLAudio plays
      try { await ctx.resume() } catch {}
      ctxRef.current = ctx
    }
  }

  async function toggle(){
    const aud = audioRef.current!
    if(!ctxRef.current){ await ensureAudio() }
    if(aud.paused){ await aud.play(); setPlaying(true) } else { aud.pause(); setPlaying(false) }
  }

  useEffect(()=>{
    const aud = audioRef.current
    if(!aud) return
    const onTime = ()=> setTimeStr(formatTime(aud.currentTime||0))
    aud.addEventListener('timeupdate', onTime)
    return ()=> aud.removeEventListener('timeupdate', onTime)
  }, [])

  useEffect(()=>{
    rafRef.current = requestAnimationFrame(drawFrame)
    return ()=> { if(rafRef.current) cancelAnimationFrame(rafRef.current); ctxRef.current?.close().catch(()=>{}) }
  }, [])

  return (
    <div style={{ position:'relative', width:size, height:size, display:'grid', placeItems:'center' }}>
      <canvas ref={canvasRef} />
      <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', pointerEvents:'none' }}>
        <div style={{ textAlign:'center', color:'#FE4365', fontFamily:'Roboto, system-ui, -apple-system, Segoe UI, sans-serif', pointerEvents:'auto' }}>
          {(artist || title) && (
            <div style={{ marginBottom:18 }}>
              {artist && <div style={{ fontSize:22, marginBottom:6 }}>{artist}</div>}
              {title && <div style={{ fontSize:18 }}>{title}</div>}
            </div>
          )}
          <button onClick={toggle} className="pill" style={{ width:120, height:120, borderRadius:120, border:'3px solid #FE4365', background:'transparent', color:'#FE4365', fontSize:18 }}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <div style={{ marginTop:16, color:'#FE4365' }}>{timeStr}</div>
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="auto" crossOrigin="anonymous" />
    </div>
  )
}

