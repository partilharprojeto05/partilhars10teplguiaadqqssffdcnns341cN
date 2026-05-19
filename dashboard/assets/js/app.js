'use strict';

/* ══════════════════════════════
   API LAYER — delega para api.js
   USE_MOCK em api.js controla se usa mockData ou Google Apps Script.
══════════════════════════════ */

/** Busca todos os doadores (assíncrono). */
async function apiGetDonors() {
  return window.PartilharAPI.apiFetchDonors();
}

/** Cria um novo doador (assíncrono). */
async function apiAddDonor(data) {
  return window.PartilharAPI.apiCreateDonor(data);
}

/** Atualiza doador existente (assíncrono). */
async function apiUpdateDonor(id, data) {
  return window.PartilharAPI.apiUpdateDonor(id, data);
}

/** Exclui doador (assíncrono). */
async function apiDeleteDonor(id) {
  return window.PartilharAPI.apiDeleteDonor(id);
}

function calcStats(donors, month, year) {
  return window.PartilharAPI.calcReportStats(donors, month, year);
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
function showToast(msg, type) {
  type = type || 'info';
  var icons = { success: '', error: '', info: '' };
  var container = document.getElementById('toast-container');
  var toast = document.createElement('div');
  toast.className = 'toast toast--' + type;
  toast.innerHTML = '<span>' + icons[type] + '</span><span>' + msg + '</span>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.style.cssText = 'opacity:0;transform:translateX(100%);transition:all .3s ease;';
    setTimeout(function () { toast.remove(); }, 320);
  }, 3500);
}

/* ══════════════════════════════
   CONFIGURAÇÃO DE DEPLOY
   Ajuste LOGIN_URL para o endereço da tela de login após o deploy.
   Exemplo: 'https://painel.grupopartilhar.com.br/login'
══════════════════════════════ */
var LOGIN_URL = '../login/index.html';
var SESSION_KEY = 'partilhar_auth';

/* ══════════════════════════════
   NAVBAR
══════════════════════════════ */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  navbar.innerHTML = '<div class="navbar__inner">'
    + '<button class="navbar__logo" id="nav-logo" aria-label="Dashboard">'
    + '<img src="assets/img/logo-partilhar.jpeg" alt="Logo Grupo Partilhar" class="navbar__logo-icon" />'
    + '</button>'
    + '<nav class="navbar__nav">'
    + '<button class="nav-link" id="nav-dashboard" data-page="dashboard"><span class="nav-icon"></span> Dashboard</button>'
    + '<button class="nav-link" id="nav-cadastro" data-page="cadastro"><span class="nav-icon"></span> Cadastrar Doador</button>'
    + '<button class="nav-link" id="nav-relatorios" data-page="relatorios"><span class="nav-icon"></span> Relatórios</button>'
    + '</nav>'
    + '<button class="navbar__mobile-toggle" id="nav-mobile-toggle" aria-label="Menu">☰</button>'
    + '</div>'
    + '<nav class="navbar__mobile-menu" id="nav-mobile-menu">'
    + '<button class="nav-link" data-page="dashboard"><span class="nav-icon"></span> Dashboard</button>'
    + '<button class="nav-link" data-page="cadastro"><span class="nav-icon"></span> Cadastrar Doador</button>'
    + '<button class="nav-link" data-page="relatorios"><span class="nav-icon"></span> Relatórios</button>'
    + '</nav>';

  document.getElementById('nav-logo').addEventListener('click', function () { navigateTo('dashboard'); });
  document.getElementById('nav-mobile-toggle').addEventListener('click', function () {
    var menu = document.getElementById('nav-mobile-menu');
    var tog = document.getElementById('nav-mobile-toggle');
    menu.classList.toggle('open');
    tog.textContent = menu.classList.contains('open') ? '✕' : '☰';
  });
  navbar.querySelectorAll('.nav-link[data-page]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(btn.dataset.page);
      document.getElementById('nav-mobile-menu').classList.remove('open');
      document.getElementById('nav-mobile-toggle').textContent = '☰';
    });
  });
}

