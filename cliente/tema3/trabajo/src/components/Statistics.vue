<template>
  <div class="statistics">
    <h2 class="stats-title">📊 Estadísticas de tu Biblioteca</h2>

    <div class="stats-grid">
      <div class="stat-card card stat-primary">
        <div class="stat-icon">📚</div>
        <div class="stat-content">
          <h3>{{ stats.totalBooks }}</h3>
          <p>Libros Totales</p>
        </div>
      </div>

      <div class="stat-card card stat-success">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <h3>{{ stats.readBooks }}</h3>
          <p>Libros Leídos</p>
        </div>
      </div>

      <div class="stat-card card stat-warning">
        <div class="stat-icon">📖</div>
        <div class="stat-content">
          <h3>{{ stats.unreadBooks }}</h3>
          <p>Por Leer</p>
        </div>
      </div>

      <div class="stat-card card stat-info">
        <div class="stat-icon">📄</div>
        <div class="stat-content">
          <h3>{{ stats.totalPages }}</h3>
          <p>Páginas Totales</p>
        </div>
      </div>
    </div>

    <div class="detailed-stats">
      <div class="card progress-card">
        <h3>Progreso de Lectura</h3>
        <div class="progress-info">
          <span>{{ stats.readPercentage }}% completado</span>
          <span>{{ stats.readBooks }} de {{ stats.totalBooks }} libros</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: stats.readPercentage + '%' }"
          ></div>
        </div>
        <div class="pages-info">
          <div class="pages-stat">
            <strong>{{ stats.pagesRead }}</strong>
            <span>Páginas leídas</span>
          </div>
          <div class="pages-stat">
            <strong>{{ stats.pagesUnread }}</strong>
            <span>Páginas por leer</span>
          </div>
        </div>
      </div>

      <div class="card categories-card">
        <h3>Libros por Categoría</h3>
        <div class="categories-list">
          <div 
            v-for="(count, category) in stats.categoriesCount" 
            :key="category"
            class="category-item"
          >
            <div class="category-info">
              <span class="category-name">{{ category }}</span>
              <span class="category-count">{{ count }} libro(s)</span>
            </div>
            <div class="category-bar">
              <div 
                class="category-fill"
                :style="{ width: getCategoryPercentage(count) + '%' }"
              ></div>
            </div>
          </div>
          <div v-if="Object.keys(stats.categoriesCount).length === 0" class="empty-categories">
            No hay categorías aún
          </div>
        </div>
      </div>
    </div>

    <div class="card insights-card">
      <h3>💡 Insights</h3>
      <div class="insights-list">
        <div class="insight-item">
          <span class="insight-icon">🎯</span>
          <p>
            <strong>Meta de lectura:</strong> 
            {{ getMeta }}
          </p>
        </div>
        <div class="insight-item">
          <span class="insight-icon">⭐</span>
          <p>
            <strong>Categoría favorita:</strong> 
            {{ getFavoriteCategory }}
          </p>
        </div>
        <div class="insight-item">
          <span class="insight-icon">📈</span>
          <p>
            <strong>Promedio de páginas:</strong> 
            {{ getAveragePages }} páginas por libro
          </p>
        </div>
        <div class="insight-item">
          <span class="insight-icon">⏱️</span>
          <p>
            <strong>Tiempo estimado de lectura:</strong> 
            {{ getEstimatedTime }}
          </p>
        </div>
      </div>
    </div>

    <div class="actions-card card">
      <h3>⚙️ Acciones</h3>
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="refreshStats">
          🔄 Actualizar Estadísticas
        </button>
        <button class="btn btn-danger" @click="handleResetData">
          ⚠️ Reiniciar Datos
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';

