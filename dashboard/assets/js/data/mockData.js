/**
 * ============================================================
 * GRUPO PARTILHAR — Mock Data
 *
 * Dados em memória para demonstração da interface.
 *  INTEGRAÇÃO: substitua por chamadas fetch() em api/api.js
 *
 * Schema do Doador (sem dados sensíveis):
 * {
 *   id              : string
 *   nome            : string
 *   email           : string
 *   telefone        : string   (WhatsApp)
 *   tipoDoacao      : 'dinheiro' | 'alimentos' | 'ambos'
 *   freqDoacao      : 'mensal' | 'unica'
 *   compromisso     : '6meses' | '1ano' | 'indeterminado'
 *   valorEstimado   : number
 *   status          : 'ativo' | 'pendente' | 'inativo'
 *   dataCadastro    : string (ISO 8601)
 *   dataProximaDoa  : string | null
 *   totalDoado      : number
 * }
 * ============================================================
 */

'use strict';

window.Partilhar = window.Partilhar || {};

/* ── Doadores iniciais ───────────────────────────────────── */
window.Partilhar._donors = [
  {
    id: '1', nome: 'Maria Silva Santos',
    email: 'maria.silva@email.com', telefone: '(81) 99999-1111',
    tipoDoacao: 'dinheiro', freqDoacao: 'mensal', compromisso: '1ano',
    valorEstimado: 50, status: 'ativo',
    dataCadastro: '2026-01-10T10:00:00Z',
    dataProximaDoa: '2026-04-14T10:00:00Z', totalDoado: 750,
  },
  {
    id: '2', nome: 'João Pedro Oliveira',
    email: 'joao.pedro@gmail.com', telefone: '(81) 98888-2222',
    tipoDoacao: 'dinheiro', freqDoacao: 'mensal', compromisso: '1ano',
    valorEstimado: 100, status: 'ativo',
    dataCadastro: '2026-01-15T14:00:00Z',
    dataProximaDoa: '2026-03-31T10:00:00Z', totalDoado: 2900,
  },
  {
    id: '3', nome: 'Ana Carolina Ferreira',
    email: 'ana.ferreira@email.com', telefone: '(81) 97777-3333',
    tipoDoacao: 'alimentos', freqDoacao: 'mensal', compromisso: '6meses',
    valorEstimado: 75, status: 'ativo',
    dataCadastro: '2026-02-01T09:00:00Z',
    dataProximaDoa: '2026-03-31T10:00:00Z', totalDoado: 450,
  },
  {
    id: '4', nome: 'Carlos Eduardo Lima',
    email: 'carlos.lima@email.com', telefone: '(81) 96666-4444',
    tipoDoacao: 'dinheiro', freqDoacao: 'mensal', compromisso: 'indeterminado',
    valorEstimado: 150, status: 'pendente',
    dataCadastro: '2026-02-10T11:00:00Z',
    dataProximaDoa: '2026-04-24T10:00:00Z', totalDoado: 1800,
  },
  {
    id: '5', nome: 'Beatriz Almeida Costa',
    email: 'beatriz.costa@email.com', telefone: '(81) 95555-5555',
    tipoDoacao: 'ambos', freqDoacao: 'unica', compromisso: 'indeterminado',
    valorEstimado: 500, status: 'ativo',
    dataCadastro: '2026-03-05T16:00:00Z',
    dataProximaDoa: null, totalDoado: 500,
  },
  {
    id: '6', nome: 'Roberto Mendes Souza',
    email: 'roberto.souza@email.com', telefone: '(81) 94444-6666',
    tipoDoacao: 'alimentos', freqDoacao: 'mensal', compromisso: '1ano',
    valorEstimado: 80, status: 'inativo',
    dataCadastro: '2025-10-01T10:00:00Z',
    dataProximaDoa: null, totalDoado: 640,
  },
];

window.Partilhar._nextId = 7;

/* ── Labels ──────────────────────────────────────────────── */
window.Partilhar.TIPO_LABEL = {
  dinheiro:  ' Dinheiro',
  alimentos: ' Alimentos',
  ambos:     ' Ambos',
};

window.Partilhar.COMP_LABEL = {
  '6meses':        '6 Meses',
  '1ano':          '1 Ano',
  'indeterminado': 'Indeterminado',
};

window.Partilhar.FREQ_LABEL = {
  mensal: 'Mensal',
  unica:  'Única',
};

window.Partilhar.STATUS_LABEL = {
  ativo:    'Ativo',
  pendente: 'Pendente',
  inativo:  'Inativo',
};

window.Partilhar.MONTHS_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

/* ── Helpers ─────────────────────────────────────────────── */
window.Partilhar.formatBRL = function (v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
};

window.Partilhar.formatDate = function (s) {
  if (!s) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(s));
};

window.Partilhar.getInitials = function (nome) {
  return (nome || '').split(' ').slice(0, 2).map(function (n) { return n[0]; }).join('').toUpperCase();
};
