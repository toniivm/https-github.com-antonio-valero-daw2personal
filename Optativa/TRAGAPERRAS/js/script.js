// ===== CONFIGURACIÓN DEL JUEGO =====
// Total definitivo: 7 símbolos (5 base + Scatter + FreeGames)
// Se elimina "arbol.svg" para cumplir requisito (antes había 6 base).
const symbols = [
    "graficos/campana.svg",   // 🔔 Muy frecuente
    "graficos/bola.svg",      // 🎄 Frecuente
    "graficos/regalo.svg",    // 🎁 Media
    "graficos/estrella.svg",  // ⭐ Alta
    "graficos/santa.svg",     // 🎅 JACKPOT
    "graficos/scatter.svg",   // 🌀 Scatter (WILD) sustituye cualquiera excepto FreeGames
    "graficos/freegames.svg"  // 🎮 FreeGames (3+ dispara bonus)
];

// Multiplicadores base (se multiplican por la apuesta)
const prizeMultipliers = {
    "graficos/campana.svg": 1.5,    // Reducido de 2 → 1.5
    "graficos/bola.svg": 3,          // Reducido de 5 → 3
    "graficos/regalo.svg": 8,        // Reducido de 10 → 8
    "graficos/estrella.svg": 50,
    "graficos/santa.svg": 200,
    "graficos/scatter.svg": 40,      // Si forma línea propia (sin sustituir)
    "graficos/freegames.svg": 0      // Solo activa bonus
};

// Variables del juego
let bonos = 0;
let multiplier = 1;
let totalSpins = 0;
let totalWins = 0;
let maxPrize = 0;
let currentBet = 1; // Apuesta por defecto
// Estado de bonus (free games)
let inBonusMode = false;
let remainingFreeSpins = 0;
let stickyScatterPositions = new Set(); // Índices que permanecen como scatter durante free spins
// Coste dinámico compra bonus: se calcula como apuesta actual * factor
const BONUS_PURCHASE_FACTOR = 60; // Aumentado: bonus más caro

function updateBonusUI() {
    const counter = document.getElementById("freeSpinsCounter");
    const value = document.getElementById("freeSpinsValue");
    if (!counter || !value) return;
    if (inBonusMode) {
        counter.style.display = "block";
        value.textContent = remainingFreeSpins;
    } else {
        counter.style.display = "none";
    }
}

function updateBuyBonusCost() {
    const label = document.getElementById("buyBonusCostLabel");
    if (label) {
        const cost = (currentBet * BONUS_PURCHASE_FACTOR).toFixed(2);
        label.textContent = `Coste: ${cost}€`;
    }
}

function buyBonus() {
    if (inBonusMode) {
        showMessage("⚠️ Ya estás en BONUS", "info");
        return;
    }
    const creditoElement = document.getElementById("credito");
    let currentCredit = parseFloat(creditoElement.textContent);
    const cost = currentBet * BONUS_PURCHASE_FACTOR;
    if (currentCredit < cost) {
        showMessage("❌ Crédito insuficiente para comprar bonus", "error");
        return;
    }
    currentCredit = parseFloat((currentCredit - cost).toFixed(2));
    creditoElement.textContent = currentCredit;
    updateCreditDisplay();
    inBonusMode = true;
    remainingFreeSpins = 10;
    stickyScatterPositions.clear();
    showMessage(`🎮 BONUS COMPRADO: 10 FREE SPINS`, "success");
    updateBonusUI();
    // Deshabilitar botón compra durante bonus
    const btn = document.getElementById('buyBonusButton');
    if (btn) btn.disabled = true;
    // Lanzar inmediatamente la primera free spin para feedback
    spinSlot(currentBet, document.getElementById('spinButton'));
}

// Variables de auto-spin
let autoSpinActive = false;
let autoSpinCount = 0;
let autoSpinMax = 0;
let autoSpinInterval = null;

// Variables de control de animación
let activeIntervals = [];
let activeTimeouts = [];
let stopRequested = false;

// Cargar sonidos
const spinSound = new Audio("sounds/spin.mp3");
const prizeSound = new Audio("sounds/prize.mp3");
let bgMusic = null; // Se inicializará después

function playSound(audio) {
    if (audio) {
        audio.currentTime = 0; 
        audio.play().catch(e => console.log("Audio error:", e));
    }
}

