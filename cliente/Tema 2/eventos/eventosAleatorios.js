
/*const eventos = ["click", "blur", "dblclick", "input", "change"
    ,"focus", "mouseover", "mouseout", "mouseenter", "mouseleave",
    "keydown"
];*/

const eventos = ["click", "dblclick",
     "mouseover", "mouseout", "mouseenter", "mouseleave"
];

//Recorrer elementos de la vista con classList random

const elementos = document.getElementsByClassName("random");

function addRandomEvent(){
    let randomElement = Math.floor(Math.random() * elementos.length);
    let randomEvent = getRandomEvent();

    //console.log("Elemento: " + elementos[randomElement]);
    //console.log("Evento: " + randomEvent);

    //Añadir evento a elemento
    //elementos[randomElement].addEventListener(randomEvent, eventFound);

    /*elementos[randomElement].addEventListener(randomEvent, ()=>{
        alert("Has encontrado el evento.");
    });*/

    
    elementos[randomElement].addEventListener(randomEvent,()=> eventFound2(randomEvent));

}

addRandomEvent();
let tiempoInicial = new Date();

function eventFound(){
    let tiempoFinal = new Date();
    let segundos = (tiempoFinal - tiempoInicial) / 1000;

    alert("Has encontrado el evento. Enhorabuena!!! Has tardado " + segundos + " segundos" );
}



function eventFound2(evento){
    let tiempoFinal = new Date();
    let segundos = (tiempoFinal - tiempoInicial) / 1000;

    alert("Has encontrado el evento." + evento+
         "Enhorabuena!!! Has tardado " + segundos + " segundos" );
}

function getRandomEvent() {
    //Math.random(); // 0 a 1: Pero el maximo es 0.9999999
    //Math.random() * 10; // 0 a 9.999999
    //Math.floor(Math.random() * 10); // 0 a 9. Truncar

    const randomIndex = Math.floor(Math.random() * eventos.length);
    
    return eventos[randomIndex];
}
