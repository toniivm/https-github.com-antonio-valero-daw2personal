// array.js
const arr1 = [1, 2, 3, 4];
const arr2 = ['a', 'b', 'c'];

function mostrarSiMismoTamanio(a, b) {
    if (a.length === b.length) {
        alert('Los arrays tienen el mismo tamaño (' + a.length + ').');
    } else {
        alert('Los arrays tienen tamaños diferentes: ' + a.length + ' y ' + b.length + '.');
    }
}

// Ejemplo de uso
mostrarSiMismoTamanio(arr1, arr2);

function checkArrayEquality(a, b) {
    if (a.length !== b.length) {
        return false;
    }   
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }   

}   }  return true;