// ===== FUNCIONES DE ESTADÍSTICAS =====
function updateStats() {
    document.getElementById("total-spins").textContent = totalSpins;
    document.getElementById("total-wins").textContent = totalWins;
    const winRate = totalSpins > 0 ? Math.round((totalWins / totalSpins) * 100) : 0;
    document.getElementById("win-rate").textContent = winRate + "%";
    document.getElementById("max-prize").textContent = maxPrize + "€";
}

function resetStats() {
    if (confirm("¿Seguro que quieres reiniciar las estadísticas?")) {
        totalSpins = 0;
        totalWins = 0;
        maxPrize = 0;
        bonos = 0;
        document.getElementById("bonos").textContent = bonos;
        updateStats();
        showMessage("📊 Estadísticas reiniciadas", "info");
    }
}

// ===== EFECTOS VISUALES =====
function createFireworks() {
    const container = document.getElementById("fireworks-container");
    container.innerHTML = "";
    
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const firework = document.createElement("div");
            firework.className = "firework";
            firework.style.left = Math.random() * window.innerWidth + "px";
            firework.style.top = Math.random() * window.innerHeight + "px";
            firework.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            firework.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            firework.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
            
            container.appendChild(firework);
            
            setTimeout(() => firework.remove(), 1000);
        }, i * 100);
    }
}

function highlightWinningSlots(winningIndices) {
    const slots = document.querySelectorAll(".slot");
    
    // Remover clase winner de todos
    slots.forEach(slot => slot.classList.remove("winner"));
    
    // Añadir clase winner a los ganadores
    winningIndices.forEach(index => {
        if (slots[index]) {
            slots[index].classList.add("winner");
        }
    });
    
    // Remover la clase después de la animación
    setTimeout(() => {
        slots.forEach(slot => slot.classList.remove("winner"));
    }, 3000);
}

// ===== MOSTRAR OVERLAY DE PREMIO =====
function showWinOverlay(amount, type) {
    const overlay = document.getElementById('winOverlay');
    const icon = overlay.querySelector('.win-icon');
    const title = overlay.querySelector('.win-title');
    const amountElement = overlay.querySelector('.win-amount');
    
    // Limpiar clases previas
    overlay.className = 'win-overlay';
    
    // Configurar contenido según tipo de premio
    if (type === 'mega') {
        overlay.classList.add('mega-win');
        icon.textContent = '🎅🎊';
        title.textContent = '¡¡¡MEGA WIN!!!';
        amountElement.textContent = `${amount}€`;
    } else if (type === 'big') {
        overlay.classList.add('big-win');
        icon.textContent = '🎁✨';
        title.textContent = '¡¡BIG WIN!!';
        amountElement.textContent = `${amount}€`;
    } else {
        // Normal win - AHORA SÍ mostrar overlay con animación
        overlay.classList.add('normal-win');
        icon.textContent = '🎄💰';
        title.textContent = '¡GANASTE!';
        amountElement.textContent = `+${amount}€`;
    }
    
    // Mostrar overlay con animación
    overlay.classList.add('show');
    
    // Añadir confeti animado para todos los premios
    createWinParticles();
    
    // Cerrar al hacer clic
    const closeOverlay = () => {
        overlay.classList.remove('show');
        overlay.removeEventListener('click', closeOverlay);
    };
    
    overlay.addEventListener('click', closeOverlay);
    
    // Auto-cerrar: más rápido para premios normales
    const autoCloseTime = type === 'normal' ? 2000 : 4000;
    setTimeout(closeOverlay, autoCloseTime);
}

// ===== CREAR PARTÍCULAS DE PREMIO =====
function createWinParticles() {
    const container = document.getElementById('winOverlay');
    const colors = ['#ffd700', '#00ff00', '#ff6b6b', '#00bfff', '#ff69b4'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'win-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 2000);
        }, i * 50);
    }
}

function showMessage(text, type = "success") {
    const mensaje = document.getElementById("mensaje");
    mensaje.textContent = text;
    mensaje.style.color = type === "success" ? "#00ff00" : 
                          type === "jackpot" ? "#ffd700" : 
                          type === "info" ? "#00bfff" : "#ff6b6b";
    
    if (type === "jackpot") {
        mensaje.style.fontSize = "1.5rem";
        mensaje.style.animation = "jackpotPulse 0.5s ease-in-out 5";
    } else {
        mensaje.style.fontSize = "1.2rem";
    }
}

