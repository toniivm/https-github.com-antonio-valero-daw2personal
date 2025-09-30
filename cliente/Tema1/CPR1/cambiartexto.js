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

let contador = 0;

function carrusel5imagenes() { 
let arrayimagenes = [
    'https://imgs.search.brave.com/3AoNjgGfWtCO5ou7I-QlysBLqweNvlcwoBhIr4hrvtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odW1h/bmlkYWRlcy5jb20v/d3AtY29udGVudC91/cGxvYWRzLzIwMTgv/MTIvRnJhbmNpc2Nv/LUZyYW5jby00LWUx/NTg1NTE1NDMyNDMz/LTgwMHg0MTAuanBn',
    'https://imgs.search.brave.com/BGHjsrQd5rNvpVa-WbdSY56u7LfcbAGpPkisrc9oHV0/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjIz/MTAwODExOS9lcy9m/b3RvL21hZHJpZC1z/cGFpbi1mcmFuY28t/bWFzdGFudHVvbm8t/b2YtcmVhbC1tYWRy/aWQtaW4tYWN0aW9u/LWR1cmluZy10aGUt/bGFsaWdhLWVhLXNw/b3J0cy1tYXRjaC5q/cGc_cz02MTJ4NjEy/Jnc9MCZrPTIwJmM9/aDhnc3Qya0NGMG1R/cl96YVhlbms3WUoz/VFdlSkhzOHFOVFM3/OF9LenZRdz0',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308'
    // Puedes añadir más URLs aquí
];

// Inicializamos el índice de la imagen actual

// Obtenemos el elemento de imagen por su id
const img = document.getElementById('imagen');
contador++;
if (contador >= arrayimagenes.length) {
    contador = 0;   
}

img.src = arrayimagenes[contador];

// Mostramos la imagen (en caso de que esté oculta)
img.style.display = 'block';
console.log(contador);

// Añadimos un evento de clic para cambiar a la siguiente imagen
img.onclick = carrusel5imagenes;
}