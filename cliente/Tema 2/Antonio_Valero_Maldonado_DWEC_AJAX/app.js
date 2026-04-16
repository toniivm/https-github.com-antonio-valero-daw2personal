const API_URL = 'https://api.restful-api.dev/objects';

// Aqui guardo los elementos del HTML que voy a usar muchas veces.
// Asi no tengo que ir buscandolos todo el rato con getElementById.
const elements = {
    statusBox: document.getElementById('statusBox'),
    responseViewer: document.getElementById('responseViewer'),
    objectsList: document.getElementById('objectsList'),
    resultsCounter: document.getElementById('resultsCounter'),
    loadAllBtn: document.getElementById('loadAllBtn'),
    clearViewBtn: document.getElementById('clearViewBtn'),
    getByIdForm: document.getElementById('getByIdForm'),
    createForm: document.getElementById('createForm'),
    updateForm: document.getElementById('updateForm'),
    deleteForm: document.getElementById('deleteForm'),
    loadForEditBtn: document.getElementById('loadForEditBtn'),
    searchId: document.getElementById('searchId'),
    updateId: document.getElementById('updateId'),
};

function setStatus(message, type = 'info') {
    // Este cuadro es el que avisa si algo ha salido bien, mal o si esta cargando.
    elements.statusBox.textContent = message;
    elements.statusBox.className = `status status--${type}`;
}

function setResponse(title, payload) {
    // Aqui enseño la respuesta completa del servidor para ver exactamente que ha devuelto.
    const content = {
        operacion: title,
        momento: new Date().toLocaleString('es-ES'),
        respuesta: payload,
    };

    elements.responseViewer.textContent = JSON.stringify(content, null, 2);
}

