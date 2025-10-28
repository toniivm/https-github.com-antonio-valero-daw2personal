function medioArbol() {
    let altura = parseInt(prompt("Ingrese la altura del triángulo:"));  

    for (let i = 1; i <= altura; i++) {
        for (let j = 1; j <= i; j++) {
            document.write("*");
        }
        document.write("<br>");
    }
}

medioArbol();

const matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

function imprimirMatriz(matriz) {
    let numFilas = matriz.length;

    for (let i = 0; i < numFilas; i++) {
        let numColumnas = matriz[i].length;
        for (let j = 0; j < numColumnas; j++) {
            document.write(matriz[i][j] + " ");
        }
        document.write("<br>");
    }
}

function sumarMatriz(matriz) {
    let suma = 0;
    let numFilas = matriz.length;

    for (let i = 0; i < numFilas; i++) {
        let numColumnas = matriz[i].length;
        for (let j = 0; j < numColumnas; j++) {
            suma += matriz[i][j];
        }
    }
    return suma;
}

function crearMatriz() {
    let matriz = [];
    for (let i = 0; i < 5; i++) {
        let fila = [];
        for (let j = 0; j < 5; j++) {
            fila.push(Math.floor(Math.random() * 90) + 10);
        }
        matriz.push(fila);
    }
    return matriz;
}

function sumarDiagonal(matrizz) {
    let suma = 0;
    for (let i = 0; i < matrizz.length; i++) {
        suma += matrizz[i][i];
    }
    return suma;
}

let matrizz = crearMatriz();
imprimirMatriz(matrizz);
document.write('Suma de la diagonal principal:', sumarDiagonal(matrizz)); 

document.write("La suma de todos los elementos de la matriz es: " + sumarMatriz(matrizz));