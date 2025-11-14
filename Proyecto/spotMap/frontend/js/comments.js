/**
 * comments.js - Sistema de comentarios en spots
 * Permite a usuarios comentar y ver comentarios
 */

import { showToast } from './notifications.js';
import { getCurrentUser, isAuthenticated } from './auth.js';

// Storage de comentarios (localStorage para demo, luego Supabase)
const COMMENTS_KEY = 'spotmap_comments';

/**
 * Obtener comentarios de un spot
 */
export function getComments(spotId) {
    try {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        return allComments[spotId] || [];
    } catch (error) {
        console.error('[COMMENTS] Error obteniendo comentarios:', error);
        return [];
    }
}

/**
 * Añadir comentario a un spot
 */
export function addComment(spotId, text) {
    if (!isAuthenticated()) {
        showToast('Debes iniciar sesión para comentar', 'warning');
        return null;
    }

    if (!text || !text.trim()) {
        showToast('El comentario no puede estar vacío', 'warning');
        return null;
    }

    const user = getCurrentUser();
    const comment = {
        id: Date.now(),
        spotId,
        userId: user.id,
        userName: user.user_metadata?.full_name || user.email.split('@')[0],
        userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        text: text.trim(),
        likes: 0,
        likedBy: [],
        createdAt: new Date().toISOString(),
        replies: []
    };

    try {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        if (!allComments[spotId]) {
            allComments[spotId] = [];
        }
        allComments[spotId].unshift(comment);
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
        
        showToast('Comentario añadido ✨', 'success', { autoCloseMs: 1500 });
        return comment;
    } catch (error) {
        console.error('[COMMENTS] Error añadiendo comentario:', error);
        showToast('Error al añadir comentario', 'error');
        return null;
    }
}

/**
 * Dar like a un comentario
 */
export function likeComment(spotId, commentId) {
    if (!isAuthenticated()) {
        showToast('Debes iniciar sesión para dar like', 'warning');
        return;
    }

    const user = getCurrentUser();
    
    try {
        const allComments = JSON.parse(localStorage.getItem(COMMENTS_KEY) || '{}');
        const spotComments = allComments[spotId] || [];
        const comment = spotComments.find(c => c.id === commentId);

        if (!comment) return;

        const likedIndex = comment.likedBy.indexOf(user.id);
        if (likedIndex > -1) {
            comment.likedBy.splice(likedIndex, 1);
            comment.likes--;
        } else {
            comment.likedBy.push(user.id);
            comment.likes++;
        }

        localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
        return comment;
    } catch (error) {
        console.error('[COMMENTS] Error dando like:', error);
    }
}

/**
 * Renderizar lista de comentarios
 */
export function renderComments(spotId) {
    const comments = getComments(spotId);
    
    if (comments.length === 0) {
        return '<p class="text-muted text-center py-4">No hay comentarios aún. ¡Sé el primero!</p>';
    }

    return comments.map(comment => renderComment(comment)).join('');
}

/**
 * Renderizar un comentario individual
 */
function renderComment(comment) {
    const timeAgo = getTimeAgo(comment.createdAt);
    const user = getCurrentUser();
    const isLiked = user && comment.likedBy.includes(user.id);
    
    return `
        <div class="comment-item" data-comment-id="${comment.id}">
            <img src="${comment.userAvatar}" alt="${comment.userName}" class="comment-avatar">
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(comment.userName)}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <p class="comment-text">${escapeHtml(comment.text)}</p>
                <div class="comment-actions">
                    <button class="comment-action ${isLiked ? 'liked' : ''}" onclick="window.likeCommentUI(${comment.spotId}, ${comment.id})">
                        <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i>
                        <span>${comment.likes || 0}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Calcular tiempo relativo
 */
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString();
}

/**
 * Escape HTML para prevenir XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Abrir modal de detalles de spot con comentarios
 */
export function openSpotDetailsModal(spot) {
    const comments = renderComments(spot.id);
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'modalSpotDetails';
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${escapeHtml(spot.title)}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${spot.image_path ? `<img src="${spot.image_path}" alt="${escapeHtml(spot.title)}" class="spot-detail-image">` : ''}
                    
                    <div class="spot-detail-info">
                        <p class="spot-detail-description">${escapeHtml(spot.description || 'Sin descripción')}</p>
                        <div class="spot-detail-meta">
                            <span><i class="bi bi-geo-alt-fill"></i> ${spot.lat.toFixed(5)}, ${spot.lng.toFixed(5)}</span>
                            ${spot.category ? `<span class="badge">${escapeHtml(spot.category)}</span>` : ''}
                        </div>
                    </div>

                    <hr class="my-4">

                    <div class="comments-section">
                        <h6 class="mb-3">💬 Comentarios (${getComments(spot.id).length})</h6>
                        
                        ${isAuthenticated() ? `
                        <div class="comment-form mb-4">
                            <textarea 
                                id="comment-input-${spot.id}" 
                                class="form-control comment-input" 
                                placeholder="Escribe un comentario..." 
                                rows="3"
                            ></textarea>
                            <button class="btn btn-primary btn-sm mt-2" onclick="window.submitComment(${spot.id})">
                                Publicar comentario
                            </button>
                        </div>
                        ` : `
                        <div class="alert alert-info">
                            <a href="#" data-bs-toggle="modal" data-bs-target="#modalLogin">Inicia sesión</a> para comentar
                        </div>
                        `}

                        <div class="comments-list" id="comments-list-${spot.id}">
                            ${comments}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

/**
 * UI: Submit comment
 */
window.submitComment = function(spotId) {
    const input = document.getElementById(`comment-input-${spotId}`);
    const text = input.value.trim();

    if (!text) {
        showToast('Escribe algo antes de publicar', 'warning');
        return;
    }

    const comment = addComment(spotId, text);
    
    if (comment) {
        input.value = '';
        const commentsList = document.getElementById(`comments-list-${spotId}`);
        const comments = renderComments(spotId);
        commentsList.innerHTML = comments;
    }
};

/**
 * UI: Like comment
 */
window.likeCommentUI = function(spotId, commentId) {
    const comment = likeComment(spotId, commentId);
    if (comment) {
        const commentsList = document.getElementById(`comments-list-${spotId}`);
        const comments = renderComments(spotId);
        commentsList.innerHTML = comments;
    }
};
