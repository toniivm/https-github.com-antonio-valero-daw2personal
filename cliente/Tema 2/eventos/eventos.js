let boton = document.getElementById("btn");

//boton.addEventListener("click", botonClicado);
boton.addEventListener("dblclick", botonClicado);


let inputTexto = document.getElementById("inputTexto");
//inputTexto.addEventListener("blur", focusPerdido); //Pierde el foco

//inputTexto.addEventListener("change", elementoCambiado); //Cuando se cambia el valor y pierde el foco

//inputTexto.addEventListener("input", letraEscrita); //Cada vez que se modifica el valor

//inputTexto.addEventListener("focus", elementoEnfocado); //Cuando se enfoca el elemento

function elementoEnfocado(){
    alert("Elemento enfocado");
}
function letraEscrita(){
    alert("Letra escrita");
}
function elementoCambiado(){
    alert("Elemento cambiado");
}


function botonClicado(){
    alert("Botón clicado");
}

function focusPerdido(){
    alert("Foco perdido");
}


let img = document.getElementById("img");
img.addEventListener("mouseover", entrarImagen);
//img.addEventListener("mouseout", entrarImagen);
//img.addEventListener("mouseenter", entrarImagen);
//img.addEventListener("mouseleave", entrarImagen);

function entrarImagen(){
    console.log("Entrando en la imagen");
}
function salirImagen(){
    console.log("Saliendo de la imagen");
}