/**
 * ============================================================
 * GRUPO PARTILHAR — Componente: Charts (Chart.js wrappers)
 * ============================================================
 */

'use strict';

// Instâncias dos gráficos (para destruir antes de recriar)
let donutStatusChart  = null;
let donutTipoChart    = null;
let barTopChart       = null;

const COLORS = {
  pink:    '#ec4899',
  green:   '#22c55e',
  blue:    '#3b82f6',
  amber:   '#f59e0b',
  gray:    '#94a3b8',
  pink2:   '#f472b6',
  green2:  '#4ade80',
};

const BASE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Usamos legend customizada
    },
  },
};

/**
 * Renderiza gráfico de pizza: Doadores por Status.
 * @param {Object} stats  — Resultado de calcReportStats()
 */
export function renderStatusChart(stats) {
  const ctx = document.getElementById('chart-status')?.getContext('2d');
  if (!ctx) return;

  if (donutStatusChart) donutStatusChart.destroy();

  donutStatusChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Ativos', 'Pendentes', 'Inativos'],
      datasets: [{
        data: [stats.activeDonors, stats.pendingDonors, stats.inactiveDonors],
        backgroundColor: [COLORS.green, COLORS.amber, COLORS.gray],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      ...BASE_OPTIONS,
      cutout: '65%',
      plugins: {
        ...BASE_OPTIONS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });

  // Legend customizada
  _renderLegend('legend-status', [
    { label: `Ativos: ${stats.activeDonors}`,   color: COLORS.green },
    { label: `Pendentes: ${stats.pendingDonors}`, color: COLORS.amber },
    { label: `Inativos: ${stats.inactiveDonors}`, color: COLORS.gray },
  ]);
}

/**
 * Renderiza gráfico de pizza: Tipo de Doação.
 * @param {Object} stats
 */
export function renderTipoChart(stats) {
  const ctx = document.getElementById('chart-tipo')?.getContext('2d');
  if (!ctx) return;

  if (donutTipoChart) donutTipoChart.destroy();

  donutTipoChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Dinheiro', 'Alimentos', 'Ambos'],
      datasets: [{
        data: [stats.porTipo.dinheiro, stats.porTipo.alimentos, stats.porTipo.ambos],
        backgroundColor: [COLORS.pink, COLORS.blue, COLORS.green],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      ...BASE_OPTIONS,
      cutout: '65%',
      plugins: {
        ...BASE_OPTIONS.plugins,
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
          },
        },
      },
    },
  });

  _renderLegend('legend-tipo', [
    { label: `Dinheiro: ${stats.porTipo.dinheiro}`,   color: COLORS.pink },
    { label: `Alimentos: ${stats.porTipo.alimentos}`, color: COLORS.blue },
    { label: `Ambos: ${stats.porTipo.ambos}`,         color: COLORS.green },
  ]);
}

/**
 * Renderiza gráfico de barras: Top 5 Doadores.
 * @param {Array} top5  — Array de objetos doador
 */
export function renderTopChart(top5) {
  const ctx = document.getElementById('chart-top')?.getContext('2d');
  if (!ctx) return;

  if (barTopChart) barTopChart.destroy();

  const labels = top5.map(d => d.nome.split(' ')[0]);
  const data   = top5.map(d => d.totalDoado);
  const bgs    = [COLORS.pink, COLORS.pink2, COLORS.green, COLORS.blue, COLORS.amber];

  barTopChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Total Doado (R$)',
        data,
        backgroundColor: bgs,
        borderRadius: 8,
        borderSkipped: false,
      }],
    },
    options: {
      ...BASE_OPTIONS,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#9090b0', font: { family: 'Inter', size: 12 } },
        },
        y: {
          grid: { color: '#f0eef8' },
          ticks: {
            color: '#9090b0',
            font: { family: 'Inter', size: 11 },
            callback: v => `R$ ${v.toLocaleString('pt-BR')}`,
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          },
        },
      },
    },
  });
}

// ── Helper: Legend customizada ────────────────────────────────
function _renderLegend(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = items.map(item => `
    <div class="legend-item">
      <span class="legend-dot" style="background:${item.color};"></span>
      <span>${item.label}</span>
    </div>
  `).join('');
}
