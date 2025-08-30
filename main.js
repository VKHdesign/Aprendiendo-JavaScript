const mesesDias = {
    "Enero": 31, "Febrero": 28, "Marzo": 31, "Abril": 30, "Mayo": 31, "Junio": 30,
    "Julio": 31, "Agosto": 31, "Septiembre": 30, "Octubre": 31, "Noviembre": 30, "Diciembre": 31
};

let agenda = [];
const form = document.getElementById("agendaForm");
const tableBody = document.querySelector("#agendaTable tbody");

// Función para guardar en localStorage
function guardarEnLocalStorage() {
    localStorage.setItem('agendaAnual', JSON.stringify(agenda));
}

// Función para cargar desde localStorage
function cargarDesdeLocalStorage() {
    const agendaGuardada = localStorage.getItem('agendaAnual');
    if (agendaGuardada) {
        agenda = JSON.parse(agendaGuardada);
    }
}

// Renderizar tabla
function renderAgenda() {
    tableBody.innerHTML = "";
    agenda.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${item.dia}</td>
        <td>${item.mes}</td>
        <td>${item.actividad}</td>
        <td>
            <button class="editar" onclick="editarActividad(${index})">✏️ Editar</button>
            <button class="eliminar" onclick="eliminarActividad(${index})">🗑️ Eliminar</button>
        </td>
        `;
        tableBody.appendChild(row);
    });
}

// Agregar actividad
form.addEventListener("submit", e => {
    e.preventDefault();
    const mes = document.getElementById("mes").value;
    const dia = parseInt(document.getElementById("dia").value, 10);
    let actividad = document.getElementById("actividad").value.trim();

    // Validación de días
    if (dia < 1 || dia > mesesDias[mes]) {
        alert(`⌚ ${mes} tiene solo ${mesesDias[mes]} días.`);
        return;
    }
    if (!actividad) actividad = "Sin actividad";

    // Si ya existe, actualizar
    const existente = agenda.find(e => e.mes === mes && e.dia === dia);
    if (existente) {
        existente.actividad = actividad;
    } else {
        agenda.push({ dia, mes, actividad });
    }

    guardarEnLocalStorage(); // Guardar después de agregar/actualizar
    renderAgenda();
    form.reset();
});

// Editar actividad
function editarActividad(index) {
    const item = agenda[index];
    const nuevaActividad = prompt(`Nueva actividad para el ${item.dia} de ${item.mes}:`, item.actividad);
    if (nuevaActividad !== null) {
        agenda[index].actividad = nuevaActividad.trim() || "Sin actividad";
        guardarEnLocalStorage(); // Guardar después de editar
        renderAgenda();
    }
}

// Eliminar actividad
function eliminarActividad(index) {
    if (confirm("¿Seguro que quieres eliminar esta actividad?")) {
        agenda.splice(index, 1);
        guardarEnLocalStorage(); // Guardar después de eliminar
        renderAgenda();
    }
}

// Función para limpiar todas las actividades (opcional)
function limpiarTodasLasActividades() {
    if (confirm("¿Seguro que quieres eliminar TODAS las actividades?")) {
        agenda = [];
        guardarEnLocalStorage();
        renderAgenda();
    }
}

// Hacer accesibles las funciones desde los botones
window.editarActividad = editarActividad;
window.eliminarActividad = eliminarActividad;
window.limpiarTodasLasActividades = limpiarTodasLasActividades;

// Cargar datos al inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarDesdeLocalStorage();
    renderAgenda();
});