import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TheaterUnit, { type VodItem as VodItemType } from '../components/TheaterUnit'

type VodItem = VodItemType & { created_at?: string; file_size_bytes?: number }

const API_BASE_URL = 'https://api-storage.arkturian.com'
const API_KEY = 'Inetpass1'

type MediaFilter = 'all' | 'image' | 'video'
type SortOption = 'newest' | 'oldest'

export default function VodAll(){
  const [items, setItems] = useState<VodItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<MediaFilter>('all')
  const [sort, setSort] = useState<SortOption>('newest')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/storage/list?limit=5000&mine=false`, { headers:{ 'X-API-KEY': API_KEY } })
        if(!res.ok) throw new Error('list failed')
        const data = await res.json()
        const allItems: VodItem[] = (data.items as VodItem[]).filter(item => {
          const mime = item.mime_type || ''
          return mime.startsWith('image/') || mime.startsWith('video/')
        })
        setItems(allItems)
        setError(null)
      } catch(e){
        console.error(e)
        setError('Could not load media list.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    let result = items

    // Type filter
    if(filter === 'image') result = result.filter(i => i.mime_type?.startsWith('image/'))
    if(filter === 'video') result = result.filter(i => i.mime_type?.startsWith('video/'))

    // Search
    if(search.trim()){
      const q = search.toLowerCase()
      result = result.filter(i =>
        (i.title || '').toLowerCase().includes(q) ||
        (i.original_filename || '').toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        String(i.id).includes(q)
      )
    }

    // Sort
    result = [...result].sort((a, b) => {
      const da = a.created_at || ''
      const db = b.created_at || ''
      if(sort === 'newest') return da > db ? -1 : da < db ? 1 : b.id - a.id
      return da < db ? -1 : da > db ? 1 : a.id - b.id
    })

    return result
  }, [items, filter, sort, search])

  const imageCount = items.filter(i => i.mime_type?.startsWith('image/')).length
  const videoCount = items.filter(i => i.mime_type?.startsWith('video/')).length

  return (
    <main role="main">
      <section className="section section-full" aria-labelledby="vodall-title">
        <div className="vodall-header">
          <h2 id="vodall-title" className="h2" style={{ margin: 0 }}>All Media</h2>
          {!loading && !error && (
            <span className="vodall-count">{filtered.length} items</span>
          )}
        </div>

        {!loading && !error && items.length > 0 && (
          <div className="vodall-toolbar">
            <div className="vodall-filters">
              <button className={`vodall-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                All ({items.length})
              </button>
              <button className={`vodall-filter-btn${filter === 'image' ? ' active' : ''}`} onClick={() => setFilter('image')}>
                Images ({imageCount})
              </button>
              <button className={`vodall-filter-btn${filter === 'video' ? ' active' : ''}`} onClick={() => setFilter('video')}>
                Videos ({videoCount})
              </button>
            </div>
            <div className="vodall-controls">
              <input
                className="vodall-search"
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="vodall-sort" value={sort} onChange={e => setSort(e.target.value as SortOption)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>
        )}

        {loading && <p className="muted">Loading…</p>}
        {error && <p className="muted" style={{ color:'crimson' }}>{error}</p>}
        {!loading && !error && (
          <div className="masonry-responsive">
            {filtered.map(item => (
              <div key={item.id} className="masonry-item">
                <TheaterUnit item={item} mode="mini" onDoubleClick={()=> navigate(`/vod/theater?current_id=${item.id}&from=/vod/all`)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
