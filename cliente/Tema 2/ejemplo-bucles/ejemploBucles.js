function medioArbol(){
    let num = prompt("Introduce un numero: ");

    for(let i=1; i<=num; i++){
        for(let j=1; j<=i; j++){
            document.write("*");
        }
        document.write("<br>");
    }
}

medioArbol();


const matriz = [
    [1, 2, 3, 8],
    [4, 5, 6, 8],
    [7, 8, 9, 8, 9]
];

function imprimirMatriz() {
    let numFilas = matriz.length;

    for (let i = 0; i < numFilas; i++) { // Recorre cada fila
        let numColumnas = matriz[i].length;
        for (let j = 0; j < numColumnas; j++) { // Recorre cada columna
            document.write(matriz[i][j] + " ");
        }
        // Salto de línea después de cada fila
        document.write("<br>");
    }
}

imprimirMatriz();


function sumarMatriz() {
    let numFilas = matriz.length;
    let suma = 0;

    for (let i = 0; i < numFilas; i++) { // Recorre cada fila
        let numColumnas = matriz[i].length;
        for (let j = 0; j < numColumnas; j++) { // Recorre cada columna
             suma = matriz[i][j] + suma;
        }
    }

    document.write("La suma de todos los elementos es: " + suma);
}

sumarMatriz();



function sumaDiagonal() {
    let numFilas = matriz.length;
    let suma = 0;

    for (let i = 0; i < numFilas; i++) { // Recorre cada fila
        let numColumnas = matriz[i].length;
        for (let j = 0; j < numColumnas; j++) { // Recorre cada columna
            if(i === j) {
                suma = matriz[i][j] + suma;
            }
        }
    }

    document.write("La suma de la diagonal es: " + suma);
}

function sumaDiagonal2() {
    let suma = 0;

    for (let i = 0; i < matriz.length; i++) {
        suma += matriz[i][i];
    }

    document.write("La suma de la diagonal es: " + suma);
}


function generarMatriz(tam) {
    let matriz = new Array(tam);

    for (let i = 0; i < tam; i++) {
        matriz[i] = new Array(tam);
    }

    for (let i = 0; i < tam; i++) {
        for (let j = 0; j < tam; j++) {
            matriz[i][j] = Math.floor(Math.random() * 10);
        }
    }

    imprimirMatriz(matriz);
    return matriz;
}

let matrizGenerada = generarMatriz(50);
//rimirMatriz(matrizGenerada);



function imprimirMatriz(m) {
    let numFilas = m.length;

    for (let i = 0; i < numFilas; i++) { // Recorre cada fila
        let numColumnas = m[i].length;
        for (let j = 0; j < numColumnas; j++) { // Recorre cada columna
            document.write(m[i][j] + " ");
        }
        // Salto de línea después de cada fila
        document.write("<br>");
    }
}
