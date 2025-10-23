//Modelo. Base de datos en memoria
const listaTareasModelo = [];

const listaTareasVista = document.getElementById('listaTareas');

function actualizarVista() {

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

    listaTareasModelo.push(nuevaTareaObjeto);




    let nuevaTareaVista = document.createElement('li');

    //Acceder valor de una variable: ${variable}
    //nuevaTareaVista.textContent = `${nuevaTarea}`;

    nuevaTareaVista.innerHTML = `
        <div>
          <strong>${nuevaTarea}</strong> 
        </div>
        <button onclick="eliminarTarea(this)" class="btn-eliminar" style="margin-left: 10px; width: 100px; ">
        X</button>
      `;

    // Agregar la nueva tarea a la vista
    listaTareasVista.appendChild(nuevaTareaVista);

    // Limpiar el campo de entrada después de agregar la tarea
    document.getElementById('tareaInput').value = '';
}

// Eliminar tarea al hacer clic en el botón de eliminar
function eliminarTarea(botonEliminar) {
    const tareaAEliminar = botonEliminar.parentElement;
    listaTareasVista.removeChild(tareaAEliminar);
}