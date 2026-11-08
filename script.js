(() => {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------------
     Mobile nav toggle
     --------------------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  function closeMenu(){
    navToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function openMenu(){
    navToggle.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  /* ---------------------------------------------------------------------
     Placeholder links (href="#") shouldn't smooth-scroll to the top —
     they're stand-ins until a real URL is added.
     --------------------------------------------------------------------- */
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', (e) => e.preventDefault());
  });

  /* ---------------------------------------------------------------------
     Scroll spy — highlight the current section in the nav
     --------------------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[data-nav]');

  if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
    const map = new Map();
    navAnchors.forEach(a => map.set(a.getAttribute('href').slice(1), a));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  /* ---------------------------------------------------------------------
     Scroll progress bar + back-to-top button
     --------------------------------------------------------------------- */
  const progress = document.getElementById('nav-progress');
  const toTop = document.getElementById('to-top');
  let ticking = false;

  function onScroll(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (toTop) toTop.classList.toggle('is-visible', scrollTop > 600);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  /* ---------------------------------------------------------------------
     Copy email to clipboard
     --------------------------------------------------------------------- */
  const copyBtn = document.getElementById('copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const value = copyBtn.getAttribute('data-copy') || '';
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(value);
        } else {
          const ta = document.createElement('textarea');
          ta.value = value;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        const label = copyBtn.querySelector('.copy-btn__label');
        const original = label.textContent;
        label.textContent = 'Copié !';
        copyBtn.classList.add('is-copied');
        setTimeout(() => {
          label.textContent = original;
          copyBtn.classList.remove('is-copied');
        }, 1800);
      } catch (err) {
        /* Clipboard unavailable — the email remains a normal mailto link. */
      }
    });
  }


  /* ---------------------------------------------------------------------
     Reveal on scroll — cards fade in as they enter the viewport
     --------------------------------------------------------------------- */
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.section-title, .skill-panel, .hop, .project-card, .cert-badge, .feed-item, .about-panel');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
      io.observe(el);
    });
  }


  /* ---------------------------------------------------------------------
     Certification viewer — opens each attestation in a modal,
     falls back to the PDF itself if <dialog> is unsupported
     --------------------------------------------------------------------- */
  const viewer = document.getElementById('cert-viewer');
  if (viewer && typeof viewer.showModal === 'function') {
    const vTitle = document.getElementById('cert-viewer-title');
    const vBody = document.getElementById('cert-viewer-body');
    const vDl = document.getElementById('cert-viewer-dl');
    const vClose = document.getElementById('cert-viewer-close');

    document.querySelectorAll('[data-cert-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const title = link.dataset.certTitle;
        const pages = link.dataset.certPages.split(',');
        vTitle.textContent = title;
        vDl.href = link.getAttribute('href');
        vBody.innerHTML = '';
        pages.forEach((src, i) => {
          const img = document.createElement('img');
          img.src = src;
          img.alt = pages.length > 1
            ? `${title} — attestation, page ${i + 1} sur ${pages.length}`
            : `${title} — attestation`;
          img.decoding = 'async';
          img.addEventListener('load', () => {
            if (img.naturalHeight > img.naturalWidth) img.classList.add('is-portrait');
          });
          vBody.appendChild(img);
          if (pages.length > 1) {
            const n = document.createElement('p');
            n.className = 'cert-viewer__page';
            n.textContent = `${i + 1} / ${pages.length}`;
            vBody.appendChild(n);
          }
        });
        vBody.scrollTop = 0;
        document.documentElement.classList.add('has-modal');
        viewer.showModal();
      });
    });

    vClose.addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', (e) => { if (e.target === viewer) viewer.close(); });
    viewer.addEventListener('close', () => document.documentElement.classList.remove('has-modal'));
  }

  /* ---------------------------------------------------------------------
     Hero terminal — simulated typing
     --------------------------------------------------------------------- */
  function initTerminal(){
    const el = document.getElementById('terminal-body');
    if (!el) return;

    const script = [
      { cmd: 'whoami', out: 'Liam Ramirez — étudiant BTS SIO SISR, 2e année' },
      { cmd: 'cat objectif.txt', out: 'Recherche une alternance Bac+3\nsystèmes, réseaux & cybersécurité\ndès septembre 2027.' },
      { cmd: 'cat localisation.txt', out: 'Saône (25), France' }
    ];

    function promptSpan(){
      const s = document.createElement('span');
      s.className = 'p';
      s.textContent = 'liam@infra:~$ ';
      return s;
    }
    function outSpan(text){
      const s = document.createElement('span');
      s.className = 'o';
      s.textContent = text;
      return s;
    }
    function finish(){
      el.appendChild(promptSpan());
      const cursor = document.createElement('span');
      cursor.className = 'terminal__cursor';
      el.appendChild(cursor);
    }

    if (prefersReduced) {
      script.forEach(line => {
        el.appendChild(promptSpan());
        el.appendChild(document.createTextNode(line.cmd + '\n'));
        el.appendChild(outSpan(line.out));
        el.appendChild(document.createTextNode('\n\n'));
      });
      finish();
      return;
    }

    let li = 0;

    function typeCmd(text, cb){
      let ci = 0;
      const node = document.createTextNode('');
      el.appendChild(node);
      const timer = setInterval(() => {
        node.textContent += text[ci];
        ci++;
        if (ci >= text.length) {
          clearInterval(timer);
          setTimeout(cb, 260);
        }
      }, 34);
    }

    function step(){
      if (li >= script.length) { setTimeout(finish, 300); return; }
      const line = script[li++];
      el.appendChild(promptSpan());
      typeCmd(line.cmd, () => {
        el.appendChild(document.createTextNode('\n'));
        el.appendChild(outSpan(line.out));
        el.appendChild(document.createTextNode('\n\n'));
        setTimeout(step, 480);
      });
    }
    step();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTerminal);
  } else {
    initTerminal();
  }
})();
