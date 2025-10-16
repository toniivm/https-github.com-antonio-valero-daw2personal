  const signosChinos = [
    "Mono", "Gallo", "Perro", "Cerdo", "Rata", "Buey",
    "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra"
  ];

  document.addEventListener('DOMContentLoaded', () => {
    // Obtener elementos del DOM
    const anio = document.getElementById('anio');
    const mes = document.getElementById('mes');
    const dia = document.getElementById('dia');
    const calcular = document.getElementById('calcular');
    const resultado = document.getElementById('resultado');

    // Establecer fecha actual
    const hoy = new Date();
    mes.value = hoy.getMonth() + 1;
    dia.value = hoy.getDate();
    anio.placeholder = hoy.getFullYear();

    // Calcular horóscopo al hacer clic
    calcular.addEventListener('click', (e) => {
      e.preventDefault();
      
      const añoIngresado = parseInt(anio.value);
      
      // Validación básica
      if (!añoIngresado || añoIngresado < 1900 || añoIngresado > hoy.getFullYear()) {
        resultado.textContent = 'Introduce un año válido';
        return;
      }

      // Calcular edad
      let edad = hoy.getFullYear() - añoIngresado;
      
      // Calcular signo
      const signo = signosChinos[((añoIngresado - 1900) % 12 + 12) % 12];
      
      resultado.textContent = `Tienes ${edad} años y tu horóscopo chino es: ${signo}`;
    });
  });
