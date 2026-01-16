<!-- MODERATION_UI_ENHANCEMENTS.md -->
# Mejoras Visuales para Moderación

## 1. Indicador de Status en el Mapa

Para mostrar visualmente si un spot está pending/approved/rejected:

```javascript
// En map.js - addMarker()
function addMarker(spot) {
  let markerColor = '#FF6B6B'; // Rojo por defecto
  
  if (spot.status === 'approved') {
    markerColor = '#51CF66'; // Verde: aprobado
  } else if (spot.status === 'pending') {
    markerColor = '#FFD93D'; // Amarillo: pendiente
  } else if (spot.status === 'rejected') {
    markerColor = '#A8A8A8'; // Gris: rechazado
  }
  
  // Crear icono con color
  const marker = L.circleMarker([spot.latitude, spot.longitude], {
    radius: 8,
    fillColor: markerColor,
    color: markerColor,
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7
  });
  
  marker.bindPopup(`
    <strong>${spot.title}</strong>
    <div class="small mt-1">
      <span class="badge badge-${spot.status === 'approved' ? 'success' : spot.status === 'pending' ? 'warning' : 'secondary'}">
        ${spot.status}
      </span>
    </div>
  `);
  
  map.addLayer(marker);
  return marker;
}
```

## 2. Badge en Sidebar (Lista de Spots)

Mostrar estado en el listado:

```html
<!-- En el renderizado de spots en ui.js -->
<div class="list-group-item d-flex justify-content-between align-items-start">
  <div>
    <h6 class="mb-0">
      ${spot.title}
      <span class="badge badge-${spot.status === 'approved' ? 'success' : 'warning'}">
        ${spot.status}
      </span>
    </h6>
    <small class="text-muted">${spot.description}</small>
  </div>
  <button class="btn btn-sm btn-danger" onclick="deleteSpot(${spot.id})">
    🗑️
  </button>
</div>
```

## 3. Panel de Moderación Mejorado

Mostrar preview de foto + información detallada:

```html
<div id="moderation-panel" class="moderation-panel card">
  <div class="card-header bg-light d-flex justify-content-between align-items-center">
    <span><strong>Moderación</strong></span>
    <span class="badge badge-warning" id="pending-count">Pending: 0</span>
    <button type="button" class="btn-close" id="btn-close-moderation"></button>
  </div>
  
  <div id="pending-list" class="list-group">
    <!-- Cada item: -->
    <div class="list-group-item">
      <!-- Preview de foto -->
      <img id="preview-${spot.id}" 
           src="${spot.image_url || ''}" 
           alt="Preview" 
           class="img-thumbnail mb-2" 
           style="max-width: 100%; max-height: 120px;">
      
      <!-- Información -->
      <div class="mb-2">
        <strong>#${spot.id} ${spot.title}</strong>
        <div class="small text-muted">
          Subido: ${new Date(spot.created_at).toLocaleString()}
        </div>
      </div>
      
      <!-- Descripción -->
      <div class="small mb-2">
        ${spot.description || '(sin descripción)'}
      </div>
      
      <!-- Botones de acción -->
      <div class="btn-group w-100" role="group">
        <button class="btn btn-sm btn-outline-success" data-action="approve">
          ✔️ Aprobar
        </button>
        <button class="btn btn-sm btn-outline-danger" data-action="reject">
          ❌ Rechazar
        </button>
        <button class="btn btn-sm btn-outline-info" data-action="focus">
          👁️ Ver
        </button>
      </div>
    </div>
  </div>
</div>
```

## 4. Notificaciones en Tiempo Real

Avisar cuando hay spots nuevos:

```javascript
// En main.js - setupRealtime()
subscribeToSpots((newSpot) => {
  if (newSpot.status === 'pending' && getCurrentRole() === 'moderator') {
    // Notificación visual para moderador
    showToast(`⏳ Nuevo spot pendiente: ${newSpot.title}`, 'warning', {
      autoCloseMs: 5000,
      actionButton: {
        label: 'Ver',
        onClick: () => focusSpot(newSpot.id)
      }
    });
    
    // Sound notification (opcional)
    playNotificationSound();
  }
});
```

## 5. Estadísticas en Dashboard

Mostrar métricas de moderación:

```javascript
export function getModerationStats() {
  return {
    pending: pendingSpots.length,
    approved: approvedSpots.length,
    rejected: rejectedSpots.length,
    avgTimeToApprove: calculateAvgApprovalTime(),
    topModerators: getTopModerators(),
    mostCommonRejectReason: getMostCommonRejectReason()
  };
}
```

