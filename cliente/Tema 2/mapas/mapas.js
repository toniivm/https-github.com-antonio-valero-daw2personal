/*
//Crear Mapa
const animales = new Map();

//Añadir elementos
animales.set('Gato', 'miau');
animales.set('Perro', 'guau');
animales.set('Vaca', 'muuuu');
animales.set('Pavo', 'apagaluz');
animales.set('Gochu', 'oink');
animales.set('Serpiente', 'ssssss');

//Modificar un valor
animales.set('Perro', 'woof');

//Elminar valor
animales.delete('Gochu');

//Devolver valor asociado a clave
animales.get('Gato');

//Tamaño de la lista
animales.size;

//Recorrer valores mapa
for(anim of animales.values()){
    console.log(anim);
}

//Recorrer claves mapa
for(animal of animales.keys()){
    console.log(animal);
}

//Recorrer claves y valores
for(animal of animales){
    console.log("Clave: " + animal[0] + ". Valor: " + animal[1]);
}

for(animal of animales.keys()){
    console.log("Clave: " + animal + ". Valor: " + animales.get(animal));
}

*/

//Modelo
const animales = new Map([
    ['Gato', 'miau'],
    ['Perro', 'guau'],
    ['Vaca', 'muuuu'],
    ['Pavo', 'apagaluz'],
    ['Gochu', 'oink'],
    ['Serpiente', 'ssssss']
]);

function anadirDatoModelo(clave, valor){
    //Comprobar si existe
    if(animales.has(clave)){
        console.log("El animal ya existe");
        return false;
    }

    animales.set(clave, valor);
    return true;
}

function eliminarDatoModelo(clave){
    //Comprobar si existe
    if(!animales.has(clave)){
        return false;
    }

    animales.delete(clave);
    return true;
}

function devolverDatosModelo(){
    return animales;
}

//Vista
let claveAnimalAnadir = document.getElementById('claveAnimal');
let valorAnimalAnadir = document.getElementById('valorAnimal');
let claveAnimalEliminar = document.getElementById('eliminarAnimal');

function anadirElementoVista(clave, valor){
    let li = document.createElement('li');
    li.textContent = clave + ": " + valor;
    document.getElementById('listaAnimales').appendChild(li);
}

function eliminarElementoVista(clave){
    let lista = document.getElementById('listaAnimales');
    for(let i=0; i<lista.children.length; i++){

        let claveEncontrada = lista.children[i].textContent.split(":")[0]
        console.log(claveEncontrada);

        if(claveEncontrada == clave){
            lista.removeChild(lista.children[i]);
        }


    }
}

function mostrarAlerta(msg){
    alert(msg);
}

//Controlador
function cargarAnimales(){
    let datos = devolverDatosModelo();
    for(animal of datos){
        anadirElementoVista(animal[0], animal[1]);
    }
}
cargarAnimales();

function anadirAnimal(){
    let clave = claveAnimalAnadir.value;
    let valor = valorAnimalAnadir.value;

    let datoAnadido = anadirDatoModelo(clave, valor);

    if(!datoAnadido){
        //Mostrar alerta
        mostrarAlerta("El animal ya existe. No se puede añadir");
    }

    else{
        anadirElementoVista(clave, valor);
    }

}

function eliminarAnimal(){
    eliminarElementoVista(claveAnimalEliminar.value);
    
}


//Trabajo con cadenas
let cadena = "1;2;5;6;9;10";

//Split
let cadenaSeparada = cadena.split(";");

for(let i=0; i<cadenaSeparada.length; i++){
    console.log(cadenaSeparada[i]);
}

//Join
let cadenaUnida = cadenaSeparada.join("-"); //1-2-5-6-9-10
console.log(cadenaUnida);


//Replace
let cad = "El perro de Andrea ladra";
cad =cad.replace("a", "e"); //Reemplazar primera ocurrencia
//console.log(cad);

cad = cad.replaceAll("a", "e");
console.log(cad);

cad.substring(0, 10); //Devuelve parte de la cadena desde 0 hasta 10

let cadenaConEspacios = " 1 2 3 4 5 6 7 8 9 10  ";

console.log(cadenaConEspacios.trim());
console.log(cadenaConEspacios.replaceAll(" ", ""));


cadena.length //tamaño de la cadena

for(let i=0;i<cadena.length; i++){
    console.log(cadena[i]);
}

cadena.toUpperCase();//Mayusculas
cadena.toLocaleLowerCase();//Minusculas


