// Suponiendo que tienes dos imágenes en tu HTML con los IDs 'imgPerro' y 'imgGato'
// Y dos botones que llaman a las funciones mostrarPerro() y mostrarGato()

function mostrarPerro() {
    document.getElementById('imgPerro').style.display = 'block';
    document.getElementById('imgGato').style.display = 'none';
}

function mostrarGato() {
    document.getElementById('imgPerro').style.display = 'none';
    document.getElementById('imgGato').style.display = 'block';
}