function setActiveNavLink(page) {
  document.querySelectorAll('.nav-link[data-page]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

/* ══════════════════════════════
   MODAL
══════════════════════════════ */
var overlay = null;
var modalEl = null;

function initModal() {
  overlay = document.getElementById('modal-overlay');
  modalEl = document.getElementById('modal');
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
}

function closeModal() { overlay.classList.remove('open'); }
function openModal() { overlay.classList.add('open'); }

function openDonorModal(donor) {
  var statusClass = { ativo: 'badge--active', pendente: 'badge--pending', inativo: 'badge--inactive' }[donor.status] || '';
  var waNumber = '55' + donor.telefone.replace(/\D/g, '');
  modalEl.innerHTML = '<div class="modal-header">'
    + '<h2 class="modal-title" id="modal-title">Detalhes do Doador</h2>'
    + '<button class="modal-close" id="modal-close-btn">✕</button>'
    + '</div>'
    + '<div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-6);">'
    + '<div class="donor-info-avatar">' + window.Partilhar.getInitials(donor.nome) + '</div>'
    + '<div><div style="font-size:var(--font-size-xl);font-weight:var(--font-weight-bold);color:var(--color-text-dark);">' + donor.nome + '</div>'
    + '<span class="badge ' + statusClass + '" style="margin-top:var(--space-1);">' + window.Partilhar.STATUS_LABEL[donor.status] + '</span></div>'
    + '</div>'
    + '<div class="donor-info-grid">'
    + _infoItem(' E-mail', donor.email)
    + _infoItem(' Telefone', donor.telefone)
    + _infoItem(' Tipo de Doação', window.Partilhar.TIPO_LABEL[donor.tipoDoacao])
    + _infoItem(' Frequência', window.Partilhar.FREQ_LABEL[donor.freqDoacao])
    + _infoItem('⏱ Compromisso', window.Partilhar.COMP_LABEL[donor.compromisso])
    + _infoItem(' Valor Estimado', window.Partilhar.formatBRL(donor.valorEstimado))
    + '<div class="donor-info-item"><span class="donor-info-item__label"> Total Doado</span><span class="donor-info-item__value" style="color:var(--color-green-500);font-weight:700;">' + window.Partilhar.formatBRL(donor.totalDoado) + '</span></div>'
    + _infoItem(' Próxima Doação', window.Partilhar.formatDate(donor.dataProximaDoa))
    + _infoItem(' Cadastrado em', window.Partilhar.formatDate(donor.dataCadastro))
    + '</div>'
    + '<div class="modal-footer" id="modal-footer">'
    + '<button class="btn btn-ghost" id="modal-delete-btn"> Excluir</button>'
    + '<button class="btn btn-primary btn-sm" id="modal-register-btn" style="margin-right:auto;"> Registrar Doação</button>'
    + (donor.status !== 'ativo' ? '<button class="btn btn-success btn-sm" id="modal-activate-btn"> Marcar como Ativo</button>' : '<button class="btn btn-secondary btn-sm" id="modal-deactivate-btn">⏸ Pendente</button>')
    + '<a href="https://wa.me/' + waNumber + '" target="_blank" rel="noopener" class="btn btn-success" style="background:var(--gradient-green);"> WhatsApp</a>'
    + '</div>';

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-delete-btn').addEventListener('click', async function () {
    if (!confirm('Excluir ' + donor.nome + '?')) return;
    try {
      await apiDeleteDonor(donor.id);
      closeModal();
      showToast(donor.nome + ' removido.', 'success');
      await initDashboard();
    } catch (err) {
      showToast('Erro ao excluir doador.', 'error');
      console.error(err);
    }
  });

  var registerBtn = document.getElementById('modal-register-btn');
  registerBtn.addEventListener('click', function () {
    var footer = document.getElementById('modal-footer');
    var tipo = donor.tipoDoacao; // 'dinheiro' | 'alimentos' | 'ambos'
    var wrap = 'display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap;width:100%;';
    var inputS = 'flex:1;min-width:100px;padding:var(--space-2) var(--space-3);border:1.5px solid var(--color-pink-500);border-radius:var(--radius-lg);font-size:var(--font-size-sm);outline:none;background:var(--color-surface);';
    var labelS = 'font-size:var(--font-size-sm);font-weight:600;color:var(--color-text-dark);white-space:nowrap;';

    if (tipo === 'alimentos') {
      // Sem valor — só confirmar entrega
      footer.innerHTML =
        '<div style="' + wrap + '">'
        + '<span style="' + labelS + '"> Confirmar entrega de alimentos deste mês?</span>'
        + '<button class="btn btn-primary btn-sm" id="modal-confirm-donation"> Confirmar Entrega</button>'
        + '<button class="btn btn-ghost btn-sm" id="modal-cancel-donation">Cancelar</button>'
        + '</div>';

    } else if (tipo === 'ambos') {
      // Valor em dinheiro + checkbox de alimentos
      footer.innerHTML =
        '<div style="' + wrap + '">'
        + '<span style="' + labelS + '">R$ recebido:</span>'
        + '<input type="number" id="modal-donation-value" min="0" step="0.01" value="' + (donor.valorEstimado || 0) + '" style="' + inputS + '" />'
        + '<label style="display:flex;align-items:center;gap:6px;font-size:var(--font-size-sm);cursor:pointer;white-space:nowrap;">'
        + '<input type="checkbox" id="alimentos-entregues" checked style="width:15px;height:15px;accent-color:var(--color-pink-500);" />'
        + 'Alimentos entregues'
        + '</label>'
        + '<button class="btn btn-primary btn-sm" id="modal-confirm-donation"> Confirmar</button>'
        + '<button class="btn btn-ghost btn-sm" id="modal-cancel-donation">Cancelar</button>'
        + '</div>';
      var inp = document.getElementById('modal-donation-value');
      inp.focus(); inp.select();

    } else {
      // dinheiro — só valor
      footer.innerHTML =
        '<div style="' + wrap + '">'
        + '<span style="' + labelS + '"> Valor recebido (R$):</span>'
        + '<input type="number" id="modal-donation-value" min="0.01" step="0.01" value="' + (donor.valorEstimado || 0) + '" style="' + inputS + '" />'
        + '<button class="btn btn-primary btn-sm" id="modal-confirm-donation"> Confirmar</button>'
        + '<button class="btn btn-ghost btn-sm" id="modal-cancel-donation">Cancelar</button>'
        + '</div>';
      var inp2 = document.getElementById('modal-donation-value');
      inp2.focus(); inp2.select();
    }

    document.getElementById('modal-cancel-donation').addEventListener('click', function () {
      openDonorModal(donor);
    });

    document.getElementById('modal-confirm-donation').addEventListener('click', async function () {
      var confirmBtn = document.getElementById('modal-confirm-donation');
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<div class="spinner"></div>';

      var novaProxima = donor.freqDoacao === 'mensal'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : (donor.dataProximaDoa || '');

      var payload = { dataProximaDoa: novaProxima, status: 'ativo' };
      var toastMsg = '';

      if (tipo === 'alimentos') {
        // Apenas data e status — sem valor monetário
        toastMsg = 'Entrega de alimentos registrada para ' + donor.nome + '!';

      } else if (tipo === 'ambos') {
        var valor = parseFloat(document.getElementById('modal-donation-value').value) || 0;
        var alimentosOk = document.getElementById('alimentos-entregues').checked;
        if (valor > 0) {
          payload.totalDoado = (donor.totalDoado || 0) + valor;
        }
        toastMsg = 'Doação de ' + window.Partilhar.formatBRL(valor)
          + (alimentosOk ? ' + alimentos' : ' (alimentos pendentes)')
          + ' registrada para ' + donor.nome + '!';

      } else {
        // dinheiro
        var valor2 = parseFloat(document.getElementById('modal-donation-value').value) || 0;
        if (valor2 <= 0) {
          showToast('Informe um valor maior que zero.', 'error');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = ' Confirmar';
          return;
        }
        payload.totalDoado = (donor.totalDoado || 0) + valor2;
        toastMsg = 'Doação de ' + window.Partilhar.formatBRL(valor2) + ' registrada para ' + donor.nome + '!';
      }

      try {
        await apiUpdateDonor(donor.id, payload);
        closeModal();
        showToast(toastMsg, 'success');
        await initDashboard();
      } catch (err) {
        showToast('Erro ao registrar doação.', 'error');
        console.error(err);
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = ' Confirmar';
      }
    });
  });

  var activateBtn = document.getElementById('modal-activate-btn');
  var deactivateBtn = document.getElementById('modal-deactivate-btn');
  if (activateBtn) activateBtn.addEventListener('click', async function () {
    try {
      await apiUpdateDonor(donor.id, { status: 'ativo' });
      closeModal(); showToast(donor.nome + ' marcado como Ativo.', 'success'); await initDashboard();
    } catch (err) { showToast('Erro ao atualizar.', 'error'); }
  });
  if (deactivateBtn) deactivateBtn.addEventListener('click', async function () {
    try {
      await apiUpdateDonor(donor.id, { status: 'pendente' });
      closeModal(); showToast(donor.nome + ' marcado como Pendente.', 'info'); await initDashboard();
    } catch (err) { showToast('Erro ao atualizar.', 'error'); }
  });
  openModal();
}

