<template>
  <div id="app">
    <header class="app-header">
      <div class="container">
        <h1>📚 MyBookShelf</h1>
        <p class="subtitle">Gestiona tu biblioteca personal</p>
        <!-- <p class="subtitle">v1.0</p> -->
      </div>
    </header>

    <nav class="app-nav">
      <div class="container">
        <button 
          :class="['nav-btn', { active: currentView === 'library' }]" 
          @click="currentView = 'library'"
        >
          📖 Biblioteca
        </button>
        <button 
          :class="['nav-btn', { active: currentView === 'add' }]" 
          @click="currentView = 'add'"
        >
          ➕ Añadir Libro
        </button>
        <button 
          :class="['nav-btn', { active: currentView === 'stats' }]" 
          @click="currentView = 'stats'"
        >
          📊 Estadísticas
        </button>
      </div>
    </nav>

    <main class="app-main">
      <div class="container">
        <BookLibrary 
          v-if="currentView === 'library'" 
          :bookService="bookService"
          @book-updated="handleBookUpdate"
        />
        <AddBookForm 
          v-if="currentView === 'add'" 
          :bookService="bookService"
          @book-added="handleBookAdded"
        />
        <Statistics 
          v-if="currentView === 'stats'" 
          :bookService="bookService"
        />
      </div>
    </main>

    <footer class="app-footer">
      <div class="container">
        <p>MyBookShelf &copy; 2025 - Hecho con Vue.js para DWEC</p>
        <small>Antonio Valero - DAW2</small>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref } from 'vue';
import { BookService } from './services/BookService.js';
import BookLibrary from './components/BookLibrary.vue';
import AddBookForm from './components/AddBookForm.vue';
import Statistics from './components/Statistics.vue';

export default {
  name: 'App',
  components: {
    BookLibrary,
    AddBookForm,
    Statistics
  },
  setup() {
    const bookService = new BookService('local');
    const currentView = ref('library');

    const handleBookAdded = () => {
      currentView.value = 'library';
    };

    const handleBookUpdate = () => {
      // Forzar actualización de componentes
    };

    return {
      bookService,
      currentView,
      handleBookAdded,
      handleBookUpdate
    };
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 32px 0; /* uso px directo a veces */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  color: #667eea;
  font-size: 2.5rem;
  margin-bottom: 8px; /* mezclo unidades */
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.app-nav {
  background: rgba(255, 255, 255, 0.9);
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.app-nav .container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #666;
  font-size: 1rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.nav-btn.active {
  background: #667eea;
  color: white;
}

.app-main {
  flex: 1;
  padding: 2rem 0;
}

.app-footer {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  text-align: center;
  padding: 1.5rem 0;
  margin-top: auto;
}

.app-footer p{
  margin: 0;
  margin-bottom: 5px;
}

.app-footer small{
  opacity: 0.8;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .app-header h1 {
    font-size: 2rem;
  }
  
  .nav-btn {
    flex: 1;
    min-width: calc(50% - 0.5rem);
  }
}
</style>
