/**
 * 🎨 Sidebar Toggle - Comportamiento colapsable con animaciones fluidas
 * Estilo Google Maps con personalidad única
 */

export function initSidebar() {
  const toggleBtn = document.getElementById('btn-toggle-sidebar-desktop');
  const sidebar = document.getElementById('sidebar');
  
  if (!toggleBtn || !sidebar) {
    console.log('[SIDEBAR] Elementos no encontrados en esta vista');
    return;
  }

  const isMobileViewport = window.matchMedia('(max-width: 991.98px)').matches;
  if (isMobileViewport) {
    sidebar.setAttribute('data-collapsed', 'false');
    toggleBtn.classList.remove('collapsed');
    console.log('[SIDEBAR] Modo móvil detectado, colapsado desactivado');
    return;
  }

  // Estado inicial
  let isCollapsed = sidebar.getAttribute('data-collapsed') === 'true';

  // Función para alternar el estado
  function toggleSidebar() {
    isCollapsed = !isCollapsed;
    
    // Actualizar atributo data
    sidebar.setAttribute('data-collapsed', isCollapsed);
    
    // Actualizar clase del botón
    if (isCollapsed) {
      toggleBtn.classList.add('collapsed');
    } else {
      toggleBtn.classList.remove('collapsed');
    }

    // Animar icono
    const icon = toggleBtn.querySelector('i');
    if (icon) {
      if (isCollapsed) {
        icon.classList.remove('bi-chevron-left');
        icon.classList.add('bi-chevron-right');
      } else {
        icon.classList.remove('bi-chevron-right');
        icon.classList.add('bi-chevron-left');
      }
    }

    // Guardar preferencia en localStorage
    localStorage.setItem('sidebar-collapsed', isCollapsed);

    // Forzar recalculo del mapa después de la transición
    setTimeout(() => {
      if (window.map) {
        window.map.invalidateSize();
      }
    }, 400); // Match con la duración de la transición CSS

    console.log(`[SIDEBAR] ${isCollapsed ? 'Colapsado' : 'Expandido'}`);
  }

  // Event listener del botón
  toggleBtn.addEventListener('click', toggleSidebar);

  // Restaurar estado desde localStorage
  const savedState = localStorage.getItem('sidebar-collapsed');
  if (savedState === 'true') {
    isCollapsed = false; // Invertir para que toggleSidebar lo ponga en true
    toggleSidebar();
  }

  // Efectos hover del botón (agregar brillo)
  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.transform = isCollapsed 
      ? 'translateY(-50%) scale(1.15)' 
      : 'translateY(-50%) scale(1.15) rotate(180deg)';
  });

  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.transform = isCollapsed 
      ? 'translateY(-50%)' 
      : 'translateY(-50%) rotate(180deg)';
  });

  console.log('[SIDEBAR] ✓ Toggle inicializado');
}
