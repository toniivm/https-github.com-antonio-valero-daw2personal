/**
 * comments.js - Sistema de comentarios en spots
 * Permite a usuarios comentar y ver comentarios
 */

import { showToast } from './notifications.js';
import { getCurrentUser, isAuthenticated } from './auth.js';
import { updateSpot } from './spots.js';

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
    const commentCount = getComments(spot.id).length;
    
    // Validar datos del spot
    const rawTitle = spot.title || 'Sin título';
    const rawDescription = spot.description || 'Sin descripción';
    const rawCategory = spot.category || '';
    const rawTags = Array.isArray(spot.tags)
        ? spot.tags.join(', ')
        : (typeof spot.tags === 'string' ? spot.tags : '');

    const title = escapeHtml(rawTitle);
    const description = escapeHtml(rawDescription);
    const category = rawCategory ? escapeHtml(rawCategory) : 'Sin categoría';
    const lat = (spot.lat || 0).toFixed(5);
    const lng = (spot.lng || 0).toFixed(5);
    
    // Verificar si hay imágenes
    const hasImage1 = spot.image_path && spot.image_path.trim();
    const hasImage2 = spot.image_path_2 && spot.image_path_2.trim();
    
    const canManageSpot = typeof window.canEditSpot === 'function'
        ? window.canEditSpot(spot.id)
        : false;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `modalSpotDetails_${spot.id}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable" style="max-height: 90vh;">
            <div class="modal-content bg-dark text-light" style="max-height: 90vh; overflow: hidden;">
                <div class="modal-header border-secondary pb-3">
                    <h5 class="modal-title text-white fw-bold" id="spot-title-${spot.id}">${title}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body" style="overflow-y: auto;">
                    <!-- Imágenes del spot -->
                    ${hasImage1 || hasImage2 ? `
                    <div class="spot-images-container mb-3">
                        <div class="row g-2">
                            ${hasImage1 ? `
                            <div class="col-12 ${hasImage2 ? 'col-md-6' : ''}">
                                <img id="spot-image-1-${spot.id}" src="${spot.image_path}" alt="${title}" class="img-fluid rounded spot-image-preview" style="max-height: 200px; object-fit: cover; width: 100%; cursor: pointer;" onclick="window.openImageFullscreen('${spot.image_path}', '${title}')">
                            </div>
                            ` : ''}
                            ${hasImage2 ? `
                            <div class="col-12 col-md-6">
                                <img id="spot-image-2-${spot.id}" src="${spot.image_path_2}" alt="${title} - Imagen 2" class="img-fluid rounded spot-image-preview" style="max-height: 200px; object-fit: cover; width: 100%; cursor: pointer;" onclick="window.openImageFullscreen('${spot.image_path_2}', '${title} - Imagen 2')">
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    ` : `
                    <div class="alert alert-warning mb-4" role="alert">
                        <i class="bi bi-exclamation-triangle"></i> Sin imágenes disponibles
                    </div>
                    `}
                    
                    <!-- Información del spot -->
                    <div class="spot-detail-info mb-4">
                        <h6 class="text-primary fw-bold mb-2">Descripción</h6>
                        <p class="spot-detail-description text-light" id="spot-desc-${spot.id}">${description}</p>
                        
                        <h6 class="text-primary fw-bold mb-2 mt-3">Información</h6>
                        <div class="spot-detail-meta text-secondary">
                            <div class="mb-2">
                                <i class="bi bi-geo-alt-fill text-info"></i> 
                                <strong>Ubicación:</strong> ${lat}, ${lng}
                            </div>
                            <div class="mb-2">
                                <i class="bi bi-tag-fill text-warning"></i> 
                                <strong>Categoría:</strong> <span class="badge bg-primary" id="spot-category-${spot.id}">${category}</span>
                            </div>
                            ${spot.created_at ? `
                            <div class="mb-2">
                                <i class="bi bi-calendar text-success"></i> 
                                <strong>Creado:</strong> ${new Date(spot.created_at).toLocaleDateString('es-ES')}
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    ${canManageSpot ? `
                    <hr class="my-4 border-secondary">
                    <div class="spot-edit-section">
                        <h6 class="text-primary fw-bold mb-3">Editar spot</h6>
                        <div class="mb-3">
                            <label class="form-label">Título</label>
                            <input id="edit-title-${spot.id}" class="form-control bg-secondary text-light border-secondary" value="${escapeHtml(rawTitle)}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea id="edit-desc-${spot.id}" class="form-control bg-secondary text-light border-secondary" rows="3">${escapeHtml(rawDescription)}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Categoría</label>
                                <input id="edit-category-${spot.id}" class="form-control bg-secondary text-light border-secondary" value="${escapeHtml(rawCategory)}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Etiquetas (coma)</label>
                                <input id="edit-tags-${spot.id}" class="form-control bg-secondary text-light border-secondary" value="${escapeHtml(rawTags)}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Foto 1</label>
                                <input id="edit-photo-1-${spot.id}" type="file" accept="image/*" class="form-control bg-secondary text-light border-secondary">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Foto 2</label>
                                <input id="edit-photo-2-${spot.id}" type="file" accept="image/*" class="form-control bg-secondary text-light border-secondary">
                            </div>
                        </div>
                        <div class="d-flex gap-2">
                            <button class="btn btn-success btn-sm" onclick="window.submitSpotEdit(${spot.id})">
                                <i class="bi bi-check2-circle"></i> Guardar cambios
                            </button>
                            <small class="text-muted align-self-center">En API local solo se reemplaza la Foto 1.</small>
                        </div>
                    </div>
                    ` : ''}

                    <hr class="my-4 border-secondary">

                    <!-- Sección de comentarios -->
                    <div class="comments-section">
                        <h6 class="mb-3 text-light fw-bold">
                            <i class="bi bi-chat-dots"></i> Comentarios (${commentCount})
                        </h6>
                        
                        ${isAuthenticated() ? `
                        <div class="comment-form mb-4">
                            <textarea 
                                id="comment-input-${spot.id}" 
                                class="form-control comment-input bg-secondary text-light border-secondary" 
                                placeholder="Escribe un comentario..." 
                                rows="3"
                            ></textarea>
                            <button class="btn btn-primary btn-sm mt-2" onclick="window.submitComment(${spot.id})">
                                <i class="bi bi-send"></i> Publicar comentario
                            </button>
                        </div>
                        ` : `
                        <div class="alert alert-info bg-info text-dark border-0 mb-4" role="alert">
                            <i class="bi bi-info-circle"></i> 
                            <a href="#" data-bs-toggle="modal" data-bs-target="#modalLogin" class="alert-link">Inicia sesión</a> para comentar
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

    try {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    } catch (error) {
        console.error('[COMMENTS] Error abriendo modal:', error);
        modal.remove();
    }
}

