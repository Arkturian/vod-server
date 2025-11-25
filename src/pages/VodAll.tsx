import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TheaterUnit, { type VodItem as VodItemType } from '../components/TheaterUnit'

type VodItem = VodItemType

const API_BASE_URL = 'https://api.arkturian.com'
const API_KEY = 'Inetpass1'

// Uses shared component from components/VodTile

export default function VodAll(){
  const [items, setItems] = useState<VodItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(()=>{
    (async ()=>{
      try{
        setLoading(true)
        const res = await fetch(`${API_BASE_URL}/storage/list?mine=false`, { headers:{ 'X-API-KEY': API_KEY } })
        if(!res.ok) throw new Error('list failed')
        const data = await res.json()
        const filtered: VodItem[] = (data.items as VodItem[]).filter(v => v.hls_url)
        setItems(filtered)
        setError(null)
      } catch(e){
        console.error(e)
        setError('Could not load video list.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <main role="main">
      <section className="section" aria-labelledby="vodall-title">
        <h2 id="vodall-title" className="h2">All Videos</h2>
        {loading && <p className="muted">Loading…</p>}
        {error && <p className="muted" style={{ color:'crimson' }}>{error}</p>}
        {!loading && !error && (
          <div className="masonry">
            {items.map(item => (
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

