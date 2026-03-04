///Ejercicio 1 
// a) Pedir frase de más de 10 caracteres y repetir hasta que sea correcta
let frase;
do {
    frase = prompt("Introduce una frase de más de 10 caracteres:");
} while (frase.length <= 10);

// b) Mostrar mensaje según el número de palabras
let palabras = frase.split(" ");
let mensaje;

if (palabras.length < 3) {
    mensaje = "Menos de tres palabras";
} else if (palabras.length === 3) {
    mensaje = "Tres palabras";
} else {
    mensaje = "Más de tres palabras";
}

alert(mensaje);

// Ejercicio 2 
function comprobar() {

    let valor1 = document.getElementById("numero1").value;
    let valor2 = document.getElementById("numero2").value;
    let texto = document.getElementById("expresion").value;

    let numero1 = parseInt(valor1);
    let numero2String = String(valor2);

    // Comprobar si son iguales (sin importar el tipo)
    if (numero1 == numero2String) {
        alert("Son iguales");
    } else {
        alert("No son iguales");
    }

    // Convertir el segundo valor a número para operaciones matemáticas
    let numero2 = parseFloat(valor2);

    // Imprimir por consola: triple del segundo número, suma y potencia
    console.log("Triple del segundo número: " + (numero2 * 3));
    console.log("Suma de ambos números: " + (numero1 + numero2));
    console.log("Primer número elevado al segundo: " + Math.pow(numero1, numero2));

    // Validar texto con expresión regular
    let expresion = "^[B-T][0-9]{3}[AB][aeiouAEIOU]+$";
    let varRegex = new RegExp(expresion);

    if (varRegex.test(texto)) {
        console.log("El texto cumple con los requisitos");
    } else {
        console.log("El texto no cumple con los requisitos");
    }
}

//Ejercico 3 creo una interfaz con una imagen, dos inputs de texto y una etiqueta

let elementos = ["Cebra", "Gacela"];

document.getElementById("miImagen").addEventListener("mouseenter", function () {
    console.log("El puntero ha entrado en la imagen");
});

document.getElementById("input1").addEventListener("input", function () {
    document.getElementById("input2").value = this.value;
});
document.getElementById("tituloDWEC").addEventListener("dblclick", function () {
    this.textContent = "Aprobado";
});
document.getElementById("miImagen").addEventListener("click", function () {
    let textoInput = document.getElementById("input1").value;
    elementos.push(textoInput);
    alert("Elementos del array: " + elementos.join(", "));
});

// Ejercicio 4
let hashMapBebidas = new Map();
let contador = 1;

function añadirBebida() {
    let bebida = prompt("Introduce una bebida:");
    
    // Verificamos que no esté vacío y que no exista en el mapa
    if (bebida && bebida.trim() !== "") {
        // Comprobamos si la bebida ya existe en los valores del Map
        let existe = false;
        for (let valor of hashMapBebidas.values()) {
            if (valor === bebida) {
                existe = true;
                break;
            }
        }
        
        if (!existe) {
            // Añadims al HashMap
            hashMapBebidas.set(contador, bebida);
            contador++;
            
            // Añadimos a la lista visual
            let lista = document.getElementById("listaBebidas");
            let nuevoElemento = document.createElement("li");
            nuevoElemento.textContent = bebida;
            lista.appendChild(nuevoElemento);
        } else {
            alert("La bebida ya existe en el mapa");
        }
    } else {
        alert("El texto no puede estar vacío");
    }
}

function eliminarBebida() {
    // Eliminarem el último elemento del HashMap
    if (hashMapBebidas.size > 0) {
        let ultimaClave = Math.max(...hashMapBebidas.keys());
        
        // Eliminar del HashMap
        hashMapBebidas.delete(ultimaClave);
        
        // Eliminar el último elemento de la lista visual
        let lista = document.getElementById("listaBebidas");
        if (lista.lastChild) {
            lista.removeChild(lista.lastChild);
        }
        
        alert("Último elemento eliminado correctamente");
    } else {
        alert("No hay elementos para eliminar");
    }
}

function vaciarBebidas() {
    // Vaciar el HashMap
    hashMapBebidas.clear();
    
    
    // Vaciar la lista visual
    let lista = document.getElementById("listaBebidas");
    lista.innerHTML = "";
    
    alert("Todas las bebidas han sido eliminadas");
}
function mostrarBebidas() {
    if (hashMapBebidas.size > 0) {
        let bebidasArray = Array.from(hashMapBebidas.values());
        alert("Bebidas en el HashMap: " + bebidasArray.join(", "));
    } else {
        alert("No hay bebidas en el HashMap");
    }
}