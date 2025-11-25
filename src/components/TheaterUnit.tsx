import { useState } from 'react'
import VodPlayer, { type VodPlayerHandle } from './VodPlayer'

export type VodItem = {
  id: number
  hls_url: string
  title?: string
  description?: string
  original_filename?: string
  thumbnail_url?: string
}

type Props = {
  item: VodItem
  mode: 'mini' | 'theater'
  width?: number
  fixedHeight?: number
  showMeta?: boolean
  autoplay?: boolean
  cover?: boolean
  onDoubleClick?: () => void
  onMeta?: (id:number, size:{ w:number; h:number }) => void
  // Theater controls
  playerRef?: React.Ref<VodPlayerHandle>
  muted?: boolean
  scaleMode?: 'fit' | 'fill'
  fullscreenScaleMode?: 'fit' | 'fill'
  onTimeUpdate?: (current:number, duration:number) => void
  onPlayChange?: (playing:boolean) => void
  miniContainerRef?: (el: HTMLDivElement | null) => void
  miniStyle?: React.CSSProperties
}

export default function TheaterUnit({ item, mode, width, fixedHeight, showMeta = true, autoplay = true, cover = false, onDoubleClick, onMeta, playerRef, muted, scaleMode, fullscreenScaleMode, onTimeUpdate, onPlayChange, miniContainerRef, miniStyle }: Props){
  const [wh, setWh] = useState<{ w:number; h:number }>({ w:16, h:9 })
  const ratio = wh.h ? wh.w / wh.h : 16/9
  const autoHeight = width ? Math.ceil(width / ratio) : undefined
  const playerHeight = fixedHeight ?? autoHeight
  const title = item.title || item.original_filename || '—'

  if(mode === 'theater'){
    return (
      <div style={{ position:'relative', width:'100%', height:'100%' }} onDoubleClick={onDoubleClick}>
        <VodPlayer
          ref={playerRef as any}
          src={item.hls_url}
          autoplay={autoplay}
          muted={!!muted}
          loop={false}
          scaleMode={scaleMode ?? (cover ? 'fill' : 'fit')}
          fullscreenScaleMode={fullscreenScaleMode ?? scaleMode}
          onTimeUpdate={onTimeUpdate}
          onPlayChange={onPlayChange}
          onMetadata={({ width, height })=> { setWh({ w: width, h: height }); onMeta?.(item.id, { w: width, h: height }) }}
        />
      </div>
    )
  }

  // mini mode – styled like current VodTile in masonry layout
  const content = (
    <>
      {width ? (
        <div ref={miniContainerRef || undefined} style={{ width:'100%', height: playerHeight, ...(miniStyle || {}) }} onDoubleClick={onDoubleClick}>
          <VodPlayer
            src={item.hls_url}
            autoplay={autoplay}
            muted
            loop
            scaleMode={cover ? 'fill' : 'fit'}
            disableDoubleClickFullscreen={!!onDoubleClick}
            onMetadata={({ width, height })=> { setWh({ w: width, h: height }); onMeta?.(item.id, { w: width, h: height }) }}
          />
        </div>
      ) : (
        <div style={{ position:'relative', width:'100%' }} onDoubleClick={onDoubleClick}>
          <div style={{ width:'100%', paddingTop: `${(1/ratio)*100}%` }} />
          <div ref={miniContainerRef || undefined} style={{ position:'absolute', inset:0, ...(miniStyle || {}) }}>
            <VodPlayer
              src={item.hls_url}
              autoplay={autoplay}
              muted
              loop
              scaleMode={cover ? 'fill' : 'fit'}
              disableDoubleClickFullscreen={!!onDoubleClick}
              onMetadata={({ width, height })=> { setWh({ w: width, h: height }); onMeta?.(item.id, { w: width, h: height }) }}
            />
          </div>
        </div>
      )}
      {showMeta && (
        <div style={{ marginTop:8 }}>
          <div className="flat-card-title" style={{ fontSize:14 }}>{title}</div>
          {item.description && <div className="flat-card-sub" style={{ fontSize:12 }}>{item.description}</div>}
        </div>
      )}
    </>
  )

  if(width){
    const outerHeight = (playerHeight || 0) + (showMeta ? 40 : 0) + 24
    return (
      <article className="flat-card hitem" style={{ width, height: outerHeight, overflow:'hidden' }}>
        <div className="flat-card-inner" style={{ padding:12, display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'100%' }}>
          {content}
        </div>
      </article>
    )
  }

  return (
    <article className="flat-card" style={{ overflow:'hidden' }}>
      <div className="flat-card-inner" style={{ padding:12 }}>
        {content}
      </div>
    </article>
  )
}

