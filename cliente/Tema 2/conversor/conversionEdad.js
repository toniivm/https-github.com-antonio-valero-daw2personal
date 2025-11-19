//Conversión de cadenas a números
parseInt();
Number();

//Convertir una cadena en un float
parseFloat();
Number();

//Convertir un numero en una cadena
String();

//Cuando una cadena no puede convertirse en número
NaN;
isNaN(); //Devuelve true si la cadena no puede convertirse en número









let edad = "";
// 100b, b1, 134.56, true

console.log(parseInt(edad));
console.log(Number(edad));


function comprobarEdad(){
    let edad = document.getElementById("edad").value;
    let edadInt = Number(edad);

    if(isNaN(edadInt) || edadInt < 18 || edadInt > 40){
        document.getElementById("resultado").innerHTML = "No puedes entrar a la discoteca";
    }else{
        document.getElementById("resultado").innerHTML = "Puedes entrar a la discoteca";
    }

}