const btn    = document.getElementById('btn-buscar')
const estado = document.getElementById('estado')
const grid   = document.getElementById('grid')

btn.addEventListener('click', async () => {

    btn.disabled = true
    estado.textContent = 'Cargando... esto puede tardar unos segundos.'
    grid.innerHTML = ''

    const respuesta = await fetch('/items')
    const datos = await respuesta.json()

    if (datos.error) {
        estado.textContent = 'Error: ' + datos.error
        btn.disabled = false
        return
    }

    estado.textContent = datos.total + ' noticias encontradas'

    datos.noticias.forEach(n => {
        const card = document.createElement('div')
        card.className = 'card'
        card.innerHTML = `
            <img src="${n.imagen}" alt="${n.titulo}">
            <div class="info">
                <h3>${n.titulo}</h3>
                <p>${n.descripcion}</p>
                <a href="${n.enlace}" target="_blank">Leer noticia</a>
            </div>
        `
        grid.appendChild(card)
    })

    btn.disabled = false
})