function _infoItem(label, value) {
  return '<div class="donor-info-item"><span class="donor-info-item__label">' + label + '</span><span class="donor-info-item__value">' + value + '</span></div>';
}

/* ══════════════════════════════
   DASHBOARD
══════════════════════════════ */
var _dashSearch = '';
var _dashFilter = 'todos';

async function initDashboard() {
  _bindDashEvents();
  try {
    // 1. Verifica e atualiza status automaticamente antes de renderizar
    await _autoAtualizarStatus();
    // 2. Carrega e renderiza
    var donors = await apiGetDonors();
    _renderDashStats(donors);
    _renderDashTable(donors);
  } catch (err) {
    console.error('[Dashboard] Erro ao carregar doadores:', err);
    showToast('Erro ao carregar doadores. Verifique a conexão.', 'error');
  }
}

/**
 * Varre todos os doadores mensais:
 *   - Se dataProximaDoa já passou e status é 'ativo' → marca como 'pendente'
 * Roda silenciosamente em background; erros individuais não param a UI.
 */
async function _autoAtualizarStatus() {
  var donors;
  try { donors = await apiGetDonors(); } catch (_) { return; }

  var agora = new Date();
  var atualizacoes = donors.filter(function (d) {
    return d.freqDoacao === 'mensal'
      && d.status === 'ativo'
      && d.dataProximaDoa
      && new Date(d.dataProximaDoa) < agora;
  });

  await Promise.all(atualizacoes.map(function (d) {
    return apiUpdateDonor(d.id, { status: 'pendente' }).catch(function (err) {
      console.warn('[autoStatus] Falha ao atualizar', d.nome, err);
    });
  }));

  if (atualizacoes.length > 0) {
    console.info('[autoStatus]', atualizacoes.length, 'doador(es) marcado(s) como pendente.');
  }
}