// ===== ANIMACIÓN DE SLOTS (5x3) - GIRO COLUMNA POR COLUMNA =====
function animateSlots(targetSymbols, callback) {
    const slotElements = document.querySelectorAll(".slot");
    const slotInners = document.querySelectorAll(".slot-inner");
    
    stopRequested = false;
    slotElements.forEach(slot => slot.classList.add("spinning"));
    
    // Giro COLUMNA POR COLUMNA (como tragaperras real)
    let columnIndex = 0;
    const totalColumns = 5;
    const spinDuration = 50;
    
    function spinColumn() {
        if (stopRequested) {
            stopAllAnimations(targetSymbols, callback);
            return;
        }
        
        if (columnIndex >= totalColumns) {
            slotElements.forEach(slot => slot.classList.remove("spinning"));
            callback();
            return;
        }
        
        const colInners = [];
        for (let row = 0; row < 3; row++) {
            colInners.push(slotInners[columnIndex + (row * 5)]);
        }
        
        let iterations = 20 + (columnIndex * 5);
        
        const columnInterval = setInterval(() => {
            if (stopRequested) {
                clearInterval(columnInterval);
                stopAllAnimations(targetSymbols, callback);
                return;
            }
            
            colInners.forEach(inner => {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                inner.innerHTML = `<img src="${randomSymbol}" alt="symbol">`;
            });
            
            if (--iterations <= 0) {
                clearInterval(columnInterval);
                colInners.forEach((inner, row) => {
                    const index = columnIndex + (row * 5);
                    inner.innerHTML = `<img src="${targetSymbols[index]}" alt="symbol">`;
                    slotElements[index].classList.remove("spinning");
                });
                
                columnIndex++;
                setTimeout(spinColumn, 150);
            }
        }, spinDuration);
        
        activeIntervals.push(columnInterval);
    }
    
    spinColumn();
}

// ===== FUNCIÓN PARA DETENER TODAS LAS ANIMACIONES =====
function stopAllAnimations(targetSymbols, callback) {
    const slotElements = document.querySelectorAll(".slot");
    const slotInners = document.querySelectorAll(".slot-inner");
    
    // Limpiar todos los intervalos y timeouts activos
    activeIntervals.forEach(interval => clearInterval(interval));
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeIntervals = [];
    activeTimeouts = [];
    
    // Mostrar resultados finales inmediatamente en todos los slots
    slotInners.forEach((inner, index) => {
        const finalSymbol = targetSymbols[index];
        inner.innerHTML = `<img src="${finalSymbol}" alt="symbol">`;
    });
    
    // Quitar clase spinning de todos los slots
    slotElements.forEach(slot => slot.classList.remove("spinning"));
    
    // Llamar al callback
    callback();
}

// ===== GESTIÓN DE CRÉDITO =====
function updateSpinButton() {
    const credito = parseFloat(document.getElementById("credito").textContent);
    const spinButton = document.getElementById("spinButton");
    const betSelector = document.getElementById("betSelector");
    
    if (spinButton) {
        spinButton.disabled = credito < currentBet;
    }
    if (betSelector) {
        betSelector.disabled = false; // Siempre habilitar selector después del giro
    }
}

function updateCreditDisplay() {
    const credito = document.getElementById("credito").textContent;
    document.getElementById("credit-display").innerHTML = `<i class="fas fa-money-bill-wave"></i> Saldo: ${credito}€`;
}

function addCredit(amount) {
    const creditoElement = document.getElementById("credito");
    const currentCredit = parseInt(creditoElement.textContent);
    creditoElement.textContent = currentCredit + amount;
    
    updateCreditDisplay();
    updateSpinButton();
    
    // Animación de añadir crédito
    creditoElement.parentElement.style.animation = "none";
    setTimeout(() => {
        creditoElement.parentElement.style.animation = "jackpotPulse 0.5s ease-in-out 2";
    }, 10);
    
    showMessage(`💰 +${amount}€ añadidos a tu saldo`, "info");
}

// ===== SELECTOR DE APUESTA =====
function updateBetDisplay() {
    const betAmountElement = document.getElementById("betAmount");
    if (betAmountElement) {
        betAmountElement.textContent = currentBet.toFixed(2);
    }
}

