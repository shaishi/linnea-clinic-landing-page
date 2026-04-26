import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_token = '<!-- Treatments Section -->'
end_token = '<!-- Transformations Section (moved after treatments) -->'

start_idx = html.find(start_token)
end_idx = html.find(end_token)

if start_idx != -1 and end_idx != -1:
    new_treatments = """<!-- Treatments Section -->
    <section class="treatments section" id="treatments" style="min-height: 800px; position: relative;">
      <div class="container relative-container" style="position: relative;">
        <h2 class="section-title text-center" data-i18n="nav-treatments" style="margin-bottom: 2rem;">Treatments</h2>
        
        <!-- View 1: Main Categories Carousel -->
        <div id="treatments-categories-view" class="drill-view active">
          <div class="carousel-wrapper" data-carousel="categories">
            <button class="carousel-btn carousel-prev" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,6 9,12 15,18"/></svg>
            </button>
            <div class="carousel-viewport">
              <div class="treatments-grid carousel-track">
                <!-- Signature -->
                <div class="treatment-card category-trigger" data-target-sub="sub-signature" style="cursor: pointer;">
                  <img src="./images/t_ffr_1777194492983.png" alt="Signature" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="cat-signature" style="font-family: 'DM Serif Display', serif;">Signature Treatments</h3>
                    <div style="font-size: 0.95rem; text-decoration: underline; margin-top: 1rem; color: var(--clinique-teal);" data-i18n="view-treatments">View Treatments</div>
                  </div>
                </div>
                <!-- Skin -->
                <div class="treatment-card category-trigger" data-target-sub="sub-skin" style="cursor: pointer;">
                  <img src="./images/t_sculptra_1777194549075.png" alt="Skin Rejuvenation" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="cat-skin" style="font-family: 'DM Serif Display', serif;">Skin Rejuvenation</h3>
                    <div style="font-size: 0.95rem; text-decoration: underline; margin-top: 1rem; color: var(--clinique-teal);" data-i18n="view-treatments">View Treatments</div>
                  </div>
                </div>
                <!-- Contouring -->
                <div class="treatment-card category-trigger" data-target-sub="sub-contouring" style="cursor: pointer;">
                  <img src="./images/contouring.png" alt="Facial Contouring" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="cat-contouring" style="font-family: 'DM Serif Display', serif;">Facial Contouring</h3>
                    <div style="font-size: 0.95rem; text-decoration: underline; margin-top: 1rem; color: var(--clinique-teal);" data-i18n="view-treatments">View Treatments</div>
                  </div>
                </div>
                <!-- Botox -->
                <div class="treatment-card category-trigger" data-target-sub="sub-botox" style="cursor: pointer;">
                  <img src="./images/botox.png" alt="Botox & Neuromodulators" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="cat-botox" style="font-family: 'DM Serif Display', serif;">Botox & Neuromodulators</h3>
                    <div style="font-size: 0.95rem; text-decoration: underline; margin-top: 1rem; color: var(--clinique-teal);" data-i18n="view-treatments">View Treatments</div>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
            <div class="carousel-dots-row"></div>
          </div>
        </div>

        <!-- View 2: Sub-Carousel - Signature -->
        <div id="sub-signature" class="drill-view">
          <div class="drill-header">
            <button class="btn-back-categories" data-i18n="btn-back"><span>&larr;</span> Back</button>
            <h3 data-i18n="cat-signature">Signature Treatments</h3>
            <div style="width:100px;"></div>
          </div>
          <div class="carousel-wrapper" data-carousel="signature">
            <button class="carousel-btn carousel-prev" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,6 9,12 15,18"/></svg>
            </button>
            <div class="carousel-viewport">
              <div class="treatments-grid carousel-track" style="justify-content: center;">
                <div class="treatment-card legal-link" data-target="modal-ffr" style="cursor: pointer;" title="View Details">
                  <img src="./images/t_ffr_1777194492983.png" alt="Full Face Restoration" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="ffr-title">Full Face Restoration</h3>
                    <p data-i18n="ffr-desc">A holistic approach combining fillers and Botox for complete facial harmony and lift.</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
            <div class="carousel-dots-row"></div>
          </div>
        </div>

        <!-- View 3: Sub-Carousel - Skin -->
        <div id="sub-skin" class="drill-view">
          <div class="drill-header">
            <button class="btn-back-categories" data-i18n="btn-back"><span>&larr;</span> Back</button>
            <h3 data-i18n="cat-skin">Skin Rejuvenation</h3>
            <div style="width:100px;"></div>
          </div>
          <div class="carousel-wrapper" data-carousel="skin">
            <button class="carousel-btn carousel-prev" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,6 9,12 15,18"/></svg>
            </button>
            <div class="carousel-viewport">
              <div class="treatments-grid carousel-track">
                <div class="treatment-card legal-link" data-target="modal-pn" style="cursor: pointer;" title="View Details">
                  <img src="./images/t_pn_1777194520499.png" alt="Polynucleotides (PN)" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="pn-title">Polynucleotides (PN)</h3>
                    <p data-i18n="pn-desc">Innovative biological molecules promoting deep cellular regeneration and skin vitality.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-sculptra" style="cursor: pointer;" title="View Details">
                  <img src="./images/t_sculptra_1777194549075.png" alt="Sculptra" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="sculptra-title">Sculptra</h3>
                    <p data-i18n="sculptra-desc">A bio-stimulator that rebuilds your body's natural collagen for long-lasting firmness.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-radiesse" style="cursor: pointer;" title="View Details">
                  <img src="./images/scientific_article.png" alt="Radiesse" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="radiesse-title">Radiesse</h3>
                    <p data-i18n="radiesse-desc">Dual-action treatment offering immediate volume while stimulating collagen and elastin.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-skinbooster" style="cursor: pointer;" title="View Details">
                  <img src="./images/skin.png" alt="Skin Booster" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="skinbooster-title">Skin Booster</h3>
                    <p data-i18n="skinbooster-desc">Deep hydration treatment improving skin elasticity for a radiant, glowing complexion.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-acne" style="cursor: pointer;" title="View Details">
                  <img src="./images/before-after-skin.png" alt="Acne Scars Treatment" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="acne-title">Acne Scars Treatment</h3>
                    <p data-i18n="acne-desc">Combined injection techniques to blur scars and significantly improve skin texture.</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
            <div class="carousel-dots-row"></div>
          </div>
        </div>

        <!-- View 4: Sub-Carousel - Contouring -->
        <div id="sub-contouring" class="drill-view">
          <div class="drill-header">
            <button class="btn-back-categories" data-i18n="btn-back"><span>&larr;</span> Back</button>
            <h3 data-i18n="cat-contouring">Facial Contouring</h3>
            <div style="width:100px;"></div>
          </div>
          <div class="carousel-wrapper" data-carousel="contouring">
            <button class="carousel-btn carousel-prev" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,6 9,12 15,18"/></svg>
            </button>
            <div class="carousel-viewport">
              <div class="treatments-grid carousel-track">
                <div class="treatment-card legal-link" data-target="modal-lips" style="cursor: pointer;" title="View Details">
                  <img src="./images/t_lips_1777194610121.png" alt="Lip Enhancement" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="lips-title">Lip Enhancement</h3>
                    <p data-i18n="lips-desc">Emphasizing lip borders, correcting asymmetry, and adding balanced natural volume.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-jawline" style="cursor: pointer;" title="View Details">
                  <img src="./images/contouring.png" alt="Jawline & Chin Sculpting" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="jawline-title">Jawline & Chin Sculpting</h3>
                    <p data-i18n="jawline-desc">Defining the facial frame to create a sculpted, lifted, and sharper profile.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-nose" style="cursor: pointer;" title="View Details">
                  <img src="./images/jaw-after.png" alt="Non-Surgical Rhinoplasty" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="nose-title">Non-Surgical Rhinoplasty</h3>
                    <p data-i18n="nose-desc">Correcting asymmetry and lifting the nasal tip precisely without surgery.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-teartrough" style="cursor: pointer;" title="View Details">
                  <img src="./images/t_teartrough_1777194646793.png" alt="Tear Trough Filler" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="teartrough-title">Tear Trough Filler</h3>
                    <p data-i18n="teartrough-desc">Delicate treatment to reduce dark circles and under-eye hollows for a rested look.</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
            <div class="carousel-dots-row"></div>
          </div>
        </div>

        <!-- View 5: Sub-Carousel - Botox -->
        <div id="sub-botox" class="drill-view">
          <div class="drill-header">
            <button class="btn-back-categories" data-i18n="btn-back"><span>&larr;</span> Back</button>
            <h3 data-i18n="cat-botox">Botox & Neuromodulators</h3>
            <div style="width:100px;"></div>
          </div>
          <div class="carousel-wrapper" data-carousel="botox">
            <button class="carousel-btn carousel-prev" aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15,6 9,12 15,18"/></svg>
            </button>
            <div class="carousel-viewport">
              <div class="treatments-grid carousel-track" style="justify-content: center;">
                <div class="treatment-card legal-link" data-target="modal-botx" style="cursor: pointer;" title="View Details">
                  <img src="./images/botox.png" alt="Classic Botox" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="botx-title">Classic Botox</h3>
                    <p data-i18n="botx-desc">Relaxing expression lines in the forehead and eyes for a smooth, serene appearance.</p>
                  </div>
                </div>
                <div class="treatment-card legal-link" data-target="modal-botxadv" style="cursor: pointer;" title="View Details">
                  <img src="./images/botox_article.png" alt="Advanced Botox" class="treatment-img" />
                  <div class="treatment-content">
                    <h3 data-i18n="botxadv-title">Advanced Botox</h3>
                    <p data-i18n="botxadv-desc">Treating bruxism (teeth grinding) or sculpting the jawline and neck.</p>
                  </div>
                </div>
              </div>
            </div>
            <button class="carousel-btn carousel-next" aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9,6 15,12 9,18"/></svg>
            </button>
            <div class="carousel-dots-row"></div>
          </div>
        </div>

      </div>
    </section>\n\n    """
    html = html[:start_idx] + new_treatments + html[end_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Updated index.html nested carousels successfully.")

