 

export default function SiteFooter(){
  return (
    <footer role="contentinfo">
      <div className="foot">
        <div>
          <h3>Updates</h3>
          <ul>
            <li><a href="#">Newsletter</a></li>
            <li><a href="#">Instagram</a></li>
          </ul>
        </div>
        <div>
          <h3>Clients & Partners</h3>
          <ul>
            <li>FFG / KWF (projects)</li>
            <li>Makerspace Villach</li>
            <li>Local schools & tourism</li>
          </ul>
        </div>
        <div>
          <h3>Legal</h3>
          <ul>
            <li><a href="#">Imprint</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        </div>
        <div>
          <h3>Credits</h3>
          <ul>
            <li>Design & Dev: Alexander Popovic</li>
          </ul>
        </div>
      </div>
      <div className="foot-bottom">© <span id="y"></span> Alexander Popovic</div>
    </footer>
  )
}

