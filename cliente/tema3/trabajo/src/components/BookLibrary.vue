<template>
  <div class="book-library">
    <div class="library-header card">
      <h2>Mi Biblioteca</h2>
      
      <div class="library-controls">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchTerm" 
            placeholder="🔍 Buscar libros..."
            class="form-input"
            @input="handleSearch"
          />
        </div>

        <div class="filters">
          <select v-model="selectedCategory" class="form-input" @change="applyFilters">
            <option value="all">Todas las categorías</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>

          <select v-model="readFilter" class="form-input" @change="applyFilters">
            <option value="all">Todos</option>
            <option value="read">Leídos</option>
            <option value="unread">No leídos</option>
          </select>
        </div>
      </div>
    </div>

    <div class="books-count">
      <p>📚 Mostrando {{ filteredBooks.length }} libro(s)</p>
    </div>

    <div v-if="filteredBooks.length === 0" class="empty-state card">
      <p>📚 No se encontraron libros. ¡Añade tu primer libro!</p>
      <small v-if="searchTerm || selectedCategory !== 'all' || readFilter !== 'all'">
        Prueba a quitar los filtros
      </small>
    </div>

    <div class="books-grid">
      <BookCard 
        v-for="book in filteredBooks" 
        :key="book.id + updateTrigger"
        :book="book"
        @toggle-read="handleToggleRead"
        @delete-book="handleDeleteBook"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, reactive } from 'vue';
// import { watch } from 'vue'; // al final no lo necesite
import BookCard from './BookCard.vue';

export default {
  name: 'BookLibrary',
  components: {
    BookCard
  },
  props: {
    bookService: {
      type: Object,
      required: true
    }
  },
  emits: ['book-updated'],
  setup(props, { emit }) {
    const books = ref([]);
    const searchTerm = ref('');
    const selectedCategory = ref('all');
    const readFilter = ref('all');
    const updateTrigger = ref(0); // Para forzar actualizaciones

    const categories = computed(() => {
      return props.bookService.getCategories();
    });

    const filteredBooks = computed(() => {
      let result = books.value;
      // let temp = [...books.value]; // probe con spread pero no hacia falta

      // Filtrar por búsqueda
      if (searchTerm.value) {
        result = result.filter(book => 
          book.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          book.category.toLowerCase().includes(searchTerm.value.toLowerCase())
        );
      }

      // Filtrar por categoría
      if (selectedCategory.value !== 'all') {
        result = result.filter(book => book.category === selectedCategory.value);
      }

      // Filtrar por estado de lectura
      if (readFilter.value === 'read') {
        result = result.filter(book => book.isRead);
      } else if (readFilter.value === 'unread') {
        result = result.filter(book => !book.isRead);
      }

      return result;
    });

    const loadBooks = () => {
      // Creo un nuevo array para forzar la reactividad
      books.value = [...props.bookService.getAllBooks()];
      console.log('Libros cargados:', books.value.length); // para ver que funciona
    };

    const handleSearch = () => {
      // No hace falta hacer nada, Vue lo actualiza solo con el computed
    };

    const applyFilters = () => {
      // Los filtros se aplican automaticamente
    };

    const handleToggleRead = (bookId) => {
      console.log('handleToggleRead llamado para:', bookId);
      const book = props.bookService.getBookById(bookId);
      if (book) {
        console.log('Estado actual del libro:', book.isRead);
        // Cambio el estado según esté
        if (book.isRead) {
          console.log('Marcando como no leído...');
          props.bookService.markAsUnread(bookId);
        } else {
          console.log('Marcando como leído...');
          props.bookService.markAsRead(bookId);
        }
        // Fuerzo la reactividad incrementando el trigger
        updateTrigger.value++;
        books.value = [...props.bookService.getAllBooks()];
        console.log('Nuevo estado del libro:', book.isRead);
        emit('book-updated');
      } else {
        console.error('Libro no encontrado:', bookId);
      }
    };

    const handleDeleteBook = (bookId) => {
      if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        props.bookService.deleteBook(bookId);
        console.log('Libro eliminado'); // debug
        // Fuerzo la reactividad creando un nuevo array
        books.value = [...props.bookService.getAllBooks()];
        emit('book-updated');
      }
    };

    onMounted(() => {
      loadBooks();
      // console.log('Componente montado'); // debug
    });

    // atajo para refrescar todo (lo use mientras desarrollaba)
    // const refresh = () => loadBooks();

    return {
      books,
      searchTerm,
      selectedCategory,
      readFilter,
      categories,
      filteredBooks,
      updateTrigger,
      handleSearch,
      applyFilters,
      handleToggleRead,
      handleDeleteBook
    };
  }
};
</script>

<style scoped>
.book-library {
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

.library-header {
  margin-bottom: 2rem;
}

.library-header h2 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.library-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  width: 100%;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters select {
  flex: 1;
  min-width: 200px;
}

.books-count {
  margin-bottom: 1rem;
  color: white;
  font-weight: 500;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
  /* probe con gap: 1.5rem pero quedaba muy junto */
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-light);
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .library-header h2 {
    font-size: 1.5rem;
  }

  .filters {
    flex-direction: column;
  }

  .filters select {
    width: 100%;
  }

  .books-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
