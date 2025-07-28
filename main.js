// Crear los días de la semana
const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Crear array para guardar actividades por día
let agenda = [];

// Recorrer los días y pedir al usuario una actividad por día (con "Sin actividad" por defecto)
for (let i = 0; i < diasSemana.length; i++) {
    let actividad = prompt(`¿Qué actividad tienes para el día ${diasSemana[i]}?`);
    
    // Si el usuario no escribe nada o cancela, poner "Sin actividad"
    if (!actividad || actividad.trim() === "") {
        actividad = "Sin actividad";
    } else {
        actividad = actividad.trim();
    }

    agenda.push({ dia: diasSemana[i], actividad: actividad });
}

// Mostrar la agenda completa en consola
console.log("📅 Tu agenda semanal:");
agenda.forEach(item => {
    console.log(`${item.dia}: ${item.actividad}`);
});
