/**
 * ⚠️ SPOTMAP - PRODUCTION ENVIRONMENT LOADER
 * Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
 * PROHIBIDA SU COPIA, MODIFICACIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN.
 */

class ProductionEnvLoader {
    constructor() {
        this.env = {};
        this.loadEnv();
        this.validateEnv();
        this.applySecurityPolicies();
    }

    /**
     * Load environment variables from .env.production
     */
    loadEnv() {
        // Check if we're in development or production
        const isDev = !window.location.hostname.includes('spotmap.local') && 
                      window.location.hostname !== 'localhost';

        // In production, these should be injected by the server
        // via window.__SPOTMAP_CONFIG__ or environment variables
        this.env = {
            // API Configuration
            supabaseUrl: window.__SPOTMAP_CONFIG__?.SUPABASE_URL || 
                        import.meta.env.VITE_SUPABASE_URL,
            supabaseKey: window.__SPOTMAP_CONFIG__?.SUPABASE_ANON_KEY || 
                        import.meta.env.VITE_SUPABASE_ANON_KEY,
            apiUrl: window.__SPOTMAP_CONFIG__?.API_URL || 
                   import.meta.env.VITE_API_URL,
            apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),

            // Security
            securityGuardEnabled: this.parseBoolean(
                window.__SPOTMAP_CONFIG__?.SECURITY_GUARD || 
                import.meta.env.VITE_ENABLE_SECURITY_GUARD
            ),
            fingerprintingEnabled: this.parseBoolean(
                window.__SPOTMAP_CONFIG__?.FINGERPRINTING || 
                import.meta.env.VITE_ENABLE_FINGERPRINTING
            ),
            devToolsBlocked: this.parseBoolean(
                import.meta.env.VITE_BLOCK_DEVTOOLS
            ),
            rightClickBlocked: this.parseBoolean(
                import.meta.env.VITE_BLOCK_RIGHT_CLICK
            ),
            shortcutsBlocked: this.parseBoolean(
                import.meta.env.VITE_BLOCK_SHORTCUTS
            ),

            // Monitoring
            errorLoggingEnabled: this.parseBoolean(
                import.meta.env.VITE_LOG_ERRORS
            ),
            errorReportingEnabled: this.parseBoolean(
                import.meta.env.VITE_SEND_ERROR_REPORTS
            ),
            errorReportUrl: import.meta.env.VITE_ERROR_REPORT_URL,

            // Features
            cacheEnabled: this.parseBoolean(
                import.meta.env.VITE_CACHE_ENABLED
            ),
            cacheDuration: parseInt(
                import.meta.env.VITE_CACHE_DURATION || '3600000'
            ),
            maintenanceMode: this.parseBoolean(
                import.meta.env.VITE_MAINTENANCE_MODE
            ),
            analyticsEnabled: this.parseBoolean(
                import.meta.env.VITE_ENABLE_ANALYTICS
            ),

            // Environment
            nodeEnv: import.meta.env.MODE || 'production',
            isDev: isDev
        };
    }

    /**
     * Validate required environment variables
     */
    validateEnv() {
        const required = [
            'supabaseUrl',
            'supabaseKey',
            'apiUrl'
        ];

        const missing = required.filter(key => !this.env[key]);

        if (missing.length > 0) {
            const error = `Missing required environment variables: ${missing.join(', ')}`;
            console.error('❌ ' + error);
            
            // In production, show maintenance page
            if (this.env.nodeEnv === 'production') {
                this.showMaintenancePage(error);
            }
            
            throw new Error(error);
        }

        console.log('✅ Environment variables validated');
    }

    /**
     * Apply security policies
     */
    applySecurityPolicies() {
        // Content Security Policy - enforced by backend headers
        this.applyCorsPolicy();
        this.applySubresourceIntegrity();
        this.disableUnsafeEvals();

        console.log('✅ Security policies applied');
    }

    /**
     * Apply CORS policy
     */
    applyCorsPolicy() {
        const allowedOrigins = [
            this.env.supabaseUrl,
            this.env.apiUrl,
            window.location.origin
        ];

        // Validate all CORS requests
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
            const [resource] = args;
            const url = new URL(resource, window.location.origin);

            // Allow same-origin
            if (url.origin === window.location.origin) {
                return originalFetch.apply(this, args);
            }

            // Allow configured origins
            if (!allowedOrigins.some(origin => url.origin === origin)) {
                console.warn(`CORS: Blocked request to ${url.origin}`);
                return Promise.reject(new Error('CORS policy violation'));
            }

            return originalFetch.apply(this, args);
        };
    }

    /**
     * Apply Subresource Integrity checks
     */
    applySubresourceIntegrity() {
        // Check all loaded scripts have integrity
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const missingIntegrity = scripts.filter(s => !s.integrity);

        if (missingIntegrity.length > 0) {
            console.warn(`⚠️ ${missingIntegrity.length} scripts without integrity attribute`);
        }
    }

    /**
     * Disable unsafe eval
     */
    disableUnsafeEvals() {
        // Override eval
        window.eval = function() {
            throw new Error('eval() is disabled for security reasons');
        };

        // Override Function constructor for code evaluation
        const OriginalFunction = Function;
        window.Function = function(...args) {
            if (args.some(arg => typeof arg === 'string' && arg.includes('eval'))) {
                throw new Error('Function constructor with eval is disabled');
            }
            return OriginalFunction.apply(this, args);
        };
    }

    /**
     * Get environment variable
     */
    get(key, defaultValue = null) {
        return this.env[key] !== undefined ? this.env[key] : defaultValue;
    }

    /**
     * Parse boolean values
     */
    parseBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return false;
    }

    /**
     * Show maintenance page
     */
    showMaintenancePage(message) {
        document.body.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: #1a1a1a; color: white; font-family: Arial;">
                <div style="text-align: center;">
                    <h1>🔧 Maintenance Mode</h1>
                    <p>We're performing scheduled maintenance.</p>
                    <p style="color: #888; font-size: 12px;">Please try again later.</p>
                </div>
            </div>
        `;
    }

    /**
     * Log configuration (sanitized)
     */
    logConfig() {
        const sanitized = {
            ...this.env,
            supabaseUrl: this.maskUrl(this.env.supabaseUrl),
            supabaseKey: '***',
            apiUrl: this.env.apiUrl,
            nodeEnv: this.env.nodeEnv
        };

        console.table(sanitized);
    }

    /**
     * Mask sensitive URLs
     */
    maskUrl(url) {
        if (!url) return url;
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.hostname}`;
    }
}

// Auto-initialize
export const envLoader = new ProductionEnvLoader();

// Export for use in other modules
export default envLoader;
