// notifications.js - Centralized toast/alert system
// Provides showToast(message, type) for consistent user feedback.

const LEVEL_MAP = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  info: 'info'
};

export function showToast(message, type = 'info', { autoCloseMs = 4000 } = {}) {
  const level = LEVEL_MAP[type] || 'info';
  ensureContainer();
  const wrapper = document.getElementById('toast-container');

  const div = document.createElement('div');
  div.className = `alert alert-${level} alert-dismissible fade show shadow-sm`; 
  div.setAttribute('role', 'alert');
  div.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
  `;
  wrapper.appendChild(div);

  if (autoCloseMs > 0) {
    setTimeout(() => {
      div.classList.remove('show');
      div.addEventListener('transitionend', () => div.remove());
      div.remove();
    }, autoCloseMs);
  }
}

function ensureContainer() {
  if (!document.getElementById('toast-container')) {
    const c = document.createElement('div');
    c.id = 'toast-container';
    c.style.position = 'fixed';
    c.style.top = '1rem';
    c.style.right = '1rem';
    c.style.zIndex = '2000';
    c.style.width = '320px';
    c.style.maxWidth = '90vw';
    c.setAttribute('aria-live', 'polite');
    c.setAttribute('aria-atomic', 'false');
    document.body.appendChild(c);
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}
