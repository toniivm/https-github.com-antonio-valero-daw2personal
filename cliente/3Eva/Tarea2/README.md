# Actividad DWEC - Scraping

## Web elegida

20minutos.es, sección Tecnología.

## Qué datos se sacan

Noticias de tecnología: título, descripción, imagen y enlace a la noticia completa.

## Cómo funciona la interacción

1. Puppeteer abre la portada de 20minutos.es
2. Cierra el aviso de cookies si aparece
3. Hace clic en el enlace de la sección "Tecnología" del menú
4. Espera a que carguen los artículos y hace scroll
5. Extrae las noticias y las devuelve como JSON

## Cómo ejecutarlo

```bash
npm install
npm start
```

Luego abrir http://localhost:4000 y pulsar el botón.

