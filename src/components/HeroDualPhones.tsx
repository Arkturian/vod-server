 
import CustomHLSPlayer from '../CustomHLSPlayer'

export default function HeroDualPhones(){
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="kicker">Alexander Popovic — Klagenfurt, AT</p>
      <h1 id="hero-title" className="title">Creative Technologist & AR Storyteller</h1>
      <p className="subtitle">I design and build immersive experiences that braid <strong>nature</strong>, <strong>3D/AR</strong>, and <strong>film</strong>. Maker of Tscheppa-AR, Starburst Designer, SensePresenter.</p>
      <div className="hero-actions">
        <a className="pill primary" href="#projects">See Projects</a>
        <a className="pill" href="#work">Case Studies</a>
        <a className="pill" href="#contact">Book a call</a>
      </div>

      <div className="stack">
        <div className="phone-wrap" aria-hidden="true">
          <div className="phone" id="parallax-phone">
            <div className="screen">
              <div className="screen-inner">
                <iframe className="video-bg"
                  src="https://www.youtube.com/embed/rUcYMDtTrsw?autoplay=1&mute=1&loop=1&playlist=rUcYMDtTrsw&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1"
                  frameBorder={0}
                  allow="autoplay; encrypted-media; accelerometer; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="TSCH-AR teaser"
                />
                <div className="content-overlay">
                  <div className="phone-top"><span>alex.pop</span><span>TSCH-AR</span></div>
                  <div className="brand-big">Wunderwelten</div>
                  <p className="desc">Field-aware UI & AR scenes over real landscapes. Nature first, tech in service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="phone-wrap">
          <div className="phone">
            <div className="screen">
              <div className="screen-inner">
                <div className="content-overlay" style={{background:'transparent', padding:0}}>
                  <CustomHLSPlayer
                    hlsUrl="https://vod.arkturian.com/media/u2_20250829_171448_6fa93837/master.m3u8"
                    muted={true}
                    autoplay={true}
                    loop={true}
                    aspectRatio={9/19.5}
                    borderRadius="24px"
                    hideControls={true}
                    fillParent={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

