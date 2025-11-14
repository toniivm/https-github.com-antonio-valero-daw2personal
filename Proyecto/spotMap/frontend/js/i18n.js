/**
 * i18n.js - Sistema de internacionalización
 * Soporte para Español e Inglés
 */

const translations = {
    es: {
        // Navbar
        'app.title': 'SpotMap',
        'nav.menu': 'Menú',
        'nav.addSpot': 'Añadir Spot',
        'nav.login': 'Iniciar Sesión',
        'nav.register': 'Registrarse',
        'nav.profile': 'Mi Perfil',
        'nav.mySpots': 'Mis Spots',
        'nav.favorites': 'Favoritos',
        'nav.settings': 'Configuración',
        'nav.logout': 'Cerrar Sesión',
        
        // Sidebar
        'sidebar.title': 'Spots Disponibles',
        'sidebar.search': 'Buscar spots...',
        'sidebar.filterCategory': 'Todas las categorías',
        'sidebar.viewList': 'Vista lista',
        'sidebar.viewGrid': 'Vista cuadrícula',
        'sidebar.geolocate': 'Mi ubicación',
        'sidebar.noSpots': 'No hay spots para mostrar',
        'sidebar.spotsCount': 'spots encontrados',
        
        // Modals - Add Spot
        'modal.addSpot.title': 'Añadir Nuevo Spot',
        'modal.addSpot.name': 'Nombre del Spot',
        'modal.addSpot.namePlaceholder': 'ej: Mirador del Fitu',
        'modal.addSpot.description': 'Descripción',
        'modal.addSpot.descriptionPlaceholder': 'Describe este lugar increíble...',
        'modal.addSpot.category': 'Categoría',
        'modal.addSpot.categoryPlaceholder': 'ej: Mirador, Playa, Montaña',
        'modal.addSpot.image': 'URL de la Imagen',
        'modal.addSpot.imagePlaceholder': 'https://...',
        'modal.addSpot.coordinates': 'Coordenadas',
        'modal.addSpot.coordinatesHelp': 'Haz click en el mapa o escribe las coordenadas',
        'modal.addSpot.latitude': 'Latitud',
        'modal.addSpot.longitude': 'Longitud',
        'modal.addSpot.cancel': 'Cancelar',
        'modal.addSpot.submit': 'Crear Spot',
        
        // Modals - Login
        'modal.login.title': 'Iniciar Sesión',
        'modal.login.email': 'Email',
        'modal.login.emailPlaceholder': 'tu@email.com',
        'modal.login.password': 'Contraseña',
        'modal.login.passwordPlaceholder': '••••••••',
        'modal.login.remember': 'Recordarme',
        'modal.login.forgot': '¿Olvidaste tu contraseña?',
        'modal.login.submit': 'Iniciar Sesión',
        'modal.login.noAccount': '¿No tienes cuenta?',
        'modal.login.registerLink': 'Regístrate aquí',
        
        // Modals - Register
        'modal.register.title': 'Crear Cuenta',
        'modal.register.name': 'Nombre completo',
        'modal.register.namePlaceholder': 'Tu nombre',
        'modal.register.email': 'Email',
        'modal.register.emailPlaceholder': 'tu@email.com',
        'modal.register.password': 'Contraseña',
        'modal.register.passwordPlaceholder': 'Mínimo 6 caracteres',
        'modal.register.confirmPassword': 'Confirmar contraseña',
        'modal.register.confirmPasswordPlaceholder': 'Repite tu contraseña',
        'modal.register.terms': 'Acepto los términos y condiciones',
        'modal.register.submit': 'Registrarse',
        'modal.register.hasAccount': '¿Ya tienes cuenta?',
        'modal.register.loginLink': 'Inicia sesión',
        
        // Spot Card
        'spot.like': 'Me gusta',
        'spot.share': 'Compartir',
        'spot.delete': 'Eliminar',
        'spot.noDescription': 'Sin descripción',
        'spot.comments': 'Comentarios',
        'spot.addComment': 'Escribe un comentario...',
        'spot.publishComment': 'Publicar comentario',
        'spot.noComments': 'No hay comentarios aún. ¡Sé el primero!',
        'spot.loginToComment': 'para comentar',
        
        // Share Modal
        'share.title': 'Compartir Spot',
        'share.whatsapp': 'WhatsApp',
        'share.twitter': 'Twitter',
        'share.facebook': 'Facebook',
        'share.telegram': 'Telegram',
        'share.email': 'Email',
        'share.copy': 'Copiar enlace',
        'share.copied': 'Enlace copiado',
        
        // Footer
        'footer.about': 'Acerca de',
        'footer.aboutUs': 'Sobre SpotMap',
        'footer.team': 'Equipo',
        'footer.careers': 'Trabaja con nosotros',
        'footer.press': 'Prensa',
        'footer.explore': 'Explorar',
        'footer.discoverSpots': 'Descubrir Spots',
        'footer.categories': 'Categorías',
        'footer.map': 'Mapa',
        'footer.blog': 'Blog',
        'footer.support': 'Soporte',
        'footer.faq': 'Preguntas frecuentes',
        'footer.contact': 'Contacto',
        'footer.help': 'Centro de ayuda',
        'footer.legal': 'Legal',
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos de uso',
        'footer.cookies': 'Cookies',
        'footer.download': 'Descargar App',
        'footer.rights': 'Todos los derechos reservados',
        'footer.social': 'Síguenos en redes',
        
        // Notifications
        'notif.spotCreated': 'Spot creado correctamente',
        'notif.spotDeleted': 'Spot eliminado',
        'notif.loginSuccess': 'Sesión iniciada',
        'notif.logoutSuccess': 'Sesión cerrada',
        'notif.registerSuccess': 'Cuenta creada correctamente',
        'notif.error': 'Ha ocurrido un error',
        'notif.commentAdded': 'Comentario añadido',
        'notif.likeAdded': 'Añadido a favoritos',
        'notif.likeRemoved': 'Eliminado de favoritos',
        'notif.loginRequired': 'Debes iniciar sesión',
        
        // Time
        'time.now': 'Ahora',
        'time.minutesAgo': 'm',
        'time.hoursAgo': 'h',
        'time.daysAgo': 'd',
        
        // Actions
        'action.close': 'Cerrar',
        'action.save': 'Guardar',
        'action.edit': 'Editar',
        'action.delete': 'Eliminar',
        'action.confirm': 'Confirmar',
        'action.cancel': 'Cancelar',
        'action.search': 'Buscar',
        'action.filter': 'Filtrar',
        'action.loading': 'Cargando...',
        
        // Pages
        'page.about': 'Acerca de',
        'page.faq': 'Preguntas Frecuentes',
        'page.contact': 'Contacto',
        'page.blog': 'Blog',
        'page.privacy': 'Política de Privacidad',
        'page.terms': 'Términos y Condiciones',
    },
    
    en: {
        // Navbar
        'app.title': 'SpotMap',
        'nav.menu': 'Menu',
        'nav.addSpot': 'Add Spot',
        'nav.login': 'Sign In',
        'nav.register': 'Sign Up',
        'nav.profile': 'My Profile',
        'nav.mySpots': 'My Spots',
        'nav.favorites': 'Favorites',
        'nav.settings': 'Settings',
        'nav.logout': 'Sign Out',
        
        // Sidebar
        'sidebar.title': 'Available Spots',
        'sidebar.search': 'Search spots...',
        'sidebar.filterCategory': 'All categories',
        'sidebar.viewList': 'List view',
        'sidebar.viewGrid': 'Grid view',
        'sidebar.geolocate': 'My location',
        'sidebar.noSpots': 'No spots to display',
        'sidebar.spotsCount': 'spots found',
        
        // Modals - Add Spot
        'modal.addSpot.title': 'Add New Spot',
        'modal.addSpot.name': 'Spot Name',
        'modal.addSpot.namePlaceholder': 'e.g: Fitu Viewpoint',
        'modal.addSpot.description': 'Description',
        'modal.addSpot.descriptionPlaceholder': 'Describe this amazing place...',
        'modal.addSpot.category': 'Category',
        'modal.addSpot.categoryPlaceholder': 'e.g: Viewpoint, Beach, Mountain',
        'modal.addSpot.image': 'Image URL',
        'modal.addSpot.imagePlaceholder': 'https://...',
        'modal.addSpot.coordinates': 'Coordinates',
        'modal.addSpot.coordinatesHelp': 'Click on the map or type coordinates',
        'modal.addSpot.latitude': 'Latitude',
        'modal.addSpot.longitude': 'Longitude',
        'modal.addSpot.cancel': 'Cancel',
        'modal.addSpot.submit': 'Create Spot',
        
        // Modals - Login
        'modal.login.title': 'Sign In',
        'modal.login.email': 'Email',
        'modal.login.emailPlaceholder': 'your@email.com',
        'modal.login.password': 'Password',
        'modal.login.passwordPlaceholder': '••••••••',
        'modal.login.remember': 'Remember me',
        'modal.login.forgot': 'Forgot your password?',
        'modal.login.submit': 'Sign In',
        'modal.login.noAccount': "Don't have an account?",
        'modal.login.registerLink': 'Sign up here',
        
        // Modals - Register
        'modal.register.title': 'Create Account',
        'modal.register.name': 'Full name',
        'modal.register.namePlaceholder': 'Your name',
        'modal.register.email': 'Email',
        'modal.register.emailPlaceholder': 'your@email.com',
        'modal.register.password': 'Password',
        'modal.register.passwordPlaceholder': 'Minimum 6 characters',
        'modal.register.confirmPassword': 'Confirm password',
        'modal.register.confirmPasswordPlaceholder': 'Repeat your password',
        'modal.register.terms': 'I accept the terms and conditions',
        'modal.register.submit': 'Sign Up',
        'modal.register.hasAccount': 'Already have an account?',
        'modal.register.loginLink': 'Sign in',
        
        // Spot Card
        'spot.like': 'Like',
        'spot.share': 'Share',
        'spot.delete': 'Delete',
        'spot.noDescription': 'No description',
        'spot.comments': 'Comments',
        'spot.addComment': 'Write a comment...',
        'spot.publishComment': 'Post comment',
        'spot.noComments': 'No comments yet. Be the first!',
        'spot.loginToComment': 'to comment',
        
        // Share Modal
        'share.title': 'Share Spot',
        'share.whatsapp': 'WhatsApp',
        'share.twitter': 'Twitter',
        'share.facebook': 'Facebook',
        'share.telegram': 'Telegram',
        'share.email': 'Email',
        'share.copy': 'Copy link',
        'share.copied': 'Link copied',
        
        // Footer
        'footer.about': 'About',
        'footer.aboutUs': 'About SpotMap',
        'footer.team': 'Team',
        'footer.careers': 'Careers',
        'footer.press': 'Press',
        'footer.explore': 'Explore',
        'footer.discoverSpots': 'Discover Spots',
        'footer.categories': 'Categories',
        'footer.map': 'Map',
        'footer.blog': 'Blog',
        'footer.support': 'Support',
        'footer.faq': 'FAQ',
        'footer.contact': 'Contact',
        'footer.help': 'Help Center',
        'footer.legal': 'Legal',
        'footer.privacy': 'Privacy',
        'footer.terms': 'Terms of Service',
        'footer.cookies': 'Cookies',
        'footer.download': 'Download App',
        'footer.rights': 'All rights reserved',
        'footer.social': 'Follow us',
        
        // Notifications
        'notif.spotCreated': 'Spot created successfully',
        'notif.spotDeleted': 'Spot deleted',
        'notif.loginSuccess': 'Signed in successfully',
        'notif.logoutSuccess': 'Signed out',
        'notif.registerSuccess': 'Account created successfully',
        'notif.error': 'An error occurred',
        'notif.commentAdded': 'Comment added',
        'notif.likeAdded': 'Added to favorites',
        'notif.likeRemoved': 'Removed from favorites',
        'notif.loginRequired': 'You must sign in',
        
        // Time
        'time.now': 'Now',
        'time.minutesAgo': 'm',
        'time.hoursAgo': 'h',
        'time.daysAgo': 'd',
        
        // Actions
        'action.close': 'Close',
        'action.save': 'Save',
        'action.edit': 'Edit',
        'action.delete': 'Delete',
        'action.confirm': 'Confirm',
        'action.cancel': 'Cancel',
        'action.search': 'Search',
        'action.filter': 'Filter',
        'action.loading': 'Loading...',
        
        // Pages
        'page.about': 'About',
        'page.faq': 'FAQ',
        'page.contact': 'Contact',
        'page.blog': 'Blog',
        'page.privacy': 'Privacy Policy',
        'page.terms': 'Terms & Conditions',
    }
};

