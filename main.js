import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Reveal elements on scroll
  const revealElements = document.querySelectorAll('.treatment-card, .about-text, .about-image, .location-info, .location-map');
  
  // Add reveal class to these elements
  revealElements.forEach(el => el.classList.add('reveal'));

  const revealOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  const langToggle = document.getElementById('lang-toggle');
  let currentLang = 'en';

  const translations = {
    en: {
      "nav-about": "About",
      "nav-treatments": "Treatments",
      "nav-directions": "Directions",
      "nav-contact": "Contact",
      "btn-book": "Book Consultation",
      "hero-title": "Discover Your Natural Radiance",
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
      "footer-discuss": "Let's discuss your journey.",
      "footer-rights": "© 2026 Linnéa Aesthetic Clinic. All rights reserved.",
      "modal-title": "Book a Consultation",
      "modal-desc": "Take the first step towards your natural radiance.",
      "label-name": "Full Name",
      "placeholder-name": "Jane Doe",
      "label-email": "Email",
      "placeholder-email": "jane@example.com",
      "label-interest": "Area of Interest",
      "opt-rejuvenation": "Skin Rejuvenation",
      "opt-injectables": "Injectables",
      "opt-contouring": "Facial Contouring",
      "opt-other": "Other / Not Sure",
      "btn-submit": "Submit Request",
      "alert-success": "Thank you for booking a consultation! Our team will contact you shortly."
    },
    he: {
      "nav-about": "אודות",
      "nav-treatments": "טיפולים",
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
      "footer-discuss": "בואו נדבר על המסע שלכן.",
      "footer-rights": "© 2026 לינאה קליניקה אסתטית. כל הזכויות שמורות.",
      "modal-title": "קביעת פגישת ייעוץ",
      "modal-desc": "הצעד הראשון אל עבר הזוהר הטבעי שלך.",
      "label-name": "שם מלא",
      "placeholder-name": "ישראל ישראלי",
      "label-email": "אימייל",
      "placeholder-email": "israel@example.com",
      "label-interest": "תחום עניין",
      "opt-rejuvenation": "הצערת העור",
      "opt-injectables": "הזרקות",
      "opt-contouring": "פיסול פנים",
      "opt-other": "אחר / לא בטוח",
      "btn-submit": "שליחת בקשה",
      "alert-success": "תודה על פנייתך! צוות הקליניקה ייצור איתך קשר בהקדם."
    }
  };

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'he' : 'en';
      langToggle.textContent = currentLang === 'en' ? 'HE' : 'EN';
      document.documentElement.setAttribute('dir', currentLang === 'en' ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', currentLang);
      
      // Update texts
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
          el.textContent = translations[currentLang][key];
        }
      });

      // Update placeholders
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (translations[currentLang][key]) {
          el.placeholder = translations[currentLang][key];
        }
      });
    });
  }

  // Modal logic
  const modal = document.getElementById('booking-modal');
  const openModalBtns = document.querySelectorAll('.nav-btn, .hero-btn');
  const closeModal = document.getElementById('close-modal');
  const form = document.getElementById('booking-form');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  // Close on click outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

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
      if(response.ok) {
        alert(translations[currentLang]['alert-success']);
        modal.classList.remove('active');
        form.reset();
      } else {
        alert("Oops! There was a problem submitting your form. Please try again or contact us directly.");
      }
    }).catch(error => {
      alert("Oops! There was a problem submitting your form. Please try again or contact us directly.");
    }).finally(() => {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    });
  });
});