function _renderDashStats(donors) {
  var ativos = donors.filter(function (d) { return d.status === 'ativo'; });
  document.getElementById('stat-total').textContent = donors.length;
  document.getElementById('stat-ativos').textContent = ativos.length;
  document.getElementById('stat-pendentes').textContent = donors.filter(function (d) { return d.status === 'pendente'; }).length;
  document.getElementById('stat-valor').textContent = window.Partilhar.formatBRL(ativos.reduce(function (s, d) { return s + d.valorEstimado; }, 0));
}

async function _dashFiltered() {
  var all = await apiGetDonors();
  return all.filter(function (d) {
    var matchStatus = _dashFilter === 'todos' || d.status === _dashFilter;
    var q = _dashSearch.toLowerCase();
    var matchSearch = !q || d.nome.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.telefone.includes(q);
    return matchStatus && matchSearch;
  });
}

async function _renderDashTable() {
  var tbody = document.getElementById('donors-tbody');
  var empty = document.getElementById('donors-empty');
  var donors = await _dashFiltered();
  if (donors.length === 0) { tbody.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');

  var TIPO_SHORT = { dinheiro: 'Dinheiro', alimentos: 'Alimentos', ambos: 'Ambos' };
  var TIPO_BADGE = { dinheiro: 'badge--money', alimentos: 'badge--food', ambos: 'badge--both' };
  var STAT_BADGE = { ativo: 'badge--active', pendente: 'badge--pending', inativo: 'badge--inactive' };
  var FREQ_SHORT = { mensal: 'mês', unica: 'vez' };

  tbody.innerHTML = donors.map(function (d) {
    var waNumber = '55' + d.telefone.replace(/\D/g, '');
    var row = '<tr data-id="' + d.id + '">';
    row += '<td><div class="donor-cell"><div class="donor-avatar-sm">' + window.Partilhar.getInitials(d.nome) + '</div><div><div class="donor-name">' + d.nome + '</div></div></div></td>';
    row += '<td class="col-hide-mobile"><div class="contact-cell"><span class="contact-cell__phone">' + d.telefone + '</span><span class="contact-cell__email">' + d.email + '</span></div></td>';
    row += '<td class="col-hide-mobile"><span class="badge ' + (TIPO_BADGE[d.tipoDoacao] || '') + '">' + TIPO_SHORT[d.tipoDoacao] + '</span></td>';
    row += '<td><div class="value-cell"><div class="value-cell__main">' + window.Partilhar.formatBRL(d.valorEstimado) + '/' + (FREQ_SHORT[d.freqDoacao] || '') + '</div><div class="value-cell__total">Total: ' + window.Partilhar.formatBRL(d.totalDoado) + '</div></div></td>';
    row += '<td><span class="badge ' + (STAT_BADGE[d.status] || '') + '">' + window.Partilhar.STATUS_LABEL[d.status] + '</span></td>';
    var proxDate = d.dataProximaDoa ? new Date(d.dataProximaDoa) : null;
    var isOverdue = d.status === 'ativo' && proxDate && proxDate < new Date();
    var proxHtml = isOverdue
      ? '<span style="color:#ef4444;font-weight:600;" title="Doação em atraso!">⚠ ' + window.Partilhar.formatDate(d.dataProximaDoa) + '</span>'
      : window.Partilhar.formatDate(d.dataProximaDoa);
    row += '<td class="col-hide-mobile">' + proxHtml + '</td>';
    row += '<td><div class="actions-cell">';
    row += '<button class="btn-icon btn-view" data-id="' + d.id + '" title="Ver detalhes">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>'
      + '<circle cx="12" cy="12" r="3"/>'
      + '</svg></button>';
    row += '<button class="btn-icon btn-delete" data-id="' + d.id + '" data-nome="' + d.nome + '" title="Excluir doador" style="border-color:#fca5a5;color:#ef4444;">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
      + '<polyline points="3 6 5 6 21 6"/>'
      + '<path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>'
      + '<path d="M10 11v6M14 11v6"/>'
      + '<path d="M9 6V4h6v2"/>'
      + '</svg></button>';
    row += '<a href="https://wa.me/' + waNumber + '" target="_blank" rel="noopener" class="btn-icon btn-whatsapp" title="WhatsApp" style="display:inline-flex;align-items:center;justify-content:center;">'
      + '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">'
      + '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>'
      + '</svg></a>';
    row += '</div></td></tr>';
    return row;
  }).join('');

  tbody.querySelectorAll('.btn-view').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var all = await apiGetDonors();
      var donor = all.find(function (d) { return d.id === btn.dataset.id; });
      if (donor) openDonorModal(donor);
    });
  });

  tbody.querySelectorAll('.btn-delete').forEach(function (btn) {
    btn.addEventListener('click', async function () {
      var id = btn.dataset.id;
      var nome = btn.dataset.nome;
      if (!confirm('Excluir ' + nome + '?')) return;
      try {
        await apiDeleteDonor(id);
        showToast(nome + ' removido.', 'success');
        await initDashboard();
      } catch (err) {
        showToast('Erro ao excluir doador.', 'error');
        console.error(err);
      }
    });
  });
}

