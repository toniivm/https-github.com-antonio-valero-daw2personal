function carruselDosImagenes() {    
    var imagen = document.getElementById("imagenOsos");

    if(imagen.src.match("img/panda.webp")) {
        imagen.src = "img/rojo.webp";
    }
    else{
        imagen.src = "img/panda.webp";
    } 
}


let contador = 0;
function carruselCincoImagenes() {
    let arrayImagenes = [
        "img/taylor1.webp",
        "img/taylor2.webp",
        "img/taylor3.webp",
        "img/taylor4.webp",
        "img/taylor5.webp"
    ];

    var imagen = document.getElementById("imagenTaylor");

    contador++;

    if(contador >= arrayImagenes.length) {
        contador = 0;
    }

    //Cambiar la imagen
    imagen.src = arrayImagenes[contador];

    console.log(contador);


}