/* IFsaudavel — interações e animações (compartilhado entre as páginas) */

/* Menu mobile (hambúrguer) */
(function () {
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.menu');
  if (!menuBtn || !menu) return;
  menuBtn.setAttribute('aria-expanded', 'false');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('.menu a').forEach((a) =>
    a.addEventListener('click', () => menu.classList.remove('open'))
  );
})();

/* Cabeçalho ganha sombra ao rolar a página */
(function () {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* Animação de entrada ao rolar (fade/stagger) */
(function () {
  const items = document.querySelectorAll('.reveal, .stagger');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => io.observe(el));
})();

/* Contagem animada dos números em destaque (ex.: mini-stats) */
(function () {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;
  const animate = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 900;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(p * target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) {
    nums.forEach(animate);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((el) => io.observe(el));
})();

/* Botão flutuante "voltar ao topo" */
(function () {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  const toggle = () => btn.classList.toggle('show', window.scrollY > 420);
  toggle();
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* Lembrete de hidratação (seção Hidratação, na página inicial) */
(function () {
  const waterBtn = document.getElementById('waterBtn');
  const waterMsg = document.getElementById('waterMsg');
  if (!waterBtn || !waterMsg) return;
  waterBtn.addEventListener('click', () => {
    waterMsg.textContent = 'Ótimo! 💧 Continue lembrando de se hidratar ao longo do dia.';
    waterBtn.textContent = '✓ Registrado';
    waterBtn.disabled = true;
    waterBtn.classList.add('pop');
    waterMsg.classList.add('pop');
  });
})();

/* Checklist de hábitos com barra de progresso animada */
(function () {
  const checks = [...document.querySelectorAll('.checklist input')];
  if (!checks.length) return;
  const bar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const update = () => {
    const n = checks.filter((c) => c.checked).length;
    bar.style.width = (n / checks.length) * 100 + '%';
    progressText.textContent = `${n}/${checks.length} concluídos`;
  };
  checks.forEach((c) => c.addEventListener('change', update));
})();


/* ===== Acessibilidade IFsaudavel ===== */
(function () {
  const body = document.body;
  const savedTheme = localStorage.getItem('ifsaudavel-theme');
  const savedFont = localStorage.getItem('ifsaudavel-font');
  if (savedTheme === 'dark') body.classList.add('dark-mode');
  if (savedTheme === 'contrast') body.classList.add('high-contrast');
  if (savedFont) body.classList.add(savedFont);

  const bind = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };
  bind('fontMinus', () => {
    body.classList.remove('font-xlarge');
    body.classList.add('font-large');
    localStorage.setItem('ifsaudavel-font','font-large');
  });
  bind('fontReset', () => {
    body.classList.remove('font-large','font-xlarge');
    localStorage.removeItem('ifsaudavel-font');
  });
  bind('fontPlus', () => {
    body.classList.remove('font-large');
    body.classList.add('font-xlarge');
    localStorage.setItem('ifsaudavel-font','font-xlarge');
  });
  bind('contrastToggle', () => {
    body.classList.toggle('high-contrast');
    body.classList.remove('dark-mode');
    localStorage.setItem('ifsaudavel-theme', body.classList.contains('high-contrast') ? 'contrast' : 'normal');
  });
  bind('themeToggle', () => {
    body.classList.toggle('dark-mode');
    body.classList.remove('high-contrast');
    localStorage.setItem('ifsaudavel-theme', body.classList.contains('dark-mode') ? 'dark' : 'normal');
  });
})();


/* ===== IFsaudavel 3.0 — microinterações ===== */
(function(){
  const bar=document.getElementById('readingProgress');
  const update=()=>{if(!bar)return;const max=document.documentElement.scrollHeight-window.innerHeight;bar.style.width=(max>0?(window.scrollY/max)*100:0)+'%';};
  update(); window.addEventListener('scroll',update,{passive:true}); window.addEventListener('resize',update);
})();
(function(){
  const links=[...document.querySelectorAll('.menu a[href^="#"]')];
  const sections=links.map(a=>document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if(!sections.length||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.removeAttribute('aria-current'));const a=links.find(x=>x.getAttribute('href')==='#'+e.target.id);if(a)a.setAttribute('aria-current','page');}}),{rootMargin:'-35% 0px -55%'});
  sections.forEach(s=>io.observe(s));
})();
(function(){
  const checks=[...document.querySelectorAll('.checklist input')]; if(!checks.length)return;
  const key='ifsaudavel-checklist';
  try{const saved=JSON.parse(localStorage.getItem(key)||'[]');checks.forEach((c,i)=>c.checked=!!saved[i]);}catch(e){}
  const original=()=>{};
  const update=()=>{try{localStorage.setItem(key,JSON.stringify(checks.map(c=>c.checked)))}catch(e){}};
  checks.forEach(c=>c.addEventListener('change',update));
  checks.forEach(c=>c.dispatchEvent(new Event('change')));
})();
(function(){
  document.querySelectorAll('.btn,.card,.source-item').forEach(el=>el.addEventListener('pointerdown',()=>{el.style.setProperty('--press','1')}));
  document.querySelectorAll('.btn,.card,.source-item').forEach(el=>el.addEventListener('pointerup',()=>{el.style.removeProperty('--press')}));
})();
