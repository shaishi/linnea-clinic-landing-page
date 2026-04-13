// --- Pre-loader Logic (Highest Priority for Reliability) ---
// Using global gsap and Lenis from CDNs to ensure 100% stability on GH Pages
if (typeof gsap !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Initialize Smooth Scrolling (Lenis)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

// Removed duplicate requestAnimationFrame loop; GSAP ticker handles it below

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

document.addEventListener('DOMContentLoaded', () => {
  // --- Custom Cursor Logic ---
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  const interactiveElements = document.querySelectorAll('a, button, .treatment-card, .ba-handle');

  if (cursorDot && cursorOutline) {
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;

      // Use GSAP for smooth cursor trailing
      gsap.to(cursorDot, { x: posX, y: posY, duration: 0.1 });
      gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.25 });
    });

    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorOutline.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursorOutline.classList.remove('cursor-hover');
      });
    });
  }

  // --- Hero Intro Animation ---
  const heroTl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out', duration: 1.5 } });

  heroTl
    .fromTo('.hero-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, delay: 0.3 })
    .fromTo('.hero-subtitle', { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=1.2')
    .fromTo('.hero-btn', { opacity: 0, y: 30 }, { opacity: 1, y: 0 }, '-=1.2');

  // --- Pre-loader Removal (GSAP block removed in favor of CSS transition below) ---

  // --- GSAP Scroll Reveals ---
  const revealSections = document.querySelectorAll('section');

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
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }

    if (sectionDesc) {
      sectionTl.fromTo(sectionDesc,
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.6'
      );
    }

    if (cards.length > 0) {
      sectionTl.fromTo(cards,
        { opacity: 0, y: -60 },
        { opacity: 1, y: 0, duration: 1.0, stagger: 0.15, ease: 'power3.out' },
        '-=0.6'
      );
    }
  });

  // Specific about-section parallax/reveal
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
      duration: 1.2,
      stagger: 0.3,
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
      duration: 1.5,
      ease: 'power2.out'
    }
  );


  // --- Magnetic Buttons ---
  const magneticBtns = document.querySelectorAll('.btn-primary, .btn-secondary, .social-icon');

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

  // --- Pre-loader Removal ---
  let isLoaderRemoved = false;
  const initRemoval = () => {
    if (isLoaderRemoved) return;
    isLoaderRemoved = true;

    // Check if preloader was already shown this session
    if (sessionStorage.getItem('preloaderShown')) {
      // Small delay to ensure browser registers initial state for a smooth transition
      setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        if (typeof heroTl !== 'undefined' && heroTl.play) heroTl.play();
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) ScrollTrigger.refresh();
      }, 100);
      return;
    }

    sessionStorage.setItem('preloaderShown', 'true');

    setTimeout(() => {
      try {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');

        // Hero plays right as loader wipe-up finishes (matches 1.8s CSS transition)
        setTimeout(() => {
          if (typeof heroTl !== 'undefined' && heroTl.play) heroTl.play();
          if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) ScrollTrigger.refresh();
        }, 1800);
      } catch (e) {
        console.warn("Preloader transition error:", e);
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
      }
    }, 2500); 
  };

  // Preloader bypass
  if (sessionStorage.getItem('preloaderShown')) {
    initRemoval();
  } else {
    if (document.readyState === 'complete') {
      initRemoval();
    } else {
      window.addEventListener('load', initRemoval);
    }
    // Maximum loading time fallback 
    setTimeout(initRemoval, 3500);
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
  let currentLang = localStorage.getItem('linneaLang') || 'en';

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
      "nav-home": "Home",
      "nav-articles": "Articles",
      "hero-title": "Your Natural Radiance, Effortlessly Refined",
      "hero-subtitle": "High-end aesthetic treatments tailored to enhance your unique beauty in a soothing, professional environment.",
      "about-title": "Cultivating Aesthetic Harmony",
      "about-p1": "At Linnéa, we believe that aesthetic enhancement isn't about altering your appearance, but rather cultivating the harmony that already exists within you. Our boutique clinic provides an inviting, human-centered experience where advanced science meets customized care.",
      "about-p2": "Every treatment is precisely tailored, leaving you looking luminous, pure, and naturally balanced.",
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
      "address-val": "116 Herzl Blvd, Jerusalem",
      "hours-label": "Hours:",
      "phone-label": "Phone:",
      "get-directions": "Get Directions",
      "map-placeholder": "Map View",
      "footer-tagline": "Warm, luxurious, inviting, human.",
      "footer-explore": "Explore",
      "footer-contact": "Contact Us",
      "footer-address": "116 Herzl Blvd, Jerusalem, Israel",
      "footer-discuss": "Let's discuss your journey.",
      "footer-rights": "© 2026 Linnéa Aesthetic Clinic. All rights reserved.",
      "modal-title": "Book a Consultation",
      "modal-desc": "Take the first step towards your natural radiance.",
      "label-name": "Full Name",
      "placeholder-name": "Jane Doe",
      "label-email": "Email",
      "placeholder-email": "jane@example.com",
      "label-phone": "Phone Number",
      "placeholder-phone": "+1 234 567 8900",
      "label-interest": "Area of Interest",
      "opt-rejuvenation": "Skin Rejuvenation",
      "opt-injectables": "Injectables",
      "opt-contouring": "Facial Contouring",
      "opt-other": "Other",
      "label-other-details": "Please specify",
      "placeholder-other-details": "Tell us more about what you're looking for...",
      "reviews-title": "What Our Clients Say",
      "reviews-subtitle": "Google Reviews",
      "review-google-btn": "Rate us on Google",
      "transformations-title": "Visible Transformations",
      "transformations-desc": "Slide to explore our natural-looking results.",
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
      "btn-submit": "Submit Request",
      "alert-success": "Thank you for booking a consultation! Our team will contact you shortly.",
      "nav-accessibility": "Accessibility Statement",
      "nav-privacy": "Privacy Policy",
      "nav-terms": "Terms of Use",
      "footer-legal": "Legal",
      "cookie-text": "We use cookies to improve your browsing experience. By using our site, you agree to our use of cookies.",
      "cookie-accept": "Accept",
      "cookie-decline": "Decline",
      "acc-title": "Accessibility Options",
      "acc-increase-font": "Increase Font Size",
      "acc-decrease-font": "Decrease Font Size",
      "acc-high-contrast": "High Contrast",
      "acc-light-bg": "Light Background",
      "acc-links-underline": "Highlight Links",
      "acc-reset": "Reset Settings",
      "accessibility-stmt-content": "We view accessibility as fundamentally important. This website has been adapted to the accessibility requirements according to Israeli law. If you encounter any accessibility issues, please contact our accessibility coordinator.",
      "privacy-content": "Your privacy is important to us. We collect only necessary information to provide our aesthetic services and do not share your data with unauthorized third parties. By using this website, you agree to our data handling practices.",
      "terms-content": "By browsing and using this website, you agree to comply with and be bound by the following terms of use. The contents of this website are for general information and aesthetic service booking purposes only.",
      "nav-home": "Home",
      "nav-articles": "Articles",
      "articles-title": "Insights & Science",
      "articles-desc": "Explore our expert articles on aesthetic medicine, treatments, and the science of longevity.",
      "read-more": "Read More",
      "success-title": "Thank You!",
      "success-msg": "Your request has been received. We will contact you shortly.",
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
      "alt-dr-shilo": "Dr. Shiloh DMD MSc, Expert Aesthetic Doctor at Linnéa Aesthetic Clinic Jerusalem, Israel",
      "alt-skin": "Professional Skin Rejuvenation and Advanced Laser Treatments at Linnéa Aesthetic Clinic Israel",
      "alt-botox": "Expert Botox Injections and Dermal Fillers at Premium Aesthetic Clinic Jerusalem",
      "alt-contouring": "Facial Contouring and Aesthetic Sculpting Specialist in Jerusalem, Israel",
      "alt-article-botox": "The Art of Botox: Expert Anti-Aging and Wrinkle Treatments in Israel",
      "alt-article-fillers": "Mastering Dermal Fillers: Advanced Volume Restoration at Linnéa Aesthetic Clinic",
      "alt-article-scientific": "Science of Longevity: Evidence-Based Aesthetic Medicine in Israel",
      "alt-skin-after": "After Results of Skin Rejuvenation Treatment at Linnéa Clinic Israel",
      "alt-skin-before": "Before Skin Rejuvenation Treatment at Aesthetic Clinic Jerusalem",
      "alt-lips-after": "After Results of Lip Enhancement Fillers in Israel",
      "alt-lips-before": "Before Lip Enhancement Fillers at Linnéa Clinic",
      "alt-jawline-after": "After Jawline Contouring and Facial Sculpting Results",
      "alt-jawline-before": "Before Jawline Contouring at Jerusalem Aesthetic Clinic",
      "alt-article1-hero": "Botox and Neuromodulator Treatment for Natural Results in Israel",
      "alt-article2-hero": "Dermal Fillers and Facial Balancing for Elegant Aging in Jerusalem",
      "alt-article3-hero": "Cellular Health and Longevity Science in Modern Aesthetic Medicine Israel",
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
      "doc-name": "Dr. Shiloh DMD, MSc",
      "doc-p1": "Dr. Shiloh, the clinic’s lead physician, is a graduate of the Hebrew University of Jerusalem and Hadassah Medical Center, holding both a DMD degree and an MSc in Medical Big Data. His unique background combines advanced medical training with technological expertise from Unit 8200, enabling an innovation-driven, research-oriented, and technology-focused approach to aesthetic medicine and injectables.",
      "doc-p2": "Dr. Shiloh’s philosophy is rooted in precise minimalism - clean, refined, and natural-looking treatments that preserve facial harmony and authenticity. Each treatment is carefully tailored, with meticulous attention to detail and close, personalized guidance throughout the entire journey, with the understanding that exceptional results should not only look natural, but feel right. At the clinic, only FDA-approved materials are used, reflecting an uncompromising commitment to excellence, safety, and long-term outcomes."
    },
    he: {
      "nav-about": "אודות",
      "nav-treatments": "טיפולים",
      "nav-science": "מדע",
      "nav-directions": "הגעה",
      "nav-contact": "צור קשר",
      "btn-book": "קביעת פגישה",
      "hero-title": "גלי את הזוהר הטבעי שלך",
      "hero-subtitle": "טיפולים אסתטיים ברמה הגבוהה ביותר, המותאמים אישית להעצמת היופי הייחודי שלך באווירה מרגיעה ומקצועית.",
      "about-title": "טיפוח הרמוניה אסתטית",
      "about-p1": "אצל לינאה, אנו מאמינים ששיפור אסתטי אינו רק שינוי המראה שלך, אלא טיפוח ההרמוניה שכבר קיימת בך. קליניקת הבוטיק שלנו מספקת חוויה מזמינה ואנושית שבה מדע מתקדם פוגש טיפול מותאם אישית.",
      "about-p2": "כל טיפול מותאם בקפידה, ומעניק לך מראה זוהר, טהור ומאוזן באופן טבעי.",
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
      "address-val": "שדרות הרצל 116, ירושלים",
      "hours-label": "שעות פתיחה:",
      "phone-label": "טלפון:",
      "get-directions": "ניווט לקליניקה",
      "map-placeholder": "מפה",
      "footer-tagline": "חם, יוקרתי, מזמין, אנושי.",
      "footer-explore": "ניווט",
      "footer-contact": "צרו קשר",
      "footer-address": "שדרות הרצל 116, ירושלים, ישראל",
      "footer-discuss": "בואו נדבר על המסע שלכן.",
      "footer-rights": "© 2026 לינאה קליניקה אסתטית. כל הזכויות שמורות.",
      "modal-title": "קביעת פגישת ייעוץ",
      "modal-desc": "הצעד הראשון אל עבר הזוהר הטבעי שלך.",
      "label-name": "שם מלא",
      "placeholder-name": "ישראל ישראלי",
      "label-email": "אימייל",
      "placeholder-email": "israel@example.com",
      "label-phone": "מספר טלפון",
      "placeholder-phone": "050-1234567",
      "label-interest": "תחום עניין",
      "opt-rejuvenation": "הצערת העור",
      "opt-injectables": "הזרקות",
      "opt-contouring": "פיסול פנים",
      "opt-other": "אחר",
      "label-other-details": "אנא פרטו",
      "placeholder-other-details": "ספרו לנו עוד על מה שאתם מחפשים...",
      "reviews-title": "מה הלקוחות שלנו אומרים",
      "reviews-subtitle": "ביקורות גוגל",
      "review-google-btn": "דרגו אותנו בגוגל",
      "transformations-title": "שינויים נראים לעין",
      "transformations-desc": "הזיזו את הסליידר כדי לחקור את התוצאות הטבעיות שלנו.",
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
      "btn-submit": "שליחת בקשה",
      "alert-success": "תודה על פנייתך! צוות הקליניקה ייצור איתך קשר בהקדם.",
      "nav-accessibility": "הצהרת נגישות",
      "nav-privacy": "מדיניות פרטיות",
      "nav-terms": "תנאי שימוש באתר",
      "footer-legal": "משפטי",
      "cookie-text": "אנו משתמשים בעוגיות (Cookies) כדי לשפר את חוויית הגלישה שלך. המשך הגלישה באתר מהווה הסכמה לשימוש בהן.",
      "cookie-accept": "אישור",
      "cookie-decline": "דחייה",
      "acc-title": "תפריט נגישות",
      "acc-increase-font": "הגדלת טקסט",
      "acc-decrease-font": "הקטנת טקסט",
      "acc-high-contrast": "ניגודיות גבוהה",
      "acc-light-bg": "רקע בהיר",
      "acc-links-underline": "הדגשת קישורים",
      "acc-reset": "איפוס הגדרות",
      "accessibility-stmt-content": "אנו רואים חשיבות עליונה בהנגשת האתר. אתר זה הונגש בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע\"ג. במידה ונתקלתם בבעיית נגישות, אנא צרו עמנו קשר.",
      "privacy-content": "הפרטיות שלך חשובה לנו. אנו אוספים רק מידע הכרחי למתן השירותים האסתטיים שלנו ואיננו משתפים את הנתונים שלך עם צדדים שלישיים ללא הרשאה. בעצם השימוש באתר זה, הנך מסכים למדיניות זו.",
      "terms-content": "הגלישה והשימוש באתר זה כפופים לתנאי השימוש הבאים. תכני האתר נועדו למידע כללי בלבד ולצורך הזמנת תורים אלינו.",
      "page-title": "Linnéa | קליניקה אסתטית יוקרתית",
      "article-botox-title": "Linnéa | אמנות הבוטוקס",
      "article-fillers-title": "Linnéa | שליטה בחומרי מילוי",
      "article-scientific-title": "Linnéa | מדע אריכות הימים",
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
      "alt-dr-shilo": "ד\"ר שילה DMD MSc, מומחה לאסתטיקה רפואית במרפאת לינאה ירושלים, ישראל",
      "alt-skin": "חידוש העור וטיפולי לייזר מתקדמים במרפאת האסתטיקה לינאה ישראל",
      "alt-botox": "הזרקות בוטוקס וחומרי מילוי מומחים במרפאת בוטיק לאסתטיקה בירושלים",
      "alt-contouring": "מומחה לפיסול פנים וקו לסת במרפאת אסתטיקה בירושלים, ישראל",
      "alt-article-botox": "אמנות הבוטוקס: טיפולי אנטי-אייג'ינג והחלקת קמטים מומחים בישראל",
      "alt-article-fillers": "מומחיות בחומרי מילוי: שחזור נפח מתקדם במרפאת לינאה אסתטיקה",
      "alt-article-scientific": "מדע אריכות הימים: רפואה אסתטית מבוססת מדע בישראל",
      "alt-skin-after": "תוצאות אחרי טיפול חידוש עור במרפאת לינאה ישראל",
      "alt-skin-before": "לפני טיפול חידוש עור במרפאת אסתטיקה בירושלים",
      "alt-lips-after": "תוצאות אחרי עיבוי שפתיים עם חומרי מילוי בישראל",
      "alt-lips-before": "לפני עיבוי שפתיים במרפאת לינאה",
      "alt-jawline-after": "תוצאות אחרי פיסול קו לסת ועיצוב פנים",
      "alt-jawline-before": "לפני פיסול קו לסת במרפאת אסתטיקה ירושלים",
      "alt-article1-hero": "טיפול בוטוקס ונוירומודולטורים לתוצאות טבעיות בישראל",
      "alt-article2-hero": "חומרי מילוי ואיזון פנים להזדקנות אלגנטית בירושלים",
      "alt-article3-hero": "בריאות תאית ומדע אריכות הימים ברפואה אסתטית מודרנית בישראל",
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
      "doc-name": "ד\"ר שילה DMD, MSc",
      "doc-p1": "ד\"ר שילה, הרופא הראשי במרפאה, הוא בוגר האוניברסיטה העברית והמרכז הרפואי הדסה, ובעל תואר DMD ותואר MSc בביג דאטה רפואי. הרקע הייחודי שלו, המשלב הכשרה רפואית מתקדמת עם ניסיון טכנולוגי מיחידת 8200, מאפשר גישה מוכוונת חדשנות, מחקר וטכנולוגיה בתחום האסתטיקה הרפואית וההזרקות.",
      "doc-p2": "הגישה של ד\"ר שילה מבוססת על מינימליזם מדויק - טיפולים נקיים, אסתטיים וטבעיים, תוך שמירה על הרמוניה ואותנטיות של תווי הפנים. כל טיפול מותאם באופן אישי, עם הקפדה על פרטים קטנים וליווי צמוד לאורך כל הדרך, מתוך הבנה שתוצאה מצוינת אינה רק נראית טבעית - אלא גם מרגישה נכון. במרפאה נעשה שימוש בלעדי בחומרים המאושרים על ידי ה-FDA, כחלק ממחויבות בלתי מתפשרת לאיכות, בטיחות ותוצאות ארוכות טווח."
    }
  };

  const applyLanguage = (lang) => {
    console.log('Final applyLanguage:', lang);
    langToggles.forEach(btn => {
      btn.textContent = lang === 'en' ? 'HE' : 'EN';
    });
    document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');

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
        el.textContent = translations[lang][key];
      }
    });

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
      applyLanguage(currentLang);
    });
  });

  if (mobileNavToggle && navLinks) {
    mobileNavToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
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

    // Handle incoming links hash - REMOVED so it doesn't open on page load
    // Navigation is handled strictly through click events and scrolling now.
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = '...';
      submitBtn.disabled = true;

      fetch(form.action, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
          form.innerHTML = `
            <div style="text-align: center; padding: 2.5rem 0;">
              <h3 style="font-family: var(--font-serif); font-size: 2.5rem; color: var(--clinique-teal-dark); margin-bottom: 1rem;" data-i18n="success-title">Thank You!</h3>
              <p style="font-size: 1.1rem; color: var(--text-dark);" data-i18n="success-msg">Your request has been received. We will contact you shortly.</p>
            </div>
          `;
          applyLanguage(currentLang);
        } else {
          submitBtn.textContent = 'Error, please try again.';
          submitBtn.disabled = false;
        }
      }).catch(error => {
        submitBtn.textContent = 'Error, please try again.';
        submitBtn.disabled = false;
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
  };

  if (cookieAccept && cookieDecline) {
    cookieAccept.addEventListener('click', () => handleCookie('accepted'));
    cookieDecline.addEventListener('click', () => handleCookie('declined'));
  }

  // Accessibility Widget
  const accToggle = document.getElementById('accessibility-toggle');
  const accPanel = document.getElementById('accessibility-panel');
  const accClose = document.getElementById('acc-close');

  if (accToggle && accPanel) {
    accToggle.addEventListener('click', () => {
      accPanel.classList.toggle('active');
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
        beforeClip.style.width = (100 - pos) + '%';
      } else {
        beforeClip.style.width = pos + '%';
      }
      handle.style.left = pos + '%';
      // Make before image fill the full wrapper width regardless of clip
      if (beforeImg) {
        beforeImg.style.width = (rect.width) + 'px';
      }
    };

    // Set initial image width on load
    const initWidth = () => {
      if (beforeImg) {
        beforeImg.style.width = wrapper.getBoundingClientRect().width + 'px';
      }
    };
    initWidth();
    window.addEventListener('resize', initWidth);

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
