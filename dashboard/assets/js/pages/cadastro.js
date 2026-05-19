/**
 * ============================================================
 * GRUPO PARTILHAR — Página: Cadastro de Doador (Admin)
 * ============================================================
 */

'use strict';

import { apiCreateDonor } from '../api/api.js';
import { showToast } from '../components/toast.js';

let _navigateTo = null;

/**
 * Inicializa a página de cadastro.
 * @param {Function} navigateTo
 */
export function initCadastro(navigateTo) {
  _navigateTo = navigateTo;
  _bindEvents();
}

// ── Eventos ───────────────────────────────────────────────────
function _bindEvents() {
  // Botão voltar
  document.getElementById('btn-back').addEventListener('click', () => {
    _navigateTo('dashboard');
  });

  // Máscara de CPF
  const cpfInput = document.getElementById('cpf');
  if (cpfInput) {
    cpfInput.addEventListener('input', () => {
      cpfInput.value = _maskCPF(cpfInput.value);
    });
  }

  // Máscara de telefone
  const telInput = document.getElementById('telefone');
  if (telInput) {
    telInput.addEventListener('input', () => {
      telInput.value = _maskPhone(telInput.value);
    });
  }

  // Desabilitar valor estimado quando tipo = alimentos
  document.querySelectorAll('input[name="tipoDoacao"]').forEach(radio => {
    radio.addEventListener('change', _handleTipoDoacaoChange);
  });
  // Aplica o estado inicial (padrão é "dinheiro", mas garante consistência)
  _handleTipoDoacaoChange();

  // Máscara de CEP
  const cepInput = document.getElementById('cep');
  if (cepInput) {
    cepInput.addEventListener('input', () => {
      cepInput.value = _maskCEP(cepInput.value);
    });
  }

  // Submit
  const form = document.getElementById('form-cadastro');
  form.addEventListener('submit', handleSubmit);

  // Reset — após limpar o formulário, reavalia o estado do campo valorEstimado
  document.getElementById('btn-reset').addEventListener('click', () => {
    form.reset();
    _clearErrors();
    // O reset restaura o radio padrão; recalcula disabled/enabled do campo valor
    _handleTipoDoacaoChange();
  });
}

// ── Handle Submit ─────────────────────────────────────────────
/**
 * Processa o envio do formulário.
 *   PONTO DE INTEGRAÇÃO: a chamada apiCreateDonor() em api/api.js
 * deve ser substituída pelo fetch() ao Google Sheets quando o backend estiver pronto.
 *
 * @param {Event} e
 */
async function handleSubmit(e) {
  e.preventDefault();

  _clearErrors();

  const data = _collectFormData();
  const errors = _validate(data);

  if (Object.keys(errors).length > 0) {
    _showErrors(errors);
    showToast('Por favor, corrija os campos destacados.', 'error');
    return;
  }

  // Desabilitar botão durante envio
  const btnSubmit = document.getElementById('btn-submit');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '<div class="spinner"></div> Salvando...';

  try {
    //  PONTO DE INTEGRAÇÃO: apiCreateDonor envia dados para o backend
    const created = await apiCreateDonor(data);

    console.log('[Cadastro] Doador criado:', created);

    showToast(`${created.nome} cadastrado com sucesso! `, 'success');

    // Limpa formulário e vai para dashboard
    document.getElementById('form-cadastro').reset();
    setTimeout(() => _navigateTo('dashboard'), 1500);

  } catch (err) {
    console.error('[Cadastro] Erro ao salvar:', err);
    showToast('Erro ao salvar doador. Tente novamente.', 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = ' Salvar Doador';
  }
}

// ── Coleta dados do formulário ────────────────────────────────
function _collectFormData() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const tipoDoacao = document.querySelector('input[name="tipoDoacao"]:checked')?.value || 'dinheiro';

  return {
    nome:           get('nome'),
    email:          get('email'),
    telefone:       get('telefone'),
    cpf:            get('cpf'),
    endereco:       get('endereco'),
    cidade:         get('cidade'),
    estado:         get('estado'),
    cep:            get('cep'),
    tipoDoacao,
    freqDoacao:     get('freqDoacao'),
    compromisso:    get('compromisso'),
    valorEstimado:  tipoDoacao === 'alimentos' ? 0 : (parseFloat(get('valorEstimado')) || 0),
    status:         'pendente',
  };
}

// ── Controle do campo valor por tipo de doação ────────────────
function _handleTipoDoacaoChange() {
  const selecionado = document.querySelector('input[name="tipoDoacao"]:checked')?.value;
  const valorInput  = document.getElementById('valorEstimado');
  const valorGroup  = valorInput?.closest('.form-group');

  if (!valorInput) return;

  if (selecionado === 'alimentos') {
    valorInput.value    = '';
    valorInput.disabled = true;
    valorInput.placeholder = 'Não aplicável para alimentos';
    if (valorGroup) valorGroup.style.opacity = '0.45';
  } else {
    valorInput.disabled = false;
    valorInput.placeholder = '0,00';
    if (valorGroup) valorGroup.style.opacity = '1';
  }
}

// ── Validação ─────────────────────────────────────────────────
function _validate(data) {
  const errors = {};

  if (!data.nome || data.nome.length < 3)
    errors.nome = 'Nome deve ter pelo menos 3 caracteres.';

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = 'E-mail inválido.';

  if (!data.telefone || data.telefone.replace(/\D/g, '').length < 10)
    errors.telefone = 'Telefone inválido.';

  if (!data.freqDoacao)
    errors.freqDoacao = 'Selecione a frequência de doação.';

  if (!data.compromisso)
    errors.compromisso = 'Selecione o tempo de compromisso.';

  if (data.tipoDoacao === 'alimentos' && data.valorEstimado > 0)
    errors.valorEstimado = 'Doação de alimentos não permite valor em dinheiro.';

  return errors;
}

function _showErrors(errors) {
  Object.entries(errors).forEach(([field, msg]) => {
    const input = document.getElementById(field);
    const error = document.getElementById(`error-${field}`);
    if (input) input.classList.add('error');
    if (error) {
      error.textContent = msg;
      error.classList.add('visible');
    }
  });
}

function _clearErrors() {
  document.querySelectorAll('.form-input.error, .form-select.error').forEach(el => {
    el.classList.remove('error');
  });
  document.querySelectorAll('.form-error.visible').forEach(el => {
    el.classList.remove('visible');
  });
}

// ── Máscaras ──────────────────────────────────────────────────
function _maskCPF(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .slice(0, 14);
}

function _maskPhone(v) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

function _maskCEP(v) {
  return v.replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 9);
}
