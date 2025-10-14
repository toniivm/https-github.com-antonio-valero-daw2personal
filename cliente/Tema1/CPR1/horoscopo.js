  const signos = ["Mono","Gallo","Perro","Cerdo","Rata","Buey","Tigre","Conejo","Dragón","Serpiente","Caballo","Cabra"];

    document.getElementById('calcular').onclick = () => {
        const anio = +document.getElementById('anio').value;
        const resultado = document.getElementById('resultado');
        const actual = new Date().getFullYear();
        if (anio < 1900 || anio > actual) {
            resultado.textContent = "Por favor, introduce un año válido.";
            return;
        }
        resultado.textContent = `Tienes ${actual-anio} años y tu horóscopo chino es: ${signos[(anio-1900)%12]}.`;
    };