/**
 * UI: Submit spot edit
 */
window.submitSpotEdit = async function(spotId) {
    try {
        const titleInput = document.getElementById(`edit-title-${spotId}`);
        const descInput = document.getElementById(`edit-desc-${spotId}`);
        const categoryInput = document.getElementById(`edit-category-${spotId}`);
        const tagsInput = document.getElementById(`edit-tags-${spotId}`);
        const photo1Input = document.getElementById(`edit-photo-1-${spotId}`);
        const photo2Input = document.getElementById(`edit-photo-2-${spotId}`);

        if (!titleInput || !descInput || !categoryInput || !tagsInput) {
            showToast('No se pudieron leer los campos de edición', 'error');
            return;
        }

        const title = titleInput.value.trim();
        if (!title) {
            showToast('El título es obligatorio', 'warning');
            return;
        }

        const description = descInput.value.trim();
        const category = categoryInput.value.trim();
        const tagsRaw = tagsInput.value.trim();
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const photoFile1 = photo1Input?.files?.[0] || null;
        const photoFile2 = photo2Input?.files?.[0] || null;

        showToast('Guardando cambios...', 'info', { autoCloseMs: 1200 });

        const updated = await updateSpot(spotId, { title, description, category, tags }, photoFile1, photoFile2);

        // Refrescar UI principal
        const { loadSpots, displaySpots } = await import('./spots.js');
        const { renderSpotList } = await import('./ui.js');
        const spots = await loadSpots({ forceRefresh: true });
        displaySpots(spots, renderSpotList);

        // Actualizar modal actual
        const titleEl = document.getElementById(`spot-title-${spotId}`);
        const descEl = document.getElementById(`spot-desc-${spotId}`);
        const categoryEl = document.getElementById(`spot-category-${spotId}`);
        if (titleEl) titleEl.textContent = updated?.title || title;
        if (descEl) descEl.textContent = updated?.description || description || 'Sin descripción';
        if (categoryEl) categoryEl.textContent = updated?.category || category || 'Sin categoría';

        const img1 = document.getElementById(`spot-image-1-${spotId}`);
        const img2 = document.getElementById(`spot-image-2-${spotId}`);
        if (img1 && updated?.image_path) img1.src = updated.image_path;
        if (img2 && updated?.image_path_2) img2.src = updated.image_path_2;

        showToast('Spot actualizado ✅', 'success');
    } catch (error) {
        console.error('[COMMENTS] Error actualizando spot:', error);
        showToast(error.message || 'Error actualizando spot', 'error');
    }
};

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