function sanitizeValue(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDataList(data) {
    // El campo data viene como objeto, asi que lo convierto en una lista para pintarlo mejor.
    const entries = Object.entries(data || {});

    if (!entries.length) {
        return '<li>Sin datos adicionales</li>';
    }

    return entries
        .map(([key, value]) => `<li><strong>${sanitizeValue(key)}:</strong> ${sanitizeValue(value)}</li>`)
        .join('');
}

function renderObjects(items) {
    // Esta funcion pinta en pantalla los objetos que llegan de la API.
    // Si no hay nada, muestro un mensaje simple para que no se quede un hueco raro.
    if (!Array.isArray(items) || items.length === 0) {
        elements.objectsList.className = 'objects-list empty-state';
        elements.objectsList.textContent = 'No hay elementos para mostrar en este momento.';
        elements.resultsCounter.textContent = '0 elementos visibles.';
        return;
    }

    const cards = items.map((item) => {
        const objectName = item.name || 'Elemento sin nombre';

        return `
            <article class="object-card">
                <span class="object-card__id">ID: ${sanitizeValue(item.id)}</span>
                <h3>${sanitizeValue(objectName)}</h3>
                <ul>${formatDataList(item.data)}</ul>
            </article>
        `;
    });

    elements.objectsList.className = 'objects-list';
    elements.objectsList.innerHTML = cards.join('');
    elements.resultsCounter.textContent = `${items.length} elemento(s) visible(s).`;
}

function collectPayload(prefix) {
    // Cojo los valores del formulario y monto el objeto que voy a mandar a la API.
    // Uso prefix porque el formulario de crear y el de editar tienen campos parecidos.
    const name = document.getElementById(`${prefix}Name`).value.trim();
    const year = document.getElementById(`${prefix}Year`).value.trim();
    const price = document.getElementById(`${prefix}Price`).value.trim();
    const category = document.getElementById(`${prefix}Category`).value.trim();

    if (!name) {
        throw new Error('Tienes que escribir al menos el nombre.');
    }

    const data = {};

    if (year) {
        data.year = Number(year);
    }

    if (price) {
        data.price = Number(price);
    }

    if (category) {
        data.category = category;
    }

    return { name, data };
}

async function apiRequest(path = '', options = {}) {
    // Esta es la parte mas importante: hago la peticion y devuelvo la respuesta ya preparada.
    // La idea es no repetir el mismo codigo en cada boton del CRUD.
    const response = await fetch(`${API_URL}${path}`, options);
    const rawText = await response.text();
    let payload = {};

    if (rawText) {
        try {
            payload = JSON.parse(rawText);
        } catch {
            payload = { message: rawText };
        }
    }

    if (!response.ok) {
        const message = payload.error || payload.message || `Error HTTP ${response.status}`;
        throw new Error(message);
    }

    return payload;
}

function fillUpdateForm(item) {
    // Cuando busco un objeto, relleno tambien el formulario de editar para ahorrar tiempo.
    const data = item.data || {};

    elements.updateId.value = item.id || '';
    elements.searchId.value = item.id || '';
    document.getElementById('deleteId').value = item.id || '';
    document.getElementById('updateName').value = item.name || '';
    document.getElementById('updateYear').value = data.year ?? '';
    document.getElementById('updatePrice').value = data.price ?? '';
    document.getElementById('updateCategory').value = data.category ?? '';
}

function toggleButtonState(button, isLoading, loadingText) {
    // Esto sirve para que el boton cambie de texto mientras carga y no se pulse mil veces.
    if (!button) {
        return;
    }

    if (!button.dataset.originalText) {
        button.dataset.originalText = button.textContent;
    }

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : button.dataset.originalText;
}

async function loadAllObjects() {
    // GET de todos los elementos.
    toggleButtonState(elements.loadAllBtn, true, 'Cargando...');

    try {
        setStatus('Recuperando todos los elementos de la API...', 'info');
        const data = await apiRequest();
        renderObjects(data);
        setResponse('GET /objects', data);
        setStatus(`Se han cargado ${data.length} elemento(s).`, 'success');
    } catch (error) {
        renderObjects([]);
        setResponse('GET /objects', { error: error.message });
        setStatus(`Ha habido un problema al cargar los elementos: ${error.message}`, 'error');
    } finally {
        toggleButtonState(elements.loadAllBtn, false, 'Cargando...');
    }
}

async function getObjectById(event) {
    // GET de un solo elemento usando el ID que escribe el usuario.
    event.preventDefault();

    const id = elements.searchId.value.trim();

    if (!id) {
        setStatus('Escribe un ID antes de buscar.', 'error');
        return;
    }

    const submitButton = elements.getByIdForm.querySelector('button[type="submit"]');
    toggleButtonState(submitButton, true, 'Buscando...');

    try {
        setStatus(`Consultando el elemento con ID ${id}...`, 'info');
        const item = await apiRequest(`/${encodeURIComponent(id)}`);
        renderObjects([item]);
        setResponse(`GET /objects/${id}`, item);
        fillUpdateForm(item);
        setStatus(`Elemento ${id} encontrado. Tambien he rellenado el formulario de editar.`, 'success');
    } catch (error) {
        renderObjects([]);
        setResponse(`GET /objects/${id}`, { error: error.message });
        setStatus(`No se ha podido recuperar el elemento ${id}: ${error.message}`, 'error');
    } finally {
        toggleButtonState(submitButton, false, 'Buscando...');
    }
}

async function createObject(event) {
    // POST para crear un elemento nuevo.
    event.preventDefault();

    const submitButton = elements.createForm.querySelector('button[type="submit"]');
    toggleButtonState(submitButton, true, 'Creando...');

    try {
        const payload = collectPayload('create');
        setStatus('Creando un nuevo elemento...', 'info');

        const created = await apiRequest('', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        renderObjects([created]);
        setResponse('POST /objects', created);
        fillUpdateForm(created);
        elements.deleteForm.reset();
        elements.createForm.reset();
        setStatus(`Elemento creado correctamente. El nuevo ID es ${created.id}.`, 'success');
        await loadAllObjects();
    } catch (error) {
        setResponse('POST /objects', { error: error.message });
        setStatus(`No se ha podido crear el elemento: ${error.message}`, 'error');
    } finally {
        toggleButtonState(submitButton, false, 'Creando...');
    }
}

async function loadObjectForEdit() {
    // Este boton no actualiza nada todavia.
    // Solo trae los datos actuales para que sea mas comodo editarlos.
    const id = elements.updateId.value.trim();

    if (!id) {
        setStatus('Primero tienes que indicar el ID que quieres editar.', 'error');
        return;
    }

    toggleButtonState(elements.loadForEditBtn, true, 'Cargando...');

    try {
        setStatus(`Cargando el elemento ${id} para editarlo...`, 'info');
        const item = await apiRequest(`/${encodeURIComponent(id)}`);
        fillUpdateForm(item);
        renderObjects([item]);
        setResponse(`GET /objects/${id}`, item);
        setStatus(`Ya estan cargados los datos del elemento ${id}.`, 'success');
    } catch (error) {
        setResponse(`GET /objects/${id}`, { error: error.message });
        setStatus(`No se han podido cargar los datos del elemento ${id}: ${error.message}`, 'error');
    } finally {
        toggleButtonState(elements.loadForEditBtn, false, 'Cargando...');
    }
}

async function updateObject(event) {
    // PATCH para cambiar un objeto que ya existe.
    event.preventDefault();

    const id = elements.updateId.value.trim();

    if (!id) {
        setStatus('Tienes que indicar el ID del elemento que quieres actualizar.', 'error');
        return;
    }

    const submitButton = elements.updateForm.querySelector('button[type="submit"]');
    toggleButtonState(submitButton, true, 'Actualizando...');

    try {
        const payload = collectPayload('update');
        setStatus(`Actualizando el elemento ${id}...`, 'info');

        const updated = await apiRequest(`/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        renderObjects([updated]);
        setResponse(`PATCH /objects/${id}`, updated);
        setStatus(`El elemento ${id} se ha actualizado correctamente.`, 'success');
        await loadAllObjects();
    } catch (error) {
        setResponse(`PATCH /objects/${id}`, { error: error.message });
        setStatus(`No se ha podido actualizar el elemento ${id}: ${error.message}`, 'error');
    } finally {
        toggleButtonState(submitButton, false, 'Actualizando...');
    }
}

async function deleteObject(event) {
    // DELETE para borrar el elemento cuyo ID escribe el usuario.
    event.preventDefault();

    const id = document.getElementById('deleteId').value.trim();

    if (!id) {
        setStatus('Tienes que escribir un ID para poder borrar el elemento.', 'error');
        return;
    }

    const submitButton = elements.deleteForm.querySelector('button[type="submit"]');
    toggleButtonState(submitButton, true, 'Eliminando...');

    try {
        setStatus(`Eliminando el elemento ${id}...`, 'info');
        const result = await apiRequest(`/${encodeURIComponent(id)}`, {
            method: 'DELETE',
        });

        setResponse(`DELETE /objects/${id}`, result);
        renderObjects([]);
        elements.deleteForm.reset();
        setStatus(result.message || `El elemento ${id} se ha eliminado correctamente.`, 'success');
        await loadAllObjects();
    } catch (error) {
        setResponse(`DELETE /objects/${id}`, { error: error.message });
        setStatus(`No se ha podido eliminar el elemento ${id}: ${error.message}`, 'error');
    } finally {
        toggleButtonState(submitButton, false, 'Eliminando...');
    }
}

function clearView() {
    // Limpio formularios y resultados para empezar de cero sin recargar la pagina.
    renderObjects([]);
    elements.responseViewer.textContent = 'Esperando una operacion...';
    elements.getByIdForm.reset();
    elements.createForm.reset();
    elements.updateForm.reset();
    elements.deleteForm.reset();
    setStatus('Se ha limpiado la vista para empezar otra prueba.', 'info');
}

// Aqui conecto cada boton o formulario con su funcion correspondiente.
elements.loadAllBtn.addEventListener('click', loadAllObjects);
elements.clearViewBtn.addEventListener('click', clearView);
elements.getByIdForm.addEventListener('submit', getObjectById);
elements.createForm.addEventListener('submit', createObject);
elements.updateForm.addEventListener('submit', updateObject);
elements.deleteForm.addEventListener('submit', deleteObject);
elements.loadForEditBtn.addEventListener('click', loadObjectForEdit);

// Cargo datos al abrir para que la pagina no aparezca vacia desde el principio.
loadAllObjects();