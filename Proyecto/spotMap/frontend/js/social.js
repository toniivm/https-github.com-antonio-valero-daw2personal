/**
 * social.js - Sistema de interacciones sociales
 * Favoritos, likes, compartir en redes sociales
 */

import { showToast } from './notifications.js';
import { getCurrentUser, isAuthenticated } from './auth.js';

// Storage de favoritos (localStorage para demo, luego Supabase)
const FAVORITES_KEY = 'spotmap_favorites';

/**
 * Inicializar sistema social
 */
export function initSocial() {
    console.log('[SOCIAL] Inicializando sistema social...');
    setupSocialListeners();
    console.log('[SOCIAL] ✓ Sistema social inicializado');
}

/**
 * Setup listeners para acciones sociales
 */
function setupSocialListeners() {
    // Los listeners se añaden dinámicamente a cada card
    document.addEventListener('click', (e) => {
        // Like button
        if (e.target.closest('.btn-like')) {
            e.stopPropagation();
            const btn = e.target.closest('.btn-like');
            const spotId = parseInt(btn.dataset.spotId);
            toggleLike(spotId, btn);
        }

        // Share button
        if (e.target.closest('.btn-share')) {
            e.stopPropagation();
            const btn = e.target.closest('.btn-share');
            const spotId = parseInt(btn.dataset.spotId);
            openShareModal(spotId);
        }
    });
}

/**
 * Toggle like en un spot
 */
export function toggleLike(spotId, buttonElement) {
    if (!isAuthenticated()) {
        showToast('Debes iniciar sesión para dar like', 'warning');
        return;
    }

    const favorites = getFavorites();
    const index = favorites.indexOf(spotId);
    
    if (index > -1) {
        // Ya está en favoritos, quitarlo
        favorites.splice(index, 1);
        updateLikeButton(buttonElement, false);
        showToast('Eliminado de favoritos', 'info', { autoCloseMs: 1500 });
    } else {
        // Añadir a favoritos
        favorites.push(spotId);
        updateLikeButton(buttonElement, true);
        showToast('Añadido a favoritos ⭐', 'success', { autoCloseMs: 1500 });
    }

    saveFavorites(favorites);
    updateFavoritesCount();
}

/**
 * Actualizar botón de like
 */
function updateLikeButton(button, isLiked) {
    if (!button) return;

    const icon = button.querySelector('.like-icon');
    if (icon) {
        icon.textContent = isLiked ? '❤️' : '🤍';
    }
    button.classList.toggle('liked', isLiked);
}

/**
 * Verificar si un spot está en favoritos
 */
export function isSpotLiked(spotId) {
    const favorites = getFavorites();
    return favorites.includes(spotId);
}

/**
 * Obtener favoritos del localStorage
 */
function getFavorites() {
    const user = getCurrentUser();
    const key = user ? `${FAVORITES_KEY}_${user.id}` : FAVORITES_KEY;
    
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('[SOCIAL] Error obteniendo favoritos:', error);
        return [];
    }
}

/**
 * Guardar favoritos en localStorage
 */
function saveFavorites(favorites) {
    const user = getCurrentUser();
    const key = user ? `${FAVORITES_KEY}_${user.id}` : FAVORITES_KEY;
    
    try {
        localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
        console.error('[SOCIAL] Error guardando favoritos:', error);
    }
}

/**
 * Obtener spots favoritos
 */
export function getFavoriteSpots() {
    return getFavorites();
}

/**
 * Actualizar contador de favoritos
 */
function updateFavoritesCount() {
    const favorites = getFavorites();
    // Aquí podrías actualizar un badge en el UI
    console.log(`[SOCIAL] Favoritos: ${favorites.length}`);
}

/**
 * Abrir modal de compartir
 */