var _dashEventsInit = false;
function _bindDashEvents() {
  if (_dashEventsInit) return;
  _dashEventsInit = true;
  document.getElementById('search-input').addEventListener('input', function (e) { _dashSearch = e.target.value; _renderDashTable(); });
  document.getElementById('filter-status').addEventListener('change', function (e) { _dashFilter = e.target.value; _renderDashTable(); });
  document.getElementById('btn-new-donor').addEventListener('click', function () { navigateTo('cadastro'); });
  document.getElementById('btn-refresh') && document.getElementById('btn-refresh').addEventListener('click', function () { initDashboard(); });
}

/* ══════════════════════════════
   CADASTRO
══════════════════════════════ */
var _cadastroEventsInit = false;
function initCadastro() {
  if (_cadastroEventsInit) return;
  _cadastroEventsInit = true;

  document.getElementById('btn-back').addEventListener('click', function () { navigateTo('dashboard'); });
  document.getElementById('btn-reset').addEventListener('click', function () {
    document.getElementById('form-cadastro').reset();
    document.querySelectorAll('.form-input.error,.form-select.error').forEach(function (el) { el.classList.remove('error'); });
    document.querySelectorAll('.form-error.visible').forEach(function (el) { el.classList.remove('visible'); });
  });

  var telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', function () { telInput.value = maskPhone(telInput.value); });
  }

  document.getElementById('form-cadastro').addEventListener('submit', handleCadastroSubmit);
}

