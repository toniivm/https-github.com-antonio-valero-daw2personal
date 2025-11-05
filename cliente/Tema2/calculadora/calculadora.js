let operacion = '';

function agregarCifra(numero) {
 operacion += numero;
 updateDisplay();
}

function updateDisplay() {
 document.getElementById('display').innerText = operacion;
}

function clearDisplay() {
 operacion = '';
 document.getElementById('display').innerText = operacion;
}
function calcularResultado() {
    console.log("Calculando resultado de la operación: " + operacion);
    let resultado = eval(operacion);
    operacion = resultado.toString();
    updateDisplay();
}   

// Asignar eventos a los botones numéricos
let botonIgual = document.getElementById('boton-igual');
botonIgual.addEventListener('click', calcularResultado);

let botones=document.querySelectorAll('button');

botones.forEach((b)=>{
    if(b.innerText != '=' && b.innerText !== '='){
        b.addEventListener('click', ()=> agregarCifra(b.innerText));
    }
});