export function openShareModal(spotId) {
    const spot = window.currentSpots?.find(s => s.id === spotId);
    
    if (!spot) {
        showToast('Error al cargar el spot', 'error');
        return;
    }

    const url = `${window.location.origin}${window.location.pathname}?spot=${spotId}`;
    const title = `¡Mira este lugar: ${spot.title}!`;
    const description = spot.description || 'Descubre este increíble lugar en SpotMap';

    // Crear modal dinámico
    showShareOptions(spot, url, title, description);
}

/**
 * Mostrar opciones de compartir
 */
function showShareOptions(spot, url, title, description) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalShare';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">🔗 Compartir "${spot.title}"</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="share-buttons">
                        <button class="share-btn share-whatsapp" data-url="${encodeURIComponent(url)}" data-text="${encodeURIComponent(title)}">
                            <i class="bi bi-whatsapp"></i>
                            <span>WhatsApp</span>
                        </button>
                        <button class="share-btn share-twitter" data-url="${encodeURIComponent(url)}" data-text="${encodeURIComponent(title)}">
                            <i class="bi bi-twitter-x"></i>
                            <span>Twitter</span>
                        </button>
                        <button class="share-btn share-facebook" data-url="${encodeURIComponent(url)}">
                            <i class="bi bi-facebook"></i>
                            <span>Facebook</span>
                        </button>
                        <button class="share-btn share-telegram" data-url="${encodeURIComponent(url)}" data-text="${encodeURIComponent(title)}">
                            <i class="bi bi-telegram"></i>
                            <span>Telegram</span>
                        </button>
                        <button class="share-btn share-email" data-url="${encodeURIComponent(url)}" data-subject="${encodeURIComponent(title)}" data-body="${encodeURIComponent(description)}">
                            <i class="bi bi-envelope"></i>
                            <span>Email</span>
                        </button>
                        <button class="share-btn share-copy" data-url="${url}">
                            <i class="bi bi-clipboard"></i>
                            <span>Copiar link</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup share button handlers
    modal.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleShare(e.target.closest('.share-btn'));
        });
    });

    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // Remove modal from DOM when hidden
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

/**
 * Manejar acción de compartir
 */
function handleShare(button) {
    const type = button.classList.contains('share-whatsapp') ? 'whatsapp' :
                 button.classList.contains('share-twitter') ? 'twitter' :
                 button.classList.contains('share-facebook') ? 'facebook' :
                 button.classList.contains('share-telegram') ? 'telegram' :
                 button.classList.contains('share-email') ? 'email' :
                 'copy';

    const url = decodeURIComponent(button.dataset.url);
    const text = decodeURIComponent(button.dataset.text || '');
    const subject = decodeURIComponent(button.dataset.subject || '');
    const body = decodeURIComponent(button.dataset.body || '');

    switch (type) {
        case 'whatsapp':
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
            break;
        case 'twitter':
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
            break;
        case 'telegram':
            window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
            break;
        case 'email':
            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n' + url)}`;
            break;
        case 'copy':
            copyToClipboard(url);
            break;
    }

    showToast('¡Compartido!', 'success', { autoCloseMs: 1500 });
}

/**
 * Copiar al portapapeles
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
            showToast('Link copiado al portapapeles', 'success', { autoCloseMs: 2000 });
        } else {
            // Fallback para navegadores antiguos
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('Link copiado', 'success', { autoCloseMs: 2000 });
        }
    } catch (error) {
        console.error('[SOCIAL] Error copiando al portapapeles:', error);
        showToast('Error al copiar', 'error');
    }
}

/**
 * Generar botones sociales para una card
 */
export function getSocialButtons(spotId) {
    const isLiked = isSpotLiked(spotId);
    
    return `
        <div class="social-buttons">
            <button class="btn-social btn-like ${isLiked ? 'liked' : ''}" data-spot-id="${spotId}" title="Me gusta">
                <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
            </button>
            <button class="btn-social btn-share" data-spot-id="${spotId}" title="Compartir">
                <i class="bi bi-share"></i>
            </button>
        </div>
    `;
}