async function handleCadastroSubmit(e) {
  e.preventDefault();
  document.querySelectorAll('.form-input.error,.form-select.error').forEach(function (el) { el.classList.remove('error'); });
  document.querySelectorAll('.form-error.visible').forEach(function (el) { el.classList.remove('visible'); });

  var get = function (id) { return (document.getElementById(id) || {}).value || ''; };
  var tipoDoacao = (document.querySelector('input[name="tipoDoacao"]:checked') || {}).value || 'dinheiro';
  var data = {
    nome: get('nome').trim(), email: get('email').trim(), telefone: get('telefone').trim(),
    tipoDoacao: tipoDoacao, freqDoacao: get('freqDoacao'), compromisso: get('compromisso'),
    valorEstimado: parseFloat(get('valorEstimado')) || 0
  };

  var errors = {};
  if (!data.nome || data.nome.length < 3) errors.nome = 'Nome deve ter pelo menos 3 caracteres.';
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = 'E-mail inválido.';
  if (!data.telefone || data.telefone.replace(/\D/g, '').length < 10) errors.telefone = 'Telefone inválido.';
  if (!data.freqDoacao) errors.freqDoacao = 'Selecione a frequência de doação.';
  if (!data.compromisso) errors.compromisso = 'Selecione o tempo de compromisso.';

  if (Object.keys(errors).length > 0) {
    Object.entries(errors).forEach(function (entry) {
      var field = entry[0], msg = entry[1];
      var input = document.getElementById(field);
      var errorEl = document.getElementById('error-' + field);
      if (input) input.classList.add('error');
      if (errorEl) { errorEl.textContent = msg; errorEl.classList.add('visible'); }
    });
    showToast('Por favor, corrija os campos destacados.', 'error');
    return;
  }

  var btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<div class="spinner"></div> Salvando...';

  try {
    var created = await apiAddDonor(data);
    console.log('[Cadastro] Doador criado:', created);
    showToast(created.nome + ' cadastrado com sucesso!', 'success');
    document.getElementById('form-cadastro').reset();
    setTimeout(function () { navigateTo('dashboard'); }, 1200);
  } catch (err) {
    console.error('[Cadastro] Erro:', err);
    showToast('Erro ao salvar doador. Tente novamente.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = ' Salvar Doador';
  }
}

function maskPhone(v) {
  return v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
}

/* ══════════════════════════════
   RELATÓRIOS + CHARTS
══════════════════════════════ */
var _chartStatus = null, _chartTipo = null, _chartTop = null;
var CHART_COLORS = { pink: '#F0919B', pink2: '#F5AEBA', green: '#D2E896', blue: '#A28A84', amber: '#BFA099', gray: '#C0B0AC' };

function initRelatorios() {
  var now = new Date();
  var picker = document.getElementById('month-picker');
  picker.value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  _updateReport();
  var bindExport = document.getElementById('btn-export');
  bindExport.onclick = exportCSV;
  picker.onchange = function () { _updateReport(); };
}

async function _updateReport() {
  var val = document.getElementById('month-picker').value || '';
  var parts = val.split('-').map(Number);
  var year = parts[0] || new Date().getFullYear(), month = parts[1] || new Date().getMonth() + 1;
  var donors;
  try {
    donors = await apiGetDonors();
  } catch (err) {
    console.error('[Relatórios] Erro ao carregar doadores:', err);
    showToast('Erro ao carregar dados do relatório.', 'error');
    return;
  }
  var stats = calcStats(donors, month, year);

  document.getElementById('rel-total').textContent = stats.totalDonors;
  document.getElementById('rel-recebidas').textContent = stats.doacoesRecebidas;
  document.getElementById('rel-pendentes').textContent = stats.pendingDonors;
  document.getElementById('rel-period').textContent = window.Partilhar.MONTHS_PT[month - 1] + ' de ' + year;

  // Total arrecadado real + previsão mensal como subtítulo
  var valorEl = document.getElementById('rel-valor');
  valorEl.innerHTML = window.Partilhar.formatBRL(stats.totalArrecadado)
    + '<div style="font-size:var(--font-size-xs);opacity:0.8;margin-top:4px;font-weight:normal;">'
    + 'Previsto/mês: ' + window.Partilhar.formatBRL(stats.totalPrevisto)
    + '</div>';

  _renderStatusChart(stats);
  _renderTipoChart(stats);
  _renderTopChart(stats.top5);
  _renderTop5Table(stats.top5);
}

function _renderStatusChart(stats) {
  var ctx = document.getElementById('chart-status').getContext('2d');
  if (_chartStatus) _chartStatus.destroy();
  _chartStatus = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Ativos', 'Pendentes', 'Inativos'], datasets: [{ data: [stats.activeDonors, stats.pendingDonors, stats.inactiveDonors], backgroundColor: [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.gray], borderWidth: 0, hoverOffset: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.label + ': ' + ctx.parsed; } } } } }
  });
  _renderLegend('legend-status', [{ label: 'Ativos: ' + stats.activeDonors, color: CHART_COLORS.green }, { label: 'Pendentes: ' + stats.pendingDonors, color: CHART_COLORS.amber }, { label: 'Inativos: ' + stats.inactiveDonors, color: CHART_COLORS.gray }]);
}