```html
<!-- Dashboard widget -->
<div class="card mt-3">
  <div class="card-header">Estadísticas de Moderación</div>
  <div class="card-body">
    <div class="row">
      <div class="col-md-3">
        <div class="stat">
          <div class="stat-value text-warning" id="stat-pending">0</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat">
          <div class="stat-value text-success" id="stat-approved">0</div>
          <div class="stat-label">Aprobados</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat">
          <div class="stat-value text-danger" id="stat-rejected">0</div>
          <div class="stat-label">Rechazados</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="stat">
          <div class="stat-value text-info" id="stat-avg-time">2h</div>
          <div class="stat-label">Tiempo Promedio</div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## 6. Razón de Rechazo (Opcional)

Permitir comentar por qué se rechaza:

```html
<!-- Modal para rechazar -->
<div class="modal fade" id="modalRejectSpot">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Rechazar Spot</h5>
      </div>
      <div class="modal-body">
        <label>Razón del rechazo:</label>
        <textarea class="form-control" id="reject-reason" rows="3" 
                  placeholder="Ej: Foto no clara, ubicación incorrecta, etc.">
        </textarea>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Cancelar
        </button>
        <button type="button" class="btn btn-danger" id="btn-confirm-reject">
          Rechazar
        </button>
      </div>
    </div>
  </div>
</div>
```

```javascript
// En supabaseClient.js
export async function rejectSpot(id, reason = '') {
  if (!supabaseAvailable()) return false;
  const { error } = await supabase
    .from('spots')
    .update({ 
      status: 'rejected',
      reject_reason: reason,
      rejected_at: new Date().toISOString()
    })
    .eq('id', id);
  if (error) {
    console.error('[Supabase] Error rechazando', error);
    return false;
  }
  return true;
}
```

## 7. Log de Acciones de Moderación

Registrar qué hace cada moderador:

```javascript
// moderation.log
{
  timestamp: "2026-01-16T10:30:00Z",
  moderator_id: "user-123",
  action: "approved",
  spot_id: 5,
  spot_title: "Parque Milan",
  reason: null
}

{
  timestamp: "2026-01-16T10:35:00Z",
  moderator_id: "user-123",
  action: "rejected",
  spot_id: 6,
  spot_title: "Foto Spam",
  reason: "No es un lugar real"
}
```

```sql
-- En Supabase
CREATE TABLE moderation_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  moderator_id UUID NOT NULL,
  action ENUM('approved', 'rejected', 'commented'),
  spot_id BIGINT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (moderator_id) REFERENCES profiles(user_id),
  FOREIGN KEY (spot_id) REFERENCES spots(id)
);
```

---

## 🎨 Estilos CSS (styles.css)

```css
/* Badges de status */
.badge-pending {
  background-color: #FFD93D;
  color: #333;
}

.badge-approved {
  background-color: #51CF66;
  color: white;
}

.badge-rejected {
  background-color: #A8A8A8;
  color: white;
}

/* Panel de moderación */
.moderation-panel {
  border-left: 4px solid #FFD93D;
  background: rgba(255, 217, 61, 0.05);
}

.moderation-panel .list-group-item {
  border-left: 3px solid transparent;
}

.moderation-panel .list-group-item:hover {
  border-left-color: #FFD93D;
  background-color: rgba(255, 217, 61, 0.1);
}

/* Estadísticas */
.stat {
  text-align: center;
  padding: 1rem 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
}

/* Imagen preview en moderación */
.moderation-panel img {
  border-radius: 4px;
  border: 1px solid #ddd;
}
```

---

## 📱 Responsive

Todo el panel ya es responsive:
- **Desktop**: Panel flotante en esquina
- **Tablet**: Panel a un lado, se reduce anchura
- **Mobile**: Panel fullscreen con scroll

```css
@media (max-width: 768px) {
  .moderation-panel {
    position: fixed !important;
    top: 70px !important;
    right: 0 !important;
    left: 0 !important;
    width: 100% !important;
    max-height: calc(100vh - 140px) !important;
    border-radius: 0;
    z-index: 1050;
  }
}
```

---

## 🚀 Implementar Paso a Paso

1. **Primero**: Activar SQL en Supabase (MODERATION_SETUP.md)
2. **Luego**: Recargar página, verificar panel
3. **Opcional**: Agregar previews de foto
4. **Futuro**: Agregar notificaciones de sonido, dashboard, logs

---

## 📝 Resumen

Las mejoras visuales hacen que la moderación sea:
- ✅ Más clara (badges de color)
- ✅ Más rápida (panel centralizado)
- ✅ Más informada (previews, estadísticas)
- ✅ Más profesional (logs de acciones)

