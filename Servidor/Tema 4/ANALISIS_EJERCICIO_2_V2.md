# Análisis del Ejercicio 2: Búsqueda de Clientes con Filtros Dinámicos

## 1. Explicación General del Código

**¿Cuál es el objetivo de la función?**

Básicamente esta función sirve para buscar clientes en la base de datos de forma flexible. Si un comercial quiere encontrar todos los clientes de Madrid o los que hayan gastado más de 50.000 euros, esta función lo hace sin necesidad de escribir una SQL diferente cada vez. Se adapta a los criterios que le pasemos y hace la búsqueda automáticamente.

**¿Qué tipo de datos recibe y qué devuelve?**

La función recibe dos cosas: un array con los filtros (puede tener nombre, ciudad, fechas, cantidad de facturación, etc.) y la conexión a la base de datos (el objeto PDO). Lo que devuelve es un array con todos los clientes que cumplen esos filtros. Cada cliente viene con todos sus datos: id, nombre, teléfono, email, dónde es, cuánto ha gastado... Si no hay resultados, devuelve un array vacío.

**¿Qué problema resuelve dentro de un CRM/ERP?**

En una empresa normal, los vendedores constantemente necesitan buscar clientes específicos. Pueden querer encontrar a todos los de Barcelona, o los que son VIP porque han gastado mucho, o los que se registraron este mes, o directamente los que están activos. Sin esta función, cada búsqueda diferente sería una SQL nueva. Con esto, una sola función maneja todos los casos posibles.

**¿Qué tipo de operación realiza sobre la base de datos?**

Es un SELECT que filtra dinámicamente. Empezamos diciendo que queremos todos los clientes, y luego añadimos condiciones según los filtros que nos pasen. Si no nos dicen que busque por ciudad, no filtra por ciudad. Es un SELECT inteligente que se adapta.

---

## 2. Elementos Importantes que Hacen que el Código Funcione

**Creación dinámica del WHERE según los filtros**

Lo primero que hacemos es empezar con una condición que siempre es verdadera: "WHERE 1=1". Esto es como una base neutra. Luego, por cada filtro que nos pasan, añadimos un AND con esa condición. Por ejemplo: si me dicen buscar por nombre, añado "AND nombre LIKE :nombre". Si también me dicen ciudad, añado "AND ciudad = :ciudad". El resultado final es que tenemos exactamente las condiciones que necesitamos, ni más ni menos.

**Uso de PDO::prepare() y parámetros nombrados**

Aquí es importante no meter directamente los valores que el usuario manda en la SQL, porque sería un agujero de seguridad enorme. En su lugar, escribimos la estructura SQL con placeholders (como :nombre, :ciudad), y luego le decimos a PDO qué valor va a tomar cada uno. Es como escribir la pregunta primero y luego rellenar los huecos. Así el usuario no puede inyectar código SQL malicioso aunque lo intente.

**Validación de filtros antes de añadirlos**

No todos los filtros se comprueban igual. Para campos de texto como el nombre, usamos !empty() porque un nombre vacío no significa nada. Para las fechas usamos isset() para saber si el usuario metió algo. Para campos booleanos como "activo", hay que ser más estricto y comprobar que solo sean 0 o 1, nada más.

**Control del filtro booleano (activo) con múltiples valores válidos**

El campo "activo" solo puede ser verdadero o falso, es decir, 0 o 1. No queremos que alguien mande un 5 o una palabra rara, porque eso rompería la búsqueda. Así que comprobamos específicamente que sea 0 o 1 antes de añadir ese filtro a la búsqueda.

**Construcción final del SQL con implode**

Tenemos todos los fragmentos de las condiciones en un array. Luego usamos implode para unirlos todos con "AND" en medio. Es como si tuviéramos las piezas de un puzzle en una bolsa, y luego las juntamos en el orden correcto.

---

## 3. Funciones o Mecanismos Relevantes y Menos Típicos

**PDO::prepare() y por qué evita inyección SQL**

Cuando preparamos una consulta con prepare(), lo que hacemos es decirle a MySQL: "Aquí viene la estructura de la SQL, luego vendrán los datos por separado". La base de datos compila esa estructura, y después los datos se añaden como datos, no como código. Así que aunque alguien intente meter algo como "'; DROP TABLE clientes; --" en un filtro, la BD lo ve como un texto normal, no como una orden. Es el método más seguro que existe.

**fetchAll(PDO::FETCH_ASSOC) y qué formato devuelve**

Este método coge todos los resultados y los convierte en arrays asociativos. En lugar de objetos con propiedades, obtenemos arrays donde cada clave es el nombre de la columna. Por ejemplo: array('id' => 1, 'nombre' => 'Juan', 'ciudad' => 'Madrid'). Es mucho más fácil de trabajar en PHP puro y si necesitamos pasarlo a JSON para una API, es directo.

**implode(' AND ', $where) para generar condiciones dinámicas**

En lugar de ir concatenando strings enormes con la SQL, construimos un array con cada condición como un elemento. Así es mucho más legible y fácil de debuggear. Si algo falla, ves claramente qué condiciones se añadieron. Al final, juntamos todo con implode y un AND en medio.

**Conversión a entero (int) antes de ejecutar el filtro booleano**

Para el campo "activo", convertimos lo que recibimos a entero. Si viene "1", pasa a 1. Si viene "true", pasa a 1. Si viene algo raro, pasa a 0. Así nos aseguramos de que siempre es un número, sea lo que sea que mande el usuario.

**Uso de arrays asociativos para mapear filtros → parámetros**

En el array de filtros, cada clave tiene un nombre descriptivo: 'nombre', 'ciudad', etc. Eso hace que cuando leamos el código, sepamos inmediatamente de qué trata cada cosa. El mapeo entre los datos de entrada y los parámetros SQL es automático y claro.

---

## 4. Posibles Mejoras

**Mejora 1: Validar rangos de fechas**

Ahora mismo, si alguien manda una fecha de inicio posterior a la de fin (tipo inicio en 2025 y fin en 2020), la función no dice nada y devuelve resultados vacíos. Sería mejor comprobar que la fecha de inicio sea menor o igual a la de fin, y si no, lanzar un error o avisar al usuario.

**Mejora 2: Añadir paginación**

Actualmente devolvemos todos los clientes que cumplen los filtros. Si la empresa tiene 50.000 clientes, devolver todo de golpe se come toda la memoria del servidor y el cliente tarda una eternidad en cargar. Sería mucho mejor poder decir: "Dame 20 resultados, página 1", "Dame 20 resultados, página 2", etc.

**Mejora 3: Permitir orden dinámico**

Ahora siempre ordenamos por facturación de mayor a menor. Pero a veces el vendedor querrá ordenar por nombre, por fecha de registro, por teléfono, o por lo que sea. Sería mejor pasar un parámetro que diga por qué campo ordenar y en qué dirección, siempre validando que ese campo existe en la tabla para evitar que alguien intente inyectar código SQL en el ORDER BY.
