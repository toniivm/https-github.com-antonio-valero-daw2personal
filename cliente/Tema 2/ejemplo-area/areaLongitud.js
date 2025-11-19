function calcularArea(radio){
    var area = Math.PI * Math.pow(radio, 2);

    document.getElementById("resultadoArea").innerHTML = "El área del círculo es: " + area.toFixed(4);
}

function calcularLongitud(radio){
    var longitud = 2 * Math.PI * radio;

    document.getElementById("resultadoLongitud").innerHTML = "La longitud del círculo es: " + longitud.toFixed(4);
}

function calcular(radio){
    calcularArea(radio);
    calcularLongitud(radio);
}