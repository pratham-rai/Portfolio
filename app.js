// ============================================================
// Pratham Rai — Portfolio Interactive Engine
// Vanilla JS — Canvas, Theme, Cursor, Scroll, Modals, Filters
// ============================================================

(function () {
  'use strict';

  // ──────────────────────────────────────────────
  // 1. INTERACTIVE CANVAS PARTICLE BACKGROUND
  // ──────────────────────────────────────────────

  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let mouse = { x: -500, y: -500 };
  let animFrameId;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 1.8 + 0.6;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.15;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges
      if (this.x > canvas.width + 10) this.x = -10;
      if (this.x < -10) this.x = canvas.width + 10;
      if (this.y > canvas.height + 10) this.y = -10;
      if (this.y < -10) this.y = canvas.height + 10;
    }

    draw() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(148, 163, 184, ${this.opacity})`
        : `rgba(71, 85, 105, ${this.opacity * 0.6})`;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = [];
    const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawConnections() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    const maxDist = 140;
    const mouseMaxDist = 180;

    for (let i = 0; i < particles.length; i++) {
      // Mouse connections
      const dxM = particles[i].x - mouse.x;
      const dyM = particles[i].y - mouse.y;
      const distM = Math.sqrt(dxM * dxM + dyM * dyM);
      if (distM < mouseMaxDist) {
        const alpha = (1 - distM / mouseMaxDist) * 0.6;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = isDark
          ? `rgba(99, 102, 241, ${alpha})`
          : `rgba(79, 70, 229, ${alpha * 0.7})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Particle-to-particle connections
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = isDark
            ? `rgba(148, 163, 184, ${alpha})`
            : `rgba(71, 85, 105, ${alpha * 0.5})`;
          ctx.lineWidth = 0.4;
          ctx.stroke();
        }
      }
    }
  }

  function animateCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    drawConnections();
    animFrameId = requestAnimationFrame(animateCanvas);
  }

  function startCanvas() {
    resizeCanvas();
    initParticles();
    animateCanvas();
  }

  window.addEventListener('resize', () => {
    cancelAnimationFrame(animFrameId);
    resizeCanvas();
    initParticles();
    animateCanvas();
  });

  canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.x = -500;
    mouse.y = -500;
  });

  startCanvas();

  // ──────────────────────────────────────────────
  // 2. THEME TOGGLE (Dark / Light with localStorage)
  // ──────────────────────────────────────────────

  const themeBtn = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('pratham-theme', theme);
  }

  // Load stored preference or detect OS preference
  const stored = localStorage.getItem('pratham-theme');
  if (stored) {
    setTheme(stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    setTheme('light');
  }

  themeBtn.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ──────────────────────────────────────────────
  // 3. CUSTOM CURSOR TRAIL (Desktop only)
  // ──────────────────────────────────────────────

  const cursorTrail = document.getElementById('cursor-trail');
  const cursorOutline = document.getElementById('cursor-outline');
  let cursorX = 0, cursorY = 0;
  let outlineX = 0, outlineY = 0;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorTrail.style.left = cursorX + 'px';
      cursorTrail.style.top = cursorY + 'px';
    });

    function animateOutline() {
      outlineX += (cursorX - outlineX) * 0.12;
      outlineY += (cursorY - outlineY) * 0.12;
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';
      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover-expand on interactive elements
    const hoverTargets = document.querySelectorAll('.cursor-hover-target');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
      });
    });
  } else {
    // Hide custom cursor on touch
    if (cursorTrail) cursorTrail.style.display = 'none';
    if (cursorOutline) cursorOutline.style.display = 'none';
  }

  // ──────────────────────────────────────────────
  // 4. HEADER SCROLL STATE
  // ──────────────────────────────────────────────

  const header = document.getElementById('header');

  function handleHeaderScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  // Active nav-item indicator based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-item');

  function updateActiveNav() {
    const scrollPos = window.scrollY + 200;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navItems.forEach(item => {
          item.classList.remove('active');
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ──────────────────────────────────────────────
  // 5. MOBILE NAVIGATION
  // ──────────────────────────────────────────────

  const hamburger = document.getElementById('hamburger-menu');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-overlay');

  function toggleMobileNav() {
    mobileNav.classList.toggle('open');
    if (mobileNav.classList.contains('open')) {
      mobileOverlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    } else {
      mobileOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', toggleMobileNav);
  mobileOverlay.addEventListener('click', toggleMobileNav);

  // Close mobile nav on link click
  mobileNav.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        toggleMobileNav();
      }
    });
  });

  // ──────────────────────────────────────────────
  // 6. INTERSECTION OBSERVER — SCROLL REVEAL
  // ──────────────────────────────────────────────

  const revealElements = document.querySelectorAll('.scroll-reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Stagger the animation slightly for siblings
        setTimeout(() => {
          entry.target.classList.add('active');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -60px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ──────────────────────────────────────────────
  // 7. SKILLS FILTER
  // ──────────────────────────────────────────────

  const filterBtns = document.querySelectorAll('.filter-btn');
  const skillCards = document.querySelectorAll('.skill-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      skillCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          card.style.display = '';
          // Trigger reflow then animate in
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          });
        } else {
          card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.8)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ──────────────────────────────────────────────
  // 8. PROJECT DETAIL MODALS
  // ──────────────────────────────────────────────

  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modalOverlays = document.querySelectorAll('.modal-overlay');

  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(trigger.dataset.modal);
    });
  });

  modalOverlays.forEach(overlay => {
    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });

    // Close button
    const closeBtn = overlay.querySelector('.modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(overlay));
    }
  });

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modalOverlays.forEach(overlay => {
        if (overlay.classList.contains('open')) {
          closeModal(overlay);
        }
      });
      // Also close mobile nav
      if (mobileNav.classList.contains('open')) {
        toggleMobileNav();
      }
    }
  });

  // ──────────────────────────────────────────────
  // 9. CONTACT FORM HANDLER (FormSubmit.co Integration)
  // ──────────────────────────────────────────────

  const contactForm = document.getElementById('contact-form-handler');
  const successAlert = document.getElementById('success-alert');
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnHTML = submitBtn.innerHTML;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    if (!name || !email || !subject || !message) return;

    // Show Loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending Message...';

    // Submit to FormSubmit.co via AJAX
    fetch('https://formsubmit.co/ajax/raipratham12@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        Name: name,
        Email: email,
        Subject: subject,
        Message: message
      })
    })
    .then(response => response.json())
    .then(data => {
      // Save local backup as well
      const messages = JSON.parse(localStorage.getItem('pratham-messages') || '[]');
      messages.push({
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('pratham-messages', JSON.stringify(messages));

      // Show success toast
      successAlert.classList.add('show');
      setTimeout(() => {
        successAlert.classList.remove('show');
      }, 4000);

      // Reset form
      contactForm.reset();
    })
    .catch(error => {
      console.error('Error submitting form:', error);
      alert('Failed to transmit message. Please contact directly at raipratham12@gmail.com.');
    })
    .finally(() => {
      // Restore button status
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    });
  });


  // ──────────────────────────────────────────────
  // 10. TIMELINE SCROLL PROGRESS BAR
  // ──────────────────────────────────────────────

  const timelineProgress = document.getElementById('timeline-progress-bar');
  const timelineContainer = document.querySelector('.timeline-container');

  function updateTimelineProgress() {
    if (!timelineContainer || !timelineProgress) return;

    const rect = timelineContainer.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const containerHeight = timelineContainer.offsetHeight;
    const scrollPos = window.scrollY + window.innerHeight * 0.5;

    let progress = (scrollPos - containerTop) / containerHeight;
    progress = Math.max(0, Math.min(1, progress));

    timelineProgress.style.height = (progress * 100) + '%';
  }

  window.addEventListener('scroll', updateTimelineProgress, { passive: true });

  // ──────────────────────────────────────────────
  // 11. SMOOTH ANCHOR SCROLLING
  // ──────────────────────────────────────────────

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const offset = 80;
        const topPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: topPos,
          behavior: 'smooth'
        });
      }
    });
  });

  // ──────────────────────────────────────────────
  // 12. CARD CLICK NAVIGATION HANDLER
  // ──────────────────────────────────────────────

  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      // Don't intercept click if clicking directly on a link or button, or an SVG inside a link/button
      if (e.target.closest('a') || e.target.closest('button')) return;
      const link = card.querySelector('.project-more-link');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    });
  });

  const honorCards = document.querySelectorAll('.honor-card');
  honorCards.forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;
      const link = card.querySelector('.honor-more-link');
      if (link) {
        const href = link.getAttribute('href');
        if (href && href !== '#') {
          window.location.href = href;
        }
      }
    });
  });

  // ──────────────────────────────────────────────
  // 13. INITIAL CALLS
  // ──────────────────────────────────────────────

  handleHeaderScroll();
  updateActiveNav();
  updateTimelineProgress();

})();
