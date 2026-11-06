/**
 * HRITABRATA BARDHAN - MINIMALIST PORTFOLIO ENGINE (CYBER BLUE ACCENT)
 * Includes: Interactive Plexus Mesh Canvas (Retina & Mobile Optimized),
 * Typewriter Engine, Theme Switcher (Dark/Light), Scrollspy with RAF throttling,
 * Interactive Terminal, Toast Notifications, Copy Triggers, and Modal/Drawer Controllers.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. THEME SWITCHER (DARK / LIGHT MODE)
  // =========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const htmlRoot = document.documentElement;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('site-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  document.body.className = savedTheme === 'light' ? 'theme-light' : 'theme-dark';

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      htmlRoot.setAttribute('data-theme', newTheme);
      document.body.className = newTheme === 'light' ? 'theme-light' : 'theme-dark';
      localStorage.setItem('site-theme', newTheme);

      if (window.updatePlexusTheme) {
        window.updatePlexusTheme(newTheme);
      }
    });
  }

  // =========================================================================
  // 2. INTERACTIVE PLEXUS 3D CONSTELLATION NETWORK CANVAS (MOBILE & HIGH-DPI OPTIMIZED)
  // =========================================================================
  const canvas = document.getElementById('plexus-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2 for mobile battery efficiency
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.scale(dpr, dpr);
    }
    resizeCanvas();

    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      mouse.x = null;
      mouse.y = null;
    });

    // Touch support for Mobile and Tablet (with passive listeners for 60fps scrolling)
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      mouse.x = null;
      mouse.y = null;
    }, { passive: true });

    let isDark = htmlRoot.getAttribute('data-theme') !== 'light';
    let nodeColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(37, 99, 235, 0.75)';
    let lineColor = isDark ? 'rgba(255, 255, 255, ' : 'rgba(37, 99, 235, ';
    let triColor = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(37, 99, 235, 0.04)';

    window.updatePlexusTheme = (theme) => {
      isDark = theme !== 'light';
      nodeColor = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(37, 99, 235, 0.75)';
      lineColor = isDark ? 'rgba(255, 255, 255, ' : 'rgba(37, 99, 235, ';
      triColor = isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(37, 99, 235, 0.04)';
    };

    // Mobile adaptive particle count
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile
      ? Math.min(Math.floor((width * height) / 18000), 38)
      : Math.min(Math.floor((width * height) / 9500), 115);

    const particles = [];

    class PlexusParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 1.5 + 1.0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce on boundaries
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse attraction/repulsion
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.6;
            this.y -= (dy / dist) * force * 1.6;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new PlexusParticle());
    }

    function renderPlexus() {
      ctx.clearRect(0, 0, width, height);

      const maxDist = isMobile ? 120 : 148;

      // Draw Triangles and Connecting Lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();

            // Find third particle for triangulated wireframe mesh (desktop/tablets only for performance)
            if (!isMobile) {
              for (let k = j + 1; k < particles.length; k++) {
                const p3 = particles[k];
                const d2 = Math.sqrt((p1.x - p3.x) ** 2 + (p1.y - p3.y) ** 2);
                const d3 = Math.sqrt((p2.x - p3.x) ** 2 + (p2.y - p3.y) ** 2);

                if (d2 < maxDist * 0.85 && d3 < maxDist * 0.85) {
                  ctx.beginPath();
                  ctx.moveTo(p1.x, p1.y);
                  ctx.lineTo(p2.x, p2.y);
                  ctx.lineTo(p3.x, p3.y);
                  ctx.closePath();
                  ctx.fillStyle = triColor;
                  ctx.fill();
                }
              }
            }
          }
        }

        // Connect particles to mouse / touch
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p1.x - mouse.x;
          const mdy = p1.y - mouse.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mDist < maxDist * 1.2) {
            const mAlpha = (1 - mDist / (maxDist * 1.2)) * 0.32;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${mAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.stroke();
          }
        }

        p1.update();
        p1.draw();
      }

      requestAnimationFrame(renderPlexus);
    }
    renderPlexus();
  }

  // =========================================================================
  // 3. DYNAMIC TYPEWRITER EFFECT
  // =========================================================================
  const typedText = document.getElementById('typed-text');
  const roles = [
    'Software Developer',
    'C++ & Linux Systems Developer',
    'DSA & Systems Specialist',
    'Arch Linux & Hyprland Builder',
    'Full-Stack & AI Engineer'
  ];

  let rIdx = 0;
  let cIdx = 0;
  let deleting = false;
  let speed = 90;

  function runTypewriter() {
    if (!typedText) return;
    const current = roles[rIdx];

    if (deleting) {
      typedText.textContent = current.substring(0, cIdx - 1);
      cIdx--;
      speed = 45;
    } else {
      typedText.textContent = current.substring(0, cIdx + 1);
      cIdx++;
      speed = 90;
    }

    if (!deleting && cIdx === current.length) {
      speed = 2200;
      deleting = true;
    } else if (deleting && cIdx === 0) {
      deleting = false;
      rIdx = (rIdx + 1) % roles.length;
      speed = 400;
    }

    setTimeout(runTypewriter, speed);
  }
  runTypewriter();

  // =========================================================================
  // 4. SCROLLSPY & SMOOTH MAGNETIC PILL INDICATOR (RAF THROTTLED)
  // =========================================================================
  const navTrack = document.getElementById('nav-pill-track');
  const navActivePill = document.getElementById('nav-active-pill');
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('section[id]');
  let currentActiveNav = null;
  let ticking = false;

  function moveIndicator(targetItem) {
    if (!navActivePill || !targetItem || !navTrack) return;
    if (window.innerWidth <= 832) return; // Hidden on mobile nav switch

    const trackRect = navTrack.getBoundingClientRect();
    const itemRect = targetItem.getBoundingClientRect();

    if (itemRect.width === 0) return;

    const left = itemRect.left - trackRect.left;
    const width = itemRect.width;

    navActivePill.style.width = `${width}px`;
    navActivePill.style.transform = `translateX(${left}px)`;
    navActivePill.style.opacity = '1';
  }

  function getActiveSection() {
    let currentId = 'home';
    const scrollPos = window.scrollY + 160;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });
    return currentId;
  }

  function updateNav() {
    const activeId = getActiveSection();

    navItems.forEach((item) => {
      if (item.getAttribute('data-nav') === activeId) {
        item.classList.add('active');
        currentActiveNav = item;
      } else {
        item.classList.remove('active');
      }
    });

    if (currentActiveNav) {
      moveIndicator(currentActiveNav);
    }
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateNav);
      ticking = true;
    }
  }

  // Smooth hover preview on pill track
  navItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      moveIndicator(item);
    });
  });

  if (navTrack) {
    navTrack.addEventListener('mouseleave', () => {
      if (currentActiveNav) {
        moveIndicator(currentActiveNav);
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  setTimeout(onScroll, 50);
  window.addEventListener('load', onScroll);

  // =========================================================================
  // 5. ANIMATED STATS COUNTER
  // =========================================================================
  const statNumbers = document.querySelectorAll('.stat-num');
  let animatedStats = false;

  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const statObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedStats) {
          animatedStats = true;
          statNumbers.forEach((el) => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            let cur = 0;
            const step = Math.max(1, Math.floor(target / 40));
            const timer = setInterval(() => {
              cur += step;
              if (cur >= target) {
                el.textContent = target;
                clearInterval(timer);
              } else {
                el.textContent = cur;
              }
            }, 30);
          });
        }
      },
      { threshold: 0.2 }
    );
    statObserver.observe(aboutSection);
  }

  // =========================================================================
  // 6. INTERACTIVE DEVELOPER CLI TERMINAL
  // =========================================================================
  const termInput = document.getElementById('terminal-input');
  const termHistory = document.getElementById('terminal-history');
  const termScreen = document.getElementById('terminal-screen');

  if (termInput && termHistory) {
    const historyStack = [];
    let historyIdx = -1;

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function createPromptPillHtml(execTime = '0s') {
      return `
        <div class="term-prompt-header">
          <span class="term-pill pill-timer">
            <svg class="pill-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"></circle><polyline points="12 6.5 12 12 15 14"></polyline></svg>
            <span class="pill-text">${execTime}</span>
          </span>
          <span class="term-pill pill-dir">
            <svg class="pill-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>
            <span class="pill-arrow">→</span>
            <svg class="pill-icon" viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </span>
        </div>
      `;
    }

    const termCommands = {
      help: () => `
<span class="code-sub">Commands Available:</span>
  <span class="highlight-crimson">about</span>      - Personal summary & background
  <span class="highlight-crimson">skills</span>     - Technical competencies & stack
  <span class="highlight-crimson">projects</span>   - Featured GitHub repositories & links
  <span class="highlight-crimson">contact</span>    - Direct email & social handles
  <span class="highlight-crimson">github</span>     - Open GitHub profile
  <span class="highlight-crimson">clear</span>      - Clear terminal screen
`,
      about: () => `
<span class="code-sub">Hritabrata Bardhan (FzAlpha)</span>
• Computer Science Engineering Student
• Low-level systems programming in C++ / POSIX
• Operating system internals & custom Linux terminal shells
• 200+ LeetCode & algorithmic challenges solved
`,
      skills: () => `
<span class="code-sub">Languages:</span> C++, C, Python, Java, Bash, Lua, JavaScript, HTML/CSS
<span class="code-sub">Environment:</span> Arch Linux, EndeavourOS, Hyprland, Docker, Git, Neovim, CMake
`,
      projects: () => `
1. <a href="https://github.com/FzAlpha/log-Manager" target="_blank" class="highlight-crimson">log-Manager</a> - C++ telemetry & DSA tracker
2. <a href="https://github.com/FzAlpha/custom-linux-shell" target="_blank" class="highlight-crimson">custom-linux-shell</a> - Custom Linux terminal with process piping & syscalls
3. <a href="https://github.com/FzAlpha/algo-vault" target="_blank" class="highlight-crimson">algo-vault</a> - 200+ optimal DSA solutions
4. <a href="https://github.com/FzAlpha" target="_blank" class="highlight-crimson">Multi-Agent AI Platform</a> - Parallel task automation
`,
      contact: () => `
Email: <a href="mailto:hritabratabardhan13579@gmail.com" class="highlight-crimson">hritabratabardhan13579@gmail.com</a>
LinkedIn: <a href="https://www.linkedin.com/in/hritabrata-bardhan-12b498365/" target="_blank" class="highlight-crimson">Hritabrata Bardhan</a>
GitHub: <a href="https://github.com/FzAlpha" target="_blank" class="highlight-crimson">github.com/FzAlpha</a>
Discord: <span class="highlight-crimson">fz_alpha_1</span>
`,
      github: () => {
        window.open('https://github.com/FzAlpha', '_blank');
        return '<span class="code-sub">Opened GitHub profile in new tab.</span>';
      },
      clear: () => {
        termHistory.innerHTML = '';
        return null;
      }
    };

    if (termScreen) {
      termScreen.addEventListener('click', () => {
        termInput.focus();
      });
    }

    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const raw = termInput.value.trim();
        const cmd = raw.toLowerCase();
        termInput.value = '';

        if (!raw) return;

        historyStack.push(raw);
        historyIdx = historyStack.length;

        const row = document.createElement('div');
        row.className = 'term-row';

        let res = '';
        if (termCommands[cmd]) {
          const out = termCommands[cmd]();
          if (out === null) return;
          res = out;
        } else {
          res = `<div>Command not found: '${escapeHtml(raw)}'. Type <span class="highlight-crimson">help</span> to view commands.</div>`;
        }

        row.innerHTML = `
          ${createPromptPillHtml('0s')}
          <div class="term-prompt-line">
            <span class="term-arrow-symbols"><span class="term-sym-dot">●</span> <span class="term-sym-arrow">▶</span></span>
            <span class="term-echo">${escapeHtml(raw)}</span>
          </div>
          <div class="term-output">${res}</div>
        `;

        termHistory.appendChild(row);
        if (termScreen) {
          termScreen.scrollTop = termScreen.scrollHeight;
        }
      } else if (e.key === 'ArrowUp') {
        if (historyStack.length > 0 && historyIdx > 0) {
          historyIdx--;
          termInput.value = historyStack[historyIdx];
          setTimeout(() => {
            termInput.selectionStart = termInput.selectionEnd = termInput.value.length;
          }, 0);
        }
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        if (historyStack.length > 0 && historyIdx < historyStack.length - 1) {
          historyIdx++;
          termInput.value = historyStack[historyIdx];
        } else {
          historyIdx = historyStack.length;
          termInput.value = '';
        }
        e.preventDefault();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        const current = termInput.value.trim().toLowerCase();
        if (current) {
          const validCmds = Object.keys(termCommands);
          const match = validCmds.find(c => c.startsWith(current));
          if (match) {
            termInput.value = match;
          }
        }
      }
    });
  }

  // =========================================================================
  // 7. TOAST NOTIFICATIONS & COPY CLIPS
  // =========================================================================
  const toastBox = document.getElementById('toast-box');
  function showToast(msg) {
    if (!toastBox) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    toastBox.appendChild(t);

    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(1rem)';
      t.style.transition = 'all 0.3s ease';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  const copyBtns = document.querySelectorAll('.copy-btn');
  copyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-copy');
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          setTimeout(() => (btn.textContent = originalText), 2000);
          showToast(`Copied "${val}" to clipboard!`);
        });
      }
    });
  });

  // =========================================================================
  // 8. CONTACT FORM SUBMISSION
  // =========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('c-name').value.trim();
      const email = document.getElementById('c-email').value.trim();
      const msg = document.getElementById('c-msg').value.trim();

      if (!name || !email || !msg) {
        showToast('Please complete all required fields.');
        return;
      }

      showToast(`Thanks ${name}! Preparing email message...`);
      const mailto = `mailto:hritabratabardhan13579@gmail.com?subject=Project Inquiry from ${encodeURIComponent(
        name
      )}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${msg}`)}`;
      window.location.href = mailto;
      contactForm.reset();
    });
  }

  // =========================================================================
  // 9. RESUME MODAL CONTROLLER (WITH MOBILE SCROLL LOCK)
  // =========================================================================
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtns = [
    document.getElementById('open-resume-btn'),
    document.getElementById('hero-resume-trigger'),
    document.getElementById('drawer-resume-btn')
  ];
  const closeResumeBtn = document.getElementById('modal-close-btn');
  const printCvBtn = document.getElementById('print-cv-btn');

  function openCV() {
    if (resumeModal) {
      resumeModal.classList.add('open');
      document.body.classList.add('scroll-locked');
    }
  }

  function closeCV() {
    if (resumeModal) {
      resumeModal.classList.remove('open');
      if (!mobileDrawer || !mobileDrawer.classList.contains('open')) {
        document.body.classList.remove('scroll-locked');
      }
    }
  }

  openResumeBtns.forEach((b) => {
    if (b) b.addEventListener('click', openCV);
  });

  if (closeResumeBtn) closeResumeBtn.addEventListener('click', closeCV);
  if (resumeModal) {
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) closeCV();
    });
  }

  if (printCvBtn) {
    printCvBtn.addEventListener('click', () => window.print());
  }

  // =========================================================================
  // 10. MOBILE DRAWER NAVIGATION (WITH MOBILE SCROLL LOCK)
  // =========================================================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('drawer-close');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('open');
    if (drawerOverlay) drawerOverlay.classList.add('active');
    document.body.classList.add('scroll-locked');
  }

  function closeDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('open');
    if (drawerOverlay) drawerOverlay.classList.remove('active');
    if (!resumeModal || !resumeModal.classList.contains('open')) {
      document.body.classList.remove('scroll-locked');
    }
  }

  if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);
  drawerLinks.forEach((l) => l.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCV();
      closeDrawer();
    }
  });

  // =========================================================================
  // 11. SCROLL PROGRESS BAR (RAF THROTTLED)
  // =========================================================================
  const scrollProgress = document.getElementById('scroll-progress');
  if (scrollProgress) {
    let progressTicking = false;

    function updateProgress() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      scrollProgress.style.transform = `scaleX(${ratio})`;
      progressTicking = false;
    }

    window.addEventListener('scroll', () => {
      if (!progressTicking) {
        requestAnimationFrame(updateProgress);
        progressTicking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  // =========================================================================
  // 12. SCROLL REVEAL ANIMATIONS (added here so no-JS users see all content)
  // =========================================================================
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll(
    '.section-title-wrap, .about-card, .skills-cat-card, .project-card, ' +
    '.terminal-container, .contact-details-card, .contact-form-card'
  );

  if (revealTargets.length && 'IntersectionObserver' in window && !prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Stagger siblings sharing the same parent grid for a cascade effect
            const siblings = Array.from(entry.target.parentElement.children)
              .filter((c) => c.classList.contains('reveal'));
            const idx = siblings.indexOf(entry.target);
            entry.target.style.setProperty('--reveal-delay', `${Math.min(idx, 4) * 0.08}s`);
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  // =========================================================================
  // 13. CURSOR-FOLLOW SPOTLIGHT ON GLASS CARDS (fine pointers only)
  // =========================================================================
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer) {
    const spotlightCards = document.querySelectorAll(
      '.about-card, .skills-cat-card, .project-card, .contact-details-card, .contact-form-card'
    );
    spotlightCards.forEach((card) => {
      card.classList.add('card-spotlight');
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', `${x}%`);
        card.style.setProperty('--my', `${y}%`);
      });
    });
  }

  // =========================================================================
  // 14. DEPTH SCROLL ENGINE ("GO INWARDS" — sections recede into 3D space)
  //     JS-driven so it works in every browser (no scroll-timeline needed).
  //     Each section's content plane dives toward a shared vanishing point
  //     as it enters/leaves the viewport, resting crisp while being read.
  // =========================================================================
  if (!prefersReducedMotion) {
    const depthTargets = Array.from(document.querySelectorAll('main > section > .container'));

    if (depthTargets.length) {
      depthTargets.forEach((el) => el.classList.add('depth-layer'));

      const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
      let depthTicking = false;

      function applyDepth() {
        const vh = window.innerHeight || document.documentElement.clientHeight;
        const zone = vh * 0.6; // length of the enter / exit transition band

        for (let i = 0; i < depthTargets.length; i++) {
          const el = depthTargets[i];
          const rect = el.getBoundingClientRect();

          // Skip elements that are nowhere near the viewport (cheap early-out)
          if (rect.bottom < -vh || rect.top > vh * 2) continue;

          // "presence" = how settled the plane is (1 = resting, 0 = far away)
          const enter = (vh - rect.top) / zone;    // grows as the top scrolls up
          const exit = rect.bottom / zone;          // shrinks as the bottom leaves
          const presence = clamp(Math.min(enter, exit), 0, 1);
          const depth = 1 - presence;               // 0 near center, 1 far

          if (depth < 0.001) {
            el.style.transform = 'none';
            el.style.opacity = '1';
            continue;
          }

          // Direction: content above the viewport centre rises as it recedes,
          // content below sinks slightly — reinforcing the dive.
          const center = rect.top + rect.height / 2;
          const dir = center < vh / 2 ? -1 : 1;

          const scale = 1 - depth * 0.09;           // 1 -> 0.91
          const tz = -depth * 180;                  // 0 -> -180px (inward)
          const ty = dir * depth * 18;              // gentle vertical drift
          const opacity = 1 - depth * 0.6;          // 1 -> 0.4

          el.style.transform =
            `perspective(1500px) translate3d(0, ${ty.toFixed(1)}px, ${tz.toFixed(1)}px) scale(${scale.toFixed(4)})`;
          el.style.opacity = opacity.toFixed(3);
        }
        depthTicking = false;
      }

      function onDepthScroll() {
        if (!depthTicking) {
          requestAnimationFrame(applyDepth);
          depthTicking = true;
        }
      }

      window.addEventListener('scroll', onDepthScroll, { passive: true });
      window.addEventListener('resize', onDepthScroll);
      window.addEventListener('load', onDepthScroll);
      applyDepth();
    }
  }
});
