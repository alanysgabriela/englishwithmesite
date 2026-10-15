// script.js

/* =========================
   Smooth scrolling + Reveal on scroll + Micro interactions
========================= */

(() => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('primary-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close on link click (mobile)
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          nav.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Floating cards micro-interaction
  const floaters = document.querySelectorAll('[data-float]');
  if (!reduceMotion) {
    floaters.forEach((el) => {
      let raf = null;
      let t0 = performance.now();
      const amp = 6; // px
      const base = el.getBoundingClientRect();

      // Use requestAnimationFrame to animate without layout thrash
      const tick = (t) => {
        const dt = (t - t0) / 1000;
        const y = Math.sin(dt * 1.4) * amp;
        const x = Math.cos(dt * 1.1) * 2;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);

      // Pause on hover: elegant & prevents motion fatigue
      el.addEventListener('mouseenter', () => {
        if (raf) cancelAnimationFrame(raf);
      });

      el.addEventListener('mouseleave', () => {
        if (!raf) raf = requestAnimationFrame(tick);
      });
    });
  }

  // Parallax for hero visual
  const parallaxEl = document.querySelector('[data-parallax]');
  if (parallaxEl && !reduceMotion) {
    const onMove = (e) => {
      const r = parallaxEl.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;

      const rotX = (-dy * 4).toFixed(2);
      const rotY = (dx * 6).toFixed(2);
      parallaxEl.style.transform = `translateY(0) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    };

    const onLeave = () => {
      parallaxEl.style.transform = '';
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    parallaxEl.addEventListener('mouseleave', onLeave);
  }

  // Carousel (placeholder testimonials)
  const carousel = document.querySelector('[data-carousel]');
  if (carousel && !reduceMotion) {
    const track = carousel.querySelector('[data-carousel-track]');
    const items = Array.from(carousel.querySelectorAll('[data-carousel-item]'));
    const prevBtn = carousel.querySelector('[data-carousel-prev]');
    const nextBtn = carousel.querySelector('[data-carousel-next]');
    const dotsWrap = carousel.querySelector('[data-carousel-dots]');

    if (track && items.length) {
      let index = 0;

      const state = {
        itemWidth: items[0].getBoundingClientRect().width,
        gap: parseFloat(getComputedStyle(track).columnGap || 14) || 14
      };

      // Build dots
      if (dotsWrap) {
        dotsWrap.innerHTML = '';
        items.forEach((_, i) => {
          const dot = document.createElement('button');
          dot.type = 'button';
          dot.className = 'dot' + (i === index ? ' active' : '');
          dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
          dot.addEventListener('click', () => goTo(i, true));
          dotsWrap.appendChild(dot);
        });
      }

      const updateDots = () => {
        if (!dotsWrap) return;
        Array.from(dotsWrap.children).forEach((d, i) => {
          d.classList.toggle('active', i === index);
        });
      };

      const goTo = (i, immediate = false) => {
        index = (i + items.length) % items.length;
        const left = index * (state.itemWidth + state.gap);
        track.style.transition = immediate ? 'none' : 'transform .6s var(--ease)';
        track.style.transform = `translateX(${-left}px)`;
        updateDots();
      };

      // Recalculate on resize
      const recalc = () => {
        state.itemWidth = items[0].getBoundingClientRect().width;
        // gap reading from flex isn't perfect; keep fallback
      };
      window.addEventListener('resize', recalc, { passive: true });

      prevBtn?.addEventListener('click', () => goTo(index - 1));
      nextBtn?.addEventListener('click', () => goTo(index + 1));

      // Initialize
      goTo(0, true);

      // Auto-advance with subtle pacing
      let timer = null;
      const start = () => {
        timer = setInterval(() => goTo(index + 1), 6500);
      };
      const stop = () => {
        if (timer) clearInterval(timer);
        timer = null;
      };

      carousel.addEventListener('mouseenter', stop);
      carousel.addEventListener('mouseleave', start);
      start();
    }
  }
})();