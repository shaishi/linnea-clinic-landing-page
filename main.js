// --- Imports Disabled for CDN / Direct Browser Compatibility ---
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') { gsap.registerPlugin(ScrollTrigger); }

const LINNEA_TRACKING_CONFIG = {
  googleAnalyticsId: '', // Example: G-XXXXXXXXXX
  metaPixelId: '', // Example: 123456789012345
};

let linneaTrackingLoaded = false;

const hasTrackingId = (value, prefix) => {
  const normalized = String(value || '').trim();
  return normalized && normalized.indexOf(prefix) === 0 && !normalized.includes('XXXXXXXX');
};

const loadScriptOnce = (id, src, onLoad) => {
  if (document.getElementById(id)) {
    if (onLoad) onLoad();
    return;
  }

  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  if (onLoad) script.onload = onLoad;
  document.head.appendChild(script);
};

const initLinneaTracking = () => {
  if (linneaTrackingLoaded) return;

  const gaId = String(LINNEA_TRACKING_CONFIG.googleAnalyticsId || '').trim();
  const pixelId = String(LINNEA_TRACKING_CONFIG.metaPixelId || '').trim();
  const hasGa = hasTrackingId(gaId, 'G-');
  const hasPixel = Boolean(pixelId) && !pixelId.includes('XXXXXXXX');

  if (!hasGa && !hasPixel) return;
  linneaTrackingLoaded = true;

  if (hasGa) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', gaId, {
      anonymize_ip: true,
      page_title: document.title,
      page_location: window.location.href,
    });
    loadScriptOnce('linnea-ga4', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
  }

  if (hasPixel) {
    window.fbq = window.fbq || function fbq(){ (window.fbq.callMethod ? window.fbq.callMethod : window.fbq.queue.push).apply(window.fbq, arguments); };
    if (!window.fbq.queue) window.fbq.queue = [];
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView');
    loadScriptOnce('linnea-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
  }
};

const trackLinneaEvent = (eventName, params = {}) => {
  if (!linneaTrackingLoaded) return;

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }

  if (typeof window.fbq === 'function') {
    const metaEventMap = {
      booking_modal_open: 'Contact',
      consultation_request_submit: 'Lead',
      consultation_request_success: 'Lead',
      whatsapp_click: 'Contact',
    };
    const metaEventName = metaEventMap[eventName];
    if (metaEventName) window.fbq('track', metaEventName, params);
  }
};