// Current language
let currentLanguage = localStorage.getItem('spotmap_language') || 'es';

/**
 * Get translation for a key
 */
export function t(key) {
    return translations[currentLanguage][key] || key;
}

/**
 * Get current language
 */
export function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * Set language
 */
export function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`[i18n] Language ${lang} not supported`);
        return;
    }
    
    currentLanguage = lang;
    localStorage.setItem('spotmap_language', lang);
    
    // Update all elements with data-i18n attribute
    updatePageTranslations();
    
    console.log(`[i18n] Language changed to: ${lang}`);
}

/**
 * Update all translations on the page
 */
export function updatePageTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        element.textContent = t(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Update titles/aria-labels
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        element.title = t(key);
    });
}

/**
 * Initialize i18n system
 */
export function initI18n() {
    console.log('[i18n] Initializing internationalization...');
    console.log(`[i18n] Current language: ${currentLanguage}`);
    
    // Update page translations
    updatePageTranslations();
    
    // Setup language toggle button
    const langToggle = document.getElementById('btn-language-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', toggleLanguage);
        updateLanguageButton();
    }
    
    console.log('[i18n] ✓ Initialized');
}

/**
 * Toggle between ES and EN
 */
export function toggleLanguage() {
    const newLang = currentLanguage === 'es' ? 'en' : 'es';
    setLanguage(newLang);
    updateLanguageButton();
}

/**
 * Update language toggle button text
 */
function updateLanguageButton() {
    const langToggle = document.getElementById('btn-language-toggle');
    if (langToggle) {
        langToggle.innerHTML = currentLanguage === 'es' 
            ? '🇬🇧 EN' 
            : '🇪🇸 ES';
    }
}
