/*
//Declarar un array
let frutas = ['Manzana', 'Banana', 'Cereza'];
const paises = ['Argentina', 'Brasil', 'Chile'];

//Acceder a un elemento del array
console.log(frutas[0]); // Manzana
console.log(paises[1]); // Brasil

//Modificar un elemento del array
frutas[0] = 'Pomelo';
paises[2] = 'Perú';

console.log(frutas); // ['Pomelo', 'Banana', 'Cereza']
console.log(paises); // ['Argentina', 'Brasil', 'Perú']

//frutas = 7; // No hay error, frutas ahora es un número
//paises = 7; // Error: Assignment to constant variable.


const presidentes2 = new Array('Bukele', 'Trump', 'Putin', 'Pedro Sánchez');

const numeros = [10]; // Array con un solo elemento
const numeros2 = new Array(10); // Array vacío con longitud 10

console.log(numeros); // [10]
console.log(numeros2); // [ <10 empty items> ]

//Obtener la longitud de un array
presidentes.length; // 4

*/
const presidentes = ['Bukele', 'Trump', 'Putin', 'Pedro Sánchez'];

//Recorrer un array

//Bucle for
for(let i=0; i< presidentes.length; i++){
    //console.log(presidentes[i]);
}

//Bucle for in
for(let p in presidentes){
    console.log(p); //Muestra el índice
    //console.log(presidentes[p]); //Muestra el valor
}

//Bucle for of
for(let p of presidentes){
    console.log(p); //Muestra el valor
}

//forEach con lambda
presidentes.forEach( p => {
    console.log(p); //Muestra el valor
});

//Ordenar una lista
presidentes.sort(); //Ordena alfabéticamente

//Añadir un elemento al final
presidentes.push('López Obrador');
presidentes.push('Lula');

//Añadir un elemento al principio
presidentes.unshift('Morales');

//Eliminar el último elemento
presidentes.pop();

//Eliminar el primer elemento
presidentes.shift();

//Eliminar un elemento en posición específica
//Elimina el elemento dejando hueco
//delete presidentes[1]; //Elimina el elemento en la posición 1, pero deja un "hueco" undefined

//Añadir un elemento en posición específica
presidentes.splice(2, 0, 'Biden'); //En la posición 2, eliminar 0 elementos y añadir 'Biden'

//Eliminar un elemento en posición específica
presidentes.splice(1, 1); //En la posición 1, eliminar 1 elemento y añadir 'Macri'

//Añadir varios elementos en posición específica
presidentes.splice(3, 0, 'Macri', 'Piñera'); //En la posición 3, eliminar 0 elementos y añadir 'Macri' y 'Piñera'

presidentes.splice(2, 2, 'Echenique'); //En la posición 2, eliminar 2 elementos

let listaSeparada = presidentes.join('* '); //Une todos los elementos en un string separados por ', '

//Mostrar todos los presidentes en etiquetas
document.getElementById('lista').innerText = listaSeparada;



//Ejercicio: Crear un array con nombres de equipos de fútbol
const equipos = ['Oviedo', 'Aviles', 'Celta de Vigo', 'Mallorca', 'Caudal', 'Mosconia'];

//Acceder elemento vista
const listaFutbol = document.getElementById('listaFutbol');

//Crear elementos li por cada equipo
const li = document.createElement('li');
li.innerText = equipos[0];

//Añadir elemento a la vista
//listaFutbol.appendChild(li);


for(let equipo of equipos){
    const li = document.createElement('li');
    li.innerText = equipo;
    listaFutbol.appendChild(li);
}

const ciudades = [['Oviedo', 'Aviles', 'Cangas de Narcea'], ['Mieres', 'Pola de Siero', 'Lastres'], ['Gijón', 'Langreo', 'Llanes']];

//Acceder a "Gijon"
console.log(ciudades[2][0]);

//Recorrer array multidimensional
for(let ciudadFila of ciudades){
    console.log('Nueva fila:' + ciudadFila);
    for(let ciudadColumna of ciudadFila){
        console.log(ciudadColumna);
    }
}

for(let i=0; i<ciudades.length; i++){
    for(let j=0; j<ciudades[i].length; j++){
        console.log(ciudades[i][j]);
    }
}

//Preguntar dato al usuario
//let msg = prompt('Hola, ¿cómo te llamas?');
console.log('El usuario se llama ' + msg);

//Ejercicio: Añadir un equipo al array y actualizar la vista
function agregarEquipo(){
    let nuevoEquipo = prompt('Introduce el nombre del equipo:');
    
    if(nuevoEquipo!==null && nuevoEquipo.length > 0){
        equipos.push(nuevoEquipo);

        //Actualizar la vista
        const li = document.createElement('li');
        li.innerText = nuevoEquipo;
        listaFutbol.appendChild(li);
    }
    else {
        alert('El nombre del equipo no puede estar vacío.');
    }
}