function _renderTipoChart(stats) {
  var ctx = document.getElementById('chart-tipo').getContext('2d');
  if (_chartTipo) _chartTipo.destroy();
  _chartTipo = new Chart(ctx, {
    type: 'doughnut',
    data: { labels: ['Dinheiro', 'Alimentos', 'Ambos'], datasets: [{ data: [stats.porTipo.dinheiro, stats.porTipo.alimentos, stats.porTipo.ambos], backgroundColor: [CHART_COLORS.pink, CHART_COLORS.blue, CHART_COLORS.green], borderWidth: 0, hoverOffset: 8 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }
  });
  _renderLegend('legend-tipo', [{ label: 'Dinheiro: ' + stats.porTipo.dinheiro, color: CHART_COLORS.pink }, { label: 'Alimentos: ' + stats.porTipo.alimentos, color: CHART_COLORS.blue }, { label: 'Ambos: ' + stats.porTipo.ambos, color: CHART_COLORS.green }]);
}

function _renderTopChart(top5) {
  var ctx = document.getElementById('chart-top').getContext('2d');
  if (_chartTop) _chartTop.destroy();
  var labels = top5.map(function (d) { return d.nome.split(' ')[0]; });
  var data = top5.map(function (d) { return d.totalDoado; });
  var bgs = [CHART_COLORS.pink, CHART_COLORS.pink2, CHART_COLORS.green, CHART_COLORS.blue, CHART_COLORS.amber];
  _chartTop = new Chart(ctx, {
    type: 'bar',
    data: { labels: labels, datasets: [{ label: 'Total Doado (R$)', data: data, backgroundColor: bgs, borderRadius: 8, borderSkipped: false }] },
    options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { color: '#A28A84', font: { family: 'Inter', size: 12 } } }, y: { grid: { color: '#E8E2E0' }, ticks: { color: '#A28A84', font: { family: 'Inter', size: 11 }, callback: function (v) { return 'R$ ' + v.toLocaleString('pt-BR'); } } } }, plugins: { legend: { display: false } } }
  });
}

