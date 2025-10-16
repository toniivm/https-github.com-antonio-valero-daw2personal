  document.addEventListener('DOMContentLoaded', () => {
    const signos = ["Rata","Buey","Tigre","Conejo","Dragón","Serpiente","Caballo","Cabra","Mono","Gallo","Perro","Cerdo"];
    const a = document.getElementById('anio'), m = document.getElementById('mes'), d = document.getElementById('dia');
    const btn = document.getElementById('calcular'), res = document.getElementById('resultado');
    const hoy = new Date();
    m.value = hoy.getMonth() + 1; d.value = hoy.getDate(); a.placeholder = hoy.getFullYear();

    btn.addEventListener('click', e => {
      e.preventDefault();
      const an = parseInt(a.value, 10), mes = parseInt(m.value, 10), dia = parseInt(d.value, 10);
      if (!an || an < 1900 || an > hoy.getFullYear()) return void (res.textContent = 'Año inválido');
      const diasMes = new Date(an, mes, 0).getDate();
      if (!mes || mes < 1 || mes > 12 || !dia || dia < 1 || dia > diasMes) return void (res.textContent = 'Fecha inválida');
      let edad = hoy.getFullYear() - an;
      if (new Date(hoy.getFullYear(), mes - 1, dia) > hoy) edad--;
      res.textContent = `Tienes ${edad} años y tu horóscopo chino es: ${signos[((an - 1900) % 12 + 12) % 12]}`;
    });
  });
