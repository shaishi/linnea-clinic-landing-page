import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Replace the Treatments Carousel with 4 Categories
start_token = '<div class="carousel-wrapper" data-carousel="treatments">'
end_token = '<!-- Transformations Section (moved after treatments) -->'

start_idx = html.find(start_token)
end_idx = html.find(end_token)

if start_idx != -1 and end_idx != -1:
    new_treatments = """
        <!-- Signature Category -->
        <h3 class="category-title text-center" data-i18n="cat-signature" style="margin-top: 4rem; font-family: 'DM Serif Display', serif; color: var(--clinique-teal); font-size: 2.2rem;">Signature Treatments</h3>
        <div class="treatments-grid">
          <div class="treatment-card legal-link" data-target="modal-ffr" style="cursor: pointer;" title="View Details">
            <img src="./images/t_ffr_1777194492983.png" alt="Full Face Restoration" class="treatment-img" />
            <div class="treatment-content">
              <h3 data-i18n="ffr-title">Full Face Restoration</h3>
              <p data-i18n="ffr-desc">A holistic approach combining fillers and Botox for complete facial harmony and lift.</p>
            </div>
          </div>
        </div>

        <!-- Skin Rejuvenation Category -->
        <h3 class="category-title text-center" data-i18n="cat-skin" style="margin-top: 4rem; font-family: 'DM Serif Display', serif; color: var(--clinique-teal); font-size: 2.2rem;">Skin Rejuvenation</h3>
        <div class="treatments-grid">
          <div class="treatment-card legal-link" data-target="modal-pn" style="cursor: pointer;" title="View Details">
            <img src="./images/t_pn_1777194520499.png" alt="Polynucleotides (PN)" class="treatment-img" />
            <div class="treatment-content">
              <h3 data-i18n="pn-title">Polynucleotides (PN) - Salmon DNA</h3>
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
          <div class="treatment-card legal-link" data-target="modal-prp" style="cursor: pointer;" title="View Details">
            <img src="./images/t_prp_1777194575811.png" alt="PRF / PRP" class="treatment-img" />
            <div class="treatment-content">
              <h3 data-i18n="prp-title">PRF / PRP</h3>
              <p data-i18n="prp-desc">Utilizing your own body's growth factors for natural rejuvenation and tissue repair.</p>
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

        <!-- Facial Contouring Category -->
        <h3 class="category-title text-center" data-i18n="cat-contouring" style="margin-top: 4rem; font-family: 'DM Serif Display', serif; color: var(--clinique-teal); font-size: 2.2rem;">Facial Contouring</h3>
        <div class="treatments-grid">
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

        <!-- Botox Category -->
        <h3 class="category-title text-center" data-i18n="cat-botox" style="margin-top: 4rem; font-family: 'DM Serif Display', serif; color: var(--clinique-teal); font-size: 2.2rem;">Botox & Neuromodulators</h3>
        <div class="treatments-grid">
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
    </section>

    """
    html = html[:start_idx] + new_treatments + html[end_idx:]


# 2. Replace the Modals
modal_start_token = '<div class="modal-overlay legal-modal-overlay" id="treatment-skin-modal"'
modal_end_token = '<!-- Privacy Policy Modal -->'

modal_start_idx = html.find(modal_start_token)
modal_end_idx = html.find(modal_end_token)

if modal_start_idx != -1 and modal_end_idx != -1:
    
    treatment_keys = [
        ('ffr', 'ffr'), ('pn', 'pn'), ('sculptra', 'sculptra'), ('radiesse', 'radiesse'),
        ('prp', 'prp'), ('skinbooster', 'skinbooster'), ('acne', 'acne'),
        ('lips', 'lips'), ('jawline', 'jawline'), ('nose', 'nose'),
        ('teartrough', 'teartrough'), ('botx', 'botx'), ('botxadv', 'botxadv')
    ]
    
    new_modals = ""
    for tid, tkey in treatment_keys:
        new_modals += f"""
  <div class="modal-overlay legal-modal-overlay" id="modal-{tid}" role="dialog" aria-modal="true" aria-labelledby="title-{tid}">
    <div class="modal-content legal-modal-content" style="max-width: 500px;">
      <button class="close-modal legal-close" data-close="modal-{tid}" aria-label="Close modal">&times;</button>
      <h2 class="modal-title" id="title-{tid}" data-i18n="{tkey}-title" style="margin-bottom: 1.5rem;">{tkey.capitalize()} Treatment</h2>
      <div class="modal-body">
        <ul style="list-style: none; padding: 0; line-height: 2.2;">
          <li><strong data-i18n="modal-time-lbl" style="color:var(--clinique-teal);">Time:</strong> <span
              data-i18n="{tkey}-time-val" style="margin-left: 0.5rem;"></span></li>
          <li><strong data-i18n="modal-pain-lbl" style="color:var(--clinique-teal);">Pain Level:</strong> <span
              data-i18n="{tkey}-pain-val" style="margin-left: 0.5rem;"></span></li>
          <li><strong data-i18n="modal-mat-lbl" style="color:var(--clinique-teal);">Materials:</strong> <span
              data-i18n="{tkey}-mat-val" style="margin-left: 0.5rem;"></span></li>
        </ul>
        <div style="margin-top: 2rem; text-align: center;">
          <button class="btn btn-primary legal-close" data-close="modal-{tid}"
            onclick="document.getElementById('nav-book-btn').click();" data-i18n="btn-book">Book Consultation</button>
        </div>
      </div>
    </div>
  </div>
"""

    html = html[:modal_start_idx] + new_modals + "\n  " + html[modal_end_idx:]


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated index.html successfully.")
