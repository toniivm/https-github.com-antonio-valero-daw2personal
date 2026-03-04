/**
 * ⚠️ CÓDIGO PROPIETARIO - SPOTMAP ⚠️
 * Copyright (c) 2025 Antonio Valero
 * Todos los derechos reservados.
 * 
 * Este código es propiedad exclusiva del autor.
 * Prohibida su copia, modificación, distribución o uso
 * sin autorización expresa por escrito.
 * 
 * CONFIDENCIAL - Para uso interno únicamente
 */

const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

// Archivos críticos a ofuscar
const criticalFiles = [
    'js/api.js',
    'js/auth.js',
    'js/supabaseClient.js',
    'js/config.js',
    'js/spots.js',
    'js/map.js',
    'js/cache.js'
];

// Configuración de ofuscación agresiva
const obfuscationOptions = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.5,
    debugProtection: true,
    debugProtectionInterval: 4000,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 1,
    stringArrayEncoding: ['rc4'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 5,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 5,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 1,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

console.log('🔐 Iniciando ofuscación de código crítico...\n');

// Crear directorio de salida
const outputDir = path.join(__dirname, 'js-obfuscated');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

let filesProcessed = 0;
let totalSize = 0;
let obfuscatedSize = 0;

criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const fileName = path.basename(file);
    const outputPath = path.join(outputDir, fileName);
    
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Saltando ${file} (no existe)`);
        return;
    }
    
    try {
        const code = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(code, 'utf8');
        
        // Añadir copyright header
        const copyrightHeader = `/**
 * ⚠️ SPOTMAP - CÓDIGO PROPIETARIO ⚠️
 * Copyright (c) 2025 Antonio Valero. Todos los derechos reservados.
 * PROHIBIDA SU COPIA, MODIFICACIÓN O DISTRIBUCIÓN SIN AUTORIZACIÓN.
 * Violaciones serán perseguidas legalmente.
 */\n\n`;
        
        console.log(`🔒 Ofuscando ${file}...`);
        
        const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscationOptions);
        const obfuscatedCode = copyrightHeader + obfuscationResult.getObfuscatedCode();
        const newSize = Buffer.byteLength(obfuscatedCode, 'utf8');
        
        fs.writeFileSync(outputPath, obfuscatedCode, 'utf8');
        
        const sizeIncrease = ((newSize - originalSize) / originalSize * 100).toFixed(1);
        console.log(`   ✓ ${fileName}: ${(originalSize/1024).toFixed(1)}KB → ${(newSize/1024).toFixed(1)}KB (+${sizeIncrease}%)`);
        
        filesProcessed++;
        totalSize += originalSize;
        obfuscatedSize += newSize;
        
    } catch (error) {
        console.error(`❌ Error al ofuscar ${file}:`, error.message);
    }
});

console.log('\n' + '='.repeat(60));
console.log(`✅ Ofuscación completada: ${filesProcessed} archivos procesados`);
console.log(`📊 Tamaño original: ${(totalSize/1024).toFixed(1)}KB`);
console.log(`📊 Tamaño ofuscado: ${(obfuscatedSize/1024).toFixed(1)}KB`);
console.log(`📈 Incremento: +${((obfuscatedSize - totalSize) / totalSize * 100).toFixed(1)}%`);
console.log('='.repeat(60));
console.log('\n🔐 Archivos ofuscados guardados en: js-obfuscated/');
console.log('⚠️  IMPORTANTE: Usa estos archivos en producción, NO los originales\n');