// ===== FUNCIÓN PRINCIPAL DE GIRO =====
function spinSlot(cost, spinButton) {
    const creditoElement = document.getElementById("credito");
    const bonosDisplay = document.getElementById("bonos");
    let currentCredit = parseFloat(creditoElement.textContent);
    const thisIsBonusSpin = inBonusMode; // Capturar estado al inicio

    if (!thisIsBonusSpin) {
        if (currentCredit < cost) {
            showMessage("❌ Crédito insuficiente. Añade más crédito para jugar.", "error");
            return;
        }
        // Descontar crédito solo si NO es free spin
        currentCredit = parseFloat((currentCredit - cost).toFixed(2));
        creditoElement.textContent = currentCredit;
        updateCreditDisplay();
    } else {
        showMessage(`🆓 FREE SPIN (${remainingFreeSpins} restantes)`, "info");
    }
    totalSpins++;
    
    // Reproducir música si no está sonando
    if (bgMusic && bgMusic.paused) {
        bgMusic.play().catch(e => console.log("Audio error:", e));
    }

    // Generar resultados aleatorios para matriz 5x3 (15 slots)
    // Distribución más dura: más símbolos comunes, menos especiales
    // Campana 50% | Bola 28% | Regalo 10% | Estrella 6% | Scatter 2% | FreeGames 1% | Santa 3%
    // Total = 100%
    const results = [];
    for (let i = 0; i < 15; i++) {
        if (inBonusMode && stickyScatterPositions.has(i)) {
            // Mantener scatter pegajoso
            results.push("graficos/scatter.svg");
            continue;
        }
        const random = Math.random() * 100;
        let symbol;
        if (random < 50) symbol = symbols[0];            // Campana 50%
        else if (random < 78) symbol = symbols[1];       // Bola 28%
        else if (random < 88) symbol = symbols[2];       // Regalo 10%
        else if (random < 94) symbol = symbols[3];       // Estrella 6%
        else if (random < 96) symbol = symbols[5];       // Scatter 2% (muy raro)
        else if (random < 97) symbol = symbols[6];       // FreeGames 1%
        else symbol = symbols[4];                        // Santa 3%
        results.push(symbol);
        // Si estamos en bonus y el símbolo es scatter nuevo, se vuelve pegajoso
        if (inBonusMode && symbol === "graficos/scatter.svg") {
            stickyScatterPositions.add(i);
        }
    }

    // Deshabilitar botones durante el giro
    document.getElementById("spinButton").disabled = true;
    document.getElementById("betSelector").disabled = true;
    
    // Mostrar botón PARAR
    const stopButton = document.getElementById("stopButton");
    stopButton.style.display = "block";
    stopRequested = false;
    
    playSound(spinSound);
    showMessage("🎰 Girando... ¡Buena suerte! 🍀", "info");

    animateSlots(results, () => {
        let premioTotal = 0;
        let hayPremio = false;
        let winningIndices = [];
        let isJackpot = false;

        // 15 LÍNEAS GANADORAS para matriz 5x3
        // Matriz 5x3: [0,1,2,3,4] [5,6,7,8,9] [10,11,12,13,14]
        const lineas = [
            // 3 Filas horizontales
            [0, 1, 2, 3, 4],      // Fila superior
            [5, 6, 7, 8, 9],      // Fila media
            [10, 11, 12, 13, 14], // Fila inferior
            // 5 Columnas verticales
            [0, 5, 10],   // Columna 1
            [1, 6, 11],   // Columna 2
            [2, 7, 12],   // Columna 3
            [3, 8, 13],   // Columna 4
            [4, 9, 14],   // Columna 5
            // 2 Diagonales
            [0, 6, 12],   // Diagonal \ (izq-centro-der)
            [4, 6, 10],   // Diagonal / (der-centro-izq)
            // 5 Líneas en zigzag
            [0, 6, 14],   // V superior
            [10, 6, 4],   // V invertida
            [0, 7, 14],   // Medio zigzag
            [1, 7, 13],   // Zigzag medio 2
            [2, 7, 12]    // Zigzag centro
        ];

        lineas.forEach(linea => {
            // Determinar símbolo base ignorando scatters al inicio
            let baseSymbol = null;
            for (let idx of linea) {
                const sym = results[idx];
                if (sym !== "graficos/scatter.svg") { // scatter puede sustituir
                    baseSymbol = sym;
                    break;
                }
            }
            if (!baseSymbol) {
                // Todos son scatter: pagar como línea scatter
                baseSymbol = "graficos/scatter.svg";
            }
            // FreeGames no genera premio en líneas
            if (baseSymbol === "graficos/freegames.svg") return;

            let consecutivos = 0;
            for (let i = 0; i < linea.length; i++) {
                const sym = results[linea[i]];
                if (sym === baseSymbol || sym === "graficos/scatter.svg") {
                    consecutivos++;
                } else {
                    break; // secuencia inicial interrumpida
                }
            }
            if (consecutivos >= 3) {
                hayPremio = true;
                for (let i = 0; i < consecutivos; i++) {
                    winningIndices.push(linea[i]);
                }
                const symbolMultiplier = prizeMultipliers[baseSymbol] || 0;
                const bonusFactor = consecutivos - 2; // 3->1,4->2,5->3
                premioTotal += symbolMultiplier * bonusFactor;
                if (baseSymbol === "graficos/santa.svg") isJackpot = true;
            }
        });

        // Contar freegames para activar bonus si no estamos ya en bonus
        const freeGamesCount = results.filter(s => s === "graficos/freegames.svg").length;
        if (freeGamesCount >= 3 && !inBonusMode) {
            inBonusMode = true;
            remainingFreeSpins = 10;
            showMessage(`🎮 BONUS ACTIVADO: 10 FREE SPINS`, "success");
        }

        // Eliminar duplicados de índices ganadores
        winningIndices = [...new Set(winningIndices)];

        let mensajeTexto = "";
        // Calcular premio final: multiplicador total * apuesta (sin duplicar)
        const finalPremioNum = parseFloat((premioTotal * cost).toFixed(2));
        const finalPremio = finalPremioNum.toFixed(2);
        
        if (hayPremio) {
            totalWins++;
            playSound(prizeSound);
            highlightWinningSlots(winningIndices);
            
            // SUMAR EL PREMIO AL CRÉDITO ACTUAL
            let currentCreditNow = parseFloat(creditoElement.textContent);
            currentCreditNow = (currentCreditNow + finalPremioNum).toFixed(2);
            creditoElement.textContent = currentCreditNow;
            
            // Clasificar el tipo de premio basado en multiplicador de apuesta
            let winType = 'normal';
            const multiplierRatio = finalPremioNum / cost; // Cuántas veces la apuesta
            
            if (isJackpot || multiplierRatio >= 50) {
                winType = 'mega';
                createFireworks();
                bonos += 5;
                bonosDisplay.textContent = bonos;
            } else if (multiplierRatio >= 15) {
                winType = 'big';
            }
            
            // Mostrar overlay de premio
            showWinOverlay(finalPremio, winType);
            
            // Actualizar premio máximo
            if (finalPremioNum > maxPrize) {
                maxPrize = finalPremioNum;
            }
        } else {
            mensajeTexto = "❌ No hay premio esta vez. ¡Sigue intentando!";
            showMessage(mensajeTexto, "error");
        }

        // Actualizar estadísticas
        updateStats();
        updateCreditDisplay();
        
        // Ocultar botón PARAR
        document.getElementById("stopButton").style.display = "none";
        
        // Gestión de ciclo de bonus
        if (inBonusMode) {
            if (!thisIsBonusSpin) {
                // Acabamos de activar bonus en esta tirada: no descontó crédito ya
            } else {
                remainingFreeSpins--;
                if (remainingFreeSpins <= 0) {
                    inBonusMode = false;
                    stickyScatterPositions.clear();
                    showMessage("🏁 BONUS FINALIZADO", "info");
                    // Rehabilitar compra bonus al terminar
                    const btn = document.getElementById('buyBonusButton');
                    if (btn) btn.disabled = false;
                } else {
                    showMessage(`🆓 Free Spins restantes: ${remainingFreeSpins}`, "info");
                }
            }
        }

        // Resaltar scatters pegajosos
        const slotElements = document.querySelectorAll('.slot');
        slotElements.forEach((slot, idx) => {
            if (stickyScatterPositions.has(idx) && inBonusMode) {
                slot.classList.add('sticky-scatter');
            } else {
                slot.classList.remove('sticky-scatter');
            }
        });

        updateBonusUI();
        updateBuyBonusCost();

        // Habilitar botones solo si no está corriendo auto-spin
        updateSpinButton();
    });
}

