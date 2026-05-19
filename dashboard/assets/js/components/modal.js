/**
 * ============================================================
 * GRUPO PARTILHAR — Componente: Modal
 * ============================================================
 */

'use strict';

import {
  formatBRL,
  formatDate,
  getInitials,
  TIPO_DOACAO_LABEL,
  COMPROMISSO_LABEL,
  FREQ_LABEL,
  STATUS_LABEL,
} from '../data/mockData.js';

import { apiUpdateDonor, apiDeleteDonor } from '../api/api.js';
import { showToast } from './toast.js';

const overlay = document.getElementById('modal-overlay');
const modalEl  = document.getElementById('modal');

// Fecha ao clicar no overlay
overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal();
});

// Fecha com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

export function closeModal() {
  overlay.classList.remove('open');
}

function openModal() {
  overlay.classList.add('open');
}

/**
 * Abre modal com detalhes do doador.
 * @param {Object}   donor
 * @param {Function} onRefresh — callback para recarregar a listagem
 */
export function openDonorModal(donor, onRefresh) {
  const statusClass = {
    ativo:    'badge--active',
    pendente: 'badge--pending',
    inativo:  'badge--inactive',
  }[donor.status] || 'badge--inactive';

  modalEl.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">Detalhes do Doador</h2>
      <button class="modal-close" id="modal-close-btn" aria-label="Fechar">✕</button>
    </div>

    <div style="display:flex; align-items:center; gap:var(--space-4); margin-bottom:var(--space-6);">
      <div class="donor-info-avatar">${getInitials(donor.nome)}</div>
      <div>
        <div style="font-size:var(--font-size-xl); font-weight:var(--font-weight-bold); color:var(--color-text-dark);">
          ${donor.nome}
        </div>
        <span class="badge ${statusClass}" style="margin-top:var(--space-1);">
          ${STATUS_LABEL[donor.status]}
        </span>
      </div>
    </div>

    <div class="donor-info-grid">
      <div class="donor-info-item">
        <span class="donor-info-item__label"> E-mail</span>
        <span class="donor-info-item__value">${donor.email}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Telefone</span>
        <span class="donor-info-item__value">${donor.telefone}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> CPF</span>
        <span class="donor-info-item__value">${donor.cpf || '—'}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Cidade / UF</span>
        <span class="donor-info-item__value">${donor.cidade ? `${donor.cidade} — ${donor.estado}` : '—'}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Tipo de Doação</span>
        <span class="donor-info-item__value">${TIPO_DOACAO_LABEL[donor.tipoDoacao]}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Frequência</span>
        <span class="donor-info-item__value">${FREQ_LABEL[donor.freqDoacao]}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label">⏱ Compromisso</span>
        <span class="donor-info-item__value">${COMPROMISSO_LABEL[donor.compromisso]}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Valor Estimado</span>
        <span class="donor-info-item__value">${formatBRL(donor.valorEstimado)}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Total Doado</span>
        <span class="donor-info-item__value" style="color:var(--color-green-500); font-weight:var(--font-weight-bold);">
          ${formatBRL(donor.totalDoado)}
        </span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Próxima Doação</span>
        <span class="donor-info-item__value">${formatDate(donor.dataProximaDoa)}</span>
      </div>
      <div class="donor-info-item">
        <span class="donor-info-item__label"> Cadastrado em</span>
        <span class="donor-info-item__value">${formatDate(donor.dataCadastro)}</span>
      </div>
      <div class="donor-info-item" style="grid-column:1/-1;">
        <span class="donor-info-item__label"> Endereço</span>
        <span class="donor-info-item__value">${donor.endereco || '—'} ${donor.cep ? `— CEP: ${donor.cep}` : ''}</span>
      </div>
    </div>

    <div class="modal-footer">
      <button class="btn btn-ghost" id="modal-delete-btn"> Excluir</button>

      ${donor.status !== 'ativo' ? `
        <button class="btn btn-success btn-sm" id="modal-activate-btn"> Marcar como Ativo</button>
      ` : `
        <button class="btn btn-secondary btn-sm" id="modal-deactivate-btn">⏸ Marcar como Pendente</button>
      `}

      <a
        href="https://wa.me/55${donor.telefone.replace(/\D/g, '')}"
        target="_blank"
        rel="noopener"
        class="btn btn-success"
        style="background:var(--gradient-green);"
      >
         WhatsApp
      </a>
    </div>
  `;

  // Fechar
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  // Excluir
  document.getElementById('modal-delete-btn').addEventListener('click', async () => {
    if (!confirm(`Excluir ${donor.nome}?`)) return;
    await apiDeleteDonor(donor.id);
    closeModal();
    showToast(`${donor.nome} removido com sucesso.`, 'success');
    onRefresh();
  });

  // Ativar/Pendente
  const activateBtn    = document.getElementById('modal-activate-btn');
  const deactivateBtn  = document.getElementById('modal-deactivate-btn');

  if (activateBtn) {
    activateBtn.addEventListener('click', async () => {
      await apiUpdateDonor(donor.id, { status: 'ativo' });
      closeModal();
      showToast(`${donor.nome} marcado como Ativo.`, 'success');
      onRefresh();
    });
  }

  if (deactivateBtn) {
    deactivateBtn.addEventListener('click', async () => {
      await apiUpdateDonor(donor.id, { status: 'pendente' });
      closeModal();
      showToast(`${donor.nome} marcado como Pendente.`, 'info');
      onRefresh();
    });
  }

  openModal();
}
