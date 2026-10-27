/* IFsaudavel — formulário de avaliação (envio para o Google Apps Script) */
(function () {
  'use strict';
  const form = document.getElementById('avaliacaoForm');
  if (!form) return;

  // URL do Google Apps Script (termina em /exec). Veja README-INTEGRACAO-GOOGLE-SHEETS.txt
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw4XmlLq090gsw4dtgMLAJvzZw__4_yiyLy-DeeymqC5El4cKYEAg0a3P0HrI_q7Ltf/exec';

  const store = (window.IFS && window.IFS.store) || { get: (k, d) => d, set() {}, del() {} };
  const DRAFT = 'ifs-avaliacao-rascunho';
  const REQUIRED = Array.from(form.querySelectorAll('[data-req]')).map((c) => c.dataset.req);
  const bar = document.getElementById('formBar'), text = document.getElementById('formText');
  const range = document.getElementById('nota'), val = document.getElementById('notaValor'), emoji = document.getElementById('notaEmoji');
  const err = document.getElementById('formError'), btn = document.getElementById('submitBtn');
  const faces = ['😞', '😞', '😕', '😕', '😐', '😐', '🙂', '🙂', '😊', '😍', '🤩'];

  const answered = (name) => !!form.querySelector('input[name="' + name + '"]:checked');

  function progress() {
    const n = REQUIRED.filter(answered).length;
    bar.style.width = (n / REQUIRED.length) * 100 + '%';
    text.textContent = n + ' de ' + REQUIRED.length + ' respondidas';
    REQUIRED.forEach((r) => {
      const card = form.querySelector('[data-req="' + r + '"]');
      card.classList.toggle('done', answered(r));
      if (answered(r)) card.classList.remove('invalid');
    });
  }

  function saveDraft() {
    const d = {};
    new FormData(form).forEach((v, k) => { if (k !== 'website') d[k] = v; });
    store.set(DRAFT, JSON.stringify(d));
  }
  function loadDraft() {
    let d = null;
    try { d = JSON.parse(store.get(DRAFT, 'null')); } catch (e) { d = null; }
    if (!d) return;
    Object.keys(d).forEach((k) => {
      const els = form.elements[k];
      if (!els) return;
      if (els.length && els[0] && els[0].type === 'radio') Array.from(els).forEach((r) => { r.checked = r.value === d[k]; });
      else if (els.type === 'range' || els.tagName === 'TEXTAREA') els.value = d[k];
    });
  }

  function counters() {
    form.querySelectorAll('.counter').forEach((c) => {
      const ta = form.elements[c.dataset.for];
      c.textContent = ta.value.length + '/' + ta.maxLength;
    });
  }
  function nota() {
    val.textContent = range.value; emoji.textContent = faces[+range.value];
    val.parentElement.classList.remove('pop'); void val.parentElement.offsetWidth; val.parentElement.classList.add('pop');
  }

  form.addEventListener('input', () => { progress(); counters(); saveDraft(); });
  range.addEventListener('input', nota);
  loadDraft(); progress(); counters();
  val.textContent = range.value; emoji.textContent = faces[+range.value];

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.textContent = '';
    const missing = REQUIRED.filter((r) => !answered(r));
    if (missing.length) {
      missing.forEach((r) => form.querySelector('[data-req="' + r + '"]').classList.add('invalid'));
      const first = form.querySelector('[data-req="' + missing[0] + '"]');
      first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      err.textContent = 'Faltam ' + missing.length + ' pergunta' + (missing.length > 1 ? 's' : '') + ' obrigatória' + (missing.length > 1 ? 's' : '') + '. Elas estão destacadas em vermelho.';
      return;
    }
    if (form.elements.website.value) return; // anti-robô: campo invisível preenchido

    btn.disabled = true; btn.textContent = 'Enviando…';
    const data = new URLSearchParams();
    data.append('timestamp', new Date().toISOString());
    new FormData(form).forEach((v, k) => { if (k !== 'website') data.append(k, v); });
    try {
      // no-cors: o Apps Script grava a linha mesmo sem devolver cabeçalhos CORS
      await fetch(APPS_SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: data });
      store.del(DRAFT);
      form.hidden = true;
      const msg = document.getElementById('mensagem');
      msg.hidden = false; msg.classList.add('fade-in');
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.IFS) window.IFS.confetti();
    } catch (er) {
      btn.disabled = false; btn.textContent = 'Enviar minha avaliação →';
      err.textContent = 'Não foi possível enviar agora. Verifique sua conexão e tente novamente — suas respostas continuam salvas.';
    }
  });
})();
