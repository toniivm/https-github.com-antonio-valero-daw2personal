/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * 
 * Script de construcción para producción con ofuscación y minificación
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔨 Iniciando build para producción...\n');

// 1. Ofuscar código JavaScript
console.log('🔐 Paso 1/4: Ofuscando código JavaScript...');
try {
    execSync('node obfuscate.js', { stdio: 'inherit' });
    console.log('✅ Ofuscación completada\n');
} catch (error) {
    console.error('❌ Error en ofuscación:', error.message);
    process.exit(1);
}

// 2. Crear directorio de producción
console.log('📦 Paso 2/4: Preparando directorio de producción...');
const prodDir = path.join(__dirname, 'production');
if (!fs.existsSync(prodDir)) {
    fs.mkdirSync(prodDir, { recursive: true });
}

// Copiar archivos necesarios
const filesToCopy = [
    'index.html',
    'about.html',
    'contact.html',
    'faq.html',
    'privacy.html',
    'terms.html',
    'manifest.json',
    'service-worker.js',
    'css/styles.css'
];

filesToCopy.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(prodDir, file);
    
    if (fs.existsSync(src)) {
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
        console.log(`   ✓ Copiado: ${file}`);
    }
});

console.log('✅ Archivos copiados\n');

// 3. Copiar código ofuscado
console.log('🔒 Paso 3/4: Copiando código ofuscado...');
const obfuscatedDir = path.join(__dirname, 'js-obfuscated');
const prodJsDir = path.join(prodDir, 'js');

if (!fs.existsSync(prodJsDir)) {
    fs.mkdirSync(prodJsDir, { recursive: true });
}

if (fs.existsSync(obfuscatedDir)) {
    const files = fs.readdirSync(obfuscatedDir);
    files.forEach(file => {
        fs.copyFileSync(
            path.join(obfuscatedDir, file),
            path.join(prodJsDir, file)
        );
        console.log(`   ✓ ${file}`);
    });
}

// Copiar archivos JS no críticos (sin ofuscar)
const nonCriticalJs = ['theme.js', 'ui.js', 'i18n.js', 'notifications.js', 'social.js'];
nonCriticalJs.forEach(file => {
    const src = path.join(__dirname, 'js', file);
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, path.join(prodJsDir, file));
        console.log(`   ✓ ${file} (sin ofuscar)`);
    }
});

console.log('✅ Código ofuscado copiado\n');

// 4. Crear archivo de configuración de producción
console.log('⚙️  Paso 4/4: Creando configuración de producción...');

const prodConfig = `/**
 * ⚠️ CONFIGURACIÓN DE PRODUCCIÓN - NO MODIFICAR ⚠️
 */

// IMPORTANTE: En producción, estas variables DEBEN venir de variables de entorno
const PRODUCTION_MODE = true;
const VERSION = '1.0.0';
const BUILD_DATE = '${new Date().toISOString()}';

console.log('%c⚠️ SpotMap - Modo Producción Activado', 'color: red; font-size: 16px; font-weight: bold;');
console.log('%cVersión: ' + VERSION, 'color: blue;');
console.log('%cBuild: ' + BUILD_DATE, 'color: blue;');
console.log('%c© 2025 Antonio Valero. Todos los derechos reservados.', 'color: gray;');
`;

fs.writeFileSync(path.join(prodJsDir, 'prod-config.js'), prodConfig);
console.log('✅ Configuración de producción creada\n');

// Resumen
console.log('='.repeat(60));
console.log('✅ BUILD COMPLETADO');
console.log('='.repeat(60));
console.log(`📁 Archivos de producción en: ${prodDir}`);
console.log(`🔐 Código ofuscado y protegido`);
console.log(`📊 Total archivos: ${filesToCopy.length + fs.readdirSync(obfuscatedDir).length}`);
console.log('\n⚠️  IMPORTANTE:');
console.log('   - Usa SOLO los archivos de production/ en servidor');
console.log('   - NO subas las carpetas js/ y tests/ originales');
console.log('   - Configura variables de entorno en el servidor');
console.log('   - Activa HTTPS y certificado SSL');
console.log('\n🚀 Listo para deploy!\n');
