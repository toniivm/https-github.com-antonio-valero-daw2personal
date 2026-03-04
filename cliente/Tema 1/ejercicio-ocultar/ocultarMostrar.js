function atropellarPerro(){
    document.getElementById("imagenPerro").style.display = "none";
}

function salvarPerro(){
    document.getElementById("imagenPerro").style.display = "block";
}

function mostrarGato(){
    document.getElementById("imagenGato").style.display = "block";
}

function ocultarGato(){
    document.getElementById("imagenGato").style.display = "none";
}

function mostrarOcultarGato(){
    if(document.getElementById("imagenGato").style.display === "none"){
        document.getElementById("imagenGato").style.display = "block";
        document.getElementById("botonMostraOcultar").innerText = "Ocultar gato";
    }else{
        document.getElementById("imagenGato").style.display = "none";
        document.getElementById("botonMostraOcultar").innerText = "Mostrar gato";

    }
}