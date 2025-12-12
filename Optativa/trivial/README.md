# Trivial Pro — Sorprendentemente Currado

Un juego de trivial moderno con una interfaz cuidada y un backend ligero en PHP, listo para XAMPP.

## Requisitos
- XAMPP en Windows con Apache y PHP activos.

## Instalación
1. Copia esta carpeta en `c:/xampp/htdocs/https-github.com-antonio-valero-daw2personal/Optativa/trivial` (ya está).
2. Arranca Apache desde el panel de XAMPP.
3. Abre en el navegador: `http://localhost/https-github.com-antonio-valero-daw2personal/Optativa/trivial/`.

## Juego
- Dos modos: **clásico** y **fiesta**.
- 10 preguntas aleatorias con puntuación por rapidez.
- Guarda tu marca y compite en el **ranking**.

## API
- `GET /api/questions?limit=10&category=...&difficulty=...`
- `POST /api/score` body: `{ name, score, duration, mode }`
- `GET /api/leaderboard`

## Personalización
- Edita `data/questions.json` para añadir preguntas.
- Estilos en `assets/css/style.css`.
- Lógica del cliente en `assets/js/app.js`.

## Seguridad
Este demo incluye validación básica. Para producción: limitar orígenes, añadir CSRF y almacenar ranking en SQLite con PDO.
