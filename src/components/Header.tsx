import { useEffect, useState } from 'react'
import { firebaseEnabled, subscribeToAuth, signInWithGoogle, signOutUser } from '../lib/firebase'
// @ts-ignore types present after deps install
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Header(){
  const location = useLocation()
  const compact = location.pathname.startsWith('/vod/theater')
    || location.pathname.startsWith('/share/videoshare')
    || location.pathname.startsWith('/share/imageshare')
  const [open, setOpen] = useState(false)
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const navigate = useNavigate()
  const [toast, setToast] = useState<string>("")
  useEffect(()=>{
    if(!firebaseEnabled) return
    const unsub = subscribeToAuth(u=> setUserPhoto(u?.photoURL || null))
    return ()=> unsub()
  }, [])
  return (
    <header className={`header${compact ? ' compact' : ''}`} role="banner" style={{ paddingLeft: 32 }}>
      <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
        <div className="brand" style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div className="logo" aria-label="AP logo" style={{ width:36, height:36, borderRadius:999, display:'grid', placeItems:'center', overflow:'hidden', border:'1px solid var(--ring)' }}>
            {userPhoto ? (<img src={userPhoto} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }} />) : 'AP'}
          </div>
          <nav className="nav brand-nav" aria-label="Primary">
          <Link className="pill" to="/">Home</Link>
          <a className="pill" href="#work">Work</a>
          <a className="pill" href="#projects">Projects</a>
          <a className="pill" href="#about">About</a>
          <a className="pill" href="#contact">Contact</a>
          <Link className="pill" to="/motion">Motion Design</Link>
          <Link className="pill" to="/vod">VOD</Link>
          <Link className="pill" to="/fieldshare">FieldShare</Link>
          <a className="pill primary" href="#contact">Let's collaborate</a>
          </nav>
        </div>

        <div className="nav" style={{ display:'flex', alignItems:'center', gap:8 }}>
          {userPhoto ? (
            <button className="pill" onClick={async()=>{ try{ await signOutUser() } catch(e){ setToast('Sign-out failed'); setTimeout(()=> setToast(''), 2500) } }} title="Sign out">Logout</button>
          ) : (
            <button className="pill" onClick={async()=> { try { if(firebaseEnabled){ await signInWithGoogle() } else { setToast('Sign-in unavailable: configure Firebase env'); setTimeout(()=> setToast(''), 2500); navigate('/fieldshare') } } catch(e){ setToast('Sign-in failed'); setTimeout(()=> setToast(''), 2500) } }} title="Sign in with Google">Sign in</button>
          )}
          <button className="menu-toggle" aria-label="Open menu" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"/>
            </svg>
          </button>
        </div>
      </div>
      {/* no separate mobile menu; we reuse the same nav */}
      {!!toast && (
        <div style={{ position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)', background:'var(--glass)', border:'1px solid var(--ring)', color:'var(--text)', borderRadius:12, padding:'8px 12px', zIndex:1000, backdropFilter:'blur(10px) saturate(180%)', WebkitBackdropFilter:'blur(10px) saturate(180%)' }}>{toast}</div>
      )}
    </header>
  )
}

