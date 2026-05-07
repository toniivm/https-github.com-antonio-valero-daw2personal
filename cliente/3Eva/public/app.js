const button = document.getElementById('cargar-mensaje');
const result = document.getElementById('resultado');
const apiUrl = window.location.port === '3000'
  ? '/api/mensaje'
  : 'http://localhost:3000/api/mensaje';

async function cargarMensaje() {
  result.textContent = 'Cargando mensaje...';

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error('La respuesta del servidor no es valida');
    }

    const data = await response.json();
    result.textContent = `${data.mensaje} (${data.fecha})`;
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
}

button.addEventListener('click', cargarMensaje);