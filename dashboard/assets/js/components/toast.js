/**
 * ============================================================
 * GRUPO PARTILHAR — Componente: Toast Notifications
 * ============================================================
 */

'use strict';

const DURATION = 3500;

/**
 * Exibe uma notificação toast.
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const icons = { success: '', error: '', info: '' };
  const icon  = icons[type] || '';

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 320);
  }, DURATION);
}
