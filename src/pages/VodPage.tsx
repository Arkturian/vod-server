import { useEffect, useMemo, useRef, useState } from 'react'
import VodPlayer from '../components/VodPlayer'
import type { VodPlayerHandle } from '../components/VodPlayer'

type VodItem = {
  id: number
  hls_url: string
  thumbnail_url?: string
  title?: string
  description?: string
  original_filename?: string
  likes?: number
}

const API_BASE_URL = 'https://api-storage.arkturian.com'
const API_KEY = 'Inetpass1'

function thumb(item: VodItem){
  if(item.thumbnail_url) return item.thumbnail_url
  return `${API_BASE_URL}/storage/media/${item.id}?variant=thumbnail&format=jpg`
}

function label(item: VodItem){
  return item.title || item.original_filename?.replace(/\.[^.]+$/, '') || `#${item.id}`
}

export default function VodPage(){
  const url = new URL(window.location.href)
  const collectionId = url.searchParams.get('collection_id')
  const currentId = url.searchParams.get('current_id')
  const singleSrc = url.searchParams.get('src')

  const [playlist, setPlaylist] = useState<VodItem[]>([])
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const [scaleMode, setScaleMode] = useState<'fit'|'fill'>('fit')
  const [muted, setMuted] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const [videoWH, setVideoWH] = useState<{ w:number; h:number }>({ w:16, h:9 })
  const playerRef = useRef<VodPlayerHandle | null>(null)

  const current = currentIndex >=0 ? playlist[currentIndex] : null

  useEffect(()=>{
    (async ()=>{
      try{
        if(collectionId){
          const res = await fetch(`${API_BASE_URL}/storage/list?limit=5000&mine=false&collection_id=${collectionId}`, { headers:{ 'X-API-KEY': API_KEY } })
          if(!res.ok) throw new Error('collection load failed')
          const data = await res.json()
          const items = (data.items as VodItem[]).filter(i => i.hls_url)
          setPlaylist(items)
          if(items.length){
            const idx = currentId ? items.findIndex(v => String(v.id) === String(currentId)) : 0
            setCurrentIndex(idx >=0 ? idx : 0)
          }
        } else if(currentId){
          const res = await fetch(`${API_BASE_URL}/storage/objects/${currentId}`, { headers:{ 'X-API-KEY': API_KEY } })
          if(!res.ok) throw new Error('object load failed')
          const item = await res.json() as VodItem
          if(item.hls_url){ setPlaylist([item]); setCurrentIndex(0) }
        } else if(singleSrc){
          setPlaylist([{ id: -1, hls_url: singleSrc, title: 'Single Video' }])
          setCurrentIndex(0)
        } else {
          const res = await fetch(`${API_BASE_URL}/storage/list?limit=5000&mine=false`, { headers:{ 'X-API-KEY': API_KEY } })
          if(!res.ok) throw new Error('list failed')
          const data = await res.json()
          const items = (data.items as VodItem[]).filter((i: any) => i.hls_url)
          if(items.length){
            setPlaylist(items)
            setCurrentIndex(0)
          }
        }
      } catch(e){ console.error(e) }
    })()
  }, [collectionId, currentId, singleSrc])

  const title = useMemo(()=> label(current || {} as VodItem), [current])
  const description = useMemo(()=> current?.description || '', [current])
  const likes = current?.likes ?? 0

  function like(){
    if(!current || current.id < 0) return
    fetch(`${API_BASE_URL}/storage/objects/${current.id}/like`, { method:'POST', headers:{ 'X-API-KEY': API_KEY } })
      .then(r => r.ok ? r.json() : Promise.reject('like failed'))
      .then((it: VodItem)=>{
        setPlaylist(prev => prev.map(p => p.id === it.id ? { ...p, likes: it.likes } : p))
      })
      .catch(console.error)
  }

  const onTime = (cur:number, dur:number)=>{
    setProgress(cur)
    setDuration(dur || 0)
  }

  const percent = duration ? (progress / duration) * 100 : 0
  const aspect = videoWH.h ? (videoWH.w / videoWH.h) : (16/9)
  const padTop = `${(1 / aspect) * 100}%`

  const upNext = playlist.slice(currentIndex+1, currentIndex+6)

  return (
    <main role="main">
    <section className="section" style={{ paddingTop:40 }}>
      {/* Player + Sidebar */}
      <div className="vod-player-layout">
        <div className="vod-player-main">
          <div style={{ position:'relative', width:'100%', background:'#000', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
            <div style={{ width:'100%', paddingTop: padTop }} />
            <div style={{ position:'absolute', inset:0 }}>
              {current && (
                <VodPlayer
                  ref={playerRef}
                  src={current.hls_url}
                  autoplay
                  muted={muted}
                  scaleMode={scaleMode}
                  onPlayChange={()=>{}}
                  onTimeUpdate={onTime}
                  onError={(m)=> console.warn(m)}
                  onMetadata={({ width, height })=> setVideoWH({ w: width, h: height })}
                />
              )}
              {/* Controls overlay */}
              <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
                <button className="pill" style={{ position:'absolute', top:12, right:12, pointerEvents:'auto' }} onClick={()=> setMuted(m => !m)}>
                  {muted ? '🔇' : '🔊'}
                </button>
                <button className="pill" style={{ position:'absolute', top:12, right:68, pointerEvents:'auto' }} onClick={()=> setScaleMode(m => m==='fit'?'fill':'fit')}>
                  ⛶
                </button>
                <div style={{ position:'absolute', bottom:0, left:0, width:'100%', height:4, background:'rgba(255,255,255,0.2)', pointerEvents:'auto', cursor:'pointer' }}
                  onClick={(e)=>{
                    if(!playerRef.current) return
                    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                    const ratio = (e.clientX - rect.left) / rect.width
                    playerRef.current.setCurrentTime(ratio * duration)
                  }}
                >
                  <div style={{ width:`${percent}%`, height:'100%', background:'var(--brand-2)', transition:'width .1s linear' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Title bar under player */}
          <div className="vod-meta-bar">
            <div style={{ flex:1, minWidth:0 }}>
              <h3 className="vod-meta-title">{title}</h3>
              {description && <p className="vod-meta-desc">{description}</p>}
            </div>
            <div className="vod-meta-actions">
              <button className="pill" onClick={()=> setCurrentIndex(i => Math.max(0, i-1))} disabled={currentIndex<=0}>‹ Prev</button>
              <button className="pill" onClick={()=> setCurrentIndex(i => Math.min(playlist.length-1, i+1))} disabled={currentIndex>=playlist.length-1}>Next ›</button>
              <button className="pill" onClick={like}>♥ {likes}</button>
            </div>
          </div>
        </div>

        {/* Up Next sidebar */}
        {upNext.length > 0 && (
          <div className="vod-sidebar">
            <div className="vod-sidebar-label">Up next</div>
            {upNext.map((v) => (
              <button key={v.id} className="vod-sidebar-item" onClick={()=> setCurrentIndex(playlist.findIndex(p=>p.id===v.id))}>
                <img className="vod-sidebar-thumb" src={thumb(v)} alt="" loading="lazy" />
                <span className="vod-sidebar-title">{label(v)}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full playlist grid */}
      {playlist.length > 1 && (
        <div style={{ marginTop:24 }}>
          <div className="vod-grid">
            {playlist.map((v, i) => (
              <button key={v.id} className={`vod-grid-item${i === currentIndex ? ' active' : ''}`} onClick={()=> setCurrentIndex(i)}>
                <div className="vod-grid-thumb-wrap">
                  <img className="vod-grid-thumb" src={thumb(v)} alt="" loading="lazy" />
                  {i === currentIndex && <div className="vod-grid-playing">Playing</div>}
                </div>
                <span className="vod-grid-title">{label(v)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
    </main>
  )
}
