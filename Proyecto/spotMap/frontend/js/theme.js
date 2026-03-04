/**
 * theme.js - Sistema de temas claro/oscuro
 */

const THEME_KEY = 'spotmap_theme';
let currentTheme = localStorage.getItem(THEME_KEY) || 'dark';

/**
 * Initialize theme system
 */
export function initTheme() {
    console.log('[THEME] Initializing theme system...');
    
    // Apply saved theme
    applyTheme(currentTheme);
    
    // Setup toggle button
    const themeToggle = document.getElementById('btn-theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeButton();
    }
    
    console.log(`[THEME] ✓ Theme: ${currentTheme}`);
}

/**
 * Toggle between light and dark
 */
export function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
    updateThemeButton();
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    if (theme === 'light') {
        // Light theme colors - mejorado para mejor contraste
        document.documentElement.style.setProperty('--color-bg', '#ffffff');
        document.documentElement.style.setProperty('--color-bg-alt', '#f9fafb');
        document.documentElement.style.setProperty('--color-bg-card', 'rgba(255, 255, 255, 0.98)');
        document.documentElement.style.setProperty('--color-text-primary', '#111827');
        document.documentElement.style.setProperty('--color-text-secondary', '#1f2937');
        document.documentElement.style.setProperty('--color-text-tertiary', '#374151');
        document.documentElement.style.setProperty('--color-text-muted', '#6b7280');
        document.documentElement.style.setProperty('--color-border', 'rgba(14, 165, 233, 0.4)');
        document.documentElement.style.setProperty('--color-border-light', 'rgba(14, 165, 233, 0.2)');
        document.documentElement.style.setProperty('--color-primary-light', 'rgba(14, 165, 233, 0.25)');
        document.documentElement.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.08)');
        document.documentElement.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.12)');
        document.documentElement.style.setProperty('--shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.15)');
        document.documentElement.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.85)');
        document.documentElement.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #ffffff 0%, #f9fafb 50%, #f3f4f6 100%)');
    } else {
        // Dark theme colors (default)
        document.documentElement.style.setProperty('--color-bg', '#0a0e27');
        document.documentElement.style.setProperty('--color-bg-alt', '#111827');
        document.documentElement.style.setProperty('--color-bg-card', 'rgba(17, 24, 39, 0.95)');
        document.documentElement.style.setProperty('--color-text-primary', '#f1f5f9');
        document.documentElement.style.setProperty('--color-text-secondary', '#e2e8f0');
        document.documentElement.style.setProperty('--color-text-tertiary', '#cbd5e1');
        document.documentElement.style.setProperty('--color-text-muted', '#94a3b8');
        document.documentElement.style.setProperty('--color-border', 'rgba(14, 165, 233, 0.25)');
        document.documentElement.style.setProperty('--color-border-light', 'rgba(14, 165, 233, 0.1)');
        document.documentElement.style.setProperty('--color-primary-light', 'rgba(14, 165, 233, 0.15)');
        document.documentElement.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.3)');
        document.documentElement.style.setProperty('--shadow-md', '0 4px 16px rgba(0, 0, 0, 0.4)');
        document.documentElement.style.setProperty('--shadow-lg', '0 8px 32px rgba(0, 0, 0, 0.5)');
        document.documentElement.style.setProperty('--glass-bg', 'rgba(17, 24, 39, 0.8)');
        document.documentElement.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #0a0e27 0%, #111827 50%, #1f2937 100%)');
    }
}

/**
 * Update theme toggle button
 */
function updateThemeButton() {
    const themeToggle = document.getElementById('btn-theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = currentTheme === 'dark' ? '☀️' : '🌙';
        themeToggle.title = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
    }
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
    return currentTheme;
}
