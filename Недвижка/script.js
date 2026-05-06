// ============================================
// Script — Коммерческая недвижимость
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // --- Navbar scroll effect ---
  const navbar = document.getElementById('navbar');
  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // --- Burger menu ---
  const burger = document.getElementById('burger');
  const navLinks = document.getElementById('navLinks');
  const overlay = document.getElementById('overlay');

  const toggleMenu = () => {
    burger.classList.toggle('active');
    navLinks.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  };

  burger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('active')) toggleMenu();
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = navbar.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- FAQ Toggle (Show all) ---
  const toggleFaqBtn = document.getElementById('toggleFaq');
  const extraFaq = document.getElementById('extraFaq');

  if (toggleFaqBtn && extraFaq) {
    toggleFaqBtn.addEventListener('click', () => {
      const isHidden = !extraFaq.classList.contains('visible');
      if (isHidden) {
        extraFaq.style.display = 'block';
        // Force reflow
        extraFaq.offsetHeight;
        extraFaq.classList.add('visible');
        toggleFaqBtn.textContent = 'Скрыть вопросы';
      } else {
        extraFaq.classList.remove('visible');
        setTimeout(() => {
          if (!extraFaq.classList.contains('visible')) {
            extraFaq.style.display = 'none';
          }
        }, 500); // Match CSS transition
        toggleFaqBtn.textContent = 'Смотреть все вопросы';
      }
    });
  }


  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.parentElement;
      const answer = item.querySelector('.faq-answer');
      const isActive = item.classList.contains('active');

      // Close all in BOTH lists
      document.querySelectorAll('.faq-item.active').forEach(el => {
        el.classList.remove('active');
        el.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked if was closed
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Scroll reveal animation ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- Interactive Gallery & Lightbox Logic ---
  const galleries = document.querySelectorAll('.prop-showcase');
  let lightboxMedia = [];
  let lightboxIndex = 0;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Закрыть">✕</button>
    <div class="lightbox-content"></div>
    <div class="lightbox-nav">
      <button class="lightbox-btn lightbox-prev" aria-label="Назад"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:24px;height:24px"><polyline points="15 18 9 12 15 6"/></svg></button>
      <button class="lightbox-btn lightbox-next" aria-label="Вперед"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:24px;height:24px"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
  `;
  document.body.appendChild(lightbox);

  const lightboxContent = lightbox.querySelector('.lightbox-content');
  const lightboxClose = lightbox.querySelector('.lightbox-close');
  const lightboxPrev = lightbox.querySelector('.lightbox-prev');
  const lightboxNext = lightbox.querySelector('.lightbox-next');

  function updateLightbox() {
    const item = lightboxMedia[lightboxIndex];
    if (item.type === 'video') {
      lightboxContent.innerHTML = `<video src="${item.src}" controls autoplay class="reveal-fast"></video>`;
    } else {
      lightboxContent.innerHTML = `<img src="${item.src}" alt="Фото объекта" class="reveal-fast">`;
    }
  }

  function openLightbox(media, index) {
    lightboxMedia = media;
    lightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxContent.innerHTML = '';
    document.body.style.overflow = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex - 1 + lightboxMedia.length) % lightboxMedia.length;
    updateLightbox();
  });
  lightboxNext.addEventListener('click', (e) => {
    e.stopPropagation();
    lightboxIndex = (lightboxIndex + 1) % lightboxMedia.length;
    updateLightbox();
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === lightboxContent) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') lightboxPrev.click();
    if (e.key === 'ArrowRight') lightboxNext.click();
  });

  // --- Initialize Each Gallery ---
  document.querySelectorAll('.prop-gallery').forEach(gallery => {
    const slides = gallery.querySelectorAll('.prop-gallery__slide');
    const dotsContainer = gallery.querySelector('.prop-gallery__dots');
    const counter = gallery.querySelector('.prop-gallery__counter');
    const prevBtn = gallery.querySelector('.prop-gallery__arrow--prev');
    const nextBtn = gallery.querySelector('.prop-gallery__arrow--next');

    let currentSlide = 0;
    const media = Array.from(slides).map(slide => {
      const img = slide.querySelector('img');
      const video = slide.querySelector('video');
      return {
        type: video ? 'video' : 'image',
        src: video ? video.src : img.src
      };
    });

    // Create dots
    slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `prop-gallery__dot ${i === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.prop-gallery__dot');

    function goToSlide(index) {
      slides[currentSlide].classList.remove('active');
      dots[currentSlide].classList.remove('active');
      currentSlide = (index + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      dots[currentSlide].classList.add('active');
      if (counter) counter.textContent = `${currentSlide + 1} / ${slides.length}`;
    }

    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide - 1); });
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); goToSlide(currentSlide + 1); });

    // Open Lightbox on slide click
    slides.forEach((slide, i) => {
      slide.addEventListener('click', () => openLightbox(media, i));
    });

    // Autoplay (5s)
    let autoplayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    gallery.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    gallery.addEventListener('mouseleave', () => {
      clearInterval(autoplayInterval);
      autoplayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    });
  });

  // --- Mobile Dropdown Toggle ---
  const dropdownTrigger = document.querySelector('.dropdown-trigger');
  if (dropdownTrigger && window.innerWidth <= 768) {
    dropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = dropdownTrigger.parentElement;
      parent.classList.toggle('active');
    });
  }

  // --- Form submission with AJAX (FormSubmit) ---
  const ctaForm = document.getElementById('ctaForm');
  if (ctaForm) {
    ctaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = ctaForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.textContent;

      // Loading state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';

      try {
        const formData = new FormData(ctaForm);
        const response = await fetch(ctaForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          alert('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.');
          ctaForm.reset();
        } else {
          throw new Error('Ошибка при отправке');
        }
      } catch (error) {
        alert('Произошла ошибка при отправке. Пожалуйста, попробуйте связаться с нами по телефону или через мессенджеры.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  // --- Interactive Maps (Yandex Maps Integration) ---
  function initMaps() {
    ymaps.ready(() => {
      const mapConfigs = [
        {
          id: 'map-phuket',
          center: [7.8479654, 98.3419337],
          title: 'Вилла в Таиланде',
          address: 'Supalai Primo Chalong, F83 house f93, 83000'
        },
        {
          id: 'map-varshavka',
          center: [55.537877, 37.581981],
          title: 'Помещение под автотематику',
          address: 'Варшавское шоссе 204, Москва'
        },
        {
          id: 'map-belorusskaya',
          center: [55.772289, 37.576007],
          title: 'Апартаменты в центре Москвы',
          address: 'Электрический переулок 3/10 стр 1, Москва'
        },
        {
          id: 'map-starokachalovskaya',
          center: [55.567530, 37.586589],
          title: 'Помещение под любой вид деятельности',
          address: 'ул. Старокачаловская 1А, Москва'
        }
      ];

      mapConfigs.forEach(config => {
        const container = document.getElementById(config.id);
        if (!container) return;

        const map = new ymaps.Map(config.id, {
          center: config.center,
          zoom: 16,
          controls: ['zoomControl', 'fullscreenControl']
        });

        const placemark = new ymaps.Placemark(config.center, {
          balloonContentHeader: config.title,
          balloonContentBody: config.address,
          hintContent: config.title
        }, {
          preset: 'islands#redDotIcon'
        });

        map.geoObjects.add(placemark);

        // Helpful if maps are initially hidden
        map.container.fitToViewport();
      });
    });
  }

  // Delay map init slightly to ensure container sizing is ready
  setTimeout(initMaps, 300);
});
