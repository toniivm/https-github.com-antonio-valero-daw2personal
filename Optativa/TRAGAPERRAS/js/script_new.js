// ===== ANIMACIÓN DE SLOTS (5x3) - GIRO COLUMNA POR COLUMNA =====
function animateSlots(targetSymbols, callback) {
    const slotElements = document.querySelectorAll(".slot");
    const slotInners = document.querySelectorAll(".slot-inner");
    
    stopRequested = false;
    
    // Añadir clase spinning
    slotElements.forEach(slot => slot.classList.add("spinning"));
    
    // Giro por COLUMNAS (como tragaperras real) - matriz 5x3
    let columnIndex = 0;
    const totalColumns = 5;
    const spinDuration = 50;
    
    function spinColumn() {
        // Si se solicitó parar, detener inmediatamente
        if (stopRequested) {
            stopAllAnimations(targetSymbols, callback);
            return;
        }
        
        // Si terminamos todas las columnas
        if (columnIndex >= totalColumns) {
            slotElements.forEach(slot => slot.classList.remove("spinning"));
            callback();
            return;
        }
        
        // Obtener slots de la columna actual
        const colInners = [];
        for (let row = 0; row < 3; row++) {
            const index = columnIndex + (row * 5);
            colInners.push(slotInners[index]);
        }
        
        // Girar esta columna más tiempo (cada columna gira más que la anterior)
        let iterations = 20 + (columnIndex * 5);
        
        const columnInterval = setInterval(() => {
            if (stopRequested) {
                clearInterval(columnInterval);
                stopAllAnimations(targetSymbols, callback);
                return;
            }
            
            // Girar solo esta columna
            colInners.forEach(inner => {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                inner.innerHTML = `<img src="${randomSymbol}" alt="symbol">`;
            });
            
            if (--iterations <= 0) {
                clearInterval(columnInterval);
                // Mostrar resultado final de esta columna
                colInners.forEach((inner, row) => {
                    const index = columnIndex + (row * 5);
                    const finalSymbol = targetSymbols[index];
                    inner.innerHTML = `<img src="${finalSymbol}" alt="symbol">`;
                });
                
                // Quitar spinning de esta columna
                for (let row = 0; row < 3; row++) {
                    const index = columnIndex + (row * 5);
                    slotElements[index].classList.remove("spinning");
                }
                
                columnIndex++;
                setTimeout(spinColumn, 150); // Pausa entre columnas
            }
        }, spinDuration);
        
        activeIntervals.push(columnInterval);
    }
    
    spinColumn();
}
