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
