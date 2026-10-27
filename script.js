/* =====================================================================
   IFsaudavel 4.0 — interações compartilhadas por todas as páginas
   Cada módulo só roda se os elementos dele existirem na página.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------- utilitários ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const root = document.documentElement;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* modo privado */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };
  const reduceMotion = () =>
    root.dataset.motion === 'reduce' || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* toast */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
  }

  /* confete */
  function confetti() {
    const c = $('#confetti');
    if (!c || reduceMotion()) return;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const colors = ['#77d89a', '#1f7a4d', '#f2c66d', '#4aa3df', '#e5736a', '#ffffff'];
    const parts = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 160, y: innerHeight * .55,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 5,
      s: Math.random() * 7 + 4, r: Math.random() * 6, vr: (Math.random() - .5) * .4,
      c: colors[(Math.random() * colors.length) | 0]
    }));
    const start = performance.now();
    (function frame(now) {
      const t = now - start;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach((p) => {
        p.vy += .42; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vx *= .99;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
        ctx.globalAlpha = Math.max(0, 1 - t / 2600);
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); ctx.restore();
      });
      if (t < 2600) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(start);
  }
  window.IFS = { toast, confetti, store };

  /* ---------- acessibilidade e tema ---------- */
  (function a11y() {
    const themeBtn = $('#themeBtn');
    const panel = $('#a11yPanel');
    const btn = $('#a11yBtn');
    const fsOf = () => parseInt(root.dataset.fs || '1', 10);
    const themeOf = () => root.dataset.theme || 'light';

    function syncUI() {
      const th = themeOf();
      if (themeBtn) themeBtn.textContent = th === 'dark' ? '☀️' : '🌙';
      $$('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === th)));
      const m = $('#motionToggle');
      if (m) m.checked = root.dataset.motion === 'reduce';
      const fs = fsOf();
      const minus = $('#fontMinus'), plus = $('#fontPlus');
      if (minus) minus.disabled = fs <= 0;
      if (plus) plus.disabled = fs >= 3;
      const meta = $('meta[name="theme-color"]');
      if (meta) meta.content = th === 'dark' ? '#0b1510' : '#123d2a';
    }
    function setTheme(t) { root.dataset.theme = t; store.set('ifs-theme', t); syncUI(); }
    function setFs(n) {
      n = Math.max(0, Math.min(3, n));
      if (n === 1) { delete root.dataset.fs; store.del('ifs-fs'); } else { root.dataset.fs = String(n); store.set('ifs-fs', String(n)); }
      syncUI();
    }

    if (themeBtn) themeBtn.addEventListener('click', () => setTheme(themeOf() === 'dark' ? 'light' : 'dark'));
    $$('[data-theme-set]').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.themeSet)));
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('fontMinus', () => setFs(fsOf() - 1));
    on('fontPlus', () => setFs(fsOf() + 1));
    on('fontReset', () => setFs(1));
    const motion = $('#motionToggle');
    if (motion) motion.addEventListener('change', () => {
      if (motion.checked) { root.dataset.motion = 'reduce'; store.set('ifs-motion', 'reduce'); }
      else { delete root.dataset.motion; store.del('ifs-motion'); }
    });
    on('a11yResetAll', () => {
      delete root.dataset.fs; delete root.dataset.motion; delete root.dataset.theme;
      ['ifs-fs', 'ifs-motion', 'ifs-theme'].forEach(store.del);
      syncUI(); toast('Preferências restauradas');
    });

    function setPanel(open) {
      if (!panel || !btn) return;
      panel.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) { const f = $('button', panel); }
    }
    if (btn) btn.addEventListener('click', (e) => { e.stopPropagation(); setPanel(!panel.classList.contains('open')); });
    on('a11yClose', () => { setPanel(false); btn.focus(); });
    document.addEventListener('click', (e) => {
      if (panel && panel.classList.contains('open') && !panel.contains(e.target) && e.target !== btn) setPanel(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && panel.classList.contains('open')) { setPanel(false); btn && btn.focus(); }
    });
    syncUI();
  })();

  /* ---------- menu mobile e dropdown ---------- */
  (function menus() {
    const mBtn = $('#menuBtn'), mMenu = $('#mobileMenu');
    function setMobile(open) {
      if (!mBtn || !mMenu) return;
      mMenu.classList.toggle('open', open);
      mBtn.setAttribute('aria-expanded', String(open));
      mBtn.textContent = open ? '✕' : '☰';
      mBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    if (mBtn) {
      mBtn.addEventListener('click', (e) => { e.stopPropagation(); setMobile(!mMenu.classList.contains('open')); });
      $$('a', mMenu).forEach((a) => a.addEventListener('click', () => setMobile(false)));
      document.addEventListener('click', (e) => { if (mMenu.classList.contains('open') && !mMenu.contains(e.target)) setMobile(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMobile(false); });
      window.addEventListener('resize', () => { if (innerWidth > 980) setMobile(false); });
    }
    const dBtn = $('.drop-btn'), dMenu = $('#dropTemas');
    function setDrop(open) {
      if (!dBtn || !dMenu) return;
      dMenu.classList.toggle('open', open);
      dBtn.setAttribute('aria-expanded', String(open));
    }
    if (dBtn) {
      dBtn.addEventListener('click', (e) => { e.stopPropagation(); setDrop(!dMenu.classList.contains('open')); });
      $$('a', dMenu).forEach((a) => a.addEventListener('click', () => setDrop(false)));
      document.addEventListener('click', (e) => { if (!dMenu.contains(e.target)) setDrop(false); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setDrop(false); } });
    }
  })();

  /* ---------- rolagem: cabeçalho, progresso, topo, scrollspy ---------- */
  (function scrolling() {
    const header = $('.header'), bar = $('#readingProgress'), top = $('#backToTop');
    let ticking = false;
    function update() {
      const y = window.scrollY;
      if (header) header.classList.toggle('scrolled', y > 8);
      if (bar) {
        const max = root.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
      }
      if (top) top.classList.toggle('show', y > 520);
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
    if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }));

    // scrollspy (apenas onde há âncoras da própria página)
    const links = $$('.header a[href^="#"], .mobile-quick-nav a[href^="#"]');
    const ids = [...new Set(links.map((a) => a.getAttribute('href').slice(1)))];
    const secs = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!secs.length || !('IntersectionObserver' in window)) return;
    const topics = ['alimentacao', 'hidratacao', 'sono', 'movimento', 'bem-estar'];
    const dropBtn = $('.drop-btn');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        links.forEach((a) => {
          if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
        if (dropBtn) { if (topics.includes(id)) dropBtn.setAttribute('aria-current', 'true'); else dropBtn.removeAttribute('aria-current'); }
      });
    }, { rootMargin: '-35% 0px -55% 0px' });
    secs.forEach((s) => io.observe(s));
  })();

  /* ---------- revelar ao rolar + contadores ---------- */
  (function reveal() {
    const items = $$('.reveal, .reveal-scale, .stagger');
    const show = (el) => el.classList.add('visible');
    if (!('IntersectionObserver' in window)) { items.forEach(show); }
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -40px 0px' });
      items.forEach((el) => io.observe(el));
      // segurança: nada fica invisível se o observer falhar
      setTimeout(() => items.forEach(show), 4000);
    }
    const nums = $$('[data-count]');
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0, dur = 900, t0 = performance.now();
      (function step(now) {
        const p = Math.min((now - t0) / dur, 1);
        el.textContent = Math.round(p * target);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    if (!('IntersectionObserver' in window)) nums.forEach((n) => { n.textContent = n.dataset.count; });
    else {
      const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { run(e.target); io2.unobserve(e.target); } }), { threshold: .5 });
      nums.forEach((n) => io2.observe(n));
    }
  })();

  /* ---------- estado do dia (salvo só no navegador) ---------- */
  const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
  const DAY_KEY = 'ifs-day';
  function loadDay() {
    let s = null;
    try { s = JSON.parse(store.get(DAY_KEY, 'null')); } catch (e) { s = null; }
    if (!s || s.date !== todayKey()) s = { date: todayKey(), checks: [], water: 0, goal: (s && s.goal) || 8, minutes: 0 };
    return s;
  }
  let day = loadDay();
  function saveDay() { store.set(DAY_KEY, JSON.stringify(day)); document.dispatchEvent(new Event('ifs:day')); }

  /* resumo "Meu dia hoje" no hero */
  (function heroSummary() {
    const fg = $('#dayRingFg');
    if (!fg) return;
    function render() {
      const habits = day.checks.filter(Boolean).length;
      const pH = habits / 5, pW = Math.min(day.water / day.goal, 1), pM = Math.min(day.minutes / 60, 1);
      const pct = Math.round(((pH + pW + pM) / 3) * 100);
      fg.style.strokeDashoffset = 326.7 * (1 - pct / 100);
      $('#dayPct').textContent = pct + '%';
      $('#mHabits').textContent = habits + '/5';
      $('#mWater').textContent = day.water + '/' + day.goal;
      $('#mMove').textContent = day.minutes + '/60 min';
      $('#dayRing').setAttribute('aria-label', 'Progresso geral do dia: ' + pct + '%');
    }
    document.addEventListener('ifs:day', render);
    render();
  })();

  /* ---------- dica do dia ---------- */
  (function tips() {
    const out = $('#tipText'), btn = $('#tipBtn');
    if (!out) return;
    const list = [
      'Beba um copo d\'água ao acordar e outro antes de sair de casa.',
      'Experimente incluir uma fruta ou verdura em pelo menos uma refeição hoje.',
      'Faça uma pausa de 5 minutos para alongar e respirar fundo entre os estudos.',
      'Deixe o celular longe da cama para facilitar o descanso à noite.',
      'Convide um amigo para caminhar, dançar ou jogar bola.',
      'Procure dormir e acordar em horários parecidos todos os dias.',
      'Comer sem pressa e sem tela ajuda a perceber melhor a refeição.',
      'Reserve um momento do dia só para algo que você gosta de fazer.',
      'Conversar com alguém de confiança sobre o seu dia também é cuidado.',
      'Prefira água para matar a sede no dia a dia.',
      'Suba escadas, vá a pé quando der: pequenos movimentos somam.',
      'Respeite o seu corpo: cada pessoa tem um ritmo e uma necessidade.'
    ];
    const start = Math.floor(Date.now() / 86400000) % list.length;
    let i = start;
    const show = () => { out.textContent = list[i]; out.classList.remove('fade-in'); void out.offsetWidth; out.classList.add('fade-in'); };
    show();
    if (btn) btn.addEventListener('click', () => { i = (i + 1) % list.length; show(); });
  })();

  /* ---------- abas: grupos de alimentos ---------- */
  (function foodTabs() {
    const tabs = $$('#foodTool [role="tab"]');
    if (!tabs.length) return;
    function select(i, focus) {
      tabs.forEach((t, j) => {
        const on = i === j;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tabs[i].focus();
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % tabs.length, true); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + tabs.length) % tabs.length, true); }
      });
    });
  })();

  /* ---------- hidratação ---------- */
  (function water() {
    const box = $('#glasses');
    if (!box) return;
    const bar = $('#waterBar'), text = $('#waterText'), goalText = $('#goalText'), msg = $('#waterMsg');
    function render(announce) {
      box.innerHTML = '';
      for (let i = 0; i < day.goal; i++) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'glass' + (i < day.water ? ' full' : '');
        b.setAttribute('aria-label', 'Copo ' + (i + 1) + (i < day.water ? ' (bebido)' : ''));
        b.addEventListener('click', () => set(day.water === i + 1 ? i : i + 1));
        box.appendChild(b);
      }
      const pct = Math.min(100, (day.water / day.goal) * 100);
      bar.style.width = pct + '%';
      text.textContent = day.water + ' de ' + day.goal + ' copos (' + (day.water * 0.2).toFixed(1).replace('.', ',') + ' L)';
      goalText.textContent = 'Meta: ' + day.goal;
      if (announce !== false) {
        msg.textContent = day.water === 0 ? '' : day.water >= day.goal ? 'Meta do dia alcançada! 💧🎉 Continue cuidando da hidratação.' :
          day.water >= day.goal / 2 ? 'Já passou da metade. Continue assim!' : 'Bom começo! Lembre-se de beber ao longo do dia.';
      }
    }
    function set(n) {
      const before = day.water;
      day.water = Math.max(0, Math.min(day.goal, n));
      saveDay(); render();
      if (before < day.goal && day.water === day.goal) { toast('💧 Meta de água do dia alcançada!'); confetti(); }
    }
    $('#waterAdd').addEventListener('click', () => set(day.water + 1));
    $('#waterUndo').addEventListener('click', () => set(day.water - 1));
    $('#goalMinus').addEventListener('click', () => { day.goal = Math.max(4, day.goal - 1); day.water = Math.min(day.water, day.goal); saveDay(); render(); });
    $('#goalPlus').addEventListener('click', () => { day.goal = Math.min(15, day.goal + 1); saveDay(); render(); });
    render(false);
  })();

  /* ---------- sono ---------- */
  (function sleep() {
    const input = $('#wakeTime'), out = $('#sleepResults');
    if (!input) return;
    const saved = store.get('ifs-wake', '');
    if (/^\d{2}:\d{2}$/.test(saved)) input.value = saved;
    const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
    function render() {
      const v = input.value;
      if (!/^\d{2}:\d{2}$/.test(v)) { out.innerHTML = '<p class="muted">Escolha o horário em que você precisa acordar.</p>'; return; }
      store.set('ifs-wake', v);
      const [h, m] = v.split(':').map(Number), wake = h * 60 + m;
      out.innerHTML = [8, 9, 10].map((hrs) =>
        '<div class="sleep-res"><small>Para dormir ' + hrs + ' h</small><b>' + fmt(wake - hrs * 60) + '</b><small>deitar até</small></div>').join('');
    }
    input.addEventListener('input', render);
    render();
  })();

  /* ---------- movimento ---------- */
  (function move() {
    const bar = $('#moveBar');
    if (!bar) return;
    const text = $('#moveText'), msg = $('#moveMsg');
    function render() {
      bar.style.width = Math.min(100, (day.minutes / 60) * 100) + '%';
      text.textContent = day.minutes + ' / 60 min';
    }
    function add(n, label) {
      const before = day.minutes;
      day.minutes = Math.max(0, day.minutes + n);
      saveDay(); render();
      if (n > 0 && label) msg.textContent = label + ' registrado(a)! +' + n + ' min 👏';
      if (before < 60 && day.minutes >= 60) { msg.textContent = 'Referência de 60 minutos alcançada hoje! 🎉'; toast('🏃 60 minutos de movimento!'); confetti(); }
    }
    $$('[data-act]').forEach((b) => b.addEventListener('click', () => add(10, b.dataset.act)));
    $('#moveUndo').addEventListener('click', () => { add(-10); msg.textContent = ''; });
    $('#moveReset').addEventListener('click', () => { day.minutes = 0; saveDay(); render(); msg.textContent = ''; });
    render();
  })();

  /* ---------- respiração guiada ---------- */
  (function breath() {
    const btn = $('#breathBtn');
    if (!btn) return;
    const circle = $('#breathCircle'), label = $('#breathLabel'), small = $('#breathSmall'), count = $('#breathCount');
    const phases = [
      { t: 'Inspire', s: 4, scale: 1 },
      { t: 'Segure', s: 2, scale: 1 },
      { t: 'Solte', s: 6, scale: .55 }
    ];
    let running = false, timer = null, cycles = 0;
    function phase(i) {
      if (!running) return;
      const p = phases[i];
      circle.style.transitionDuration = (p.t === 'Segure' ? 0 : p.s) + 's';
      circle.style.transform = 'scale(' + p.scale + ')';
      label.textContent = p.t; small.textContent = p.s + ' segundos';
      timer = setTimeout(() => {
        if (i === phases.length - 1) { cycles++; count.textContent = cycles + (cycles === 1 ? ' ciclo' : ' ciclos'); }
        phase((i + 1) % phases.length);
      }, p.s * 1000);
    }
    function stop() {
      running = false; clearTimeout(timer);
      circle.style.transitionDuration = '1s'; circle.style.transform = 'scale(.55)';
      label.textContent = 'Respirar'; small.textContent = 'Pronto?';
      btn.textContent = '▶ Começar';
    }
    btn.addEventListener('click', () => {
      if (running) { stop(); return; }
      running = true; btn.textContent = '■ Parar'; phase(0);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });
  })();

  /* ---------- humor ---------- */
  (function mood() {
    const btns = $$('.mood');
    if (!btns.length) return;
    const msgs = [
      'Que bom! Aproveite esse momento e, se puder, compartilhe esse ânimo com alguém. 😄',
      'Ótimo! Pequenas rotinas de cuidado ajudam a manter esse bem-estar. 🙂',
      'Dias assim acontecem. Uma pausa, água, um lanche ou uma conversa podem ajudar. 😐',
      'Obrigado por perceber isso. Que tal respirar fundo e falar com alguém de confiança sobre como se sente? 💬',
      'Sentimos muito que esteja difícil. Você não precisa lidar com tudo sozinho: converse com um adulto de confiança ou com um profissional. O CVV atende pelo 188, gratuitamente, 24 horas. 💚'
    ];
    const out = $('#moodMsg');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      out.textContent = msgs[+b.dataset.mood];
      out.classList.remove('fade-in'); void out.offsetWidth; out.classList.add('fade-in');
    }));
  })();

  /* ---------- mito ou verdade ---------- */
  (function flips() {
    const cards = $$('#flipGrid .flip');
    if (!cards.length) return;
    const seen = new Set(), count = $('#flipCount');
    cards.forEach((c, i) => c.addEventListener('click', () => {
      const on = c.classList.toggle('is-flipped');
      c.setAttribute('aria-pressed', String(on));
      if (on) seen.add(i);
      count.textContent = seen.size + ' de ' + cards.length + ' cartões virados';
      if (seen.size === cards.length && on) { toast('🎉 Você virou todos os cartões!'); confetti(); }
    }));
  })();

  /* ---------- checklist ---------- */
  (function checklist() {
    const checks = $$('#checklist-items input');
    if (!checks.length) return;
    const bar = $('#progressBar'), text = $('#progressText'), msg = $('#progressMsg');
    checks.forEach((c, i) => { c.checked = !!day.checks[i]; });
    function render(celebrate) {
      const n = checks.filter((c) => c.checked).length;
      bar.style.width = (n / checks.length) * 100 + '%';
      text.textContent = n + '/' + checks.length + ' concluídos';
      msg.textContent = n === 0 ? '' : n === checks.length ? 'Dia completo! 🎉' : n >= 3 ? 'Muito bem, falta pouco!' : 'Bom começo! 🌱';
      if (celebrate && n === checks.length) { toast('🎉 Você completou todos os hábitos de hoje!'); confetti(); }
    }
    checks.forEach((c, i) => c.addEventListener('change', () => {
      day.checks[i] = c.checked; saveDay(); render(c.checked);
    }));
    $('#checkReset').addEventListener('click', () => {
      checks.forEach((c) => { c.checked = false; }); day.checks = []; saveDay(); render(false);
    });
    render(false);
  })();

  /* ---------- fontes: filtro e copiar link ---------- */
  (function sources() {
    const list = $('#sourceList');
    if (!list) return;
    const items = $$('.source-item', list), count = $('#sourceCount'), chips = $$('[data-filter]');
    function filter(f) {
      let n = 0;
      items.forEach((it) => { const ok = f === 'all' || it.dataset.tags.split(' ').includes(f); it.hidden = !ok; if (ok) n++; });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === f)));
      count.textContent = 'Mostrando ' + n + ' de ' + items.length + ' fontes';
    }
    chips.forEach((c) => c.addEventListener('click', () => filter(c.dataset.filter)));
    filter('all');
    $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      const url = b.dataset.copy;
      try { await navigator.clipboard.writeText(url); }
      catch (e) {
        const ta = document.createElement('textarea'); ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (er) { /* ignore */ } ta.remove();
      }
      toast('🔗 Link copiado!');
    }));
  })();
})();