// ===== AUTO-SPIN FUNCTIONS =====
function startAutoSpin() {
    const autoSpinButton = document.getElementById("autoSpinButton");
    const autoSpinStatus = document.getElementById("autoSpinStatus");
    const autoSpinCounter = document.getElementById("autoSpinCounter");
    const autoSpinRounds = parseInt(document.getElementById("autoSpinRounds").value);
    
    if (autoSpinActive) {
        // Detener auto-spin
        stopAutoSpin();
        return;
    }
    
    // Iniciar auto-spin
    autoSpinActive = true;
    autoSpinCount = 0;
    autoSpinMax = autoSpinRounds;
    
    autoSpinButton.classList.add("active");
    autoSpinButton.innerHTML = '<i class="fas fa-stop"></i><span>DETENER</span>';
    autoSpinStatus.style.display = "block";
    
    // Deshabilitar botones de spin manual y selectores
    document.getElementById("spinButton").disabled = true;
    document.getElementById("betSelector").disabled = true;
    document.getElementById("autoSpinRounds").disabled = true;
    document.getElementById("autoSpinSpeed").disabled = true;
    
    executeAutoSpin();
}

function stopAutoSpin() {
    const autoSpinButton = document.getElementById("autoSpinButton");
    const autoSpinStatus = document.getElementById("autoSpinStatus");
    
    autoSpinActive = false;
    if (autoSpinInterval) {
        clearTimeout(autoSpinInterval);
        autoSpinInterval = null;
    }
    
    autoSpinButton.classList.remove("active");
    autoSpinButton.innerHTML = '<i class="fas fa-sync"></i><span>AUTO-SPIN</span>';
    autoSpinStatus.style.display = "none";
    
    // Habilitar botones de spin manual
    updateSpinButton();
    document.getElementById("autoSpinRounds").disabled = false;
    document.getElementById("autoSpinSpeed").disabled = false;
    
    showMessage("🛑 Auto-Spin detenido", "info");
}

