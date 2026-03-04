<template>
  <div class="book-card card">
    <div class="book-cover">
      <img :src="book.coverUrl" :alt="book.title" @error="handleImageError" />
      <div v-if="book.isRead" class="read-badge read-badge-enter">✓ Leído</div>
      <div v-else class="read-badge read-badge-exit" style="display: none;">✓ Leído</div>
    </div>

    <div class="book-info">
      <h3 class="book-title">{{ book.title }}</h3>
      <p class="book-author">👤 {{ book.author }}</p>
      <p class="book-details">📅 {{ book.year }} • 📄 {{ book.pages }} páginas</p>
      <span class="book-category badge badge-info">{{ book.category }}</span>
      <!-- <small>Añadido: {{ new Date(book.addedDate).toLocaleDateString() }}</small> -->
    </div>

    <div class="book-actions">
      <button 
        class="btn btn-action btn-toggle"
        :class="book.isRead ? 'btn-unread' : 'btn-read'"
        @click="toggleRead"
        :title="book.isRead ? 'Marcar como no leído' : 'Marcar como leído'"
      >
        <span class="btn-icon">{{ book.isRead ? '↩️' : '✓' }}</span>
        <span class="btn-text">{{ book.isRead ? 'Marcar no leído' : 'Marcar leído' }}</span>
      </button>
      <button 
        class="btn btn-danger btn-action"
        @click="$emit('delete-book', book.id)"
        title="Eliminar libro"
      >
        🗑️ Eliminar
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BookCard',
  props: {
    book: {
      type: Object,
      required: true
    }
  },
  emits: ['toggle-read', 'delete-book'],
  methods: {
    handleImageError(e) {
      e.target.src = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop';
    },
    toggleRead() {
      console.log('Toggle read para libro:', this.book.id, 'Estado actual:', this.book.isRead);
      this.$emit('toggle-read', this.book.id);
    }
  }
};
</script>

<style scoped>
.book-card {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  height: 100%;
  /* padding: 0; */ /* lo quite porque no hacia falta */
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  /* cursor: pointer; */ /* no lo uso porque no lleva a ningun sitio */
}

.book-cover {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f7fafc;
}

.book-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.read-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: var(--success-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: badgeSlideIn 0.3s ease;
}

.read-badge-exit {
  animation: badgeSlideOut 0.3s ease;
}

.book-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.book-title {
  font-size: 1.25rem;
  color: var(--text-dark);
  margin: 0;
  /* margin-bottom: 5px; */ /* probe esto pero no quedaba bien */
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  color: var(--text-light);
  font-size: 1rem;
  margin: 0;
}

.book-details {
  color: var(--text-light);
  font-size: 0.875rem;
  margin: 0;
}

.book-category {
  align-self: flex-start;
  margin-top: 0.5rem;
}

.book-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  padding-top: 0;
}

.btn-action {
  width: 100%;
  justify-content: center;
  font-size: 0.875rem;
  padding: 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-toggle {
  font-weight: 600;
}

.btn-read {
  background: var(--success-color);
  color: white;
}

.btn-read:hover {
  background: #28a745;
  transform: scale(1.02);
}

.btn-unread {
  background: #6c757d;
  color: white;
}

.btn-unread:hover {
  background: #5a6268;
  transform: scale(1.02);
}

.btn-icon {
  font-size: 1.1rem;
}

.btn-text {
  flex: 1;
}

@media (max-width: 768px) {
  .book-cover {
    height: 250px;
  }
}

@keyframes badgeSlideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes badgeSlideOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}
</style>