function _renderLegend(id, items) {
  var el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map(function (item) {
    return '<div class="legend-item"><span class="legend-dot" style="background:' + item.color + ';"></span><span>' + item.label + '</span></div>';
  }).join('');
}

function _renderTop5Table(top5) {
  var tbody = document.getElementById('top5-tbody');
  if (!tbody) return;
  var TIPO_SHORT = { dinheiro: ' Dinheiro', alimentos: ' Alimentos', ambos: ' Ambos' };
  var STAT_BADGE = { ativo: 'badge--active', pendente: 'badge--pending', inativo: 'badge--inactive' };
  tbody.innerHTML = top5.map(function (d, i) {
    var rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    var medal = (i + 1) + 'º';
    return '<tr><td><div class="rank-badge ' + rankClass + '" style="display:inline-flex;">' + medal + '</div></td>'
      + '<td style="font-weight:600;color:var(--color-text-dark);">' + d.nome + '</td>'
      + '<td>' + (TIPO_SHORT[d.tipoDoacao] || '') + '</td>'
      + '<td style="font-weight:700;color:var(--color-pink-500);">' + window.Partilhar.formatBRL(d.totalDoado) + '</td>'
      + '<td><span class="badge ' + (STAT_BADGE[d.status] || '') + '">' + window.Partilhar.STATUS_LABEL[d.status] + '</span></td></tr>';
  }).join('');
}

async function exportCSV() {
  var val = document.getElementById('month-picker').value || '';
  var parts = val.split('-').map(Number);
  var year = parts[0] || new Date().getFullYear(), month = parts[1] || new Date().getMonth() + 1;
  var donors;
  try {
    donors = await apiGetDonors();
  } catch (err) {
    showToast('Erro ao exportar dados.', 'error');
    return;
  }
  var headers = ['Nome', 'Email', 'Telefone', 'Tipo', 'Frequência', 'Compromisso', 'Valor Estimado', 'Total Doado', 'Status', 'Próxima Doação'];
  var rows = donors.map(function (d) {
    return [d.nome, d.email, d.telefone, d.tipoDoacao, d.freqDoacao, d.compromisso, d.valorEstimado, d.totalDoado, d.status, window.Partilhar.formatDate(d.dataProximaDoa)];
  });
  var csvContent = [headers].concat(rows).map(function (row) {
    return row.map(function (cell) { return '"' + String(cell).replace(/"/g, '""') + '"'; }).join(',');
  }).join('\n');
  var blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = 'partilhar_relatorio_' + year + '_' + String(month).padStart(2, '0') + '.csv'; a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════
   ROUTER
══════════════════════════════ */
var PAGES = {};
var _currentPage = null;

function navigateTo(page) {
  if (!PAGES[page]) page = 'dashboard';
  Object.values(PAGES).forEach(function (el) { if (el) el.classList.add('hidden'); });
  PAGES[page].classList.remove('hidden');
  setActiveNavLink(page);
  history.replaceState(null, '', '#' + page);

  if (page === 'dashboard') initDashboard();
  else if (page === 'cadastro') initCadastro();
  else if (page === 'relatorios') initRelatorios();

  _currentPage = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════
   BOOTSTRAP
   Funciona tanto quando carregado via <script> síncrono
   quanto via injeção dinâmica pelo api-bridge.js (após DOMContentLoaded).
══════════════════════════════ */
function _boot() {
  PAGES = {
    dashboard: document.getElementById('page-dashboard'),
    cadastro: document.getElementById('page-cadastro'),
    relatorios: document.getElementById('page-relatorios')
  };
  initNavbar();
  initModal();
  var hash = window.location.hash.replace('#', '') || 'dashboard';
  navigateTo(hash);
  window.addEventListener('hashchange', function () {
    navigateTo(window.location.hash.replace('#', '') || 'dashboard');
  });
}

// Se o DOM já estiver pronto (carregamento dinâmico pelo bridge), executa agora.
// Caso contrário, espera o DOMContentLoaded.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _boot);
} else {
  _boot();
}
