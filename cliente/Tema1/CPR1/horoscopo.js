  // Array con los signos del horóscopo chino en orden
  const signosChinos = [
    "Mono", "Gallo", "Perro", "Cerdo", "Rata", "Buey",
    "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra"
  ];

  // Al hacer clic en el botón "calcular"
  document.getElementById('calcular').onclick = () => {
    // Obtener el año introducido por el usuario
    const anioNacimiento = +document.getElementById('anio').value;
    const elementoResultado = document.getElementById('resultado');
    const anioActual = new Date().getFullYear();

    // Comprobar si el año es válido
    if (anioNacimiento < 1900 || anioNacimiento > anioActual) {
      elementoResultado.textContent = "Por favor, introduce un año válido.";
      return;
    }

    // Calcular la edad y el signo del horóscopo chino
    const edad = anioActual - anioNacimiento;
    const indiceSigno = (anioNacimiento - 1900) % 12;
    const signoChino = signosChinos[indiceSigno];

    // Mostrar el resultado
    elementoResultado.textContent =
      `Tienes ${edad} años y tu horóscopo chino es: ${signoChino}.`;
  };