// Función simple para saludar
function saludar() {
    const nombre = document.getElementById('nameInput').value || 'compañero';
    document.getElementById('innerTextDemo').innerText = '¡Hola ' + nombre + '!';
    document.getElementById('innerHtmlDemo').innerHTML = '<strong>¡Hola ' + nombre + '!</strong>';
    console.log('Saludo a:', nombre);
}

// Función para cambiar el color y la fuente del texto
function cambiarEstilo(tipo) {
    const elemento = document.getElementById('textoEstilo');
    if (tipo === 'color') {
        elemento.style.color = 'red';
    } else if (tipo === 'fuente') {
        // Rotamos entre diferentes fuentes cada vez que se presiona el botón
        const fuentes = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New'];
        const fuenteActual = elemento.style.fontFamily || fuentes[0];
        const indiceActual = fuentes.indexOf(fuenteActual);
        const nuevaFuente = fuentes[(indiceActual + 1) % fuentes.length];
        elemento.style.fontFamily = nuevaFuente;
    }
}

// Función para cambiar imágenes en la galería
function cambiarImagen(direccion) {
    const imagen = document.getElementById('imagenGaleria');
    if (imagen) {
        const numero = Math.floor(Math.random() * 10) + 1;
        imagen.src = `https://picsum.photos/seed/img${numero}/400/300`;
    }
}

// Función para cambiar entre montaña y playa
function cambiarPaisaje(tipo) {
    const imagen = document.getElementById('paisajeImagen');
    if (imagen) {
        if (tipo === 'montaña') {
            imagen.src = 'https://picsum.photos/seed/mountain/400/300';
        } else {
            imagen.src = 'https://picsum.photos/seed/beach/400/300';
        }
    }
}

// Función simple para cambiar color de fondo
function cambiarFondoColor(color) {
    const colorBox = document.getElementById('colorBox');
    if (colorBox) {
        if (color === 'blue') {
            colorBox.style.backgroundColor = '#3498db';
        } else if (color === 'green') {
            colorBox.style.backgroundColor = '#2ecc71';
        } else if (color === 'red') {
            colorBox.style.backgroundColor = '#e74c3c';
        }
        colorBox.style.color = 'white';
    }
}

// Event listeners básicos
document.getElementById('logBtn').onclick = function() {
    console.log('Mensaje en la consola');
};

document.getElementById('alertBtn').onclick = function() {
    alert('¡Mensaje de alerta!');
};
