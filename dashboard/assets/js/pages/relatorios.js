/**
 * ============================================================
 * GRUPO PARTILHAR — Página: Relatórios
 * ============================================================
 */

'use strict';

import { apiFetchDonors, calcReportStats } from '../api/api.js';
import { formatBRL, formatDate } from '../data/mockData.js';
import { renderStatusChart, renderTipoChart, renderTopChart } from '../components/charts.js';

const MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

let _donors = [];

/**
 * Inicializa a página de relatórios.
 */
export async function initRelatorios() {
  _donors = await apiFetchDonors();

  // Inicializa seletor com mês atual
  const now    = new Date();
  const picker = document.getElementById('month-picker');
  picker.value = _toMonthValue(now.getFullYear(), now.getMonth() + 1);

  _updateReport();
  _bindEvents();
}

// ── Eventos ───────────────────────────────────────────────────
function _bindEvents() {
  document.getElementById('month-picker').addEventListener('change', _updateReport);
  document.getElementById('btn-export').addEventListener('click', _exportCSV);
}

// ── Atualiza relatório ────────────────────────────────────────
function _updateReport() {
  const { month, year } = _getSelectedPeriod();
  const stats = calcReportStats(_donors, month, year);

  // Cards
  document.getElementById('rel-total').textContent  = stats.totalDonors;
  document.getElementById('rel-recebidas').textContent = stats.doacoesRecebidas;
  document.getElementById('rel-valor').textContent   = formatBRL(stats.totalArrecadado);
  document.getElementById('rel-pendentes').textContent = stats.pendingDonors;
  document.getElementById('rel-period').textContent  = `${MONTHS_PT[month - 1]} de ${year}`;

  // Gráficos
  renderStatusChart(stats);
  renderTipoChart(stats);
  renderTopChart(stats.top5);

  // Top 5 tabela
  _renderTop5Table(stats.top5);
}

// ── Top 5 tabela ──────────────────────────────────────────────
function _renderTop5Table(top5) {
  const tbody = document.getElementById('top5-tbody');
  if (!tbody) return;

  tbody.innerHTML = top5.map((d, i) => {
    const rankClass = i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : 'rank-other';
    const medal = `${i + 1}º`;
    return `
      <tr>
        <td>
          <div class="rank-badge ${rankClass}" style="display:inline-flex;">${medal}</div>
        </td>
        <td style="font-weight:600; color:var(--color-text-dark);">${d.nome}</td>
        <td>${d.cidade || '—'}</td>
        <td>${{dinheiro:' Dinheiro', alimentos:' Alimentos', ambos:' Ambos'}[d.tipoDoacao]}</td>
        <td style="font-weight:700; color:var(--color-pink-500);">${formatBRL(d.totalDoado)}</td>
        <td><span class="badge ${{ativo:'badge--active',pendente:'badge--pending',inativo:'badge--inactive'}[d.status]}">${{ativo:'Ativo',pendente:'Pendente',inativo:'Inativo'}[d.status]}</span></td>
      </tr>
    `;
  }).join('');
}

// ── Exportar CSV ──────────────────────────────────────────────
function _exportCSV() {
  const { month, year } = _getSelectedPeriod();

  const headers = ['Nome','Email','Telefone','Tipo','Frequência','Compromisso','Valor Estimado','Total Doado','Status','Próxima Doação'];

  const rows = _donors.map(d => [
    d.nome,
    d.email,
    d.telefone,
    d.tipoDoacao,
    d.freqDoacao,
    d.compromisso,
    d.valorEstimado,
    d.totalDoado,
    d.status,
    formatDate(d.dataProximaDoa),
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `partilhar_relatorio_${year}_${String(month).padStart(2, '0')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Helpers ───────────────────────────────────────────────────
function _getSelectedPeriod() {
  const val = document.getElementById('month-picker').value; // "YYYY-MM"
  const [year, month] = val.split('-').map(Number);
  return { month, year };
}

function _toMonthValue(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}
