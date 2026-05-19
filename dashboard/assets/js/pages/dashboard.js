/**
 * ============================================================
 * GRUPO PARTILHAR — Página: Dashboard
 * ============================================================
 */

'use strict';

import { apiFetchDonors } from '../api/api.js';
import {
  formatBRL,
  formatDate,
  getInitials,
  TIPO_DOACAO_LABEL,
  FREQ_LABEL,
} from '../data/mockData.js';
import { openDonorModal } from '../components/modal.js';

let _donors     = [];
let _filter     = 'todos';
let _search     = '';
let _navigateTo = null;

/**
 * Inicializa a página do Dashboard.
 * @param {Function} navigateTo
 */
export async function initDashboard(navigateTo) {
  _navigateTo = navigateTo;
  await _loadDonors();
  _renderStats();
  _renderTable();
  _bindEvents();
}

// ── Carrega / recarrega doadores ──────────────────────────────
async function _loadDonors() {
  _donors = await apiFetchDonors();
}

// ── Estatísticas ──────────────────────────────────────────────
function _renderStats() {
  const total    = _donors.length;
  const ativos   = _donors.filter(d => d.status === 'ativo').length;
  const pendentes = _donors.filter(d => d.status === 'pendente').length;
  const totalVal = _donors
    .filter(d => d.status === 'ativo')
    .reduce((s, d) => s + d.valorEstimado, 0);

  _set('stat-total',    total);
  _set('stat-ativos',   ativos);
  _set('stat-pendentes', pendentes);
  _set('stat-valor',    formatBRL(totalVal));
}

// ── Filtragem ─────────────────────────────────────────────────
function _filtered() {
  return _donors.filter(d => {
    const matchStatus = _filter === 'todos' || d.status === _filter;
    const q = _search.toLowerCase();
    const matchSearch = !q
      || d.nome.toLowerCase().includes(q)
      || d.email.toLowerCase().includes(q)
      || d.telefone.includes(q);
    return matchStatus && matchSearch;
  });
}

// ── Tabela ────────────────────────────────────────────────────
function _renderTable() {
  const tbody  = document.getElementById('donors-tbody');
  const empty  = document.getElementById('donors-empty');
  const donors = _filtered();

  if (donors.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');

  tbody.innerHTML = donors.map(d => {
    const initials = getInitials(d.nome);
    const statusClass = {
      ativo:    'badge--active',
      pendente: 'badge--pending',
      inativo:  'badge--inactive',
    }[d.status] || '';

    const tipoBadgeClass = {
      dinheiro:  'badge--money',
      alimentos: 'badge--food',
      ambos:     'badge--both',
    }[d.tipoDoacao] || '';

    const tipoLabel = {
      dinheiro:  'Dinheiro',
      alimentos: 'Alimentos',
      ambos:     'Ambos',
    }[d.tipoDoacao] || d.tipoDoacao;

    const waNumber = '55' + d.telefone.replace(/\D/g, '');

    return `
      <tr data-id="${d.id}">
        <td>
          <div class="donor-cell">
            <div class="donor-avatar-sm">${initials}</div>
            <div>
              <div class="donor-name">${d.nome}</div>
              <div class="donor-city">${d.cidade ? `${d.cidade} — ${d.estado}` : ''}</div>
            </div>
          </div>
        </td>
        <td class="col-hide-mobile">
          <div class="contact-cell">
            <span class="contact-cell__phone">${d.telefone}</span>
            <span class="contact-cell__email">${d.email}</span>
          </div>
        </td>
        <td class="col-hide-mobile">
          <span class="badge ${tipoBadgeClass}">${tipoLabel}</span>
        </td>
        <td>
          <div class="value-cell">
            <div class="value-cell__main">${formatBRL(d.valorEstimado)}/${FREQ_LABEL[d.freqDoacao] === 'Mensal' ? 'mês' : 'vez'}</div>
            <div class="value-cell__total">Total: ${formatBRL(d.totalDoado)}</div>
          </div>
        </td>
        <td>
          <span class="badge ${statusClass}">${{ativo:'Ativo',pendente:'Pendente',inativo:'Inativo'}[d.status]}</span>
        </td>
        <td class="col-hide-mobile">${formatDate(d.dataProximaDoa)}</td>
        <td>
          <div class="actions-cell">
            <button class="btn-icon btn-view" data-id="${d.id}" title="Ver detalhes" aria-label="Ver detalhes de ${d.nome}"></button>
            <a
              href="https://wa.me/${waNumber}"
              target="_blank"
              rel="noopener"
              class="btn-icon btn-whatsapp"
              title="Contato WhatsApp"
              aria-label="WhatsApp ${d.nome}"
            ></a>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Evento de clique nos botões de visualizar
  tbody.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const donor = _donors.find(d => d.id === btn.dataset.id);
      if (donor) openDonorModal(donor, _refresh);
    });
  });
}

// ── Refresh ───────────────────────────────────────────────────
async function _refresh() {
  await _loadDonors();
  _renderStats();
  _renderTable();
}

// ── Eventos ───────────────────────────────────────────────────
function _bindEvents() {
  // Busca
  document.getElementById('search-input').addEventListener('input', e => {
    _search = e.target.value;
    _renderTable();
  });

  // Filtro de status
  document.getElementById('filter-status').addEventListener('change', e => {
    _filter = e.target.value;
    _renderTable();
  });

  // Botão novo doador
  document.getElementById('btn-new-donor').addEventListener('click', () => {
    _navigateTo('cadastro');
  });
}

// ── Helper ────────────────────────────────────────────────────
function _set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
