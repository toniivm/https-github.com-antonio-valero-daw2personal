//Modelo. Base de datos en memoria
const listaTareasModelo = [];

const listaTareasVista = document.getElementById('listaTareas');

let contadorTareas = 0;

function actualizarVista(nuevaTarea) {
    let nuevaTareaVista = document.createElement('li');

    //Acceder valor de una variable: ${variable}
    //nuevaTareaVista.textContent = `${nuevaTarea}`;

    nuevaTareaVista.innerHTML = `
        <div>
          <strong>${nuevaTarea.descripcion}</strong> 
        </div>
        <button onclick="eliminarTarea(this)" class="btn-eliminar" style="margin-left: 10px; width: 100px; ">
        X</button>
      `;

    //Tratar la prioridad para cambiar el color de fondo
    let colorFondo = 'red'; // Valor por defecto

    switch(nuevaTarea.prioridad) {
        case 'alta':
            colorFondo = '#ff8d8dff'; // Rojo claro
            break;
        case 'media':
            colorFondo = '#ffff8dff'; // Amarillo claro
            break;
        case 'baja':
            colorFondo = '#8dff8dff'; // Verde claro
            break;
    }
    nuevaTareaVista.style.backgroundColor = colorFondo; // Establecer el color de fondo según la prioridad




    // Agregar la nueva tarea a la vista
    listaTareasVista.appendChild(nuevaTareaVista);

    // Limpiar el campo de entrada después de agregar la tarea
    document.getElementById('tareaInput').value = '';
}





function agregarTarea() {
    let descripcionTarea = document.getElementById('tareaInput').value; // Obtiene la descripción de la tarea
    let prioridadTarea = document.getElementById('prioridadSelect').value; // Obtiene la prioridad seleccionada

    if(descripcionTarea.trim() === '') {
        alert('La descripción de la tarea no puede estar vacía. Idiota.');
        return;
    }

    let nuevaTarea = descripcionTarea;
    let nuevaTareaObjeto = { descripcion: descripcionTarea,
                            prioridad: prioridadTarea 
    };


    actualizarVista(nuevaTareaObjeto);

    listaTareasModelo.push(nuevaTareaObjeto);


    //Actualizar contador
    contadorTareas++;
    actualizarContador();

}

// Eliminar tarea al hacer clic en el botón de eliminar
function eliminarTarea(botonEliminar) {
    const tareaAEliminar = botonEliminar.parentElement;
    listaTareasVista.removeChild(tareaAEliminar);

    //Actualizar contador
    contadorTareas--;
    actualizarContador();
}


function actualizarContador() {
    document.getElementById('tareasPendientes').textContent 
    = `Tareas Pendientes: ${contadorTareas}`;
}


function agregarTareaVoz() {
    const SpeechRecognition = window.SpeechRecognition ||
     window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Tu navegador no soporta reconocimiento de voz.");
        return;
    }

    // Crear una instancia de SpeechRecognition
    const reconocimiento = new SpeechRecognition();

    reconocimiento.lang = "es-ES";
    reconocimiento.interimResults = false;
    reconocimiento.maxAlternatives = 1;
    reconocimiento.continuous = false; // cambia a true si quieres escucha continua


    //Se ejecuta cuando empieza a escuchar
    reconocimiento.onstart = () => {
        console.log("🎤 Escuchando...");
    };






    reconocimiento.onresult = (event) => {
        const tareaReconocida = event.results[0][0].transcript;
        document.getElementById("tareaInput").value = tareaReconocida;
        console.log(`✅ Tarea reconocida: "${tareaReconocida}"`);
    };

    

    //Se ejecuta si hay un error
    reconocimiento.onerror = (event) => {
        console.error("❌ Error en el reconocimiento:", event.error);
    };

    //Se ejecuta cuando termina de escuchar
    reconocimiento.onend = () => {
        console.log("🛑 Reconocimiento finalizado.");
    };





    reconocimiento.start();


}