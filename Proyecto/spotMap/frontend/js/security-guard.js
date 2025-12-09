/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Todos los derechos reservados.
 * 
 * Sistema de protección anti-scraping y watermarking
 */

class SecurityGuard {
    constructor() {
        this.requestCount = 0;
        this.suspiciousActivity = 0;
        this.userFingerprint = this.generateFingerprint();
        this.init();
    }

    init() {
        this.setupHoneypots();
        this.monitorBotBehavior();
        this.protectDOM();
        this.setupRateLimiting();
    }

    // Generar huella digital única del usuario
    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('SpotMap', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('Security', 4, 17);
        
        const fingerprint = canvas.toDataURL();
        const hash = this.simpleHash(fingerprint + navigator.userAgent + screen.width + screen.height);
        
        return hash;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Honeypots invisibles para detectar bots/scrapers
    setupHoneypots() {
        // Campo invisible en formularios
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'email_confirm';
        honeypot.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        
        honeypot.addEventListener('input', () => {
            this.flagSuspicious('honeypot_triggered');
        });
        
        document.body.appendChild(honeypot);

        // Link invisible para crawlers
        const trapLink = document.createElement('a');
        trapLink.href = '/api/admin/debug/system';
        trapLink.style.cssText = 'position:absolute;left:-9999px;';
        trapLink.textContent = 'Admin Panel';
        
        trapLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.flagSuspicious('trap_link_clicked');
        });
        
        document.body.appendChild(trapLink);
    }

    // Detectar comportamiento de bot
    monitorBotBehavior() {
        let mouseMovements = 0;
        let clicks = 0;
        let scrolls = 0;

        document.addEventListener('mousemove', () => mouseMovements++);
        document.addEventListener('click', () => clicks++);
        document.addEventListener('scroll', () => scrolls++);

        // Verificar después de 10 segundos
        setTimeout(() => {
            if (mouseMovements < 5 && clicks === 0 && scrolls < 2) {
                this.flagSuspicious('no_human_interaction');
            }
        }, 10000);

        // Detectar velocidad de navegación anormal
        const pageLoadTime = Date.now();
        window.addEventListener('beforeunload', () => {
            const timeOnPage = Date.now() - pageLoadTime;
            if (timeOnPage < 500) { // Menos de 0.5 segundos
                this.flagSuspicious('instant_navigation');
            }
        });
    }

    // Proteger DOM contra inspección masiva
    protectDOM() {
        // Watermark invisible en elementos críticos
        const addWatermark = (element) => {
            if (element && element.dataset) {
                element.dataset.spotmapWm = this.userFingerprint;
            }
        };

        // Watermark en spots
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // ELEMENT_NODE
                        if (node.classList && 
                            (node.classList.contains('spot') || 
                             node.classList.contains('spot-card'))) {
                            addWatermark(node);
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Rate limiting del lado del cliente
    setupRateLimiting() {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = async function(...args) {
            self.requestCount++;

            // Más de 50 requests en 1 minuto = sospechoso
            if (self.requestCount > 50) {
                self.flagSuspicious('excessive_requests');
                throw new Error('Rate limit exceeded');
            }

            return originalFetch.apply(this, args);
        };

        // Reset contador cada minuto
        setInterval(() => {
            this.requestCount = 0;
        }, 60000);
    }

    // Marcar actividad sospechosa
    flagSuspicious(reason) {
        this.suspiciousActivity++;
        
        console.warn(`[SECURITY] Suspicious activity detected: ${reason}`);
        console.warn(`[SECURITY] Fingerprint: ${this.userFingerprint}`);

        // Registrar en backend
        if (this.suspiciousActivity >= 3) {
            this.reportToBackend(reason);
            
            // Bloquear en producción
            if (window.location.hostname !== 'localhost') {
                setTimeout(() => {
                    document.body.innerHTML = `
                        <div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:Arial,sans-serif;text-align:center;">
                            <div>
                                <h1 style="color:#e74c3c;">⚠️ Acceso Bloqueado</h1>
                                <p>Se ha detectado actividad sospechosa en tu sesión.</p>
                                <p>Si crees que es un error, contacta con soporte.</p>
                                <p style="color:#95a5a6;font-size:12px;">ID: ${this.userFingerprint}</p>
                            </div>
                        </div>
                    `;
                }, 2000);
            }
        }
    }

    // Reportar al backend
    async reportToBackend(reason) {
        try {
            await fetch('/api/security/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fingerprint: this.userFingerprint,
                    reason: reason,
                    suspiciousCount: this.suspiciousActivity,
                    userAgent: navigator.userAgent,
                    timestamp: Date.now()
                })
            });
        } catch (error) {
            console.error('[SECURITY] Failed to report to backend', error);
        }
    }

    // Obtener fingerprint
    getFingerprint() {
        return this.userFingerprint;
    }
}

// Inicializar protección automáticamente
const securityGuard = new SecurityGuard();

// Añadir watermark a todas las peticiones API
const originalXHROpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    this.addEventListener('readystatechange', function() {
        if (this.readyState === 4) {
            this.setRequestHeader('X-SpotMap-Fingerprint', securityGuard.getFingerprint());
        }
    });
    return originalXHROpen.apply(this, [method, url, ...rest]);
};

export default securityGuard;
