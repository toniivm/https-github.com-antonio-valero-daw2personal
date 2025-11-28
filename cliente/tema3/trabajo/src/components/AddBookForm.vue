<template>
  <div class="add-book-form">
    <div class="card form-card">
      <h2>➕ Añadir Nuevo Libro</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label">Título *</label>
          <input 
            type="text" 
            v-model="formData.title" 
            class="form-input"
            placeholder="Ej: El Quijote"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Autor *</label>
          <input 
            type="text" 
            v-model="formData.author" 
            class="form-input"
            placeholder="Ej: Miguel de Cervantes"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Categoría *</label>
            <select v-model="formData.category" class="form-input" required>
              <option value="" disabled>Selecciona una categoría</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
              <option value="custom">➕ Otra...</option>
            </select>
          </div>

          <div class="form-group" v-if="formData.category === 'custom'">
            <label class="form-label">Nueva Categoría</label>
            <input 
              type="text" 
              v-model="customCategory" 
              class="form-input"
              placeholder="Ej: Misterio"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Páginas *</label>
            <input 
              type="number" 
              v-model.number="formData.pages" 
              class="form-input"
              placeholder="300"
              min="1"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Año de Publicación *</label>
            <input 
              type="number" 
              v-model.number="formData.year" 
              class="form-input"
              placeholder="2023"
              :min="1000"
              :max="new Date().getFullYear()"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">URL de Portada (opcional)</label>
          <input 
            type="url" 
            v-model="formData.coverUrl" 
            class="form-input"
            placeholder="https://ejemplo.com/portada.jpg"
          />
          <small class="form-hint">Deja en blanco para usar una portada por defecto</small>
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              v-model="formData.isRead"
            />
            <span>Ya he leído este libro</span>
          </label>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary btn-large">
            ✓ Añadir Libro
          </button>
          <button type="button" class="btn btn-secondary btn-large" @click="resetForm">
            🔄 Limpiar Formulario
          </button>
        </div>

        <div v-if="successMessage" class="success-message">
          ✓ {{ successMessage }}
        </div>
      </form>
    </div>

    <div class="card preview-card" v-if="isFormValid">
      <h3>Vista Previa</h3>
      <div class="book-preview">
        <div class="preview-cover">
          <img :src="previewCover" alt="Preview" @error="handlePreviewError" />
        </div>
        <div class="preview-info">
          <h4>{{ formData.title || 'Título del libro' }}</h4>
          <p>👤 {{ formData.author || 'Autor' }}</p>
          <p>📅 {{ formData.year || 'Año' }} • 📄 {{ formData.pages || '0' }} páginas</p>
          <span class="badge badge-info">{{ getFinalCategory }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'AddBookForm',
  props: {
    bookService: {
      type: Object,
      required: true
    }
  },
  emits: ['book-added'],
  setup(props, { emit }) {
    const formData = ref({
      title: '',
      author: '',
      category: '',
      pages: null,
      year: new Date().getFullYear(),
      coverUrl: '',
      isRead: false
    });

    const customCategory = ref('');
    const successMessage = ref('');

    // categorias que uso normalmente
    const categories = [
      'Ficción',
      'No Ficción',
      'Ciencia',
      'Tecnología',
      'Historia',
      'Biografía',
      'Fantasía',
      'Romance',
      'Misterio',
      'Terror',
      'Autoayuda',
      'Ensayo'
    ];
    // podria cargar esto de una API pero para el proyecto esta bien asi

    const isFormValid = computed(() => {
      // verifico que esten los campos principales
      let valid = formData.value.title && 
             formData.value.author && 
             formData.value.category &&
             formData.value.pages > 0;
      return valid;
    });

    const getFinalCategory = computed(() => {
      if (formData.value.category === 'custom' && customCategory.value) {
        return customCategory.value;
      }
      return formData.value.category || 'Sin categoría';
    });

    const previewCover = computed(() => {
      if (formData.value.coverUrl) {
        return formData.value.coverUrl;
      }
      return props.bookService.getDefaultCover(getFinalCategory.value);
    });

    const handleSubmit = () => {
      // Primero verifico que esté todo bien
      if (!isFormValid.value) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
      }
      // validacion extra: el año no puede ser futuro
      if(formData.value.year > new Date().getFullYear()){
        alert('El año no puede ser mayor al actual');
        return;
      }

      // Preparo los datos del libro
      const bookData = {
        ...formData.value,
        category: getFinalCategory.value
      };

      props.bookService.addBook(bookData);
      
      successMessage.value = `¡Libro "${bookData.title}" añadido correctamente!`;
      
      setTimeout(() => {
        successMessage.value = '';
        emit('book-added');
      }, 1500);

      resetForm();
    };

    const resetForm = () => {
      // Limpio todo el formulario
      formData.value = {
        title: '',
        author: '',
        category: '',
        pages: null,
        year: new Date().getFullYear(), // año actual por defecto
        coverUrl: '',
        isRead: false
      };
      customCategory.value = '';
    };

    const handlePreviewError = (e) => {
      e.target.src = 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=400&fit=crop';
    };

    return {
      formData,
      customCategory,
      successMessage,
      categories,
      isFormValid,
      getFinalCategory,
      previewCover,
      handleSubmit,
      resetForm,
      handlePreviewError
    };
  }
};
</script>

<style scoped>
.add-book-form {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.form-card h2,
.preview-card h3 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.preview-card h3 {
  font-size: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  color: var(--text-light);
  font-size: 0.875rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-large {
  flex: 1;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.success-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #c6f6d5;
  color: #22543d;
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.book-preview {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.preview-cover {
  width: 150px;
  height: 200px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.preview-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-info {
  flex: 1;
}

.preview-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--text-dark);
  font-size: 1.25rem;
}

.preview-info p {
  margin: 0.25rem 0;
  color: var(--text-light);
}

@media (min-width: 1024px) {
  .add-book-form {
    grid-template-columns: 2fr 1fr;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .book-preview {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .preview-cover {
    width: 120px;
    height: 160px;
  }
}
</style>