function executeAutoSpin() {
    if (!autoSpinActive) {
        clearTimeout(autoSpinInterval);
        return;
    }
    
    const creditoElement = document.getElementById("credito");
    let currentCredit = parseInt(creditoElement.textContent);
    
    // Verificar si hay crédito suficiente
    if (currentCredit < 1) {
        stopAutoSpin();
        showMessage("❌ Crédito insuficiente para continuar Auto-Spin", "error");
        return;
    }
    
    // Verificar si se alcanzó el máximo de tiradas
    if (autoSpinMax !== 999 && autoSpinCount >= autoSpinMax) {
        stopAutoSpin();
        showMessage("✅ Auto-Spin completado: " + autoSpinCount + " tiradas", "success");
        return;
    }
    
    autoSpinCount++;
    const autoSpinCounter = document.getElementById("autoSpinCounter");
    autoSpinCounter.textContent = autoSpinMax === 999 ? 
        `${autoSpinCount} / ∞` : 
        `${autoSpinCount} / ${autoSpinMax}`;
    
    // Ejecutar tirada con la apuesta actual
    const spinButton = document.getElementById("spinButton");
    spinSlot(currentBet, spinButton);
    
    // Obtener velocidad seleccionada
    const speed = parseInt(document.getElementById("autoSpinSpeed").value);
    
    // Programar siguiente tirada con la velocidad seleccionada
    autoSpinInterval = setTimeout(() => {
        if (autoSpinActive) {
            executeAutoSpin();
        }
    }, speed);
}

// ===== EVENT LISTENERS =====
document.getElementById("autoSpinButton").addEventListener("click", startAutoSpin);

document.getElementById("stopButton").addEventListener("click", function() {
    stopRequested = true;
    this.style.display = "none";
    showMessage("⏸️ Deteniendo giro...", "info");
});

// ===== INICIALIZACIÓN =====
updateSpinButton();
updateStats();
updateCreditDisplay();

// ===== EVENT LISTENERS =====
const betSelectorElement = document.getElementById("betSelector");
if (betSelectorElement) {
    betSelectorElement.addEventListener("change", function() {
        currentBet = parseFloat(this.value);
        updateBetDisplay();
    });
}

const spinButtonElement = document.getElementById("spinButton");
if (spinButtonElement) {
    spinButtonElement.addEventListener("click", function() {
        console.log("Botón girar clickeado, apuesta:", currentBet);
        if (!autoSpinActive) {
            spinSlot(currentBet, this);
        }
    });
}

// Botón comprar bonus
const buyBonusBtn = document.getElementById('buyBonusButton');
if (buyBonusBtn) {
    buyBonusBtn.addEventListener('click', buyBonus);
    updateBuyBonusCost();
}

// Iniciar música de fondo
const backgroundMusic = document.getElementById('backgroundMusic');
bgMusic = backgroundMusic; // Asignar a variable global
if (backgroundMusic) {
    backgroundMusic.volume = 0.3; // Volumen al 30%
    // Intentar reproducir automáticamente
    backgroundMusic.play().catch(e => {
        console.log("Música requiere interacción del usuario");
        // Reproducir en la primera interacción
        document.body.addEventListener('click', function playOnce() {
            backgroundMusic.play();
            document.body.removeEventListener('click', playOnce);
        }, { once: true });
    });
}