/**
 * Abrir imagen en tamaño completo con carrusel
 */
window.openImageFullscreen = function(imageSrc, imageAlt) {
    // Obtener todas las imágenes del spot actual (búsqueda en el modal abierto)
    const imageElements = document.querySelectorAll('.spot-image-preview');
    const images = Array.from(imageElements).map(img => ({
        src: img.getAttribute('onclick').match(/'([^']+)'/)[1],
        alt: img.getAttribute('onclick').match(/'([^']*)', '([^']*)'/)[2]
    }));

    // Encontrar el índice de la imagen actual
    let currentIndex = images.findIndex(img => img.src === imageSrc);
    if (currentIndex === -1) {
        currentIndex = 0;
    }

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = `modalImageFullscreen_${Date.now()}`;
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
        <div class="modal-dialog modal-fullscreen" style="max-width: 95vw;">
            <div class="modal-content bg-dark" style="max-height: 95vh;">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title text-white">${imageAlt}</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body d-flex align-items-center justify-content-center position-relative" style="max-height: calc(95vh - 60px); overflow: hidden;">
                    <img id="fullscreen-image" src="${imageSrc}" alt="${imageAlt}" class="img-fluid" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    
                    ${images.length > 1 ? `
                    <button class="btn btn-light btn-sm" id="btn-prev-image" style="position: absolute; left: 20px; top: 50%; transform: translateY(-50%); z-index: 1000;">
                        <i class="bi bi-chevron-left"></i>
                    </button>
                    <button class="btn btn-light btn-sm" id="btn-next-image" style="position: absolute; right: 20px; top: 50%; transform: translateY(-50%); z-index: 1000;">
                        <i class="bi bi-chevron-right"></i>
                    </button>
                    <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.7); color: white; padding: 8px 16px; border-radius: 20px; z-index: 1000;">
                        <span id="image-counter">${currentIndex + 1}/${images.length}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    try {
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        // Si hay múltiples imágenes, agregar funcionalidad de navegación
        if (images.length > 1) {
            const imgElement = document.getElementById('fullscreen-image');
            const counterElement = document.getElementById('image-counter');
            const prevBtn = document.getElementById('btn-prev-image');
            const nextBtn = document.getElementById('btn-next-image');

            const updateImage = (index) => {
                currentIndex = (index + images.length) % images.length;
                imgElement.src = images[currentIndex].src;
                imgElement.alt = images[currentIndex].alt;
                counterElement.textContent = `${currentIndex + 1}/${images.length}`;
            };

            prevBtn.addEventListener('click', () => updateImage(currentIndex - 1));
            nextBtn.addEventListener('click', () => updateImage(currentIndex + 1));

            // Soporte para teclado
            const handleKeyboard = (e) => {
                if (e.key === 'ArrowLeft') updateImage(currentIndex - 1);
                if (e.key === 'ArrowRight') updateImage(currentIndex + 1);
            };
            document.addEventListener('keydown', handleKeyboard);

            modal.addEventListener('hidden.bs.modal', () => {
                document.removeEventListener('keydown', handleKeyboard);
                modal.remove();
            });
        } else {
            modal.addEventListener('hidden.bs.modal', () => {
                modal.remove();
            });
        }
    } catch (error) {
        console.error('[COMMENTS] Error abriendo imagen fullscreen:', error);
        modal.remove();
    }
};
