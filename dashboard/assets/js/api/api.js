/**
 * ============================================================
 * GRUPO PARTILHAR — Camada de API
 *
 * Este arquivo é o ÚNICO ponto de integração com o backend.
 *
 * MODO OFFLINE (USE_MOCK = true):
 *   Usa window.Partilhar._donors (mockData.js, script clássico).
 *   Nenhuma requisição de rede é feita.
 *
 * MODO REAL (USE_MOCK = false):
 *   Envia requisições REST para o backend Node.js local.
 *   Certifique-se de que o backend esteja rodando:
 *     cd backend && npm run dev
 * ============================================================
 */

'use strict';

// ── Configuração ──────────────────────────────────────────────
// URL base do backend Node.js/Express.
// Em produção, troque pelo domínio do servidor deployado.
const API_BASE_URL = 'https://site-back-jqih.onrender.com';

// true  → usa mockData.js (sem backend, sem internet)
// false → usa o backend Node.js real
const USE_MOCK = false;

// ─────────────────────────────────────────────────────────────
//  Helpers de mock (acessam window.Partilhar definido em mockData.js)
// ─────────────────────────────────────────────────────────────

function _mockGetAll() {
  return (window.Partilhar && window.Partilhar._donors)
    ? window.Partilhar._donors.slice()
    : [];
}

function _mockGetById(id) {
  return _mockGetAll().find(d => String(d.id) === String(id)) || null;
}

function _mockAdd(data) {
  const p = window.Partilhar;
  const donor = Object.assign({}, data, {
    id: String(p._nextId++),
    status: data.status || 'pendente',   // novo doador começa como pendente
    dataCadastro: new Date().toISOString(),
    dataProximaDoa: data.freqDoacao === 'mensal'
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    totalDoado: 0,
  });
  p._donors.push(donor);
  return donor;
}

function _mockUpdate(id, data) {
  const p = window.Partilhar;
  const idx = p._donors.findIndex(d => String(d.id) === String(id));
  if (idx === -1) return null;
  p._donors[idx] = Object.assign({}, p._donors[idx], data);
  return p._donors[idx];
}

function _mockDelete(id) {
  const p = window.Partilhar;
  const prev = p._donors.length;
  p._donors = p._donors.filter(d => String(d.id) !== String(id));
  return p._donors.length < prev;
}

// ─────────────────────────────────────────────────────────────
//  Helpers de requisição para o backend REST
// ─────────────────────────────────────────────────────────────

/**
 * Faz uma requisição ao backend e retorna o campo `data` da resposta.
 *
 * @param {string} method - Verbo HTTP (GET, POST, PUT, DELETE)
 * @param {string} path   - Rota relativa, ex: '/doadores' ou '/doadores/uuid'
 * @param {object} [body] - Corpo da requisição (para POST/PUT)
 * @returns {Promise<any>} - Conteúdo de `response.data`
 */
async function _request(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE_URL}${path}`, options);

  if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Erro desconhecido no servidor');
  return json.data;
}

// ═════════════════════════════════════════════════════════════
//  DOADORES
// ═════════════════════════════════════════════════════════════

/**
 * Busca todos os doadores.
 * @returns {Promise<Array>}
 */
export async function apiFetchDonors() {
  if (USE_MOCK) return _mockGetAll();
  return _request('GET', '/doadores');
}

/**
 * Busca doador por ID.
 * @param {string} id
 * @returns {Promise<Object|null>}
 */
export async function apiFetchDonorById(id) {
  if (USE_MOCK) return _mockGetById(id);
  // O backend não tem endpoint individual; busca todos e filtra
  const donors = await _request('GET', '/doadores');
  return donors.find(d => d.id === id) || null;
}

/**
 * Cria novo doador.
 * @param {Object} data - Dados do formulário
 * @returns {Promise<Object>}
 */
export async function apiCreateDonor(data) {
  if (USE_MOCK) return _mockAdd(data);
  return _request('POST', '/doadores', data);
}

/**
 * Atualiza doador existente.
 * @param {string} id
 * @param {Object} data
 * @returns {Promise<Object|null>}
 */
export async function apiUpdateDonor(id, data) {
  if (USE_MOCK) return _mockUpdate(id, data);
  return _request('PUT', `/doadores/${id}`, data);
}

/**
 * Exclui doador.
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function apiDeleteDonor(id) {
  if (USE_MOCK) return _mockDelete(id);
  await _request('DELETE', `/doadores/${id}`);
  return true;
}

// ═════════════════════════════════════════════════════════════
//  RELATÓRIOS (lógica client-side — não muda com o backend)
// ═════════════════════════════════════════════════════════════

/**
 * Calcula estatísticas para um período (mês/ano).
 *
 * @param {Array}  donors  - Lista de doadores
 * @param {number} month   - 1-12
 * @param {number} year    - ex: 2026
 * @returns {Object}
 */
export function calcReportStats(donors, month, year) {
  const active   = donors.filter(d => d.status === 'ativo');
  const pending  = donors.filter(d => d.status === 'pendente');
  const inactive = donors.filter(d => d.status === 'inativo');

  const monthDonors = donors.filter(d => {
    if (d.freqDoacao === 'unica') {
      const dt = new Date(d.dataCadastro);
      return dt.getMonth() + 1 === month && dt.getFullYear() === year;
    }
    return d.status === 'ativo' || d.status === 'pendente';
  });

  // Total real arrecadado = soma de totalDoado de todos os doadores
  const totalArrecadado = donors
    .reduce((sum, d) => sum + (d.totalDoado || 0), 0);

  // Previsão mensal = soma de valorEstimado dos ativos no período
  const totalPrevisto = monthDonors
    .filter(d => d.status === 'ativo')
    .reduce((sum, d) => sum + (d.valorEstimado || 0), 0);

  // Doações recebidas = ativos que já têm valor registrado (totalDoado > 0)
  const doacoesRecebidas = active.filter(d => (d.totalDoado || 0) > 0).length;

  const porTipo = {
    dinheiro:  donors.filter(d => d.tipoDoacao === 'dinheiro').length,
    alimentos: donors.filter(d => d.tipoDoacao === 'alimentos').length,
    ambos:     donors.filter(d => d.tipoDoacao === 'ambos').length,
  };

  const top5 = [...donors]
    .sort((a, b) => b.totalDoado - a.totalDoado)
    .slice(0, 5);

  return {
    totalDonors:      donors.length,
    activeDonors:     active.length,
    pendingDonors:    pending.length,
    inactiveDonors:   inactive.length,
    doacoesRecebidas,
    totalArrecadado,
    totalPrevisto,
    porTipo,
    top5,
  };
}

// ═════════════════════════════════════════════════════════════
//  FORMULÁRIO PÚBLICO
// ═════════════════════════════════════════════════════════════

/**
 * Envia inscrição do doador (página pública).
 * @param {Object} data
 * @returns {Promise<{ success: boolean }>}
 */
export async function apiPublicRegister(data) {
  if (USE_MOCK) {
    console.log('[API] apiPublicRegister — mock:', data);
    await new Promise(r => setTimeout(r, 1200));
    return { success: true };
  }
  await _request('POST', '/doadores/publico', data);
  return { success: true };
}
