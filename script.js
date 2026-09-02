/* ===================================================
   VIGHNESH MHATRE PORTFOLIO — script.js
   Neural canvas · Custom cursor · Interactive terminal
   Scroll animations · Email copy · Active nav
   =================================================== */

'use strict';

// ─── Custom Cursor ────────────────────────────────
const cursor = document.getElementById('cursor');
const trail  = document.getElementById('cursorTrail');

let mouseX = 0, mouseY = 0;
let trailX = 0, trailY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (cursor) {
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  }
});

function animateTrail() {
  if (trail) {
    trailX += (mouseX - trailX) * 0.1;
    trailY += (mouseY - trailY) * 0.1;
    trail.style.left = trailX + 'px';
    trail.style.top  = trailY + 'px';
  }
  requestAnimationFrame(animateTrail);
}
animateTrail();

function addHoverCursor(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hover'));
  });
}
addHoverCursor('a, button, .project-card, .skill-tag, .terminal-input');


// ─── Navbar scroll state ──────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });


// ─── Mobile menu ─────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });
}


// ─── Scroll-triggered fade-up ─────────────────────
const fadeTargets = document.querySelectorAll(
  '.project-card, .timeline-item, .about-grid, .contact-item, #copyEmailBtn, .section-title'
);
fadeTargets.forEach(el => el.classList.add('fade-up'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.children];
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = (idx * 0.08) + 's';
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

fadeTargets.forEach(el => observer.observe(el));


// ─── Neural Network Canvas ────────────────────────
(function initNeural() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes;
  const mouse = { x: null, y: null };
  const NODE_COUNT = 60, MAX_DIST = 170, CYAN = '0, 245, 212', AMBER = '245, 166, 35';

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', () => { resize(); spawnNodes(); });

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function spawnNodes() {
    nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.25, 0.25), vy: rand(-0.25, 0.25),
      r: rand(2.5, 4),
      hue: Math.random() > 0.85 ? AMBER : CYAN,
    }));
  }
  spawnNodes();

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -50) n.x = W + 50;
      if (n.x > W + 50) n.x = -50;
      if (n.y < -50) n.y = H + 50;
      if (n.y > H + 50) n.y = -50;
      if (mouse.x !== null) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 100) { const f = (100 - d) / 100 * 0.4; n.x += dx / d * f; n.y += dy / d * f; }
      }
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${CYAN}, ${(1 - d / MAX_DIST) * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.hue}, 0.75)`; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${n.hue}, 0.06)`; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


