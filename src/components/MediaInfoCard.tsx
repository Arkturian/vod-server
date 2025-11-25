
type Props = {
  id: number
  title?: string
  description?: string
  downloadHref?: string
  shareUrl: string
  likeCount?: number
  onLike: () => void
  onDelete: () => void
  onTitleChange?: (next: string) => void
  onDescriptionChange?: (next: string) => void
  onSelect?: () => void
}

export default function MediaInfoCard({
  id,
  title,
  description,
  downloadHref,
  shareUrl,
  likeCount,
  onLike,
  onDelete,
  onTitleChange,
  onDescriptionChange,
  onSelect,
}: Props){
  const showTitle = !!title
  const showDesc = !!description

  return (
    <div data-id={id} onClick={onSelect} style={{ background:'var(--glass)', border:'1px solid var(--ring)', borderRadius:12, backdropFilter:'blur(10px) saturate(180%)', WebkitBackdropFilter:'blur(10px) saturate(180%)', padding:'12px 14px' }}>
      {showTitle && (
        <div
          style={{ fontWeight:700, marginBottom:10, fontSize:'1.15rem', outline:'none' }}
          contentEditable
          suppressContentEditableWarning
          onMouseDown={(e)=> e.stopPropagation()}
          onBlur={(e)=> onTitleChange?.(e.currentTarget.textContent || '')}
        >
          {title}
        </div>
      )}
      {showDesc && (
        <div
          className="muted"
          style={{ margin:0, color:'#fff', fontSize:'.9rem', outline:'none' }}
          contentEditable
          suppressContentEditableWarning
          onMouseDown={(e)=> e.stopPropagation()}
          onBlur={(e)=> onDescriptionChange?.(e.currentTarget.textContent || '')}
        >
          {description}
        </div>
      )}
      <div style={{ position:'relative', display:'flex', gap:12, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
          <button
            className="pill"
            style={{ background:'transparent', border:'1px solid var(--ring)', borderRadius:12, color:'#fff' }}
            onClick={(e)=>{ e.stopPropagation(); onLike() }}
          >
            ♥ {typeof likeCount === 'number' ? likeCount : 0}
          </button>
          {downloadHref && (
            <a
              className="pill"
              style={{ background:'transparent', border:'1px solid var(--ring)', borderRadius:12, color:'#fff' }}
              href={downloadHref}
              download
              onClick={(e)=> e.stopPropagation()}
            >
              ⬇ Download
            </a>
          )}
          <button
            className="pill"
            style={{ background:'transparent', border:'1px solid var(--ring)', borderRadius:12, color:'#fff' }}
            onClick={(e)=>{ e.stopPropagation();
              if((navigator as any).share){ (navigator as any).share({ url: shareUrl }) }
              else { navigator.clipboard.writeText(shareUrl) }
            }}
          >
            Share
          </button>
          <button
            className="pill"
            title="Delete"
            style={{ background:'transparent', border:'1px solid var(--ring)', borderRadius:12, color:'#fff' }}
            onClick={(e)=>{ e.stopPropagation(); onDelete() }}
          >
            ×
          </button>
        </div>
        <div style={{ flex:1 }} />
      </div>
    </div>
  )
}

