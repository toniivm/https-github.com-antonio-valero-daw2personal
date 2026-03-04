
let vara = "33"-(-5);
console.log(5/2);
/* EJEMPLO HOISTING
//Hoisting

//Las variables declaradas con var se elevan al inicio y se inicializan con undefined
console.log(variableVarHoisting); // undefined

var variableVarHoisting = 11;

//Las variables declaradas con let se elevan al inicio pero no se inicializan
console.log(variableLetHoisting); 
let variableLetHoisting = 11;
*/




/* EJEMPLO AMBITO DE LAS VARIABLES
//Ambito de las variables
{
    var variableVarAmbito = 22;


    let variableLetAmbito = 22;
}

//Variable var tiene ambito global o de funcion (Global scope)
console.log(variableVarAmbito); // 22

//Variable let tiene ambito de bloque (Block scope)
console.log(variableLetAmbito); // Da error: variableLetAmbito is not defined
*/



/* EJEMPLO REDECLARACION DE VARIABLES
//Redeclaracion de variables
var variableVarRedeclaracion = 22;

//Variable var permite la redeclaracion
var variableVarRedeclaracion = "Cadena"; // No da error


let variableLetRedeclaracion = 22;

//Variable let no permite la redeclaracion
let variableLetRedeclaracion = "Cadena"; // Da error: Identifier 'variableLetRedeclaracion' has already been declared
*/

//const
//Constantes
//Ambito de bloque
//No se puede reasignar ni redeclarar
//Debe inicializarse al declararse
//No puede usarse sin declararse


const constante = 33;
console.log(constante); 




















let variableVar = 22;
let variableLet = 22;

function testVariables() {
    //console.log(variableVar); 
    //console.log(variableLet);
    
    //Redeclaracion de una variable
    let variableVar = 33; 
    //let variableLet = 33; // Da error: Identifier 'variableLet' has already been declared

    console.log(variableVar); 
    //console.log(variableLet); 
}

console.log(variableVar); 

testVariables();
