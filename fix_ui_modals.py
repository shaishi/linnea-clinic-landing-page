import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Fix "View Treatments" aesthetics -> make them primary buttons
html = re.sub(
    r'<div style="font-size: 0\.95rem; text-decoration: underline; margin-top: 1rem; color: var\(--clinique-teal\);" data-i18n="view-treatments">View Treatments</div>',
    r'<button class="btn btn-primary" style="margin-top: 1.2rem; padding: 0.6rem 1.5rem; font-size: 0.9rem; font-family: var(--font-sans); letter-spacing: 0.05em;" data-i18n="view-treatments">View Treatments</button>',
    html
)

# 2. Add the 12 missing modals right before the privacy modal
privacy_modal_token = '<!-- Privacy Policy Modal -->'
privacy_idx = html.find(privacy_modal_token)

if privacy_idx != -1:
    treatment_keys = [
        ('ffr', 'ffr'), ('pn', 'pn'), ('sculptra', 'sculptra'), ('radiesse', 'radiesse'),
        ('skinbooster', 'skinbooster'), ('acne', 'acne'),
        ('lips', 'lips'), ('jawline', 'jawline'), ('nose', 'nose'),
        ('teartrough', 'teartrough'), ('botx', 'botx'), ('botxadv', 'botxadv')
    ]
    
    new_modals = "<!-- 12 Treatment Modals -->\n"
    for tid, tkey in treatment_keys:
        new_modals += f"""
  <div class="modal-overlay legal-modal-overlay" id="modal-{tid}" role="dialog">
    <div class="modal-content legal-modal-content" style="max-width: 500px; padding: 3rem 2rem; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
      <button class="close-modal legal-close" data-close="modal-{tid}" aria-label="Close modal">&times;</button>
      <h2 class="modal-title" id="title-{tid}" data-i18n="{tkey}-title" style="margin-bottom: 2rem; font-size: 2.2rem; color: var(--clinique-teal-dark); text-align: center;">{tkey.capitalize()} Treatment</h2>
      <div class="modal-body">
        <ul style="list-style: none; padding: 0; line-height: 2.5; font-size: 1.1rem; color: var(--text-dark);">
          <li><strong data-i18n="modal-time-lbl" style="color:var(--clinique-teal);">Time:</strong> <span
              data-i18n="{tkey}-time-val" style="margin-left: 0.5rem; margin-right: 0.5rem;"></span></li>
          <li><strong data-i18n="modal-pain-lbl" style="color:var(--clinique-teal);">Pain Level:</strong> <span
              data-i18n="{tkey}-pain-val" style="margin-left: 0.5rem; margin-right: 0.5rem;"></span></li>
          <li><strong data-i18n="modal-mat-lbl" style="color:var(--clinique-teal);">Materials:</strong> <span
              data-i18n="{tkey}-mat-val" style="margin-left: 0.5rem; margin-right: 0.5rem;"></span></li>
        </ul>
        <div style="margin-top: 3rem; text-align: center;">
          <button class="btn btn-primary legal-close" data-close="modal-{tid}"
            onclick="document.getElementById('nav-book-btn').click();" data-i18n="btn-book">Book Consultation</button>
        </div>
      </div>
    </div>
  </div>
"""

    html = html[:privacy_idx] + new_modals + "\n  " + html[privacy_idx:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Modals restored and View Treatments aesthetics updated.")
