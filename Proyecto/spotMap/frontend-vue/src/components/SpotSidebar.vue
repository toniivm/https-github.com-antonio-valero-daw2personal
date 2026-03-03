<script setup>
import { reactive } from 'vue';

const props = defineProps({
  spots: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  selectedId: {
    type: [String, Number, null],
    default: null,
  },
  viewMode: {
    type: String,
    default: 'list',
  },
  searchQuery: {
    type: String,
    default: '',
  },
  categoryFilter: {
    type: String,
    default: 'all',
  },
  tagFilter: {
    type: String,
    default: 'all',
  },
  bestTimeFilter: {
    type: String,
    default: 'all',
  },
  difficultyFilter: {
    type: String,
    default: 'all',
  },
  seasonFilter: {
    type: String,
    default: 'all',
  },
  availableCategories: {
    type: Array,
    default: () => [],
  },
  availableTags: {
    type: Array,
    default: () => [],
  },
  bestTimeOptions: {
    type: Array,
    default: () => [],
  },
  difficultyOptions: {
    type: Array,
    default: () => [],
  },
  seasonOptions: {
    type: Array,
    default: () => [],
  },
  page: {
    type: Number,
    default: 1,
  },
  pages: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  },
  hasPrev: {
    type: Boolean,
    default: false,
  },
  hasNext: {
    type: Boolean,
    default: false,
  },
  authLoading: {
    type: Boolean,
    default: false,
  },
  authError: {
    type: String,
    default: '',
  },
  isAuthenticated: {
    type: Boolean,
    default: false,
  },
  currentUser: {
    type: Object,
    default: null,
  },
  currentRole: {
    type: String,
    default: 'user',
  },
  isModerator: {
    type: Boolean,
    default: false,
  },
  moderationLoading: {
    type: Boolean,
    default: false,
  },
  moderationError: {
    type: String,
    default: '',
  },
  pendingSpots: {
    type: Array,
    default: () => [],
  },
  pendingTotal: {
    type: Number,
    default: 0,
  },
  showCreateForm: {
    type: Boolean,
    default: false,
  },
  actionStatus: {
    type: String,
    default: '',
  },
  selectedSpot: {
    type: Object,
    default: null,
  },
  socialLoading: {
    type: Boolean,
    default: false,
  },
  socialError: {
    type: String,
    default: '',
  },
  favoritesCount: {
    type: Number,
    default: 0,
  },
  isFavoritedByUser: {
    type: Boolean,
    default: false,
  },
  ratingAggregate: {
    type: Object,
    default: () => ({ count: 0, average: 0 }),
  },
  selectedComments: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits([
  'select-spot',
  'reload',
  'change-view',
  'change-search',
  'change-category',
  'change-tag',
  'change-best-time',
  'change-difficulty',
  'change-season',
  'login',
  'logout',
  'reload-moderation',
  'approve-pending',
  'reject-pending',
  'create-spot',
  'update-spot',
  'toggle-favorite',
  'rate-spot',
  'add-comment',
  'prev-page',
  'next-page',
]);

const credentials = reactive({
  email: '',
  password: '',
});

const createForm = reactive({
  title: '',
  description: '',
  lat: '',
  lng: '',
  image_path: '',
  category: '',
  tags: '',
  schedule: '',
  difficulty: '',
  season: '',
});

const editForm = reactive({
  id: '',
  title: '',
  description: '',
  lat: '',
  lng: '',
  image_path: '',
  category: '',
  tags: '',
  schedule: '',
  difficulty: '',
  season: '',
});

const socialForm = reactive({
  score: 5,
  comment: '',
});

function submitLogin() {
  emit('login', { email: credentials.email, password: credentials.password });
}

function submitCreateSpot() {
  emit('create-spot', { ...createForm });
}

function loadSelectedSpot() {
  const spot = props.spots.find((item) => String(item.id) === String(props.selectedId));
  if (!spot) {
    return;
  }

  editForm.id = spot.id;
  editForm.title = spot.title ?? '';
  editForm.description = spot.description ?? '';
  editForm.lat = String(spot.lat ?? spot.latitude ?? '');
  editForm.lng = String(spot.lng ?? spot.longitude ?? '');
  editForm.image_path = spot.image_path ?? '';
  editForm.category = spot.category ?? '';
  editForm.tags = Array.isArray(spot.tags) ? spot.tags.join(', ') : '';
  editForm.schedule = spot.schedule ?? '';
  editForm.difficulty = spot.difficulty ?? '';
  editForm.season = spot.season ?? '';
}

function submitUpdateSpot() {
  emit('update-spot', { ...editForm });
}

function submitRateSpot() {
  if (!props.selectedSpot?.id) {
    return;
  }
  emit('rate-spot', { spotId: props.selectedSpot.id, score: Number(socialForm.score) });
}

function submitComment() {
  if (!props.selectedSpot?.id) {
    return;
  }
  emit('add-comment', { spotId: props.selectedSpot.id, body: socialForm.comment });
  socialForm.comment = '';
}

function handleClick(spotId) {
  emit('select-spot', spotId);
}

function formatTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) {
    return 'sin etiquetas';
  }
  return tags.slice(0, 3).join(' · ');
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-head">
      <h2>Explorar Spots</h2>
      <button
        class="btn-reload"
        type="button"
        @click="emit('reload')"
      >
        Recargar
      </button>
    </div>

    <div class="auth-box">
      <div class="auth-head">
        <strong>Sesión</strong>
        <span
          v-if="isAuthenticated"
          class="role-pill"
        >
          {{ currentRole }}
        </span>
      </div>

      <template v-if="!isAuthenticated">
        <div class="auth-row">
          <input
            v-model="credentials.email"
            class="input"
            type="email"
            placeholder="Email"
          >
          <input
            v-model="credentials.password"
            class="input"
            type="password"
            placeholder="Contraseña"
          >
          <button
            class="btn-page"
            type="button"
            :disabled="authLoading"
            @click="submitLogin"
          >
            {{ authLoading ? 'Entrando…' : 'Entrar' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="auth-row auth-row-inline">
          <span class="auth-user">
            {{ currentUser?.email || currentUser?.username || 'Usuario' }}
          </span>
          <button
            class="btn-page"
            type="button"
            @click="emit('logout')"
          >
            Salir
          </button>
        </div>
      </template>

      <div
        v-if="authError"
        class="state-block error compact"
      >
        {{ authError }}
      </div>
    </div>

    <div
      v-if="isModerator"
      class="moderation-box"
    >
      <div class="auth-head">
        <strong>Moderación</strong>
        <span class="role-pill">{{ pendingTotal }} pendientes</span>
      </div>

      <div class="auth-row auth-row-inline">
        <button
          class="btn-page"
          type="button"
          :disabled="moderationLoading"
          @click="emit('reload-moderation')"
        >
          {{ moderationLoading ? 'Actualizando…' : 'Recargar pendientes' }}
        </button>
      </div>

      <div
        v-if="moderationError"
        class="state-block error compact"
      >
        {{ moderationError }}
      </div>

      <ul
        v-if="pendingSpots.length"
        class="moderation-list"
      >
        <li
          v-for="spot in pendingSpots"
          :key="spot.id"
          class="moderation-item"
        >
          <div class="moderation-title">
            {{ spot.title || `Spot ${spot.id}` }}
          </div>
          <div class="moderation-actions">
            <button
              class="btn-page"
              type="button"
              @click="emit('approve-pending', spot.id)"
            >
              Aprobar
            </button>
            <button
              class="btn-page"
              type="button"
              @click="emit('reject-pending', spot.id)"
            >
              Rechazar
            </button>
          </div>
        </li>
      </ul>
    </div>

    <div
      v-if="showCreateForm"
      class="moderation-box"
    >
      <div class="auth-head">
        <strong>Crear Spot</strong>
      </div>

      <div class="auth-row">
        <input
          v-model="createForm.title"
          class="input"
          type="text"
          placeholder="Título"
        >
        <textarea
          v-model="createForm.description"
          class="input"
          placeholder="Descripción"
          rows="2"
        />

        <div class="row">
          <input
            v-model="createForm.lat"
            class="input"
            type="number"
            step="any"
            placeholder="Latitud"
          >
          <input
            v-model="createForm.lng"
            class="input"
            type="number"
            step="any"
            placeholder="Longitud"
          >
        </div>

        <input
          v-model="createForm.image_path"
          class="input"
          type="url"
          placeholder="URL imagen (image_path)"
        >
        <input
          v-model="createForm.category"
          class="input"
          type="text"
          placeholder="Categoría"
        >
        <input
          v-model="createForm.tags"
          class="input"
          type="text"
          placeholder="Tags separados por coma"
        >

        <div class="row row-three">
          <select
            v-model="createForm.schedule"
            class="input"
          >
            <option value="">
              Mejor hora
            </option>
            <option
              v-for="option in bestTimeOptions"
              :key="`new-${option}`"
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <select
            v-model="createForm.difficulty"
            class="input"
          >
            <option value="">
              Dificultad
            </option>
            <option
              v-for="option in difficultyOptions"
              :key="`new-d-${option}`"
              :value="option"
            >
              {{ option }}
            </option>
          </select>

          <select
            v-model="createForm.season"
            class="input"
          >
            <option value="">
              Temporada
            </option>
            <option
              v-for="option in seasonOptions"
              :key="`new-s-${option}`"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <button
          class="btn-page"
          type="button"
          @click="submitCreateSpot"
        >
          Publicar spot
        </button>
      </div>
    </div>

    <div
      v-if="showCreateForm && selectedId"
      class="moderation-box"
    >
      <div class="auth-head">
        <strong>Editar Spot Seleccionado</strong>
      </div>

      <div class="auth-row">
        <button
          class="btn-page"
          type="button"
          @click="loadSelectedSpot"
        >
          Cargar spot #{{ selectedId }}
        </button>

        <input
          v-model="editForm.title"
          class="input"
          type="text"
          placeholder="Título"
        >
        <textarea
          v-model="editForm.description"
          class="input"
          placeholder="Descripción"
          rows="2"
        />
        <div class="row">
          <input
            v-model="editForm.lat"
            class="input"
            type="number"
            step="any"
            placeholder="Latitud"
          >
          <input
            v-model="editForm.lng"
            class="input"
            type="number"
            step="any"
            placeholder="Longitud"
          >
        </div>
        <input
          v-model="editForm.image_path"
          class="input"
          type="url"
          placeholder="URL imagen (image_path)"
        >
        <input
          v-model="editForm.category"
          class="input"
          type="text"
          placeholder="Categoría"
        >
        <input
          v-model="editForm.tags"
          class="input"
          type="text"
          placeholder="Tags separados por coma"
        >
        <button
          class="btn-page"
          type="button"
          @click="submitUpdateSpot"
        >
          Guardar cambios
        </button>
      </div>
    </div>

    <div
      v-if="actionStatus"
      class="state-block compact"
    >
      {{ actionStatus }}
    </div>

    <div
      v-if="selectedSpot"
      class="moderation-box"
    >
      <div class="auth-head">
        <strong>Interacción Spot</strong>
        <span class="role-pill">#{{ selectedSpot.id }}</span>
      </div>

      <div class="state-block compact">
        <strong>{{ selectedSpot.title || 'Spot seleccionado' }}</strong>
        <div class="small-meta">
          ⭐ {{ Number(ratingAggregate?.average || 0).toFixed(2) }} ({{ ratingAggregate?.count || 0 }} valoraciones)
        </div>
        <div class="small-meta">
          ❤️ {{ favoritesCount }} favoritos
        </div>
      </div>

      <div class="auth-row auth-row-inline">
        <button
          class="btn-page"
          type="button"
          :disabled="!isAuthenticated || socialLoading"
          @click="emit('toggle-favorite', selectedSpot.id)"
        >
          {{ isFavoritedByUser ? 'Quitar favorito' : 'Añadir favorito' }}
        </button>
      </div>

      <div class="auth-row auth-row-inline">
        <select
          v-model="socialForm.score"
          class="input"
        >
          <option :value="1">
            1
          </option>
          <option :value="2">
            2
          </option>
          <option :value="3">
            3
          </option>
          <option :value="4">
            4
          </option>
          <option :value="5">
            5
          </option>
        </select>
        <button
          class="btn-page"
          type="button"
          :disabled="!isAuthenticated || socialLoading"
          @click="submitRateSpot"
        >
          Valorar
        </button>
      </div>

      <div class="auth-row">
        <textarea
          v-model="socialForm.comment"
          class="input"
          rows="2"
          placeholder="Escribe un comentario"
        />
        <button
          class="btn-page"
          type="button"
          :disabled="!isAuthenticated || socialLoading"
          @click="submitComment"
        >
          Comentar
        </button>
      </div>

      <div
        v-if="socialError"
        class="state-block error compact"
      >
        {{ socialError }}
      </div>

      <ul
        v-if="selectedComments.length"
        class="moderation-list"
      >
        <li
          v-for="comment in selectedComments"
          :key="comment.id"
          class="moderation-item"
        >
          <div class="moderation-title">
            {{ comment.content || comment.body || '(sin texto)' }}
          </div>
          <div class="small-meta">
            {{ comment.user_id || 'usuario' }}
          </div>
        </li>
      </ul>
    </div>

    <div class="filters">
      <input
        class="input"
        type="search"
        :value="searchQuery"
        placeholder="Buscar por título, descripción o tag"
        @input="emit('change-search', $event.target.value)"
      >

      <div class="row">
        <select
          class="input"
          :value="categoryFilter"
          @change="emit('change-category', $event.target.value)"
        >
          <option value="all">
            Todas las categorías
          </option>
          <option
            v-for="category in availableCategories"
            :key="category"
            :value="category"
          >
            {{ category }}
          </option>
        </select>

        <select
          class="input"
          :value="tagFilter"
          @change="emit('change-tag', $event.target.value)"
        >
          <option value="all">
            Todas las etiquetas
          </option>
          <option
            v-for="tag in availableTags"
            :key="tag"
            :value="tag"
          >
            {{ tag }}
          </option>
        </select>
      </div>

      <div class="row row-three">
        <select
          class="input"
          :value="bestTimeFilter"
          @change="emit('change-best-time', $event.target.value)"
        >
          <option value="all">
            Mejor hora
          </option>
          <option
            v-for="option in bestTimeOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <select
          class="input"
          :value="difficultyFilter"
          @change="emit('change-difficulty', $event.target.value)"
        >
          <option value="all">
            Dificultad
          </option>
          <option
            v-for="option in difficultyOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>

        <select
          class="input"
          :value="seasonFilter"
          @change="emit('change-season', $event.target.value)"
        >
          <option value="all">
            Temporada
          </option>
          <option
            v-for="option in seasonOptions"
            :key="option"
            :value="option"
          >
            {{ option }}
          </option>
        </select>
      </div>

      <div
        class="view-toggle"
        role="group"
        aria-label="Modo de visualización"
      >
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'list' }"
          type="button"
          @click="emit('change-view', 'list')"
        >
          Lista
        </button>
        <button
          class="toggle-btn"
          :class="{ active: viewMode === 'grid' }"
          type="button"
          @click="emit('change-view', 'grid')"
        >
          Grid
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="state-block"
    >
      Cargando spots…
    </div>
    <div
      v-else-if="error"
      class="state-block error"
    >
      {{ error }}
    </div>
    <div
      v-else-if="spots.length === 0"
      class="state-block"
    >
      No hay spots para los filtros actuales.
    </div>

    <ul
      v-else
      class="spot-list"
      :class="{ grid: viewMode === 'grid' }"
    >
      <li
        v-for="spot in spots"
        :key="spot.id"
      >
        <button
          class="spot-item"
          :class="{ active: String(selectedId) === String(spot.id) }"
          type="button"
          @click="handleClick(spot.id)"
        >
          <strong>{{ spot.title || 'Sin título' }}</strong>
          <span>{{ spot.category || 'sin categoría' }}</span>
          <small>{{ formatTags(spot.tags) }}</small>
        </button>
      </li>
    </ul>

    <div class="pagination">
      <span class="page-info">Página {{ page }} / {{ pages }} · Total {{ total }}</span>
      <div class="page-actions">
        <button
          class="btn-page"
          type="button"
          :disabled="!hasPrev || loading"
          @click="emit('prev-page')"
        >
          Anterior
        </button>
        <button
          class="btn-page"
          type="button"
          :disabled="!hasNext || loading"
          @click="emit('next-page')"
        >
          Siguiente
        </button>
      </div>
    </div>
  </aside>
</template>
