# Notas del proyecto

## 24 nov
- Empece con la estructura basica de vue
- Cree el componente principal y probe que funcionara
- Instale vite, va mucho mas rapido que webpack

## 25 nov  
- Hice el modelo Book
- Me costo un poco entender como hacer el pattern factory pero al final salio
- Cree las 3 estrategias de storage (local, session, memory)
- Probe con localstorage y funciona bien

## 26 nov
- Hice el BookService con toda la logica
- Añadi los metodos para añadir, borrar, buscar libros
- Tuve un bug con los filtros que no actualizaban bien, lo arregle usando computed
- Cree el componente BookLibrary para mostrar los libros

## 27 nov
- Hice el formulario para añadir libros
- Añadi validacion de campos
- La vista previa quedo chula
- Hice el componente Statistics con las graficas
- Probe todo y funciona

## 28 nov (mañana)
- Arregle los estilos responsive para movil
- Añadi mas libros de ejemplo (1984, el principito)
- Mejore el mensaje cuando no hay resultados
- Añadi validacion extra para el año en el formulario

## 28 nov (tarde)
- Desplegue en firebase (primero intente con github pages pero firebase fue mas facil)
- Termine la documentacion
- Añadi funcion debug por si hace falta
- Revise que todo este bien
- Personalize el footer con mi nombre

## Problemas que tuve:
- Al principio los datos se borraban al recargar -> solucion: localstorage
- Los filtros no funcionaban juntos -> solucion: usar computed de vue
- Las imagenes a veces no cargaban -> añadi fallback con imagen por defecto
- En movil se veia mal -> añadi media queries

## Cosas que mejoraria:
- Conectar con una api real de libros
- Añadir autenticacion
- Poder valorar los libros con estrellas
- Modo oscuro
