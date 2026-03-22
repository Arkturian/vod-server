import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react'
import Hls from 'hls.js'

export type VodPlayerHandle = {
  play: () => void
  pause: () => void
  togglePlay: () => void
  setMuted: (m: boolean) => void
  getCurrentTime: () => number
  setCurrentTime: (t: number) => void
  getDuration: () => number
  toggleFullscreen: () => void
  enterFullscreen: () => void
  exitFullscreen: () => void
}

type VodPlayerProps = {
  src: string
  autoplay?: boolean
  muted?: boolean
  loop?: boolean
  scaleMode?: 'fit' | 'fill'
  fullscreenScaleMode?: 'fit' | 'fill'
  disableDoubleClickFullscreen?: boolean
  onPlayChange?: (playing: boolean) => void
  onTimeUpdate?: (current: number, duration: number) => void
  onError?: (msg: string) => void
  onMetadata?: (meta: { width:number; height:number }) => void
  isActive?: boolean
}

const VodPlayer = forwardRef<VodPlayerHandle, VodPlayerProps>(function VodPlayer(
  { src, autoplay = true, muted = false, loop = false, scaleMode = 'fit', fullscreenScaleMode, disableDoubleClickFullscreen = false, onPlayChange, onTimeUpdate, onError, onMetadata, isActive = true },
  ref
){
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  // const hlsRef = useRef<Hls | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showUi, setShowUi] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const uiTimeoutRef = useRef<number | null>(null)
  const [fullscreenMode, setFullscreenMode] = useState<'fit'|'fill'>('fit')

  // Stable refs for callbacks to avoid re-triggering HLS setup
  const onErrorRef = useRef(onError)
  onErrorRef.current = onError
  const onMetadataRef = useRef(onMetadata)
  onMetadataRef.current = onMetadata
  const onPlayChangeRef = useRef(onPlayChange)
  onPlayChangeRef.current = onPlayChange
  const onTimeUpdateRef = useRef(onTimeUpdate)
  onTimeUpdateRef.current = onTimeUpdate

  useImperativeHandle(ref, ()=>({
    play: ()=> videoRef.current?.play(),
    pause: ()=> videoRef.current?.pause(),
    togglePlay: ()=> {
      const v = videoRef.current
      if(!v) return
      if(v.paused) v.play(); else v.pause()
    },
    setMuted: (m)=> { if(videoRef.current) videoRef.current.muted = m },
    getCurrentTime: ()=> videoRef.current?.currentTime ?? 0,
    setCurrentTime: (t)=> { if(videoRef.current) videoRef.current.currentTime = t },
    getDuration: ()=> videoRef.current?.duration ?? 0,
    toggleFullscreen: ()=>{
      const el = containerRef.current as any
      if(!el) return
      if(document.fullscreenElement){ document.exitFullscreen?.() } else { el.requestFullscreen?.() }
    },
    enterFullscreen: ()=>{ const el = containerRef.current as any; el?.requestFullscreen?.() },
    exitFullscreen: ()=>{ document.exitFullscreen?.() },
  }), [])

  useEffect(()=>{
    const v = videoRef.current
    if(!v || !src) return
    let hls: Hls | null = null

    const isHls = src.endsWith('.m3u8')
    if(isHls){
      if(v.canPlayType('application/vnd.apple.mpegurl')){
        v.src = src
      } else if(Hls.isSupported()){
        hls = new Hls({ enableWorker: true })
        hls.loadSource(src)
        hls.attachMedia(v)
        hls.on(Hls.Events.ERROR, ()=> onErrorRef.current?.('Stream error'))
      } else {
        onErrorRef.current?.('HLS not supported')
      }
    } else {
      v.src = src
    }

    return ()=>{
      if(hls){ hls.destroy() }
    }
  }, [src])

  // Pause video when not active; play when active (if autoplay)
  useEffect(()=>{
    const v = videoRef.current
    if(!v) return
    if(isActive){
      if(autoplay){ v.play().catch(()=>{}) }
    } else {
      try{ v.pause() } catch {}
    }
  }, [isActive, autoplay])

  useEffect(()=>{
    const v = videoRef.current
    if(!v) return
    const onPlay = ()=> { onPlayChangeRef.current?.(true); setShowUi(true); if(uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current); uiTimeoutRef.current = window.setTimeout(()=> setShowUi(false), 2000) as unknown as number }
    const onPause = ()=> { onPlayChangeRef.current?.(false); setShowUi(true) }
    const onTime = ()=> { onTimeUpdateRef.current?.(v.currentTime, v.duration); setProgress(v.currentTime); setDuration(v.duration || 0) }
    const onMeta = ()=> onMetadataRef.current?.({ width: v.videoWidth, height: v.videoHeight })
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    return ()=>{
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
    }
  }, [])

  useEffect(()=>{
    const onFs = ()=> setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return ()=> document.removeEventListener('fullscreenchange', onFs)
  }, [])

  const toggleFullscreen = ()=>{
    const el = containerRef.current
    if(!el) return
    if(!document.fullscreenElement){
      ;(el as any).requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  const percent = duration ? (progress / duration) * 100 : 0
  const effectiveMode: 'fit' | 'fill' = isFullscreen
    ? (fullscreenScaleMode ?? fullscreenMode)
    : (scaleMode ?? 'fit')

  return (
    <div ref={containerRef} style={{ position:'relative', width:'100%', height:'100%' }}
      onMouseMove={()=>{
        setShowUi(true)
        if(uiTimeoutRef.current) window.clearTimeout(uiTimeoutRef.current)
        if(!(videoRef.current?.paused)){
          uiTimeoutRef.current = window.setTimeout(()=> setShowUi(false), 2000) as unknown as number
        }
      }}
      onDoubleClick={disableDoubleClickFullscreen ? undefined : toggleFullscreen}
    >
      <video
        ref={videoRef}
        playsInline
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        style={{ width:'100%', height:'100%', objectFit: effectiveMode === 'fill' ? 'cover' : 'contain', background:'#000', cursor:'pointer' }}
        onClick={()=>{
          const v = videoRef.current
          if(!v) return
          if(v.paused) v.play(); else v.pause()
        }}
      />
      {isFullscreen && (
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', transition:'opacity .25s', opacity: showUi ? 1 : 0 }}>
          <button
            style={{ position:'absolute', top:12, right:12, pointerEvents:'auto' }}
            className="pill"
            onClick={toggleFullscreen}
          >
            Exit
          </button>
          <button
            style={{ position:'absolute', top:12, right:72, pointerEvents:'auto' }}
            className="pill"
            onClick={()=> setFullscreenMode(m => m==='fit' ? 'fill' : 'fit')}
            title={fullscreenMode === 'fit' ? 'Switch to Fill' : 'Switch to Fit'}
          >
            {fullscreenMode === 'fit' ? 'Fit' : 'Fill'}
          </button>
          <div style={{ position:'absolute', bottom:18, left:'2%', width:'96%', height:5, background:'rgba(255,255,255,0.3)', pointerEvents:'auto', borderRadius:3 }}
            onClick={(e)=>{
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              if(videoRef.current) videoRef.current.currentTime = ratio * (duration || 0)
            }}
          >
            <div style={{ width:`${percent}%`, height:'100%', background:'var(--brand-2)' }} />
          </div>
        </div>
      )}
    </div>
  )
})

export default VodPlayer

