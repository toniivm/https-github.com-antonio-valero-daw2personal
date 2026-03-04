let operacion ='';


//Asignar eventos a los botones desde javascript
let botonIgual = document.getElementById('botonIgual');
botonIgual.addEventListener('click', calcularResultado);

//Cuando se usa una funcion con parametros en un event listener,
//  se debe usar una funcion anonima
//botonIgual.addEventListener('click',()=> agregarCifra(b.innerText));







//Recorrer todos los botones y asignar eventos
let botones = document.querySelectorAll('button');

botones.forEach((b) => {
    if(b.innerText !== 'C' && b.innerText !== '='){
        b.addEventListener('click',() =>  agregarCifra(b.innerText));
    }
});





function agregarCifra(cifra){
    
    operacion += cifra;
    console.log(operacion);
    updateDisplay();
}


function updateDisplay(){
    document.getElementById('display').innerText = operacion;
}

function clearDisplay(){
    operacion ='';
    document.getElementById('display').innerText = 0;
}


function calcularResultado(){
    console.log("Holaaa");
    let resultado = eval(operacion);
    operacion = resultado.toString();
    updateDisplay();
}