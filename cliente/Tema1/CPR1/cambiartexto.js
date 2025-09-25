function cambiarColor(elementoId, color) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.style.color = color;
    }
}

function cambiarFuente(elementoId, fuente) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.style.fontFamily = fuente;
    }
}

function mostrarImagen1() {
    const img = document.getElementById('imagen');
    if (img) {
        img.src = 'https://imgs.search.brave.com/3AoNjgGfWtCO5ou7I-QlysBLqweNvlcwoBhIr4hrvtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odW1h/bmlkYWRlcy5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMTgv/MTIvRnJhbmNpc2Nv/LUZyYW5jby00LWUx/NTg1NTE1NDMyNDMz/LTgwMHg0MTAuanBn';
        img.style.display = 'block';
    }
}

function mostrarImagen2() {
    const img = document.getElementById('imagen');
    if (img) {
        img.src = 'https://imgs.search.brave.com/BGHjsrQd5rNvpVa-WbdSY56u7LfcbAGpPkisrc9oHV0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjIz/MTAwODExOS9lcy9m/b3RvL21hZHJpZC1z/cGFpbi1mcmFuY28t/bWFzdGFudHVvbm8t/b2YtcmVhbC1tYWRy/aWQtaW4tYWN0aW9u/LWR1cmluZy10aGUt/bGFsaWdhLWVhLXNw/b3J0cy1tYXRjaC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/aDhnc3Qya0NGMG1R/cl96YVhlbms3WUoz/VFdlSkhzOHFOVFM3/OF9LenZRdz0';
        img.style.display = 'block';
    }
}