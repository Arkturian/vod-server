import { useEffect, useMemo, useRef } from 'react'
// @ts-ignore types present after deps install
import * as THREE from 'three'
// @ts-ignore types present after deps install
import * as kokomi from 'kokomi.js'
// @ts-ignore types present after deps install
import gsap from 'gsap'

type RingLoaderProps = {
  bgColor?: string
  title?: string
  subtitle?: string
  onComplete?: () => void
}

export default function RingLoader({ bgColor = '#0c0c0c', title = 'RING', subtitle = 'Just drag and scroll~', onComplete }: RingLoaderProps){
  const containerRef = useRef<HTMLDivElement | null>(null)
  const loaderRef = useRef<HTMLDivElement | null>(null)
  const heroRef = useRef<HTMLDivElement | null>(null)
  const targetId = useMemo(()=> `ring-sketch-${Math.random().toString(36).slice(2,9)}` , [])

  useEffect(()=>{
    let cleanup: (()=>void) | undefined

    const fragmentShader = `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform sampler2D tDiffuse;
varying vec2 vUv;
uniform vec3 uBgColor;
uniform float uRGBShiftIntensity;
uniform float uGrainIntensity;
uniform float uVignetteIntensity;
uniform float uTransitionProgress;
highp float random(vec2 co){ highp float a=12.9898; highp float b=78.233; highp float c=43758.5453; highp float dt=dot(co.xy,vec2(a,b)); highp float sn=mod(dt,3.14); return fract(sin(sn)*c); }
vec3 grain(vec2 uv,vec3 col,float amount){ float noise=random(uv+iTime); col+=(noise-.5)*amount; return col; }
vec4 RGBShift(sampler2D tex,vec2 uv,float amount){ vec2 rUv=uv; vec2 gUv=uv; vec2 bUv=uv; float noise=random(uv+iTime)*.5+.5; vec2 offset=amount*vec2(cos(noise),sin(noise)); rUv+=offset; gUv+=offset*.5; bUv+=offset*.25; vec4 rTex=texture(tex,rUv); vec4 gTex=texture(tex,gUv); vec4 bTex=texture(tex,bUv); vec4 col=vec4(rTex.r,gTex.g,bTex.b,gTex.a); return col; }
vec3 vignette(vec2 uv,vec3 col,vec3 vigColor,float amount){ vec2 p=uv; p-=.5; float d=length(p); float mask=smoothstep(.5,.3,d); mask=pow(mask,.6); float mixFactor=(1.-mask)*amount; col=mix(col,vigColor,mixFactor); return col; }
float sdCircle(vec2 p,float r){ return length(p)-r; }
vec3 transition(vec2 uv,vec3 col,float progress){ float ratio=iResolution.x/iResolution.y; vec2 p=uv; p-=.5; p.x*=ratio; float d=sdCircle(p,progress*sqrt(2.2)); float c=smoothstep(-.2,0.,d); col=mix(vec3(1.),col,1.-c); return col; }
void main(){ vec2 uv=vUv; vec4 tex=RGBShift(tDiffuse,uv,uRGBShiftIntensity); vec3 col=tex.xyz; col=grain(uv,col,uGrainIntensity); col=vignette(uv,col,uBgColor,uVignetteIntensity); col=transition(uv,col,uTransitionProgress); gl_FragColor=vec4(col,1.); }
`
    class Sketch extends kokomi.Base{
      create(){
        const config = { bgColor }
        const params = { transitionProgress: 0, enterProgress: 0, rotateSpeed: 15 }
        this.renderer.setClearColor(new THREE.Color(config.bgColor), 1)
        this.camera.position.set(0, 0, 16)
        const sumFormula = (n:number)=> (n*(n+1))/2
        const isOdd = (n:number)=> n % 2 === 1
        const circleCount = 3
        const circleImgCountUnit = 12
        const resourceList = Array.from({length: circleImgCountUnit * sumFormula(circleCount)}, (_, i)=> ({ name:`tex${i+1}`, type:'texture', path:`https://picsum.photos/id/${i+1}/320/400` })) as any
        const am = new kokomi.AssetManager(this, resourceList as any)
        am.on('ready', ()=>{
          try{
            const el = loaderRef.current
            if(el){
              el.style.opacity = '0'
              setTimeout(()=>{ try{ el.style.pointerEvents = 'none' } catch{} }, 350)
            }
          } catch{}
          const material = new THREE.MeshBasicMaterial()
          const r = 6.4
          const scale = 0.8
          const rings: any[] = []
          const lines: any[] = []
          for(let i=0;i<circleCount;i++){
            const c1 = sumFormula(i) * circleImgCountUnit
            const c2 = sumFormula(i+1) * circleImgCountUnit
            const textures = Object.values(am.items).slice(c1, c2)
            const ring = new THREE.Group(); this.scene.add(ring); rings.push(ring)
            textures.forEach((tex:any, j:number)=>{
              const line = new THREE.Group(); ring.add(line); lines.push(line)
              const imgScale = 0.005 * scale * (i * 0.36 + 1)
              const width = tex.image.width * imgScale
              const height = tex.image.height * imgScale
              const geometry = new THREE.PlaneGeometry(width, height)
              const mat = material.clone(); mat.map = tex; mat.needsUpdate = true
              const mesh = new THREE.Mesh(geometry, mat)
              const r2 = r * (i + 1)
              const ratio = j / (c2 - c1)
              const angle = ratio * Math.PI * 2
              mesh.position.x = r2; mesh.rotation.z = -Math.PI/2
              line.rotation.z = angle; line.add(mesh)
            })
          }
          const ce = new kokomi.CustomEffect(this, { fragmentShader, uniforms: { uBgColor:{ value:new THREE.Color(config.bgColor)}, uRGBShiftIntensity:{ value:0.0025 }, uGrainIntensity:{ value:0.025 }, uVignetteIntensity:{ value:0.8 }, uTransitionProgress:{ value:0 } } })
          ce.addExisting(); (this as any).ce = ce
          const wheelScroller = new kokomi.WheelScroller(); wheelScroller.listenForScroll()
          const dragDetecter = new kokomi.DragDetecter(this); dragDetecter.detectDrag(); dragDetecter.on('drag', (delta:any)=>{ wheelScroller.scroll.target -= (delta.x || delta.y) * 2 })
          this.update(()=>{
            wheelScroller.syncScroll()
            rings.forEach((ring:any, i:number)=>{ ring.rotation.z += 0.0025 * (isOdd(i) ? -1 : 1) * (1 + wheelScroller.scroll.delta) * params.rotateSpeed })
            lines.forEach((line:any)=>{ line.position.z = -THREE.MathUtils.lerp(0, 100, THREE.MathUtils.mapLinear(wheelScroller.scroll.delta, 0, 1000, 0, 1)) + THREE.MathUtils.lerp(10, 0, params.enterProgress) })
            ce.customPass.material.uniforms.uTransitionProgress.value = params.transitionProgress
          })
          const t1 = gsap.timeline()
          t1.to(params, { transitionProgress: 1, duration: 1, ease: 'power1.inOut' })
            .fromTo(params, { enterProgress: 0, rotateSpeed: 10 }, { enterProgress: 1, rotateSpeed: 1, duration: 1.5, ease: 'power1.inOut' }, '-=1')
            .to(heroRef.current, { opacity: 1, duration: 1, onComplete: ()=> onComplete?.() }, '-=1')
        })
      }
    }

    const sketch = new Sketch(`#${targetId}`)
    sketch.create()
    cleanup = ()=>{ try{ (sketch as any).dispose?.() } catch{} }
    return ()=>{ cleanup?.() }
  }, [bgColor, title, subtitle, onComplete])

  return (
    <div ref={containerRef} style={{ position:'relative', width:'100%', height:'100%', background:'black', overflow:'hidden' }}>
      <div id={targetId} style={{ position:'absolute', inset:0 }}></div>
      <div ref={loaderRef} className="loader-screen" style={{ position:'fixed', inset:0, background:'white', transition:'opacity .3s ease', zIndex:2 }}></div>
      <div ref={heroRef} className="hero-dom" style={{ position:'absolute', inset:0, opacity:0, zIndex:1, display:'grid', placeItems:'center', pointerEvents:'none' }}>
        <div style={{ display:'grid', gap:8, textAlign:'center' }}>
          <div style={{ fontSize:'72px', color:'#fff', letterSpacing:'0.05em' }}>{title}</div>
          <div style={{ fontSize:'18px', color:'#8a8a8a' }}>{subtitle}</div>
        </div>
      </div>
    </div>
  )
}

