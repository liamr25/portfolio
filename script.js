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
     Hero terminal — simulated typing
     --------------------------------------------------------------------- */
  function initTerminal(){
    const el = document.getElementById('terminal-body');
    if (!el) return;

    const script = [
      { cmd: 'whoami', out: 'Liam Ramirez — étudiant BTS SIO SISR, 2e année' },
      { cmd: 'cat objectif.txt', out: 'Recherche une alternance ou un stage\nen infrastructure & réseaux.' },
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
