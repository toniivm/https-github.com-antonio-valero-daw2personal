const express = require('express')
const cors = require('cors')
const puppeteer = require('puppeteer')

const app = express()
app.use(cors())
app.use(express.static('public'))

app.get('/items', async (req, res) => {

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
    const page = await browser.newPage()

    try {

        // Abrimos la portada de 20minutos
        await page.goto('https://www.20minutos.es', { waitUntil: 'domcontentloaded', timeout: 60000 })

        // Interaccion 1: aceptar cookies si aparece el aviso
        try {
            await page.waitForSelector('#didomi-notice-agree-button', { timeout: 4000 })
            await page.click('#didomi-notice-agree-button')
        } catch (_) {}

        // Interaccion 2: clic en Tecnologia del menu
        const enlaceTec = await page.waitForSelector('a[href="https://www.20minutos.es/tecnologia/"]', { timeout: 10000 })
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
            page.evaluate(el => el.click(), enlaceTec)
        ])

        // Interaccion 3: scroll en la pagina de resultados
        await page.waitForSelector('article', { timeout: 15000 })
        await page.evaluate(() => window.scrollBy(0, 800))

        // Recogemos las noticias
        const noticias = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('article')).slice(0, 12).map(a => {
                const img = a.querySelector('img')
                return {
                    titulo:      a.querySelector('h2, h3')?.textContent.trim() || '',
                    descripcion: a.querySelector('p')?.textContent.trim() || '',
                    imagen:      img ? (img.src || img.dataset.src || '') : '',
                    enlace:      a.querySelector('a')?.href || ''
                }
            }).filter(n => n.titulo.length > 5)
        })

        res.json({ seccion: 'Tecnologia', total: noticias.length, noticias })

    } catch (e) {
        res.status(500).json({ error: e.message })
    } finally {
        await browser.close()
    }
})

app.listen(4000, () => console.log('Servidor en http://localhost:4000'))