let lenis;
try {
  if (typeof Lenis !== 'undefined') {
    // Initialize Smooth Scrolling (Lenis)
    lenis = new Lenis({
      duration: 0.9,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
} catch (e) {
  console.warn("Smooth scroll initialization failed:", e);
}

document.addEventListener('DOMContentLoaded', () => {
  const hasGsap = typeof gsap !== 'undefined';
  const hasScrollTrigger = typeof ScrollTrigger !== 'undefined';

  // --- Custom Cursor Logic ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');

  if (cursorDot && cursorOutline && hasGsap) {
    document.body.classList.add('has-custom-cursor');

    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Use GSAP for smooth cursor trailing
      gsap.to(cursorDot, { x: posX, y: posY, duration: 0.1 });
      gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.25 });
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('a, button, input, textarea, select, label, .treatment-card, .doctor-card, .review-card, .ba-handle, .legal-link')) {
        cursorOutline.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const fromInteractive = e.target.closest('a, button, input, textarea, select, label, .treatment-card, .doctor-card, .review-card, .ba-handle, .legal-link');
      const toInteractive = e.relatedTarget && e.relatedTarget.closest
        ? e.relatedTarget.closest('a, button, input, textarea, select, label, .treatment-card, .doctor-card, .review-card, .ba-handle, .legal-link')
        : null;
      if (fromInteractive && !toInteractive) {
        cursorOutline.classList.remove('cursor-hover');
      }
    });
  }

  // --- Hero Intro Animation ---
  const heroTl = hasGsap
    ? gsap.timeline({ paused: true, defaults: { ease: 'power4.out', duration: 1.0 } })
    : { progress: () => {}, play: () => {} };

  if (hasGsap) {
    heroTl
      .fromTo('.hero-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, delay: 0.15 })
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8')
      .fromTo('.hero-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, '-=0.8');
  }

  // --- Pre-loader Removal (GSAP block removed in favor of CSS transition below) ---

  // --- GSAP Scroll Reveals ---
  const revealSections = document.querySelectorAll('section');

  if (hasGsap && hasScrollTrigger) {
    revealSections.forEach(section => {
      const sectionTitle = section.querySelector('.section-title');
      const sectionDesc = section.querySelector('.section-description');
      const cards = Array.from(section.querySelectorAll('.treatment-card, .article-card, .review-card, .ba-container, .article-hero-img, .reveal, .article-content p'))
        .filter(el => !el.classList.contains('section-title') && !el.classList.contains('section-description'));

      const sectionTl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      });

      if (sectionTitle) {
        sectionTl.fromTo(sectionTitle,
          { opacity: 0, y: -50 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
      }

      if (sectionDesc) {
        sectionTl.fromTo(sectionDesc,
          { opacity: 0, y: -30 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' },
          '-=0.6'
        );
      }

      if (cards.length > 0) {
        sectionTl.fromTo(cards,
          { opacity: 0, y: -60 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
          '-=0.6'
        );
      }
    });
  }

  // Specific about-section parallax/reveal
  if (hasGsap && hasScrollTrigger) {
    gsap.fromTo('.about-text p',
      {
        opacity: 0,
        x: document.documentElement.dir === 'rtl' ? 50 : -50,
      },
      {
        scrollTrigger: {
          trigger: '.about',
          start: 'top 70%'
        },
        opacity: 1,
        x: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power3.out'
      }
    );

    gsap.fromTo('.about-image',
      {
        opacity: 0,
        scale: 0.9,
      },
      {
        scrollTrigger: {
          trigger: '.about',
          start: 'top 70%'
        },
        opacity: 1,
        scale: 1,
        duration: 0.9,
        ease: 'power2.out'
      }
    );
  }


  // --- Magnetic Buttons ---
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .social-icon');

  if (hasGsap) {
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.5,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)'
        });
      });
    });
  }

  // --- Preloader ---
  const preloaderEl = document.getElementById('preloader');

  if (!hasGsap) {
    if (preloaderEl) preloaderEl.style.display = 'none';
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
  } else if (sessionStorage.getItem('preloaderShown')) {
    // Return visit: skip instantly, jump hero to final state
    if (preloaderEl) preloaderEl.style.display = 'none';
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    heroTl.progress(1);
    if (hasScrollTrigger) ScrollTrigger.refresh();
  } else {
    // First visit: brand preloader for 2.5s, then GSAP wipe + hero reveal simultaneously
    sessionStorage.setItem('preloaderShown', 'true');
    setTimeout(() => {
      document.body.classList.remove('loading');

      // Step 1: brand content gently recedes (scale down + fade)
      gsap.to('.loader-content', {
        scale: 0.88,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in'
      });

      // Step 2: overlay dissolves after content fades
      gsap.to(preloaderEl, {
        opacity: 0,
        duration: 0.7,
        delay: 0.3,
        ease: 'power2.inOut',
        onComplete: () => {
          document.body.classList.add('loaded'); // CSS instantly enforces display:none
        }
      });

      // Hero materializes as overlay dissolves
      setTimeout(() => {
        heroTl.play();
        if (hasScrollTrigger) ScrollTrigger.refresh();
      }, 500);
    }, 2500);
  }

  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // --- Language Switching Enhancements ---
  // (The rest of the translations and logic remains, but we add a small re-trigger for GSAP if needed)

  const langToggles = document.querySelectorAll('.lang-toggle');
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const params = new URLSearchParams(window.location.search);
  const requestedLang = params.get('lang');
  let currentLang = ['he', 'en'].includes(requestedLang)
    ? requestedLang
    : (localStorage.getItem('linneaLang') || 'he');
  localStorage.setItem('linneaLang', currentLang);

  const setLeadTrackingFields = () => {
    const trackingMap = {
      'lead-page-url': window.location.href,
      'lead-page-language': currentLang,
      'lead-utm-source': params.get('utm_source') || '',
      'lead-utm-medium': params.get('utm_medium') || '',
      'lead-utm-campaign': params.get('utm_campaign') || '',
      'lead-utm-term': params.get('utm_term') || '',
      'lead-utm-content': params.get('utm_content') || '',
    };

    Object.keys(trackingMap).forEach(id => {
      const input = document.getElementById(id);
      if (input) input.value = trackingMap[id];
    });
  };

  const translations = {
    en: {
      "nav-about": "About",
      "nav-treatments": "Treatments",
      "nav-science": "Science",
      "nav-directions": "Directions",
      "nav-contact": "Contact",
      "page-title": "Linnéa | High-End Aesthetic Clinic",
      "article-botox-title": "Linnéa | The Art of Botox",
      "article-fillers-title": "Linnéa | Mastering Dermal Fillers",
      "article-scientific-title": "Linnéa | The Science of Longevity",
      "article-skin-quality-title": "Linnéa | Skin Quality, Quietly Refined",
      "article-facial-harmony-title": "Linnéa | Facial Harmony Over Volume",
      "article-consultation-plan-title": "Linnéa | The Consultation as a Treatment Plan",
      "nav-home": "Home",
      "nav-articles": "Articles",
      "btn-book": "Book a Personal Consultation",
      "hero-title": "Linnéa | Medical Precision, Clean Lines",
      "hero-subtitle": "Dual-doctor consultations for natural, harmonious results.",
      "method-kicker": "The Linnéa Method",
      "method-title": "A quieter standard in aesthetics",
      "method-desc": "Every consultation is built around medical clarity, facial harmony and restraint.",
      "method-1-title": "Dual-doctor planning",
      "method-1-desc": "Two doctors review the facial structure, treatment goals and safety considerations before creating a personal plan.",
      "method-2-title": "Precise minimalism",
      "method-2-desc": "The focus is on subtle refinement, preserving expression and proportion rather than changing identity.",
      "method-3-title": "Medical continuity",
      "method-3-desc": "Consultation, preparation, treatment and follow-up are connected into one calm, medically led patient journey.",
      "about-title": "Precision, Harmony, Restraint",
      "about-p1": "We believe that aesthetics is not about altering, but rather refining existing beauty. At Linnéa, we combine advanced science with a refined, human-centered approach, providing you with a space of tranquility and complete confidence throughout your journey.",
      "about-p2": "Our professional core beats within our joint consultation model: every treatment plan is developed by two doctors working in complete synergy. This collaboration ensures an in-depth diagnosis, meticulous planning, and a harmonious result that respects your unique facial features.",
      "about-p3": "Beyond medical excellence, the professional dialogue between us allows us to examine every angle and detail of the treatment plan, with dual oversight guaranteeing maximum precision and uncompromising safety. We are committed to results that are not only aesthetic but balanced and natural—results that blend softly into your lifestyle and reflect the most radiant, precise version of yourself.",
      "treatments-title": "Our Treatments",
      "treatments-desc": "A curated selection of high-end procedures designed to rejuvenate and refine.",
      "skin-title": "Skin Rejuvenation",
      "skin-desc": "Advanced therapies using the latest luminescence technology to restore your skin's youthful glow and texture.",
      "botox-title": "Injectables",
      "botox-desc": "Precise, natural-looking enhancements performed by our master injectors for a refreshed appearance.",
      "contouring-title": "Facial Contouring",
      "contouring-desc": "Tailored structural treatments to define, lift, and harmonize your natural facial proportions.",
      "location-title": "Visit Our Clinic",
      "location-desc": "Located in the heart of the city, Linnéa offers a hygienic, soothing sanctuary away from the bustle. We invite you to step into our luxurious space.",
      "address-label": "Address:",
      "address-val": "150 Menachem Begin Road, Tel Aviv",
      "hours-label": "Hours:",
      "phone-label": "Phone:",
      "get-directions": "Get Directions",
      "map-placeholder": "Map View",
      "footer-tagline": "Warm, luxurious, inviting, human.",
      "footer-explore": "Explore",
      "footer-contact": "Contact Us",
      "footer-address": "150 Menachem Begin Road, Tel Aviv, Israel",
      "footer-discuss": "Let's discuss your journey.",
      "footer-rights": "© 2026 Linnéa Aesthetic Clinic. All rights reserved.",
      "modal-title": "Book a Personal Consultation",
      "modal-desc": "Share a few details and our team will offer a discreet consultation time.",
      "label-name": "Full Name",
      "placeholder-name": "Your full name",
      "label-email": "Email",
      "placeholder-email": "jane@example.com",
      "label-phone": "Phone Number",
      "placeholder-phone": "+972 50 000 0000",
      "label-interest": "Area of Interest",
      "opt-rejuvenation": "Skin Rejuvenation",
      "opt-injectables": "Injectables",
      "opt-contouring": "Facial Contouring",
      "opt-other": "Other",
      "label-other-details": "Please specify",
      "placeholder-other-details": "A few words about what you would like to refine",
      "reviews-title": "What Our Clients Say",
      "reviews-subtitle": "Google Reviews",
      "review-google-btn": "Rate us on Google",
      "transformations-title": "Visible Transformations",
      "transformations-desc": "Slide to explore our natural-looking results.",
      "transformations-disclaimer": "Results may vary.",
      "before-label": "Before",
      "after-label": "After",
      "slider-before": "Before",
      "slider-after": "After",
      "review1-text": "\"An amazing experience from start to finish. The results are super natural and I felt so taken care of.\"",
      "review1-author": "Michal R.",
      "review2-text": "\"Dr. Shiloh is a true artist. My skin has never looked better, and most importantly, it still looks like ME.\"",
      "review2-author": "David L.",
      "review3-text": "\"Professional, hygienic, and very high-end. Highly recommended for anyone looking for quality.\"",
      "review3-author": "Sarah B.",
      "review4-text": "\"The consultation felt calm, precise and honest. Nothing was rushed, and the recommendation felt truly tailored.\"",
      "review4-author": "Noa A.",
      "review5-text": "\"A beautiful clinic with a refined approach. I appreciated how natural the plan was and how clearly everything was explained.\"",
      "review5-author": "Maya L.",
      "review6-text": "\"Professional, gentle and exceptionally detail-oriented. The follow-up made me feel genuinely cared for.\"",
      "review6-author": "Yael K.",
      "btn-submit": "Submit Request",
      "alert-success": "Thank you. Your consultation request has been received.",
      "nav-accessibility": "Accessibility Statement",
      "nav-privacy": "Privacy Policy",
      "nav-terms": "Terms of Use",
      "footer-legal": "Legal",
      "cookie-text": "We use essential and analytics cookies. You can accept or decline.",
      "cookie-accept": "Accept",
      "cookie-decline": "Decline",
      "acc-title": "Accessibility Options",
      "acc-increase-font": "Increase Font Size",
      "acc-decrease-font": "Decrease Font Size",
      "acc-high-contrast": "High Contrast",
      "acc-light-bg": "Light Background",
      "acc-links-underline": "Highlight Links",
      "acc-reset": "Reset Settings",
      "accessibility-stmt-content": "We view accessibility as fundamentally important. This website has been adapted to Israeli Standard IS 5568 and WCAG 2.0 Level AA. If you encounter any accessibility issues, please contact our accessibility coordinator.",
      "privacy-content": "Your privacy is important to us. We collect consultation details, consent choices and operational appointment information only for clinic communication, scheduling, preparation forms and follow-up. Email updates require separate consent and may be cancelled at any time.",
      "terms-content": "By browsing and using this website, you agree to comply with and be bound by the following terms of use. The contents of this website are for general information and aesthetic service booking purposes only.",
      "nav-home": "Home",
      "nav-articles": "Articles",
      "articles-title": "Insights & Science",
      "articles-desc": "Explore our expert articles on aesthetic medicine, treatments, and the science of longevity.",
      "read-more": "Read More",
      "success-title": "Thank You!",
      "success-msg": "Your request has been received. We will follow up with refined appointment options shortly.",
      "service-consent": "I agree that Linnéa may contact me by email, phone or WhatsApp for consultation scheduling, appointment reminders, preparation forms and treatment follow-up.",
      "privacy-consent-1": "I have read and agree to the ",
      "privacy-consent-2": "Privacy Policy",
      "privacy-consent-3": " and ",
      "privacy-consent-4": "Terms of Use",
      "email-updates-consent-1": "I agree to receive email updates. You may unsubscribe at any time. ",
      "email-updates-consent-2": "Privacy Policy",
      "article1-title": "The Art of Botox",
      "article1-subtitle": "A deep dive into neuromodulators and natural expression.",
      "article1-desc": "Discover how precise neuromodulator treatments can smooth wrinkles while maintaining your natural expressions.",
      "article1-p1": "Botox, or botulinum toxin, has revolutionized the field of aesthetic medicine. When administered by experts, it is not about freezing the face, but rather relaxing the specific hyperactive muscles that cause deep dynamic wrinkles.",
      "article1-p2": "At Linnéa, our philosophy centers around the \"micro-dosing\" technique. By using tiny, precise amounts of neuromodulators, we soften crow's feet, frown lines, and forehead creases while preserving your beautiful, natural micro-expressions.",
      "article1-p3": "The procedure is minimally invasive, with no downtime. Most clients start noticing a gentle softening within 3-5 days, peaking at two weeks. The results typically last 3-4 months, offering a continually refreshed, well-rested appearance.",
      "article1-p4": "Beyond wrinkle reduction, advanced neuromodulator techniques can be used for facial sculpting. By strategically relaxing specific depressor muscles, we can achieve a subtle brow lift, soften a square jawline through masseter reduction, or correct a gummy smile, all without surgical intervention.",
      "article1-p5": "Safety, precision, and artistry are our top priorities. During your comprehensive consultation, our medical experts will map your unique facial anatomy to design a bespoke treatment plan, ensuring that every unit of product serves a specific, harmonizing purpose for your unique features.",
      "related-treatments": "Explore Related Approaches",
      "link-botox": "→ The Art of Neuromodulators",
      "link-fillers": "→ Mastering Dermal Fillers",
      "link-scientific": "→ Science of Longevity",
      "link-precision": "→ Precision Neuromodulators",
      "link-volume": "→ Volume Restoration",
      "article1-p4": "Beyond wrinkle reduction, advanced neuromodulator techniques can be used for facial sculpting. By strategically relaxing specific depressor muscles, we can achieve a subtle brow lift, soften a square jawline through masseter reduction, or correct a gummy smile, all without surgical intervention.",
      "article1-p5": "Safety, precision, and artistry are our top priorities. During your comprehensive consultation, our medical experts will map your unique facial anatomy to design a bespoke treatment plan, ensuring that every unit of product serves a specific, harmonizing purpose for your unique features.",
      "article2-title": "Mastering Dermal Fillers",
      "article2-subtitle": "The art of facial contouring and elegant volume restoration.",
      "article2-desc": "Learn about the subtleties of facial contouring and restoring volume for a youthful, balanced appearance.",
      "article2-p1": "As we age, our face naturally loses volume, specifically in the delicate fat pads beneath our skin. Dermal fillers, primarily composed of hyaluronic acid—a naturally occurring substance in our bodies—are designed to gracefully restore this lost volume and provide structural support.",
      "article2-p2": "Our approach is strictly anatomical and highly personalized. Whether subtly enhancing the lips, restoring cheekbones, or structuring the jawline, our goal is to harmonize your features, never to distort them. We carefully analyze your facial proportions to ensure a balanced, sophisticated outcome.",
      "article2-p3": "Treatments are quick and results are visible immediately, with full integration into the tissue occurring over a few weeks. The hyaluronic acid binds with water, keeping your skin continuously hydrated and plump from within.",
      "article2-p4": "Unlike traditional approaches that focus merely on plumping, our modern techniques utilize advanced cross-linked hyaluronic acid gels that integrate seamlessly with your native tissue. This prevents the \"puffy\" look, moving dynamically with your expressions and ensuring elegant longevity.",
      "article2-p5": "We combine this artistic vision with rigorous medical safety. By utilizing micro-cannulas and precise anatomical mapping, our master injectors minimize downtime and maximize comfort. The result is a refined, effortlessly radiant version of yourself that honors your natural bone structure.",
      "article3-title": "The Science of Longevity",
      "article3-subtitle": "Evidence-based approaches to cellular health and graceful aging.",
      "article3-desc": "Delve into our evidence-based approach combining aesthetic treatments with cellular health and graceful aging.",
      "article4-title": "Skin Quality, Quietly Refined",
      "article4-subtitle": "A modern approach to texture, glow and collagen support.",
      "article4-desc": "How texture, hydration and collagen-focused care create a polished result without changing the face.",
      "article4-p1": "High-end aesthetic care is not always about changing a feature. Often, the most refined result begins with the quality of the skin itself: smoother texture, balanced hydration, calmer tone and a more luminous surface.",
      "article4-p2": "At Linnéa, we assess skin quality through multiple layers: barrier health, pigmentation, redness, pore appearance, fine lines and collagen density. This allows us to choose treatments that improve the skin gradually and intelligently.",
      "article4-p3": "Depending on the skin, a plan may include biostimulators, polynucleotides, microneedling, light-based treatments or medical-grade skincare. The goal is not an instant artificial shine, but a healthier architecture that reflects light beautifully.",
      "article4-p4": "Small, consistent improvements tend to look more elegant than aggressive intervention. When the skin becomes more resilient, makeup sits better, facial contours look softer and the overall expression appears rested.",
      "article4-p5": "A refined skin-quality plan is personalized, seasonal and measured. During consultation, we build a sequence that respects your pace, your skin history and the level of visibility you want after treatment.",
      "article5-title": "Facial Harmony Over Volume",
      "article5-subtitle": "Why proportion, light and restraint matter more than adding more.",
      "article5-desc": "Why high-end aesthetic planning begins with proportion, light and restraint.",
      "article5-p1": "A beautiful aesthetic result is rarely defined by volume alone. It is defined by harmony: the relationship between the cheeks, lips, jawline, temples, chin and the way light moves across the face.",
      "article5-p2": "Before recommending any injectable treatment, we look at the face as a whole. Sometimes the best intervention is a small structural correction; sometimes it is skin quality; sometimes it is choosing not to treat a certain area.",
      "article5-p3": "The luxury standard in aesthetic medicine is restraint. It requires technical skill, anatomical knowledge and the confidence to keep the result quiet enough that it belongs to the patient.",
      "article5-p4": "This is especially important with fillers. Used thoughtfully, they can restore support, soften shadows and refresh the face. Used without proportion, they can blur individuality.",
      "article5-p5": "At Linnéa, the plan is built around your natural architecture. Our intention is not to make you look treated, but to make your features feel balanced, rested and distinctly yours.",
      "article6-title": "The Consultation as a Treatment Plan",
      "article6-subtitle": "What should be clarified before any aesthetic procedure begins.",
      "article6-desc": "What a thoughtful consultation should clarify before any aesthetic procedure begins.",
      "article6-p1": "A consultation is not a formality. In a high-end aesthetic clinic, it is the foundation of the treatment plan and often the most important part of the patient journey.",
      "article6-p2": "The conversation should clarify your goals, your medical background, previous treatments, sensitivities, timing constraints and the level of change you are comfortable with. It should also explain what should not be done.",
      "article6-p3": "Good planning includes sequencing. Some patients benefit from preparing the skin before injectables; others need a single subtle treatment before an event; others are best served by a long-term maintenance plan.",
      "article6-p4": "A thoughtful consultation also creates safety. It gives space for medical questions, informed consent, expected recovery, possible side effects and clear follow-up instructions.",
      "article6-p5": "At Linnéa, the consultation is designed to feel calm and transparent. You should leave with clarity: what is recommended, why it is recommended, what alternatives exist and what result is realistic.",
      "alt-dr-shilo": "Dr. Shiloh DMD MSc, Expert Aesthetic Doctor at Linnéa Aesthetic Clinic Tel Aviv, Israel",
      "alt-skin": "Professional Skin Rejuvenation and Advanced Laser Treatments at Linnéa Aesthetic Clinic Israel",
      "alt-botox": "Expert Botox Injections and Dermal Fillers at Premium Aesthetic Clinic Tel Aviv",
      "alt-contouring": "Facial Contouring and Aesthetic Sculpting Specialist in Tel Aviv, Israel",
      "alt-article-botox": "The Art of Botox: Expert Anti-Aging and Wrinkle Treatments in Israel",
      "alt-article-fillers": "Mastering Dermal Fillers: Advanced Volume Restoration at Linnéa Aesthetic Clinic",
      "alt-article-scientific": "Science of Longevity: Evidence-Based Aesthetic Medicine in Israel",
      "alt-article-skin-quality": "Skin quality treatment planning for refined texture and glow at Linnéa",
      "alt-article-facial-harmony": "Facial harmony and proportion-based aesthetic planning at Linnéa",
      "alt-article-consultation-plan": "Thoughtful aesthetic consultation and treatment planning at Linnéa",
      "alt-skin-after": "After Results of Skin Rejuvenation Treatment at Linnéa Clinic Israel",
      "alt-skin-before": "Before Skin Rejuvenation Treatment at Aesthetic Clinic Tel Aviv",
      "alt-lips-after": "After Results of Lip Enhancement Fillers in Israel",
      "alt-lips-before": "Before Lip Enhancement Fillers at Linnéa Clinic",
      "alt-jawline-after": "After Jawline Contouring and Facial Sculpting Results",
      "alt-jawline-before": "Before Jawline Contouring at Tel Aviv Aesthetic Clinic",
      "alt-article1-hero": "Botox and Neuromodulator Treatment for Natural Results in Israel",
      "alt-article2-hero": "Dermal Fillers and Facial Balancing for Elegant Aging in Tel Aviv",
      "alt-article3-hero": "Cellular Health and Longevity Science in Modern Aesthetic Medicine Israel",
      "alt-article4-hero": "Skin quality, hydration and collagen support in aesthetic medicine",
      "alt-article5-hero": "Facial harmony, proportion and elegant aesthetic planning",
      "alt-article6-hero": "Private aesthetic consultation and treatment planning at Linnéa",
      "article3-p1": "True aesthetic beauty radiates from within, reflecting optimal cellular health. At Linnéa, we look beyond the surface, integrating cutting-edge longevity science with our aesthetic treatments to ensure age-defying results that last.",
      "article3-p2": "Our scientific approach focuses on bio-stimulation and regenerative medicine. By triggering the body's natural collagen and elastin production through advanced technologies like microneedling, laser therapies, and polynucleotides, we effectively repair the skin at a molecular level.",
      "article3-p3": "We are committed to educating our clients on how lifestyle, nutrition, and advanced aesthetics go hand-in-hand. Embracing longevity means investing in treatments that not only refine your appearance today but also build resilient, healthy skin architecture for years to come.",
      "article3-p4": "By harnessing the body's innate healing mechanisms through treatments such as polynucleotides and advanced bio-stimulators, we actively rebuild the extracellular matrix. This doesn't just camouflage aging—it actively slows it down down at a cellular level, creating thicker, more resilient skin.",
      "article3-p5": "At Linnéa, aesthetic longevity is a journey, not a destination. During your consultation, we develop a comprehensive roadmap tailored to your genetic predispositions and lifestyle factors, combining restorative clinic treatments with at-home medical-grade skincare for compounding results.",
      "modal-time-lbl": "Time:",
      "modal-pain-lbl": "Pain Level:",
      "modal-mat-lbl": "Materials:",
      "skin-time-val": "45-60 Minutes",
      "skin-pain-val": "Minimal (Topical Anesthetic)",
      "skin-mat-val": "Advanced Lasers, Polynucleotides, Bio-stimulators",
      "botox-time-val": "15-30 Minutes",
      "botox-pain-val": "Very Low (Micro-needles)",
      "botox-mat-val": "Premium Neuromodulators (Botox, Dysport)",
      "contouring-time-val": "30-60 Minutes",
      "contouring-pain-val": "Mild (Contains Lidocaine)",
      "contouring-mat-val": "High-Density Hyaluronic Acid Fillers",
      "doc-title": "Our Doctors",
      "doc-name": "Dr. Shmuel Shai Shiloh DMD, MSc",
      "doc-p1": "Dr. Shiloh is a graduate of the Hebrew University of Jerusalem and Hadassah Medical Center, holding both a DMD degree and an MSc in Medical Big Data. His unique background combines advanced medical training with technological expertise from Unit 8200, enabling an innovation-driven, research-oriented, and technology-focused approach to aesthetic medicine and injectables.",
      "doc-p2": "Dr. Shiloh’s philosophy is rooted in precise minimalism - clean, refined, and natural-looking treatments that preserve facial harmony and authenticity. Each treatment is carefully tailored, with meticulous attention to detail and close, personalized guidance throughout the entire journey, with the understanding that exceptional results should not only look natural, but feel right. At the clinic, only FDA-approved materials are used, reflecting an uncompromising commitment to excellence, safety, and long-term outcomes.",
      "doc-p3": "Alongside his clinical practice, Dr. Shiloh is passionate about education. He actively instructs and mentors students and practitioners in the field of aesthetic medicine, ensuring the next generation adheres to the highest standards of safety, precision, and patient care.",
      "doc2-name": "Dr. Yasmine Khoury DMD, MSc",
      "doc2-p1": "Dr. Yasmine Khoury, a dental physician and biomedical researcher, graduated with honors from the Hebrew University of Jerusalem, completing both a DMD and an MSc in Dental Sciences. Her background combines academic excellence, advanced research experience, and participation in the international scientific arena—forming the foundation for a precise, up-to-date, and evidence-based clinical approach.",
      "doc2-p2": "Dr. Khoury's professional approach focuses on dental aesthetics with a minimalist and precise touch—gentle, clean, and natural treatments that preserve the harmony and authenticity of the smile. Every treatment is fully personalized, with meticulous attention to detail and a pursuit of elegant results that don't look 'done' but blend naturally into the overall appearance.",
      "doc2-p3": "Alongside her clinical work, Dr. Khoury is involved in instructing and teaching students and professionals in the field, driven by a commitment to high standards, uncompromising safety, and continuous development. For her, aesthetic dentistry is a fusion of science, precision, and art—where the goal is not just to improve appearance but to create a result that feels right, natural, and safe for every patient.",
      "cat-signature": "Signature Treatments",
      "cat-skin": "Skin Rejuvenation",
      "cat-contouring": "Facial Contouring",
      "cat-botox": "Botox & Neuromodulators",
      "ffr-title": "Full Face Restoration",
      "ffr-desc": "A holistic approach combining fillers and Botox for complete facial harmony and lift.",
      "ffr-time-val": "60-90 Minutes",
      "ffr-pain-val": "Mild (Topical Anesthetic)",
      "ffr-mat-val": "Hyaluronic Acid, Botox, Bio-stimulators",
      "pn-title": "Polynucleotides (PN) - Salmon DNA",
      "pn-desc": "Innovative biological molecules promoting deep cellular regeneration and skin vitality.",
      "pn-time-val": "30-45 Minutes",
      "pn-pain-val": "Minimal (Topical Anesthetic)",
      "pn-mat-val": "Polynucleotides",
      "sculptra-title": "Sculptra",
      "sculptra-desc": "A bio-stimulator that rebuilds your body's natural collagen for long-lasting firmness.",
      "sculptra-time-val": "45-60 Minutes",
      "sculptra-pain-val": "Minimal (Topical Anesthetic)",
      "sculptra-mat-val": "Poly-L-Lactic Acid (PLLA)",
      "radiesse-title": "Radiesse",
      "radiesse-desc": "Dual-action treatment offering immediate volume while stimulating collagen and elastin.",
      "radiesse-time-val": "30-45 Minutes",
      "radiesse-pain-val": "Mild",
      "radiesse-mat-val": "Calcium Hydroxylapatite",
      "prp-title": "PRF / PRP",
      "prp-desc": "Utilizing your own body's growth factors for natural rejuvenation and tissue repair.",
      "prp-time-val": "45-60 Minutes",
      "prp-pain-val": "Mild (Topical Anesthetic)",
      "prp-mat-val": "Platelet-Rich Plasma/Fibrin",
      "skinbooster-title": "Skin Booster",
      "skinbooster-desc": "Deep hydration treatment improving skin elasticity for a radiant, glowing complexion.",
      "skinbooster-time-val": "20-30 Minutes",
      "skinbooster-pain-val": "Minimal",
      "skinbooster-mat-val": "Lightweight Hyaluronic Acid",
      "acne-title": "Acne Scars Treatment",
      "acne-desc": "Combined injection techniques to blur scars and significantly improve skin texture.",
      "acne-time-val": "45-60 Minutes",
      "acne-pain-val": "Moderate (Topical)",
      "acne-mat-val": "Bio-stimulators / Fillers",
      "lips-title": "Lip Enhancement",
      "lips-desc": "Emphasizing lip borders, correcting asymmetry, and adding balanced natural volume.",
      "lips-time-val": "30-45 Minutes",
      "lips-pain-val": "Mild (Topical Anesthetic)",
      "lips-mat-val": "Dedicated Hyaluronic Acid",
      "jawline-title": "Jawline & Chin Sculpting",
      "jawline-desc": "Defining the facial frame to create a sculpted, lifted, and sharper profile.",
      "jawline-time-val": "45 Minutes",
      "jawline-pain-val": "Mild",
      "jawline-mat-val": "High-Density Hyaluronic Acid / Radiesse",
      "nose-title": "Non-Surgical Rhinoplasty",
      "nose-desc": "Correcting asymmetry and lifting the nasal tip precisely without surgery.",
      "nose-time-val": "20-30 Minutes",
      "nose-pain-val": "Minimal",
      "nose-mat-val": "Hyaluronic Acid",
      "teartrough-title": "Tear Trough Filler",
      "teartrough-desc": "Delicate treatment to reduce dark circles and under-eye hollows for a rested look.",
      "teartrough-time-val": "30 Minutes",
      "teartrough-pain-val": "Minimal",
      "teartrough-mat-val": "Hyaluronic Acid",
      "botx-title": "Classic Botox",
      "botx-desc": "Relaxing expression lines in the forehead and eyes for a smooth, serene appearance.",
      "botx-time-val": "15-20 Minutes",
      "botx-pain-val": "Virtually None",
      "botx-mat-val": "Botulinum Toxin",
      "botxadv-title": "Advanced Botox",
      "botxadv-desc": "Treating bruxism (teeth grinding) or sculpting the jawline and neck.",
      "botxadv-time-val": "20 Minutes",
      "botxadv-pain-val": "Minimal",
      "botxadv-mat-val": "Botulinum Toxin"
      ,"btn-back": "Back",
      "view-treatments": "View Treatments"

    },
    he: {
      "nav-about": "אודות",
      "nav-treatments": "טיפולים",
      "nav-science": "מדע",
      "nav-directions": "הגעה",
      "nav-contact": "צור קשר",
      "btn-book": "קביעת ייעוץ אישי",
      "hero-title": "Linnéa | דיוק רפואי בקו נקי",
      "hero-subtitle": "ייעוץ אסתטי אישי על ידי שני רופאים, בגישה נקייה ומדויקת לתוצאה טבעית והרמונית.",
      "method-kicker": "שיטת Linnéa",
      "method-title": "סטנדרט שקט ומדויק לרפואה אסתטית",
      "method-desc": "כל ייעוץ נבנה סביב בהירות רפואית, הרמוניית פנים וריסון אסתטי, כדי שהתוצאה תרגיש מעודנת ולא מטופלת.",
      "method-1-title": "תכנון על ידי שני רופאים",
      "method-1-desc": "שני רופאים בוחנים את מבנה הפנים, מטרות הטיפול ושיקולי הבטיחות לפני בניית תוכנית אישית.",
      "method-2-title": "מינימליזם מדויק",
      "method-2-desc": "הדגש הוא על עידון עדין, שמירה על הבעה ופרופורציה, ולא על שינוי הזהות הפנימית של הפנים.",
      "method-3-title": "רצף רפואי מלא",
      "method-3-desc": "ייעוץ, הכנה, טיפול ומעקב מתחברים למסע מטופל רגוע, ברור ומובל רפואית.",
      "about-title": "Linnéa: אמנות הדיוק וההרמוניה",
      "about-p1": "אנו מאמינים שאסתטיקה אינה שינוי, אלא זיקוק של היופי הקיים. ב-Linnéa אנו מחברים בין מדע מתקדם לגישה אנושית ומעודנת, המעניקה לך מרחב של שקט וביטחון מלא לאורך כל הדרך.",
      "about-p2": "הלב המקצועי שלנו פועם במודל הייעוץ המשותף: כל תוכנית טיפול נבנית על ידי שני רופאים הפועלים בסינרגיה מלאה. שיתוף פעולה זה מבטיח אבחון עומק, תכנון קפדני ותוצאה הרמונית המכבדת את תווי הפנים הייחודיים שלך.",
      "about-p3": "מעבר למצוינות הרפואית, הדיאלוג המקצועי בינינו מאפשר לנו לבחון כל זווית ופרט בתוכנית הטיפול, תוך בקרה כפולה המבטיחה דיוק מקסימלי ובטיחות ללא פשרות. אנו מחויבים לתוצאה שהיא לא רק אסתטית, אלא מאוזנת וטבעית, כזו שמשתלבת ברכות באורח החיים שלך ומשקפת את הגרסה הזוהרת והמדויקת ביותר של עצמך.",
      "treatments-title": "הטיפולים שלנו",
      "treatments-desc": "מבחר מוקפד של הליכים מתקדמים שנועדו לחדש ולעדן.",
      "skin-title": "הצערת העור",
      "skin-desc": "טיפולים מתקדמים בטכנולוגיית הלרומינסנציה העדכנית ביותר לשחזור הזוהר ומרקם העור הצעיר.",
      "botox-title": "הזרקות",
      "botox-desc": "שיפורים מדויקים במראה טבעי המבוצעים על ידי המומחים שלנו למראה רענן.",
      "contouring-title": "פיסול פנים",
      "contouring-desc": "טיפולים מבניים מותאמים אישית להגדרה, הרמה והרמוניה של פרופורציות הפנים הטבעיות שלך.",
      "location-title": "בקרו בקליניקה שלנו",
      "location-desc": "ממוקמת בלב העיר, לינאה מציעה מקלט היגייני ומרגיע הרחק מההמולה. אנו מזמינים אתכם להיכנס לחלל היוקרתי שלנו.",
      "address-label": "כתובת:",
      "address-val": "דרך מנחם בגין 150, תל אביב",
      "hours-label": "שעות פתיחה:",
      "phone-label": "טלפון:",
      "get-directions": "ניווט לקליניקה",
      "map-placeholder": "מפה",
      "footer-tagline": "חם, יוקרתי, מזמין, אנושי.",
      "footer-explore": "ניווט",
      "footer-contact": "צרו קשר",
      "footer-address": "דרך מנחם בגין 150, תל אביב, ישראל",
      "footer-discuss": "בואו נדבר על המסע שלכן.",
      "footer-rights": "© 2026 לינאה קליניקה אסתטית. כל הזכויות שמורות.",
      "modal-title": "קביעת פגישת ייעוץ",
      "modal-desc": "השאירו כמה פרטים, והצוות יחזור עם אפשרויות ייעוץ מדויקות.",
      "label-name": "שם מלא",
      "placeholder-name": "שם מלא",
      "label-email": "אימייל",
      "placeholder-email": "israel@example.com",
      "label-phone": "מספר טלפון",
      "placeholder-phone": "050-0000000",
      "label-interest": "תחום עניין",
      "opt-rejuvenation": "הצערת העור",
      "opt-injectables": "הזרקות",
      "opt-contouring": "פיסול פנים",
      "opt-other": "אחר",
      "label-other-details": "אנא פרטו",
      "placeholder-other-details": "כמה מילים על מה שתרצו לדייק",
      "reviews-title": "מה הלקוחות שלנו אומרים",
      "reviews-subtitle": "ביקורות גוגל",
      "review-google-btn": "דרגו אותנו בגוגל",
      "transformations-title": "שינויים נראים לעין",
      "transformations-desc": "הזיזו את הסליידר כדי לחקור את התוצאות הטבעיות שלנו.",
      "transformations-disclaimer": "התוצאות עשויות להשתנות.",
      "before-label": "לפני",
      "after-label": "אחרי",
      "slider-before": "לפני",
      "slider-after": "אחרי",
      "review1-text": "\"חוויה מדהימה מתחילתה ועד סופה. התוצאות טבעיות מאוד והרגשתי שדואגים לי.\"",
      "review1-author": "מיכל ר.",
      "review2-text": "\"ד\\\"ר שילה הוא אמן אמיתי. העור שלי מעולם לא נראה טוב יותר, והכי חשוב, הוא עדיין נראה כמוני.\"",
      "review2-author": "דוד ל.",
      "review3-text": "\"מקצועי, היגייני וברמה גבוהה מאוד. מומלץ בחום לכל מי שמחפש איכות.\"",
      "review3-author": "שרה ב.",
      "review4-text": "\"הייעוץ היה רגוע, מדויק וכנה. שום דבר לא הרגיש ממהר, וההמלצה הייתה באמת מותאמת אישית.\"",
      "review4-author": "נועה א.",
      "review5-text": "\"קליניקה יפהפייה עם גישה מאוד מעודנת. אהבתי שהתוכנית הייתה טבעית ושכל שלב הוסבר בצורה ברורה.\"",
      "review5-author": "מאיה ל.",
      "review6-text": "\"מקצועיים, עדינים ועם תשומת לב יוצאת דופן לפרטים. המעקב נתן תחושה שבאמת רואים אותי.\"",
      "review6-author": "יעל ק.",
      "btn-submit": "שליחת בקשה",
      "alert-success": "תודה. בקשת הייעוץ התקבלה.",
      "success-title": "תודה רבה!",
      "success-msg": "פנייתך התקבלה. נחזור אליך בקרוב עם אפשרויות תיאום מדויקות.",
      "service-consent": "אני מאשר/ת שלינאה תיצור איתי קשר במייל, בטלפון או ב-WhatsApp לצורך תיאום ייעוץ, תזכורות, טפסי הכנה ומעקב טיפול.",
      "privacy-consent-1": "קראתי ואני מסכים/ה ל",
      "privacy-consent-2": "מדיניות הפרטיות",
      "privacy-consent-3": " ול",
      "privacy-consent-4": "תנאי השימוש באתר",
      "email-updates-consent-1": "אני מסכים/ה לקבל עדכונים במייל. ניתן לבטל בכל עת. ",
      "email-updates-consent-2": "מדיניות הפרטיות",
      "nav-accessibility": "הצהרת נגישות",
      "nav-privacy": "מדיניות פרטיות",
      "nav-terms": "תנאי שימוש באתר",
      "footer-legal": "משפטי",
      "cookie-text": "אנו משתמשים בעוגיות חיוניות, ובהסכמתך גם בעוגיות מדידה ופרסום, כדי להבין את ביצועי האתר ולשפר את תהליך בקשת הייעוץ.",
      "cookie-accept": "אישור",
      "cookie-decline": "דחייה",
      "acc-title": "תפריט נגישות",
      "acc-increase-font": "הגדלת טקסט",
      "acc-decrease-font": "הקטנת טקסט",
      "acc-high-contrast": "ניגודיות גבוהה",
      "acc-light-bg": "רקע בהיר",
      "acc-links-underline": "הדגשת קישורים",
      "acc-reset": "איפוס הגדרות",
      "accessibility-stmt-content": "אנו רואים חשיבות עליונה בהנגשת האתר. אתר זה הונגש בהתאם לתקן ישראלי 5568 ולהנחיות WCAG 2.0 ברמה AA. במידה ונתקלתם בבעיית נגישות, אנא צרו עמנו קשר.",
      "privacy-content": "הפרטיות שלך חשובה לנו. אנו אוספים פרטי ייעוץ, בחירות הסכמה ומידע תפעולי על תורים לצורך תקשורת עם הקליניקה, תיאום, טפסי הכנה ומעקב. עדכונים במייל דורשים הסכמה נפרדת וניתן לבטל בכל עת.",
      "terms-content": "הגלישה והשימוש באתר זה כפופים לתנאי השימוש הבאים. תכני האתר נועדו למידע כללי בלבד ולצורך הזמנת תורים אלינו.",
      "page-title": "Linnéa | קליניקה אסתטית יוקרתית",
      "article-botox-title": "Linnéa | אמנות הבוטוקס",
      "article-fillers-title": "Linnéa | שליטה בחומרי מילוי",
      "article-scientific-title": "Linnéa | מדע אריכות הימים",
      "article-skin-quality-title": "Linnéa | איכות עור, בעדינות",
      "article-facial-harmony-title": "Linnéa | הרמוניית פנים לפני נפח",
      "article-consultation-plan-title": "Linnéa | הייעוץ כתוכנית טיפול",
      "nav-home": "עמוד הבית",
      "nav-articles": "מאמרים",
      "articles-title": "תובנות ומדע",
      "articles-desc": "חקרו את המאמרים המקצועיים שלנו על רפואה אסתטית, טיפולים ומדע אריכות הימים.",
      "read-more": "קראו עוד",
      "article1-title": "אמנות הבוטוקס",
      "article1-subtitle": "צלילה עמוקה אל עולם הנוירומודולטורים והבעות הפנים הטבעיות.",
      "article1-desc": "גלו כיצד טיפולי נוירומודולטורים מדויקים יכולים להחליק קמטים תוך שמירה על ההבעות הטבעיות שלכם.",
      "article1-p1": "בוטוקס, או רעלן הבוטולינום, חולל מהפכה בתחום הרפואה האסתטית. בטיפול של מומחים, המטרה אינה 'להקפיא' את הפנים, אלא להרפות את השרירים הספציפיים שגורמים לקמטי הבעה עמוקים.",
      "article1-p2": "בלינאה, הפילוסופיה שלנו מבוססת על טכניקת ה-'מיקרו-דוזינג'. בעזרת כמויות זעירות ומדויקות של החומר, אנו מרככים את קמטי הדאגה והמצח תוך שמירה על המיקרו-הבעות הטבעיות והיפות שלך.",
      "article1-p3": "ההליך הוא זעיר-פולשני ואינו דורש זמן החלמה. רוב המטופלים ירגישו בריכוך עדין תוך 3-5 ימים, והתוצאה המלאה תופיע לאחר שבועיים. התוצאות נשמרות לרוב 3-4 חודשים, ומעניקות מראה רענן ונינוח.",
      "article1-p4": "מעבר להפחתת קמטים, ניתן להשתמש בטכניקות נוירומודולטורים מתקדמות לפיסול פנים. על ידי הרפיה אסטרטגית של שרירים מדכאים ספציפיים, נוכל להשיג הרמת גבות עדינה, לרכך קו לסת מרובע באמצעות הפחתת שריר המאסטר, או לתקן חיוך חניכי, וכל זאת ללא התערבות כירורגית.",
      "article1-p5": "בטיחות, דיוק ואמנות הם בראש סדר העדיפויות שלנו. במהלך ייעוץ מקיף, המומחים הרפואיים שלנו ימפו את האנטומיה הייחודית של פנייך כדי לעצב תוכנית טיפול מותאמת אישית, המבטיחה שכל יחידת מוצר משרתת מטרה ספציפית והרמונית עבור התווים הייחודיים שלך.",
      "related-treatments": "חקרו גישות משלימות",
      "link-botox": "← אמנות הנוירומודולטורים",
      "link-fillers": "← שליטה בחומרי מילוי",
      "link-scientific": "← מדע אריכות הימים",
      "link-precision": "← נוירומודולטורים מדויקים",
      "link-volume": "← שחזור נפחים",
      "article2-title": "שליטה בחומרי מילוי (פילרים)",
      "article2-subtitle": "האמנות של פיסול פנים ושחזור נפחים אלגנטי.",
      "article2-desc": "למדו על הדקויות של פיסול פנים והשבת נפח למראה נעורים מאוזן טבעי.",
      "article2-p1": "ככל שאנו מתבגרים, הפנים מאבדות באופן טבעי מנפחן, במיוחד בכריות השומן העדינות שמתחת לעורנו. חומרי מילוי עוריים (פילרים), המורכבים לרוב מחומצה היאלורונית - חומר טבעי הקיים בגופנו - נועדו לשחזר באלגנטיות את הנפח שאבד ולהעניק תמיכה מבנית.",
      "article2-p2": "הגישה שלנו היא אנטומית לחלוטין ומותאמת אישית. בין אם מדובר בהדגשה עדינה של השפתיים, שחזור צורת הלחיים או עיצוב קו הלסת, המטרה שלנו היא ליצור הרמוניה בין תווי הפנים ולא לעוות אותם. אנו מנתחים בקפידה את פרופורציות הפנים שלך כדי להבטיח תוצאה מאוזנת ומתוחכמת.",
      "article2-p3": "הטיפולים מהירים והתוצאות נראות מיד, עם שילוב מלא ברקמות העור שמתרחש לאורך מספר שבועות. החומצה ההיאלורונית קושרת מים, ובכך שומרת על עורך לח וקורן מבפנים באופן רציף.",
      "article2-p4": "בניגוד לגישות מסורתיות המתמקדות רק במילוי ונפח, הטכניקות המודרניות שלנו משתמשות בג'לים מתקדמים של חומצה היאלורונית עם קישוריות צולבת (cross-linked) המשתלבים בצורה חלקה ברקמה הטבעית שלך. זה מונע את המראה ה\"נפוח\", מאפשר תנועה דינמית עם הבעות הפנים שלך ומבטיח תוצאות אלגנטיות לאורך זמן.",
      "article2-p5": "אנו משלבים את החזון האמנותי הזה עם בטיחות רפואית קפדנית. על ידי שימוש במיקרו-קנולות ומיפוי אנטומי מדויק, המזריקים המומחים שלנו ממזערים את זמן ההחלמה ומקסימום נוחות. התוצאה היא גרסה מעודנת וקורנת ללא מאמץ של עצמך, המכבדת את מבנה העצם הטבעי שלך.",
      "article3-title": "מדע אריכות הימים",
      "article3-subtitle": "גישות מבוססות-ראיות לבריאות התא והזדקנות בחן.",
      "article3-desc": "חקרו את הגישה המדעית שלנו המשלבת טיפולים אסתטיים עם בריאות תאית לאריכות ימים.",
      "article4-title": "איכות עור, בעדינות",
      "article4-subtitle": "גישה מודרנית למרקם, זוהר ותמיכה בקולגן.",
      "article4-desc": "איך מרקם, לחות וטיפולים מעודדי קולגן יוצרים מראה מלוטש בלי לשנות את תווי הפנים.",
      "article4-p1": "טיפול אסתטי יוקרתי אינו תמיד מתחיל בשינוי תווי הפנים. לעיתים התוצאה המעודנת ביותר מתחילה באיכות העור עצמו: מרקם חלק יותר, לחות מאוזנת, גוון רגוע ומשטח עור שמחזיר אור בצורה יפה.",
      "article4-p2": "בלינאה אנו בוחנים את איכות העור בכמה שכבות: בריאות מחסום העור, פיגמנטציה, אדמומיות, מראה נקבוביות, קמטוטים וצפיפות קולגן. כך ניתן לבחור טיפול שמתקדם בהדרגה ובדיוק.",
      "article4-p3": "בהתאם למצב העור, התוכנית יכולה לכלול ביו-סטימולטורים, פולינוקלאוטידים, מיקרונידלינג, טיפולים מבוססי אור או שגרת טיפוח רפואית. המטרה אינה ברק מלאכותי מיידי, אלא עור בריא יותר שמחזיר אור באופן טבעי.",
      "article4-p4": "שיפורים קטנים ועקביים נראים לרוב אלגנטיים יותר מהתערבות אגרסיבית. כשהעור עמיד ובריא יותר, האיפור יושב טוב יותר, קווי הפנים מתרככים והמראה הכללי נראה רענן ונינוח.",
      "article4-p5": "תוכנית איכות עור מדויקת היא אישית, עונתית ומדודה. בפגישת הייעוץ אנו בונים רצף שמתאים לקצב שלך, להיסטוריית העור שלך ולרמת הנראות הרצויה אחרי הטיפול.",
      "article5-title": "הרמוניית פנים לפני נפח",
      "article5-subtitle": "למה פרופורציה, אור ואיפוק חשובים יותר מהוספה.",
      "article5-desc": "למה תכנון אסתטי יוקרתי מתחיל בפרופורציות, אור ואיפוק.",
      "article5-p1": "תוצאה אסתטית יפה כמעט אף פעם לא מוגדרת רק לפי נפח. היא מוגדרת לפי הרמוניה: היחס בין הלחיים, השפתיים, קו הלסת, הרקות, הסנטר והאופן שבו האור נע על הפנים.",
      "article5-p2": "לפני המלצה על טיפול הזרקה, אנו מסתכלים על הפנים כמכלול. לפעמים ההתערבות הנכונה היא תיקון מבני קטן; לפעמים איכות עור; ולפעמים ההחלטה המקצועית היא לא לטפל באזור מסוים.",
      "article5-p3": "הסטנדרט היוקרתי ברפואה אסתטית הוא איפוק. הוא דורש מיומנות טכנית, ידע אנטומי וביטחון להשאיר את התוצאה שקטה מספיק כדי שהיא תרגיש שייכת למטופלת.",
      "article5-p4": "זה חשוב במיוחד עם פילרים. כשהם נבחרים במחשבה, הם יכולים לשחזר תמיכה, לרכך צללים ולרענן את הפנים. ללא פרופורציה, הם עלולים לטשטש את הייחודיות.",
      "article5-p5": "בלינאה התוכנית נבנית סביב המבנה הטבעי שלך. הכוונה אינה לגרום לך להיראות מטופלת, אלא לגרום לתווי הפנים להרגיש מאוזנים, נינוחים ושלך באופן מובהק.",
      "article6-title": "הייעוץ כתוכנית טיפול",
      "article6-subtitle": "מה חשוב להבהיר לפני שמתחילים כל טיפול אסתטי.",
      "article6-desc": "מה פגישת ייעוץ מדויקת צריכה להבהיר לפני שמתחילים כל טיפול אסתטי.",
      "article6-p1": "פגישת ייעוץ אינה פורמליות. בקליניקה אסתטית יוקרתית היא הבסיס לתוכנית הטיפול ולעיתים החלק החשוב ביותר במסע המטופלת.",
      "article6-p2": "השיחה צריכה להבהיר מטרות, רקע רפואי, טיפולים קודמים, רגישויות, אילוצי זמן ורמת שינוי שנוחה לך. היא צריכה להסביר גם מה לא נכון לעשות.",
      "article6-p3": "תכנון טוב כולל סדר פעולות. יש מטופלות שייהנו מהכנת העור לפני הזרקות; אחרות זקוקות לטיפול עדין אחד לפני אירוע; ואחרות יתאימו לתוכנית תחזוקה ארוכת טווח.",
      "article6-p4": "ייעוץ איכותי גם יוצר בטיחות. הוא נותן מקום לשאלות רפואיות, הסכמה מדעת, צפי החלמה, תופעות לוואי אפשריות והנחיות מעקב ברורות.",
      "article6-p5": "בלינאה הייעוץ נועד להרגיש רגוע ושקוף. בסופו צריך להיות לך ברור מה מומלץ, למה זה מומלץ, אילו חלופות קיימות ומהי תוצאה ריאלית.",
      "alt-dr-shilo": "ד\"ר שילה DMD MSc, מומחה לאסתטיקה רפואית במרפאת לינאה תל אביב, ישראל",
      "alt-skin": "חידוש העור וטיפולי לייזר מתקדמים במרפאת האסתטיקה לינאה ישראל",
      "alt-botox": "הזרקות בוטוקס וחומרי מילוי מומחים במרפאת בוטיק לאסתטיקה בתל אביב",
      "alt-contouring": "מומחה לפיסול פנים וקו לסת במרפאת אסתטיקה בתל אביב, ישראל",
      "alt-article-botox": "אמנות הבוטוקס: טיפולי אנטי-אייג'ינג והחלקת קמטים מומחים בישראל",
      "alt-article-fillers": "מומחיות בחומרי מילוי: שחזור נפח מתקדם במרפאת לינאה אסתטיקה",
      "alt-article-scientific": "מדע אריכות הימים: רפואה אסתטית מבוססת מדע בישראל",
      "alt-article-skin-quality": "תכנון טיפולי איכות עור למרקם וזוהר מעודנים בלינאה",
      "alt-article-facial-harmony": "הרמוניית פנים ותכנון אסתטי מבוסס פרופורציות בלינאה",
      "alt-article-consultation-plan": "ייעוץ אסתטי אישי ותכנון טיפול בקליניקת לינאה",
      "alt-skin-after": "תוצאות אחרי טיפול חידוש עור במרפאת לינאה ישראל",
      "alt-skin-before": "לפני טיפול חידוש עור במרפאת אסתטיקה בתל אביב",
      "alt-lips-after": "תוצאות אחרי עיבוי שפתיים עם חומרי מילוי בישראל",
      "alt-lips-before": "לפני עיבוי שפתיים במרפאת לינאה",
      "alt-jawline-after": "תוצאות אחרי פיסול קו לסת ועיצוב פנים",
      "alt-jawline-before": "לפני פיסול קו לסת במרפאת אסתטיקה תל אביב",
      "alt-article1-hero": "טיפול בוטוקס ונוירומודולטורים לתוצאות טבעיות בישראל",
      "alt-article2-hero": "חומרי מילוי ואיזון פנים להזדקנות אלגנטית בתל אביב",
      "alt-article3-hero": "בריאות תאית ומדע אריכות הימים ברפואה אסתטית מודרנית בישראל",
      "alt-article4-hero": "איכות עור, לחות ותמיכה בקולגן ברפואה אסתטית",
      "alt-article5-hero": "הרמוניית פנים, פרופורציה ותכנון אסתטי אלגנטי",
      "alt-article6-hero": "ייעוץ אסתטי פרטי ותכנון טיפול בקליניקת לינאה",
      "article3-p1": "יופי אסתטי אמיתי זוהר מבפנים ומשקף בריאות תאית אופטימלית. בלינאה, אנו מסתכלים מעבר לפני השטח ומשלבים מדע מתקדם של אריכות ימים עם טיפולי האסתטיקה שלנו כדי להבטיח תוצאות המחזיקות לאורך זמן ומאטות את תהליך ההזדקנות.",
      "article3-p2": "הגישה המדעית שלנו מתמקדת בביו-סטימולציה ורפואה רנרטיבית. על ידי גירוי ייצור הקולגן והאלסטין הטבעי של הגוף באמצעות טכנולוגיות מתקדמות כמו מיקרונידלינג, טיפולי לייזר ופולינוקלאוטידים, אנו מתקנים את העור ברמה המולקולרית.",
      "article3-p3": "אנו מחויבים לחנך את המטופלים שלנו לראות כיצד אורח חיים, תזונה וטיפולים אסתטיים מתקדמים הולכים יד ביד. יישום מדע אריכות הימים משמעו השקעה בטיפולים שלא רק יעניקו מראה נהדר היום, אלא גם יבנו ארכיטקטורת עור חזקה ובריאה לשנים הבאות.",
      "article3-p4": "על ידי רתימת מנגנוני הריפוי המולדים של הגוף באמצעות טיפולים כמו פולינוקלאוטידים וביו-סטימולטורים מתקדמים, אנו בונים מחדש באופן פעיל את המטריצה החוץ-תאית. זה לא רק מסווה את ההזדקנות - זה מעכב אותה באופן פעיל ברמה התאית, ויוצר עור עבה ועמיד יותר.",
      "article3-p5": "בלינאה, אריכות ימים אסתטית היא מסע, לא יעד. במהלך הייעוץ שלך, אנו מפתחים מפת דרכים מקיפה המותאמת לנטייה הגנטית שלך ולגורמי סגנון החיים, תוך שילוב טיפולים משקמים במרפאה עם טיפוח עור רפואי בבית לתוצאות מצטברות.",
      "modal-time-lbl": "זמן טיפול:",
      "modal-pain-lbl": "רמת כאב:",
      "modal-mat-lbl": "חומרים:",
      "skin-time-val": "45-60 דקות",
      "skin-pain-val": "מינימלית (אלחוש מקומי)",
      "skin-mat-val": "לייזר מתקדם, פולינוקלאוטידים, ביו-סטימולטורים",
      "botox-time-val": "15-30 דקות",
      "botox-pain-val": "נמוכה מאוד (מיקרו-מחטים)",
      "botox-mat-val": "נוירומודולטורים פרימיום (בוטוקס, דיספורט)",
      "contouring-time-val": "30-60 דקות",
      "contouring-pain-val": "קלה (מכיל חומר הרדמה)",
      "contouring-mat-val": "חומרי צפיפות גבוהה מבוססי חומצה היאלורונית",
      "doc-title": "הרופאים שלנו",
      "doc-name": "ד״ר שמואל שי שילה DMD, MSc",
      "doc-p1": "ד\"ר שילה הוא בוגר האוניברסיטה העברית והמרכז הרפואי הדסה, ובעל תואר DMD ותואר MSc בביג דאטה רפואי. הרקע הייחודי שלו, המשלב הכשרה רפואית מתקדמת עם ניסיון טכנולוגי מיחידת 8200, מאפשר גישה מוכוונת חדשנות, מחקר וטכנולוגיה בתחום האסתטיקה הרפואית וההזרקות.",
      "doc-p2": "הגישה של ד\"ר שילה מבוססת על מינימליזם מדויק - טיפולים נקיים, אסתטיים וטבעיים, תוך שמירה על הרמוניה ואותנטיות של תווי הפנים. כל טיפול מותאם באופן אישי, עם הקפדה על פרטים קטנים וליווי צמוד לאורך כל הדרך, מתוך הבנה שתוצאה מצוינת אינה רק נראית טבעית - אלא גם מרגישה נכון. במרפאה נעשה שימוש בלעדי בחומרים המאושרים על ידי ה-FDA, כחלק ממחויבות בלתי מתפשרת לאיכות, בטיחות ותוצאות ארוכות טווח.",
      "doc-p3": "לצד עבודתו הקלינית, ד״ר שילה רואה חשיבות רבה בחינוך הדור הבא. הוא מדריך ומלמד סטודנטים ורופאים בתחום האסתטיקה הרפואית, מתוך מטרה להנחיל סטנדרטים גבוהים של בטיחות, דיוק וטיפול אנושי ומסור.",
      "doc2-name": "ד”ר יסמין ח’ורי DMD, MSc",
      "doc2-p1": "ד”ר יסמין ח’ורי, רופאת שיניים וחוקרת בתחום הביו-רפואה, היא בוגרת האוניברסיטה העברית בירושלים, שם השלימה בהצטיינות תואר DMD ותואר MSc במדעי רפואת השיניים. הרקע שלה משלב מצוינות אקדמית, ניסיון מחקרי מתקדם והשתתפות בזירה המדעית הבינלאומית – ומהווה בסיס לגישה קלינית מדויקת, עדכנית ומבוססת ראיות.",
      "doc2-p2": "הקו המקצועי של ד”ר ח’ורי מתמקד באסתטיקה דנטלית בגישה מינימליסטית ומדויקת – טיפולים עדינים, נקיים וטבעיים, תוך שמירה על הרמוניה ואותנטיות של החיוך. כל טיפול נבנה בהתאמה אישית מלאה, עם תשומת לב לפרטים הקטנים ולשאיפה לתוצאה אלגנטית שאינה “עשויה”, אלא משתלבת באופן טבעי במראה הכללי.",
      "doc2-p3": "לצד עבודתה הקלינית, ד”ר ח’ורי עוסקת בהדרכה והוראה של סטודנטים ואנשי מקצוע בתחום, מתוך מחויבות לסטנדרטים גבוהים, בטיחות בלתי מתפשרת והתפתחות מתמדת. עבורה, רפואת שיניים אסתטית היא שילוב בין מדע, דיוק ואומנות – כאשר המטרה אינה רק לשפר את המראה, אלא ליצור תוצאה שמרגישה נכונה, טבעית ובטוחה לכל מטופל.",
      "cat-signature": "טיפולים משולבים (Signature)",
      "cat-skin": "הצערת וחידוש העור",
      "cat-contouring": "פיסול ועיצוב תווי פנים",
      "cat-botox": "טיפולי בוטולינום טוקסין (בוטוקס)",
      "ffr-title": "פיסול פנים מלא",
      "ffr-desc": "גישה הוליסטית המשלבת חומרי מילוי ובוטוקס ליצירת הרמוניה, הרמה והצערה.",
      "ffr-time-val": "60-90 דקות",
      "ffr-pain-val": "קלה (אלחוש מקומי)",
      "ffr-mat-val": "חומצה היאלרונית, בוטוקס וביוסטימולטורים",
      "pn-title": "פולינוקלאוטידים (PN)",
      "pn-desc": "טיפול חדשני המעודד התחדשות תאית עמוקה, שיפור דרמטי בחיוניות ומרקם העור.",
      "pn-time-val": "30-45 דקות",
      "pn-pain-val": "מינימלית (אילחוש)",
      "pn-mat-val": "פולינוקלאוטידים",
      "sculptra-title": "סקולפטרה (Sculptra)",
      "sculptra-desc": "ביוסטימולטור המחדש קולגן טבעי למיצוק ושיפור איכות העור לטווח ארוך.",
      "sculptra-time-val": "45-60 דקות",
      "sculptra-pain-val": "מינימלית (אלחוש מקומי)",
      "sculptra-mat-val": "חומצה פולי-לקטית (PLLA)",
      "radiesse-title": "רדיאס (Radiesse)",
      "radiesse-desc": "חומר המעניק מילוי בנוסף לגירוי ייצור קולגן ואלסטין לשיפור מוצקות העור.",
      "radiesse-time-val": "30-45 דקות",
      "radiesse-pain-val": "קלה",
      "radiesse-mat-val": "סידן הידרוקסיאפטיט",
      "prp-title": "PRF / PRP",
      "prp-desc": "שימוש בפקטורי גדילה מדם המטופל להצערה טבעית ולשיקום רקמות.",
      "prp-time-val": "45-60 דקות",
      "prp-pain-val": "קלה (אלחוש מקומי)",
      "prp-mat-val": "פלזמה עשירה בטסיות",
      "skinbooster-title": "סקין בוסטר",
      "skinbooster-desc": "לחות עמוקה לשכבות העור, שיפור האלסטיות ומראה קורן, זוהר ורענן.",
      "skinbooster-time-val": "20-30 דקות",
      "skinbooster-pain-val": "מינימלית",
      "skinbooster-mat-val": "חומצה היאלרונית דלילה",
      "acne-title": "טיפול בצלקות אקנה",
      "acne-desc": "שילוב טכניקות וחומרים לטשטוש והחלקת צלקות ושיפור משמעותי במרקם.",
      "acne-time-val": "45-60 דקות",
      "acne-pain-val": "בינונית (אלחוש מקומי)",
      "acne-mat-val": "ביוסטימולטורים / חומרי מילוי",
      "lips-title": "עיצוב ועיבוי שפתיים",
      "lips-desc": "הדגשת מסגרת, תיקון אסימטריה והוספת נפח בצורה פרופורציונלית וטבעית.",
      "lips-time-val": "30-45 דקות",
      "lips-pain-val": "קלה (אלחוש מקומי)",
      "lips-mat-val": "חומצה היאלרונית ייעודית לשפתיים",
      "jawline-title": "עיצוב קו לסת וסנטר",
      "jawline-desc": "חיטוב מסגרת הפנים ליצירת מראה מפוסל, מורם וחד המדגיש את קווי הפנים.",
      "jawline-time-val": "45 דקות",
      "jawline-pain-val": "קלה",
      "jawline-mat-val": "חומצה היאלרונית סמיכה / רדיאס",
      "nose-title": "פיסול אף",
      "nose-desc": "תיקון אסימטריה, הרמת הקצה והחלקת גבנון במדויק ללא כירורגיה.",
      "nose-time-val": "20-30 דקות",
      "nose-pain-val": "מינימלית",
      "nose-mat-val": "חומצה היאלרונית",
      "teartrough-title": "מילוי שקעי עיניים",
      "teartrough-desc": "הפחתת מראה העיגולים השחורים תחת העיניים למראה ערני וצעיר.",
      "teartrough-time-val": "30 דקות",
      "teartrough-pain-val": "מינימלית",
      "teartrough-mat-val": "חומצה היאלרונית לאזור העיניים",
      "botx-title": "בוטוקס (החלקת קמטים)",
      "botx-desc": "הרפיית שרירי ההבעה במצח ובצידי העיניים למראה נינוח וחלק.",
      "botx-time-val": "15-20 דקות",
      "botx-pain-val": "אפסית",
      "botx-mat-val": "בוטולינום טוקסין",
      "botxadv-title": "בוטוקס מתקדם",
      "botxadv-desc": "לטיפול בחריקת שיניים (ברוקסיזם) וחיטוב קו הצוואר והלסת (קו נפרטיטי).",
      "botxadv-time-val": "20 דקות",
      "botxadv-pain-val": "מינימלית",
      "botxadv-mat-val": "בוטולינום טוקסין"
      ,"btn-back": "חזור",
      "view-treatments": "לכל הטיפולים"

    }
  };

  const formatTranslatedText = (value, lang) => {
    const safeText = String(value);
    if (lang !== 'he') return safeText;

    return safeText.replace(
      /([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ0-9 .,'&|:/+-]*[A-Za-zÀ-ÖØ-öø-ÿ0-9])/g,
      '<span class="latin-inline">$1</span>'
    );
  };

  const applyLanguage = (lang) => {
    console.log('Final applyLanguage:', lang);
    langToggles.forEach(btn => {
      btn.textContent = lang === 'en' ? 'HE' : 'EN';
    });
    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    setLeadTrackingFields();

    // Explicitly force direction for navbar container
    const navContainer = document.querySelector('.nav-container');
    if (navContainer) {
      navContainer.style.direction = lang === 'en' ? 'ltr' : 'rtl';
    }

    // Switch bilingual legal modal content
    document.querySelectorAll('[data-lang]').forEach(el => {
      const elLang = el.getAttribute('data-lang');
      el.style.display = (elLang === lang) ? '' : 'none';
    });

    // Update texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.innerHTML = formatTranslatedText(translations[lang][key], lang);
      }
    });

    const navBookBtn = document.getElementById('nav-book-btn');
    if (navBookBtn && window.matchMedia('(max-width: 600px)').matches) {
      navBookBtn.textContent = lang === 'he' ? 'ייעוץ אישי' : 'Consult';
    }

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (translations[lang] && translations[lang][key]) {
        el.placeholder = translations[lang][key];
      }
    });

    // Update alt-text (accessibility)
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (translations[lang] && translations[lang][key]) {
        el.alt = translations[lang][key];
      }
    });

    document.querySelectorAll('a[href*="article-"]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      const [path, hash = ''] = href.split('#');
      const cleanPath = path.split('?')[0];
      const nextHref = `${cleanPath}?lang=${lang}${hash ? `#${hash}` : ''}`;
      link.setAttribute('href', nextHref);
    });

    document.querySelectorAll('a[href*="article-"]').forEach(link => {
      if (link.dataset.languageLinkBound === 'true') return;
      link.dataset.languageLinkBound = 'true';
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('http') || href.startsWith('#')) return;
        const [path, hash = ''] = href.split('#');
        const cleanPath = path.split('?')[0];
        link.setAttribute('href', `${cleanPath}?lang=${currentLang}${hash ? `#${hash}` : ''}`);
      });
    });

    // Re-trigger scroll animations whenever the language is switched
    const activeReveals = document.querySelectorAll('.reveal.active');
    activeReveals.forEach(el => {
      el.classList.remove('active');
      setTimeout(() => el.classList.add('active'), 100);
    });

    // Update Page Title
    if (translations[lang]["page-title"]) {
      let newTitle = translations[lang]["page-title"];

      // If we are on an article page, use the specific article title
      if (window.location.pathname.includes('article-botox')) {
        newTitle = translations[lang]["article-botox-title"];
      } else if (window.location.pathname.includes('article-fillers')) {
        newTitle = translations[lang]["article-fillers-title"];
      } else if (window.location.pathname.includes('article-scientific')) {
        newTitle = translations[lang]["article-scientific-title"];
      } else if (window.location.pathname.includes('article-skin-quality')) {
        newTitle = translations[lang]["article-skin-quality-title"];
      } else if (window.location.pathname.includes('article-facial-harmony')) {
        newTitle = translations[lang]["article-facial-harmony-title"];
      } else if (window.location.pathname.includes('article-consultation-plan')) {
        newTitle = translations[lang]["article-consultation-plan-title"];
      }

      document.title = newTitle;
    }

    // Slider labels are handled by data-i18n attributes on the label spans
  };

  applyLanguage(currentLang);

  langToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'he' : 'en';
      localStorage.setItem('linneaLang', currentLang);
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set('lang', currentLang);
      window.history.replaceState({}, '', nextUrl);
      applyLanguage(currentLang);
    });
  });

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('active');
      mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside the navbar
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') &&
          !navLinks.contains(e.target) &&
          !mobileNavToggle.contains(e.target)) {
        navLinks.classList.remove('active');
        mobileNavToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Modal logic
  const modal = document.getElementById('booking-modal');
  const openModalBtns = document.querySelectorAll('.nav-btn, .hero-btn, a[href="#contact"], a[href="index.html#contact"], a[href="#book"], a[href="index.html#book"]');
  const closeModal = document.getElementById('close-modal');
  const form = document.getElementById('booking-form');

  if (modal) {
    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        trackLinneaEvent('booking_modal_open', {
          source_label: btn.textContent.trim().slice(0, 80),
          language: currentLang,
        });
      });
    });

    if (closeModal) {
      closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }

    // Close on click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });

    // Handle incoming links hash - REMOVED so it doesn't open on page load
    // Navigation is handled strictly through click events and scrolling now.
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const requiredConsents = form.querySelectorAll('input[type="checkbox"][required]');
      const hasMissingConsent = Array.from(requiredConsents).some(checkbox => !checkbox.checked);
      if (hasMissingConsent) {
        requiredConsents.forEach(checkbox => {
          checkbox.setCustomValidity(checkbox.checked ? '' : (currentLang === 'he' ? 'יש לאשר את התנאים לפני שליחת הבקשה.' : 'Please approve the required terms before submitting.'));
        });
        form.reportValidity();
        return;
      }

      requiredConsents.forEach(checkbox => checkbox.setCustomValidity(''));
      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = currentLang === 'he' ? 'שולח...' : 'Sending...';
      submitBtn.disabled = true;
      trackLinneaEvent('consultation_request_submit', {
        language: currentLang,
        interest: formData.get('interest') || '',
      });

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          trackLinneaEvent('consultation_request_success', {
            language: currentLang,
            interest: formData.get('interest') || '',
          });
          form.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 0;">
              <h3 style="font-family: var(--font-serif); font-size: 2.5rem; color: var(--clinique-teal-dark); margin-bottom: 1rem;" data-i18n="success-title">Thank You!</h3>
              <p style="font-size: 1.1rem; color: var(--text-dark);" data-i18n="success-msg">Your request has been received. We will contact you shortly.</p>
            </div>
          `;
          applyLanguage(currentLang);
        } else {
          submitBtn.textContent = currentLang === 'he' ? 'לא נשלח, נסו שוב' : 'Please try again';
          submitBtn.disabled = false;
        }
      }).catch(() => {
        submitBtn.textContent = currentLang === 'he' ? 'לא נשלח, נסו שוב' : 'Please try again';
        submitBtn.disabled = false;
      });
    });

    form.querySelectorAll('input[type="checkbox"][required]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        checkbox.setCustomValidity('');
      });
    });

    // Conditional "Other" field logic
    const interestSelect = document.getElementById('interest');
    const otherGroup = document.getElementById('other-message-group');
    const otherInput = document.getElementById('other-details');

    if (interestSelect && otherGroup && otherInput) {
      interestSelect.addEventListener('change', () => {
        if (interestSelect.value === 'other') {
          otherGroup.style.display = 'block';
          otherInput.required = true;
        } else {
          otherGroup.style.display = 'none';
          otherInput.required = false;
        }
      });
    }
  }


  // Drill-Down / Nested Carousel Logic
  const categoryTriggers = document.querySelectorAll('.category-trigger');
  const backBtns = document.querySelectorAll('.btn-back-categories');
  const drillViews = document.querySelectorAll('.drill-view');
  let drillTransitionTimer;
  
  const switchDrillView = (targetId) => {
    const targetView = document.getElementById(targetId);
    const activeView = Array.from(drillViews).find(view => view.classList.contains('active'));
    if (!targetView || activeView === targetView) return;

    window.clearTimeout(drillTransitionTimer);

    if (activeView) {
      activeView.classList.add('is-leaving');
      setTimeout(() => {
        activeView.classList.remove('active', 'is-leaving');
      }, 260);
    }

    drillTransitionTimer = setTimeout(() => {
      targetView.classList.add('active');

      requestAnimationFrame(() => {
        const wrapper = targetView.querySelector('.carousel-wrapper');
        if (wrapper && wrapper._carouselLayout) {
          wrapper._carouselLayout();
        }
        window.dispatchEvent(new Event('resize'));
      });
    }, activeView ? 140 : 0);
  };

  categoryTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target-sub');
      switchDrillView(targetId);
    });
  });

  backBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchDrillView('treatments-categories-view');
    });
  });

  // Legal Modals
  const legalLinks = document.querySelectorAll('.legal-link');
  const legalCloseBtns = document.querySelectorAll('.legal-close');
  const legalModals = document.querySelectorAll('.legal-modal-overlay');

  legalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  legalCloseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-close');
      document.getElementById(targetId).classList.remove('active');
    });
  });

  legalModals.forEach(m => {
    m.addEventListener('click', (e) => {
      if (e.target === m) {
        m.classList.remove('active');
      }
    });
  });

  // Close legal modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      legalModals.forEach(m => m.classList.remove('active'));
    }
  });

  // Cookie Banner
  const cookieBanner = document.getElementById('cookie-banner');
  const cookieAccept = document.getElementById('cookie-accept');
  const cookieDecline = document.getElementById('cookie-decline');

  if (cookieBanner && !localStorage.getItem('cookieConsent')) {
    setTimeout(() => {
      cookieBanner.classList.remove('hidden');
    }, 2000);
  }

  const handleCookie = (status) => {
    localStorage.setItem('cookieConsent', status);
    cookieBanner.classList.add('hidden');
    if (status === 'accepted') initLinneaTracking();
  };

  if (localStorage.getItem('cookieConsent') === 'accepted') {
    initLinneaTracking();
  }

  if (cookieAccept && cookieDecline) {
    cookieAccept.addEventListener('click', () => handleCookie('accepted'));
    cookieDecline.addEventListener('click', () => handleCookie('declined'));
  }

  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    link.addEventListener('click', () => {
      trackLinneaEvent('whatsapp_click', {
        language: currentLang,
        location: link.classList.contains('whatsapp-btn') ? 'floating_button' : 'page_link',
      });
    });
  });

  // Accessibility Widget
  const accToggle = document.getElementById('accessibility-toggle');
  const accPanel = document.getElementById('accessibility-panel');
  const accClose = document.getElementById('acc-close');

  if (accToggle && accPanel) {
    accToggle.addEventListener('click', () => {
      const isOpen = accPanel.classList.toggle('active');
      accToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    if (accClose) {
      accClose.addEventListener('click', () => {
        accPanel.classList.remove('active');
      });
    }

    const getAccBtn = (id) => document.getElementById(id);
    const toggleBodyClass = (className, btnId) => {
      const btn = getAccBtn(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          document.body.classList.toggle(className);
          btn.classList.toggle('active');
        });
      }
    };

    toggleBodyClass('acc-font-large', 'acc-increase-font');
    toggleBodyClass('acc-high-contrast', 'acc-high-contrast');
    toggleBodyClass('acc-light-bg', 'acc-light-bg');
    toggleBodyClass('acc-links-underline', 'acc-links-underline');

    const decreaseFontBtn = getAccBtn('acc-decrease-font');
    if (decreaseFontBtn) {
      decreaseFontBtn.addEventListener('click', () => {
        document.body.classList.remove('acc-font-large');
        const increaseBtn = getAccBtn('acc-increase-font');
        if (increaseBtn) increaseBtn.classList.remove('active');
      });
    }

    const resetBtn = getAccBtn('acc-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        document.body.className = '';
        document.querySelectorAll('.acc-btn').forEach(b => b.classList.remove('active'));
      });
    }
  }

  // ─── Carousels (desktop + mobile) ──────────────────────────────────
  function initCarousel(wrapper) {
    const type = wrapper.dataset.carousel;
    const track = wrapper.querySelector('.carousel-track');
    const viewport = wrapper.querySelector('.carousel-viewport');
    const prevBtn = wrapper.querySelector('.carousel-prev');
    const nextBtn = wrapper.querySelector('.carousel-next');
    const dotsRow = wrapper.querySelector('.carousel-dots-row');
    if (!track || !viewport || !prevBtn || !nextBtn || !dotsRow) return;

    const items = Array.from(track.children);
    const total = items.length;
    let current = 0;
    let prevIpv = -1;

    function getIpv() {
      if (window.innerWidth <= 768) return 1;
      return type === 'transformations' ? 1 : (type === 'doctors' ? 2 : 3);
    }

    function getGap() {
      // Read the actual computed column-gap in pixels
      return parseFloat(getComputedStyle(track).columnGap) || 0;
    }

    function getItemW() {
      const ipv = getIpv();
      const gap = getGap();
      const styles = getComputedStyle(viewport);
      const horizontalPadding = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const contentWidth = viewport.clientWidth - horizontalPadding;
      // Total visible = ipv items + (ipv-1) gaps
      return (contentWidth - (ipv - 1) * gap) / ipv;
    }

    function applyTransform(animate) {
      const itemW = getItemW();
      const gap = getGap();
      const step = itemW + gap; // shift per item = item width + one gap
      if (!animate) track.style.transition = 'none';
      track.style.transform = `translateX(${-current * step}px)`;
      if (!animate) { track.offsetHeight; track.style.transition = ''; }
    }

    function updateDots() {
      dotsRow.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function goTo(index) {
      const ipv = getIpv();
      const max = Math.max(0, total - ipv);
      current = index > max ? 0 : index < 0 ? max : index;
      applyTransform(true);
      updateDots();
    }

    function layout() {
      const ipv = getIpv();
      const itemW = getItemW();

      // Reset heights so natural content height can be measured
      items.forEach(item => {
        item.style.height = '';
        item.style.flex = `0 0 ${itemW}px`;
        item.style.width = `${itemW}px`;
        item.style.maxWidth = `${itemW}px`;
      });

      // Rebuild dots when items-per-view changes
      if (ipv !== prevIpv) {
        prevIpv = ipv;
        const max = Math.max(0, total - ipv);
        dotsRow.innerHTML = '';
        for (let i = 0; i <= max; i++) {
          const dot = document.createElement('button');
          dot.className = 'carousel-dot';
          dot.setAttribute('aria-label', `Slide ${i + 1} of ${max + 1}`);
          const idx = i;
          dot.addEventListener('click', () => goTo(idx));
          dotsRow.appendChild(dot);
        }
      }

      // Clamp position and re-render without animation
      const max = Math.max(0, total - ipv);
      if (current > max) current = 0;
      applyTransform(false);
      updateDots();

      // Equalize all card heights to the tallest card
      requestAnimationFrame(() => {
        const maxH = Math.max(...items.map(i => i.offsetHeight));
        if (maxH > 0) items.forEach(item => { item.style.height = `${maxH}px`; });
      });
    }

    // Wire buttons and touch only once
    if (!wrapper.dataset.carouselInit) {
      wrapper.dataset.carouselInit = 'true';

      prevBtn.addEventListener('click', () => goTo(current - 1));
      nextBtn.addEventListener('click', () => goTo(current + 1));

      if (type !== 'transformations') {
        let sx = 0;
        track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
          const diff = sx - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
        }, { passive: true });
      }
    }

    // Store layout fn for resize calls
    wrapper._carouselLayout = layout;
    layout();
  }

  document.querySelectorAll('.carousel-wrapper').forEach(initCarousel);

  // Re-layout on resize (debounced)
  let _carouselResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(_carouselResizeTimer);
    _carouselResizeTimer = setTimeout(() => {
      document.querySelectorAll('.carousel-wrapper').forEach(w => {
        if (w._carouselLayout) w._carouselLayout();
      });
    }, 150);
  });

  // ─── Before / After Slider ───────────────────────────────────────
  document.querySelectorAll('.ba-slider').forEach(slider => {
    const wrapper = slider.querySelector('.ba-image-wrapper');
    const beforeClip = slider.querySelector('.ba-before-clip');
    const beforeImg = slider.querySelector('.ba-before-img');
    const handle = slider.querySelector('.ba-handle');
    if (!wrapper || !beforeClip || !handle) return;

    let isDragging = false;

    const setPosition = (x) => {
      const rect = wrapper.getBoundingClientRect();
      const isRTL = document.documentElement.dir === 'rtl';
      let pos = ((x - rect.left) / rect.width) * 100;
      pos = Math.max(0, Math.min(100, pos));

      if (isRTL) {
        beforeImg.style.clipPath = `inset(0 0 0 ${pos}%)`;
      } else {
        beforeImg.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
      }
      handle.style.left = pos + '%';
    };

    // Set initial clip position to 50%
    const initClip = () => {
      const isRTL = document.documentElement.dir === 'rtl';
      beforeImg.style.clipPath = isRTL ? 'inset(0 0 0 50%)' : 'inset(0 50% 0 0)';
    };
    initClip();

    // Mouse events
    wrapper.addEventListener('mousedown', (e) => {
      e.preventDefault();
      isDragging = true;
      wrapper.classList.add('active');
      setPosition(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        wrapper.classList.remove('active');
      }
    });

    // Touch events
    wrapper.addEventListener('touchstart', (e) => {
      isDragging = true;
      wrapper.classList.add('active');
      setPosition(e.touches[0].clientX);
    }, { passive: true });

    wrapper.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition(e.touches[0].clientX);
    }, { passive: false });

    wrapper.addEventListener('touchend', () => {
      isDragging = false;
      wrapper.classList.remove('active');
    });
  });

  // Back to Top Logic
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

});
