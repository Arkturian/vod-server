import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, type User } from 'firebase/auth'

// Mirror 3dPresenter2 config/envs. Also allow runtime override via localStorage for dev.
function readRuntimeConfig(): any | null {
  try{
    const raw = localStorage.getItem('fs_firebase_config')
    if(!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

const runtime = readRuntimeConfig()
// Default fallback (SensePresenter) if neither runtime nor env are provided
const defaultConfig = {
  apiKey: 'AIzaSyCJwE5Uj6NTCQl36HQL-cfoyv7xeOENCiA',
  authDomain: 'sensepresenter.firebaseapp.com',
  projectId: 'sensepresenter',
  storageBucket: 'sensepresenter.firebasestorage.app',
  messagingSenderId: '431314669954',
  appId: '1:431314669954:web:94836f95745e1cf6ef7f9b',
}
const firebaseConfig = {
  apiKey: runtime?.apiKey ?? import.meta.env.VITE_FIREBASE_API_KEY ?? defaultConfig.apiKey,
  authDomain: runtime?.authDomain ?? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? defaultConfig.authDomain,
  projectId: runtime?.projectId ?? import.meta.env.VITE_FIREBASE_PROJECT_ID ?? defaultConfig.projectId,
  storageBucket: runtime?.storageBucket ?? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? defaultConfig.storageBucket,
  messagingSenderId: runtime?.messagingSenderId ?? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? defaultConfig.messagingSenderId,
  appId: runtime?.appId ?? import.meta.env.VITE_FIREBASE_APP_ID ?? defaultConfig.appId,
}

export const firebaseEnabled = !!firebaseConfig.apiKey && !!firebaseConfig.projectId

let app: FirebaseApp | null = null
let authInstance: ReturnType<typeof getAuth> | null = null

export function initFirebase(){
  if(app || !firebaseEnabled) return app
  app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  authInstance = auth
  setPersistence(auth, browserLocalPersistence).catch(()=>{})
  return app
}

export function getFirebaseAuth(){
  if(!firebaseEnabled) return null as any
  if(!app) initFirebase()
  if(!app) return null as any
  if(!authInstance){ authInstance = getAuth(app) }
  return authInstance
}

export async function signInWithGoogle(){
  if(!firebaseEnabled) return
  initFirebase()
  const auth = getFirebaseAuth()
  if(!auth) return
  const provider = new GoogleAuthProvider()
  await signInWithPopup(auth, provider)
}

export async function signOutUser(){
  if(!firebaseEnabled) return
  initFirebase()
  const auth = getFirebaseAuth()
  if(!auth) return
  await signOut(auth)
}

export function subscribeToAuth(callback: (user: User | null)=> void){
  if(!firebaseEnabled){ return () => {} }
  initFirebase()
  const auth = getFirebaseAuth()
  if(!auth){ return () => {} }
  return onAuthStateChanged(auth, callback)
}

// Debug helper to set runtime config without rebuilding (dev-only)
export function setFirebaseRuntimeConfig(cfg: Partial<{ apiKey:string; authDomain:string; projectId:string; storageBucket:string; messagingSenderId:string; appId:string }>){
  try{
    const existing = readRuntimeConfig() || {}
    const next = { ...existing, ...cfg }
    localStorage.setItem('fs_firebase_config', JSON.stringify(next))
    // Reload to pick up changes
    window.location.reload()
  } catch {}
}

// Expose on window for convenience in console
;(window as any).__setFirebase = setFirebaseRuntimeConfig

