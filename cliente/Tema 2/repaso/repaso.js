
function sumaPositivos(){
    let num=0, suma=0;

    while(num>=0){
        num = prompt("Introduce un número positivo (o un número negativo para terminar):");
        num = parseInt(num);
        if(num>=0){
            suma +=num;
        }
    }

    alert("La suma de los números positivos es: " + suma);
}

//sumaPositivos();

let array = [];

function calcular(){
    let numeros = document.getElementById("numeros").value;
    //1,2,4,5,79

    array = numeros.split(",");
    /*let numerosArray = numeros.split(",");

    for(let i=0; i<numerosArray.length; i++){
        array.push(parseInt(numerosArray[i]));
    }*/

    let media=calcularMedia(array);
    let maximo=calcularMaximo(array);
    let minimo=calcularMinimo(array);
    let suma=calcularSuma(array);

    let resultado = "Media: " + media + "<br>" +
                    "Máximo: " + maximo + "<br>" +
                    "Mínimo: " + minimo + "<br>" +
                    "Suma: " + suma;

    document.getElementById("resultado").innerHTML=resultado;

    crearLista(array);
}



function calcularMedia(arrayNumeros){
    let media=calcularSuma(arrayNumeros);   

    media = media / arrayNumeros.length;
    
    return calcularSuma(arrayNumeros) / arrayNumeros.length;
}
function calcularMaximo(arrayNumeros){
    let sortArray=arrayNumeros.sort();
    let maximo =sortArray[sortArray.length-1];

    return maximo;
}
function calcularMinimo(arrayNumeros){
    let sortArray=arrayNumeros.sort();
    let minimo=sortArray[0];

    return minimo;
}
function calcularSuma(arrayNumeros){
    let suma=0;

    for(num of arrayNumeros){
        suma += parseInt(num);
    }

    return suma;
}


function crearLista(elementos){
    let lista = document.getElementById("lista");

    for(num of elementos){
        let li = document.createElement("li");
        li.innerText = num;
        lista.appendChild(li);
    }
}

function limpiarLista(){
    let lista = document.getElementById("lista");

    let tam=lista.children.length;

    for(let i=0; i<tam; i++){
        lista.removeChild(lista.children[0]);
    }

    //document.getElementById("lista").innerHTML="";

}


function agregarElemento(){
    let valor = document.getElementById("valor").value;
    let posicion = document.getElementById("posicion").value;

    array.splice(posicion, 0, valor);
    limpiarLista();
    crearLista(array);
}

function eliminarElemento(){
    let valor = document.getElementById("valor").value;
    let posicion = document.getElementById("posicion").value;

    array.splice(posicion, valor);
    limpiarLista();
    crearLista(array);
}

let imagen = document.getElementById("imagenElmo");
let cad1 = document.getElementById("cadena1");
let cad2 = document.getElementById("cadena2");

//cad1.addEventListener("change", revertirCadena);

cad1.addEventListener("input", addLetra);

function addLetra(){
    cad2.value+="a";
}


function revertirCadena(){
    let cad = "";
    
    for(i=cad1.value.length-1; i>=0; i--){
        cad += cad1.value.charAt(i);
    }

    cad2.value = cad;
}

//imagen.addEventListener("mouseenter", alertaEvento);

function alertaEvento(){
    alert("Se ha producido un evento");
}