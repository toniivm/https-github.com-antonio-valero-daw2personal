let num1=document.getElementById("num1");
let num2=document.getElementById("num2");
let resultado=document.getElementById("resultado");

function checkInputs(){
    if(num1.value=="" || num2.value==""){
        alert("Por favor, rellena ambos campos.");
        return false;
    }
    return true;
}

function sumar(){
    if(checkInputs()){
        let suma = parseFloat(num1.value) + parseFloat(num2.value);
        resultado.innerText = "Resultado: " + suma;
    }
}

function restar(){
    if(checkInputs()){
        let resta = parseFloat(num1.value) - parseFloat(num2.value);
        resultado.innerText = "Resultado: " + resta;
    }
}

function multiplicar(){
    if(checkInputs()){
        let multiplicacion = parseFloat(num1.value) * parseFloat(num2.value);
        resultado.innerText = "Resultado: " + multiplicacion;
    }
}

function dividir(){
    if(checkInputs()){
        let division = parseFloat(num1.value) / parseFloat(num2.value);
        resultado.innerText = "Resultado: " + division;
    }
}

function operaciones(operando){
    switch(operando){
        case '+':
            sumar();    
            break;
        case '-':
            restar();
            break;
        case '*':
            multiplicar();
            break;
        case '/':
            dividir();
            break;
    }
}