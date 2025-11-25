import { useState } from 'react'
import VodPlayer from './VodPlayer'

export type VodItem = {
  id: number
  hls_url: string
  title?: string
  description?: string
  original_filename?: string
  thumbnail_url?: string
}

type VodTileProps = {
  item: VodItem
  width?: number
  fixedHeight?: number
  showMeta?: boolean
  autoplay?: boolean
  onClick?: () => void
  onMeta?: (id:number, size:{ w:number; h:number }) => void
  cover?: boolean
  onDoubleClick?: () => void
}

export default function VodTile({ item, width, fixedHeight, showMeta = true, autoplay = true, onClick, onMeta, cover = false, onDoubleClick }: VodTileProps){
  const [wh, setWh] = useState<{ w:number; h:number }>({ w:16, h:9 })

  const ratio = wh.h ? wh.w / wh.h : 16/9
  const autoHeight = width ? Math.ceil(width / ratio) : undefined
  const playerHeight = fixedHeight ?? autoHeight

  const title = item.title || item.original_filename || '—'

  // Strip mode (width provided) uses explicit height; otherwise masonry-style ratio box
  const content = (
    <>
      {width ? (
        <div style={{ width:'100%', height: playerHeight }} onClick={onClick} onDoubleClick={onDoubleClick}>
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
        <div style={{ position:'relative', width:'100%' }} onClick={onClick} onDoubleClick={onDoubleClick}>
          <div style={{ width:'100%', paddingTop: `${(1/ratio)*100}%` }} />
          <div style={{ position:'absolute', inset:0 }}>
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