// ─── Interactive Terminal ─────────────────────────
(function initTerminal() {
  const body  = document.getElementById('terminalBody');
  const input = document.getElementById('terminalInput');
  if (!body || !input) return;

  const EMAIL = 'vighneshmhatre00@gmail.com';
  const history = [];
  let histIdx = -1;

  const COMMANDS = {
    help: () => [
      '<span class="t-success">Available commands:</span>',
      '&nbsp;&nbsp;<span class="t-hint">whoami</span>        — who is Vighnesh?',
      '&nbsp;&nbsp;<span class="t-hint">projects</span>      — list all analytics projects',
      '&nbsp;&nbsp;<span class="t-hint">experience</span>    — work history',
      '&nbsp;&nbsp;<span class="t-hint">education</span>     — academic background',
      '&nbsp;&nbsp;<span class="t-hint">contact</span>       — get in touch',
      '&nbsp;&nbsp;<span class="t-hint">github</span>        — open GitHub profile',
      '&nbsp;&nbsp;<span class="t-hint">linkedin</span>      — open LinkedIn profile',
      '&nbsp;&nbsp;<span class="t-hint">clear</span>         — clear terminal',
    ],
    whoami: () => [
      '<span class="t-success">Vighnesh Mhatre</span>',
      'Data Analyst Apprentice @ Electrolab',
      'Passionate about SQL &middot; Python &middot; Power BI &middot; Data Visualization',
      'M.Sc. Data Science &mdash; B. N. Bandodkar College, Mumbai Univ (CGPA: 8.57)',
    ],
    projects: () => [
      '<span class="t-success">Projects:</span>',
      '&nbsp;&nbsp;01. <span class="t-hint">Supply Chain Dashboard</span>    &mdash; Power BI, SQL, DAX ($301K profit opt.)',
      '&nbsp;&nbsp;02. <span class="t-hint">Insurance Analytics</span>       &mdash; Interactive coverage &amp; claims dashboard',
      '&nbsp;&nbsp;03. <span class="t-hint">Loan Default Classifier</span>   &mdash; Random Forest model &amp; Streamlit app',
      '&nbsp;&nbsp;04. <span class="t-hint">CricGenAI Agent</span>           &mdash; NL-to-SQL AI agent (M.Sc. Research)',
    ],
    experience: () => [
      '<span class="t-success">Work Experience:</span>',
      '&nbsp;&nbsp;<span class="t-hint">Aug 2026 &ndash; Present</span>  Data Analyst Apprentice, Electrolab',
      '&nbsp;&nbsp;&nbsp;&nbsp;&rarr; Reconciled 34,839 ERPNext records at 100% match accuracy',
      '&nbsp;&nbsp;&nbsp;&nbsp;&rarr; Built a 6-part export pipeline for 11,732 pharma records',
      '',
      '&nbsp;&nbsp;<span class="t-hint">Mar 2026 &ndash; Jun 2026</span>  Business Analyst Intern, Anvex AI',
      '&nbsp;&nbsp;&nbsp;&nbsp;&rarr; Automated reporting workflow (120 &rarr; 15 min, 87.5% gain)',
      '&nbsp;&nbsp;&nbsp;&nbsp;&rarr; Audited 8,000+ ANPR/Vision AI records (18.5% discrepancy rate)',
      '',
      '&nbsp;&nbsp;<span class="t-hint">Jul 2025 &ndash; Dec 2025</span>  Machine Learning Intern, YBI Foundation',
      '&nbsp;&nbsp;&nbsp;&nbsp;&rarr; Built classification/regression pipelines at 90&ndash;92% accuracy',
    ],
    education: () => [
      '<span class="t-success">Education:</span>',
      '&nbsp;&nbsp;<span class="t-hint">M.Sc. Data Science</span>',
      '&nbsp;&nbsp;B. N. Bandodkar College, Mumbai Univ | CGPA: 8.57 | 2024 &ndash; 2026',
      '',
      '&nbsp;&nbsp;<span class="t-hint">B.Sc. Information Technology</span>',
      '&nbsp;&nbsp;SIES College, Mumbai Univ | CGPA: 8.72 | 2021 &ndash; 2024',
    ],
    contact: () => [
      '<span class="t-success">Contact:</span>',
      `&nbsp;&nbsp;<span class="t-hint">Email</span>     ${EMAIL}`,
      '&nbsp;&nbsp;<span class="t-hint">LinkedIn</span>  linkedin.com/in/vighnesh-anant-mhatre',
      '&nbsp;&nbsp;<span class="t-hint">GitHub</span>    github.com/Vighnesh1045',
    ],
    github: () => {
      setTimeout(() => window.open('https://github.com/Vighnesh1045', '_blank'), 300);
      return ['<span class="t-success">&rarr; Opening GitHub profile...</span>'];
    },
    linkedin: () => {
      setTimeout(() => window.open('https://www.linkedin.com/in/vighnesh-anant-mhatre/', '_blank'), 300);
      return ['<span class="t-success">&rarr; Opening LinkedIn profile...</span>'];
    },
    clear: () => '__CLEAR__',
  };

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function appendLine(html) {
    const div = document.createElement('div');
    div.className = 't-line';
    div.innerHTML = html;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    appendLine(`<span class="t-prompt">$</span>&nbsp;<span class="t-cmd">${escapeHtml(raw)}</span>`);
    if (cmd in COMMANDS) {
      const result = COMMANDS[cmd]();
      if (result === '__CLEAR__') { body.innerHTML = ''; return; }
      result.forEach(line => appendLine(line));
    } else {
      appendLine(`<span class="t-error">command not found: <em>${escapeHtml(cmd)}</em> &mdash; type <span class="t-hint">help</span></span>`);
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      if (val.trim()) history.unshift(val);
      histIdx = -1;
      input.value = '';
      runCommand(val);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx]; }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx]; }
      else { histIdx = -1; input.value = ''; }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.value.trim().toLowerCase();
      const match = Object.keys(COMMANDS).find(c => c.startsWith(partial));
      if (match) input.value = match;
    }
  });

  const termEl = document.getElementById('interactiveTerminal');
  if (termEl) termEl.addEventListener('click', () => input.focus());
})();


// ─── Email Copy ───────────────────────────────────
(function initEmailCopy() {
  const btn   = document.getElementById('copyEmailBtn');
  const badge = document.getElementById('copyBadge');
  if (!btn || !badge) return;

  btn.addEventListener('click', async () => {
    const email = 'vighneshmhatre00@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const ta = Object.assign(document.createElement('textarea'), {
        value: email,
        style: 'position:fixed;opacity:0'
      });
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    badge.classList.add('show');
    setTimeout(() => badge.classList.remove('show'), 2200);
  });
})();


// ─── Active nav link on scroll ────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 160) current = sec.id;
  });
  navAnchors.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--cyan)' : '';
  });
}, { passive: true });