export default {
  name: 'Statistics',
  props: {
    bookService: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const stats = ref({
      totalBooks: 0,
      readBooks: 0,
      unreadBooks: 0,
      totalPages: 0,
      pagesRead: 0,
      pagesUnread: 0,
      readPercentage: 0,
      categoriesCount: {}
    });

    const loadStats = () => {
      stats.value = props.bookService.getStatistics();
      // console.log('Stats:', stats.value); // debug - descomentar si falla algo
    };

    const getCategoryPercentage = (count) => {
      if (stats.value.totalBooks === 0) return 0;
      return (count / stats.value.totalBooks) * 100;
    };

    const getFavoriteCategory = computed(() => {
      var categories = stats.value.categoriesCount; // uso var aqui
      if (Object.keys(categories).length === 0) return 'Ninguna aún';
      
      const maxCategory = Object.entries(categories).reduce((max, entry) => 
        entry[1] > max[1] ? entry : max
      );
      
      return `${maxCategory[0]} (${maxCategory[1]} libros)`;
    });

    const getAveragePages = computed(() => {
      if (stats.value.totalBooks === 0) return 0;
      // primero lo hacia con toFixed(2) pero quedaban muchos decimales
      const avg = stats.value.totalPages / stats.value.totalBooks;
      return Math.round(avg);
    });

    const getMeta = computed(() => {
      const remaining = stats.value.unreadBooks;
      if (remaining === 0) return '¡Has leído todos tus libros! 🎉';
      if (remaining === 1) return 'Te queda 1 libro por leer';
      return `Te quedan ${remaining} libros por leer`;
    });

    const getEstimatedTime = computed(() => {
      // Calculo aproximado: una página son como 250 palabras
      // y leo unas 200 palabras por minuto mas o menos
      const wordsPerPage = 250;
      const wordsPerMinute = 200;
      const totalMinutes = (stats.value.pagesUnread * wordsPerPage) / wordsPerMinute;
      const hours = Math.round(totalMinutes / 60);
      
      if (hours === 0) return 'Menos de 1 hora';
      if (hours === 1) return '~1 hora';
      if (hours < 24) return `~${hours} horas`;
      
      const days = Math.round(hours / 24);
      return `~${days} día(s)`;
    });

    const refreshStats = () => {
      loadStats();
    };

    const handleResetData = () => {
      if (confirm('¿Estás seguro? Esto reiniciará todos los datos y agregará libros de ejemplo.')) {
        props.bookService.resetToDefault();
        loadStats();
      }
    };

    onMounted(() => {
      loadStats();
    });

    return {
      stats,
      getCategoryPercentage,
      getFavoriteCategory,
      getAveragePages,
      getMeta,
      getEstimatedTime,
      refreshStats,
      handleResetData
    };
  }
};
</script>

<style scoped>
.statistics {
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

.stats-title {
  color: white;
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  font-size: 3rem;
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: var(--text-dark);
}

.stat-content p {
  margin: 0;
  color: var(--text-light);
  font-size: 0.9rem;
}

.stat-primary {
  border-left: 4px solid var(--primary-color);
}

.stat-success {
  border-left: 4px solid var(--success-color);
}

.stat-warning {
  border-left: 4px solid var(--warning-color);
}

.stat-info {
  border-left: 4px solid #3182ce;
}

.detailed-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.progress-card h3,
.categories-card h3,
.insights-card h3,
.actions-card h3 {
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-light);
}

.progress-bar {
  width: 100%;
  height: 30px;
  background: #e2e8f0;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--success-color), #38a169);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
}

.pages-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.pages-stat {
  text-align: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.pages-stat strong {
  display: block;
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.pages-stat span {
  font-size: 0.875rem;
  color: var(--text-light);
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.category-name {
  font-weight: 500;
  color: var(--text-dark);
}

.category-count {
  color: var(--text-light);
}

.category-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.category-fill {
  height: 100%;
  background: var(--primary-color);
  transition: width 0.5s ease;
}

.empty-categories {
  text-align: center;
  color: var(--text-light);
  padding: 2rem;
}

.insights-card {
  grid-column: 1 / -1;
}

.insights-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.insight-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.insight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.insight-item p {
  margin: 0;
  line-height: 1.6;
}

.actions-card {
  grid-column: 1 / -1;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-buttons button {
  flex: 1;
  min-width: 200px;
}

@media (max-width: 768px) {
  .stats-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .detailed-stats {
    grid-template-columns: 1fr;
  }

  .insights-list {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }
}
</style>
