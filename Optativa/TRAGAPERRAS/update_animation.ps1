$file = "c:\xampp\htdocs\https-github.com-antonio-valero-daw2personal\Optativa\TRAGAPERRAS\DAW_Rivera_Escobar_Francisco\Tragaperras\js\script.js"
$content = Get-Content $file -Raw

# Reemplazar la función animateSlots completa por una versión columna por columna
$oldPattern = '// ===== ANIMACIÓN DE SLOTS \(5x3\) =====\s+function animateSlots\(targetSymbols, callback\) \{[\s\S]*?activeIntervals\.push\(allInterval\);\s+\}'

$newCode = @'
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
'@

$content = $content -replace $oldPattern, $newCode
$content | Set-Content $file
Write-Host "Animación actualizada: giro columna por columna activado!" -ForegroundColor Green
