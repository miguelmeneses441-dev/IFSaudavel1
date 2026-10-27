/* IFsaudavel — quiz interativo (uma pergunta por vez, com explicações) */
(function () {
  'use strict';
  const stage = document.getElementById('quizStage');
  if (!stage) return;
  const { toast, confetti, store } = window.IFS || { toast() {}, confetti() {}, store: { get: (k, d) => d, set() {} } };

  // c = índice da alternativa correta; e = explicação
  const QUESTIONS = [
    { q: 'Qual é uma característica de uma alimentação equilibrada?', o: ['Eliminar grupos inteiros de alimentos', 'Buscar variedade e equilíbrio', 'Pular refeições todos os dias', 'Seguir a mesma dieta de outra pessoa'], c: 1, e: 'Variedade e equilíbrio são a base. Cortar grupos de alimentos ou copiar a dieta de outra pessoa, sem orientação profissional, não é recomendado.' },
    { q: 'Por que a hidratação é importante?', o: ['Porque substitui todas as refeições', 'Porque participa de funções do organismo', 'Porque evita qualquer doença', 'Porque elimina a necessidade de dormir'], c: 1, e: 'A água participa de diversas funções do corpo. Ela não substitui refeições, não evita todas as doenças e não dispensa o sono.' },
    { q: 'Quantas horas de sono por noite são geralmente recomendadas para adolescentes?', o: ['3 a 4 horas', '5 a 6 horas', '8 a 10 horas', '12 a 14 horas'], c: 2, e: 'Adolescentes geralmente precisam de cerca de 8 a 10 horas de sono por noite para atenção, memória e disposição.' },
    { q: 'Qual opção representa uma forma de movimento?', o: ['Dança', 'Ficar sentado o dia todo', 'Pular refeições', 'Dormir menos'], c: 0, e: 'Dançar é movimento! Esportes, caminhada, bicicleta e brincadeiras também contam como atividade física.' },
    { q: 'Cuidar do bem-estar emocional pode incluir:', o: ['Nunca conversar sobre problemas', 'Ter lazer e buscar apoio quando necessário', 'Ignorar sentimentos', 'Evitar todas as pessoas'], c: 1, e: 'Lazer, descanso, convivência e pedir apoio quando preciso fazem parte do cuidado com a mente.' },
    { q: 'O objetivo principal de hábitos saudáveis deve ser:', o: ['Comparar corpos', 'Buscar aparência perfeita', 'Cuidar da saúde e qualidade de vida', 'Fazer dietas extremas'], c: 2, e: 'O foco é saúde e bem-estar, e não aparência ou comparação com outras pessoas.' },
    { q: 'O que pode ajudar na rotina de sono?', o: ['Horários relativamente regulares', 'Usar telas sem pausa até dormir', 'Dormir cada dia em horário totalmente diferente', 'Evitar qualquer momento de descanso'], c: 0, e: 'Horários relativamente regulares e um ambiente tranquilo ajudam o descanso. Telas sem pausa perto de dormir atrapalham.' },
    { q: 'Sobre atividade física, é correto afirmar:', o: ['Só vale se for esporte competitivo', 'Deve ser escolhida de forma segura e adequada', 'É necessário se comparar com outras pessoas', 'A aparência é o objetivo principal'], c: 1, e: 'Qualquer movimento seguro e adequado conta. O objetivo é saúde, não competição nem aparência.' },
    { q: 'Quando uma questão de saúde exige orientação individual, o ideal é:', o: ['Copiar a rotina de alguém', 'Buscar um profissional de saúde', 'Seguir qualquer dica da internet', 'Ignorar o problema'], c: 1, e: 'Cada pessoa é diferente. Para orientação individual, o caminho é buscar um profissional de saúde.' },
    { q: 'O checklist deste site serve para:', o: ['Dar uma nota para sua saúde', 'Estimular reflexão sobre a rotina', 'Comparar estudantes', 'Criar uma dieta personalizada'], c: 1, e: 'O checklist não avalia sua saúde: ele só convida você a refletir sobre a sua rotina.' }
  ];
  const TOTAL = QUESTIONS.length;
  const BEST_KEY = 'ifs-quiz-best';

  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let order, idx, score, answered, wrongs, locked;

  function start() {
    // embaralha as alternativas de cada pergunta a cada tentativa
    order = QUESTIONS.map((q) => {
      const opts = shuffle(q.o.map((t, i) => ({ t, ok: i === q.c })));
      return { q: q.q, e: q.e, opts };
    });
    idx = 0; score = 0; answered = false; wrongs = []; locked = false;
    renderQuestion();
  }

  function top() {
    return '<div class="quiz-top"><span class="count">Pergunta ' + (idx + 1) + ' de ' + TOTAL + '</span>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + TOTAL + '" aria-valuenow="' + idx + '"><span style="width:' + (idx / TOTAL) * 100 + '%"></span></div>' +
      '<span class="score-pill">⭐ ' + score + ' acerto' + (score === 1 ? '' : 's') + '</span></div>';
  }

  function renderQuestion() {
    const item = order[idx];
    answered = false;
    stage.innerHTML = top() +
      '<div class="quiz-q fade-in"><h2 id="qTitle">' + esc(item.q) + '</h2>' +
      '<div class="quiz-options" role="group" aria-labelledby="qTitle">' +
      item.opts.map((o, i) => '<button type="button" class="quiz-option" data-i="' + i + '"><span class="letter">' + String.fromCharCode(65 + i) + '</span><span>' + esc(o.t) + '</span></button>').join('') +
      '</div><div id="feedback"></div>' +
      '<div class="quiz-nav"><span class="kbd-hint">Escolha uma alternativa</span><button type="button" class="btn primary" id="nextBtn" hidden></button></div></div>';
    $all('.quiz-option').forEach((b) => b.addEventListener('click', () => choose(+b.dataset.i)));
    // anima a barra até o valor atual
    const barSpan = stage.querySelector('.bar span');
    barSpan.style.width = '0%'; requestAnimationFrame(() => requestAnimationFrame(() => { barSpan.style.width = (idx / TOTAL) * 100 + '%'; }));
    stage.querySelector('#nextBtn').addEventListener('click', next);
  }
  const $all = (s) => Array.from(stage.querySelectorAll(s));

  function choose(i) {
    if (answered) return;
    answered = true;
    const item = order[idx];
    const btns = $all('.quiz-option');
    const ok = item.opts[i].ok;
    btns.forEach((b, j) => { b.disabled = true; if (item.opts[j].ok) b.classList.add('correct'); });
    if (ok) { score++; } else { btns[i].classList.add('wrong'); wrongs.push({ q: item.q, a: item.opts.find((o) => o.ok).t, e: item.e }); }
    stage.querySelector('#feedback').innerHTML =
      '<div class="quiz-explain' + (ok ? '' : ' bad') + '" role="status"><strong>' + (ok ? '✓ Resposta correta!' : '✗ Não foi dessa vez.') + '</strong>' + esc(item.e) + '</div>';
    stage.querySelector('.score-pill').textContent = '⭐ ' + score + ' acerto' + (score === 1 ? '' : 's');
    const nb = stage.querySelector('#nextBtn');
    nb.textContent = idx === TOTAL - 1 ? 'Ver resultado 🏁' : 'Próxima →';
    nb.hidden = false; nb.focus({ preventScroll: true });
    stage.querySelector('.kbd-hint').textContent = 'Pressione Enter para continuar';
  }

  function next() {
    if (!answered) return;
    idx++;
    if (idx >= TOTAL) return showResult();
    renderQuestion();
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showResult() {
    const prevBest = parseInt(store.get(BEST_KEY, '-1'), 10);
    const isBest = score > prevBest;
    if (isBest) store.set(BEST_KEY, String(score));
    const best = Math.max(score, prevBest);
    const msg = score === TOTAL ? 'Perfeito! Você acertou tudo! 🏆' : score >= 8 ? 'Excelente! Você mandou muito bem. 🌟' : score >= 5 ? 'Muito bom! Continue aprendendo sobre hábitos saudáveis. 💚' : 'Bom começo! Explore o IFsaudavel e tente de novo. 🌱';
    stage.innerHTML =
      '<div class="result"><div class="result-ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle class="bg" cx="80" cy="80" r="70"/><circle class="fg" id="resFg" cx="80" cy="80" r="70"/></svg>' +
      '<div class="num"><span>' + score + '<small>/' + TOTAL + '</small></span></div></div>' +
      '<h2>Resultado final</h2><p>Você acertou <strong>' + score + ' de ' + TOTAL + '</strong> perguntas.<br>' + msg + '</p>' +
      '<p class="best">' + (isBest && prevBest >= 0 ? '🎉 Novo recorde pessoal!' : 'Seu melhor resultado neste aparelho: ' + best + '/' + TOTAL) + '</p>' +
      '<div class="result-actions"><button class="btn primary" type="button" id="retry">↻ Refazer quiz</button>' +
      '<button class="btn secondary" type="button" id="share">📤 Compartilhar</button>' +
      '<a class="btn secondary" href="avaliacao.html">💬 Avaliar o site</a></div>' +
      (wrongs.length ? '<div class="review"><h3>Para revisar (' + wrongs.length + ')</h3>' + wrongs.map((w) => '<div class="review-item"><b>' + esc(w.q) + '</b><span class="ans">✓ ' + esc(w.a) + '</span><br>' + esc(w.e) + '</div>').join('') + '</div>' : '<p>Nada para revisar — você acertou todas! 🎯</p>') +
      '<p style="margin-top:1.2rem"><a href="index.html">← Voltar para o site</a></p></div>';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fg = document.getElementById('resFg');
      if (fg) fg.style.strokeDashoffset = 439.8 * (1 - score / TOTAL);
    }));
    if (score >= 8) confetti();
    document.getElementById('retry').addEventListener('click', () => { start(); stage.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    document.getElementById('share').addEventListener('click', async () => {
      const text = 'Acertei ' + score + ' de ' + TOTAL + ' no quiz do IFsaudavel! Tente você também:';
      const url = location.href.split('#')[0];
      try {
        if (navigator.share) await navigator.share({ title: 'IFsaudavel — Quiz', text, url });
        else { await navigator.clipboard.writeText(text + ' ' + url); toast('🔗 Texto copiado!'); }
      } catch (e) { /* cancelado */ }
    });
    stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // atalhos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (!stage.querySelector('.quiz-option')) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    const k = e.key.toLowerCase();
    const map = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 };
    if (!answered && k in map && map[k] < order[idx].opts.length) { e.preventDefault(); choose(map[k]); }
    else if (answered && (k === 'enter' || k === 'arrowright')) {
      if (document.activeElement && document.activeElement.id === 'nextBtn' && k === 'enter') return; // o botão já trata o clique
      e.preventDefault(); next();
    }
  });

  start();
})();
