const mesesDias = {
    "Enero": 31, "Febrero": 28, "Marzo": 31, "Abril": 30, "Mayo": 31, "Junio": 30,
    "Julio": 31, "Agosto": 31, "Septiembre": 30, "Octubre": 31, "Noviembre": 30, "Diciembre": 31
};

let agenda = [];
let fechaHoraActual = null; // Variable para almacenar la fecha/hora actual
const form = document.getElementById("agendaForm");
const tableBody = document.querySelector("#agendaTable tbody");

// Función para obtener fecha y hora actual desde API
async function obtenerFechaHoraActual() {
    try {
        // API pública para obtener fecha/hora mundial
        const response = await fetch('http://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');

        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();

        // Procesar los datos obtenidos
        const fechaCompleta = new Date(data.datetime);

        fechaHoraActual = {
            fecha: fechaCompleta.toLocaleDateString('es-AR'),
            hora: fechaCompleta.toLocaleTimeString('es-AR'),
            dia: fechaCompleta.getDate(),
            mes: fechaCompleta.toLocaleDateString('es-AR', { month: 'long' }),
            año: fechaCompleta.getFullYear(),
            diaSemana: fechaCompleta.toLocaleDateString('es-AR', { weekday: 'long' }),
            timestamp: data.unixtime,
            timezone: data.timezone,
            utc_offset: data.utc_offset
        };

        // Capitalizar primera letra del mes
        fechaHoraActual.mes = fechaHoraActual.mes.charAt(0).toUpperCase() + fechaHoraActual.mes.slice(1);
        fechaHoraActual.diaSemana = fechaHoraActual.diaSemana.charAt(0).toUpperCase() + fechaHoraActual.diaSemana.slice(1);

        console.log('📅 Fecha y hora actual obtenida:', fechaHoraActual);

        // Mostrar información en la interfaz
        mostrarFechaHoraActual();

        // Auto-completar formulario con fecha actual
        autoCompletarFechaActual();

        return fechaHoraActual;

    } catch (error) {
        console.error('❌ Error al obtener fecha/hora actual:', error);

        // Fallback: usar fecha local del navegador
        console.log('🔄 Usando fecha local como respaldo...');
        usarFechaLocal();

        // Mostrar notificación de error
        mostrarNotificacion('No se pudo conectar al servidor de tiempo. Usando fecha local.', 'warning');
    }
}

// Función de respaldo usando fecha local
function usarFechaLocal() {
    const ahora = new Date();

    fechaHoraActual = {
        fecha: ahora.toLocaleDateString('es-AR'),
        hora: ahora.toLocaleTimeString('es-AR'),
        dia: ahora.getDate(),
        mes: ahora.toLocaleDateString('es-AR', { month: 'long' }),
        año: ahora.getFullYear(),
        diaSemana: ahora.toLocaleDateString('es-AR', { weekday: 'long' }),
        timestamp: Math.floor(ahora.getTime() / 1000),
        timezone: 'Local',
        utc_offset: 'Local'
    };

    // Capitalizar primera letra
    fechaHoraActual.mes = fechaHoraActual.mes.charAt(0).toUpperCase() + fechaHoraActual.mes.slice(1);
    fechaHoraActual.diaSemana = fechaHoraActual.diaSemana.charAt(0).toUpperCase() + fechaHoraActual.diaSemana.slice(1);

    mostrarFechaHoraActual();
    autoCompletarFechaActual();
}

// Función para mostrar la fecha/hora actual en la interfaz
function mostrarFechaHoraActual() {
    // Crear o actualizar el elemento de información de fecha/hora
    let infoFechaHora = document.getElementById('infoFechaHora');

    if (!infoFechaHora) {
        infoFechaHora = document.createElement('div');
        infoFechaHora.id = 'infoFechaHora';
        infoFechaHora.style.cssText = `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
        `;

        // Insertar antes del formulario (asumiendo que existe un contenedor)
        const contenedor = form.parentNode;
        contenedor.insertBefore(infoFechaHora, form);
    }

    if (fechaHoraActual) {
        infoFechaHora.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h3 style="margin: 0 0 5px 0; font-size: 1.2em;">📅 Información Actual</h3>
                    <p style="margin: 0; font-size: 0.9em; opacity: 0.9;">
                        ${fechaHoraActual.diaSemana}, ${fechaHoraActual.dia} de ${fechaHoraActual.mes} de ${fechaHoraActual.año}
                    </p>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 5px;">
                        ⏰ ${fechaHoraActual.hora}
                    </div>
                    <div style="font-size: 0.8em; opacity: 0.8;">
                        ${fechaHoraActual.timezone}
                    </div>
                </div>
            </div>
            <div style="margin-top: 10px;">
                <button onclick="actualizarFechaHora()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9em;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    🔄 Actualizar Fecha/Hora
                </button>
                <button onclick="usarFechaActualEnFormulario()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 8px 15px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9em;
                    margin-left: 10px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" 
                   onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    📝 Usar Fecha Actual
                </button>
            </div>
        `;
    }
}

// Función para auto-completar el formulario con la fecha actual
function autoCompletarFechaActual() {
    if (fechaHoraActual) {
        // Verificar si los campos existen antes de asignar valores
        const campoDia = document.getElementById("dia");
        const campoMes = document.getElementById("mes");

        if (campoDia && campoMes) {
            // Solo auto-completar si los campos están vacíos
            if (!campoDia.value) {
                campoDia.value = fechaHoraActual.dia;
            }
            if (!campoMes.value) {
                campoMes.value = fechaHoraActual.mes;
            }
        }
    }
}

// Función para usar fecha actual en el formulario (llamada por botón)
function usarFechaActualEnFormulario() {
    if (fechaHoraActual) {
        const campoDia = document.getElementById("dia");
        const campoMes = document.getElementById("mes");

        if (campoDia && campoMes) {
            campoDia.value = fechaHoraActual.dia;
            campoMes.value = fechaHoraActual.mes;

            // Enfocar el campo de actividad
            const campoActividad = document.getElementById("actividad");
            if (campoActividad) {
                campoActividad.focus();
            }

            mostrarNotificacion('Fecha actual aplicada al formulario', 'success');
        }
    }
}

// Función para actualizar fecha/hora manualmente
async function actualizarFechaHora() {
    mostrarNotificacion('Actualizando fecha y hora...', 'info');
    await obtenerFechaHoraActual();
    mostrarNotificacion('Fecha y hora actualizadas', 'success');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;

    // Colores según el tipo
    const colores = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };

    notificacion.style.background = colores[tipo] || colores.info;
    notificacion.textContent = mensaje;

    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;

    if (!document.head.querySelector('style[data-notifications]')) {
        style.setAttribute('data-notifications', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(notificacion);

    // Remover después de 4 segundos
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Función para obtener actividades del día actual
function obtenerActividadesHoy() {
    if (!fechaHoraActual) {
        mostrarNotificacion('Primero se debe cargar la fecha actual', 'warning');
        return [];
    }

    const actividadesHoy = agenda.filter(item =>
        item.dia === fechaHoraActual.dia &&
        item.mes === fechaHoraActual.mes
    );

    if (actividadesHoy.length > 0) {
        console.log(`📋 Actividades para hoy (${fechaHoraActual.dia} de ${fechaHoraActual.mes}):`, actividadesHoy);
        mostrarActividadesHoy(actividadesHoy);
    } else {
        console.log(`📋 No hay actividades programadas para hoy (${fechaHoraActual.dia} de ${fechaHoraActual.mes})`);
    }

    return actividadesHoy;
}

// Función para mostrar actividades de hoy en una ventana modal o alert
function mostrarActividadesHoy(actividadesHoy) {
    let mensaje = `📅 Actividades para hoy ${fechaHoraActual.dia} de ${fechaHoraActual.mes}:\n\n`;

    actividadesHoy.forEach((actividad, index) => {
        mensaje += `${index + 1}. ${actividad.actividad}\n`;
    });

    alert(mensaje);
}

// Función para guardar en localStorage
function guardarEnLocalStorage() {
    localStorage.setItem('agendaAnual', JSON.stringify(agenda));

    // También guardar la última fecha/hora obtenida
    if (fechaHoraActual) {
        localStorage.setItem('ultimaFechaHora', JSON.stringify(fechaHoraActual));
    }
}

// Función para cargar desde localStorage
function cargarDesdeLocalStorage() {
    const agendaGuardada = localStorage.getItem('agendaAnual');
    if (agendaGuardada) {
        agenda = JSON.parse(agendaGuardada);
    }

    // Cargar última fecha/hora si existe
    const ultimaFechaHora = localStorage.getItem('ultimaFechaHora');
    if (ultimaFechaHora) {
        fechaHoraActual = JSON.parse(ultimaFechaHora);
        mostrarFechaHoraActual();
        console.log('📅 Última fecha/hora cargada desde localStorage');
    }
}

// Renderizar tabla
function renderAgenda() {
    tableBody.innerHTML = "";

    if (agenda.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    📅 No hay actividades programadas
                    <br><small>¡Agrega tu primera actividad!</small>
                </td>
            </tr>
        `;
        return;
    }

    // Resaltar actividades de hoy si conocemos la fecha actual
    agenda.forEach((item, index) => {
        const row = document.createElement("tr");

        // Verificar si es la actividad de hoy
        const esHoy = fechaHoraActual &&
            item.dia === fechaHoraActual.dia &&
            item.mes === fechaHoraActual.mes;

        if (esHoy) {
            row.style.backgroundColor = '#e3f2fd';
            row.style.border = '2px solid #2196F3';
        }

        row.innerHTML = `
            <td>${item.dia} ${esHoy ? '🔹' : ''}</td>
            <td>${item.mes}</td>
            <td>${item.actividad} ${esHoy ? '<span style="color: #2196F3; font-weight: bold;">(HOY)</span>' : ''}</td>
            <td>
                <button class="editar" onclick="editarActividad(${index})">✏️ Editar</button>
                <button class="eliminar" onclick="eliminarActividad(${index})">🗑️ Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Agregar actividad (modificado para incluir timestamp)
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
        existente.fechaModificacion = fechaHoraActual ? fechaHoraActual.timestamp : Date.now();
        mostrarNotificacion(`Actividad actualizada para el ${dia} de ${mes}`, 'success');
    } else {
        const nuevaActividad = {
            dia,
            mes,
            actividad,
            fechaCreacion: fechaHoraActual ? fechaHoraActual.timestamp : Date.now()
        };
        agenda.push(nuevaActividad);
        mostrarNotificacion(`Nueva actividad agregada para el ${dia} de ${mes}`, 'success');
    }

    guardarEnLocalStorage();
    renderAgenda();
    form.reset();

    // Auto-completar fecha actual nuevamente
    autoCompletarFechaActual();
});

// Editar actividad
function editarActividad(index) {
    const item = agenda[index];
    const nuevaActividad = prompt(`Nueva actividad para el ${item.dia} de ${item.mes}:`, item.actividad);
    if (nuevaActividad !== null) {
        agenda[index].actividad = nuevaActividad.trim() || "Sin actividad";
        agenda[index].fechaModificacion = fechaHoraActual ? fechaHoraActual.timestamp : Date.now();
        guardarEnLocalStorage();
        renderAgenda();
        mostrarNotificacion('Actividad editada correctamente', 'success');
    }
}

// Eliminar actividad
function eliminarActividad(index) {
    if (confirm("¿Seguro que quieres eliminar esta actividad?")) {
        const actividad = agenda[index];
        agenda.splice(index, 1);
        guardarEnLocalStorage();
        renderAgenda();
        mostrarNotificacion(`Actividad del ${actividad.dia} de ${actividad.mes} eliminada`, 'success');
    }
}

// Función para limpiar todas las actividades
function limpiarTodasLasActividades() {
    if (confirm("¿Seguro que quieres eliminar TODAS las actividades? Esta acción no se puede deshacer.")) {
        agenda = [];
        guardarEnLocalStorage();
        renderAgenda();
        mostrarNotificacion('Todas las actividades han sido eliminadas', 'warning');
    }
}

// Hacer accesibles las funciones desde los botones
window.editarActividad = editarActividad;
window.eliminarActividad = eliminarActividad;
window.limpiarTodasLasActividades = limpiarTodasLasActividades;
window.actualizarFechaHora = actualizarFechaHora;
window.usarFechaActualEnFormulario = usarFechaActualEnFormulario;
window.obtenerActividadesHoy = obtenerActividadesHoy;

// Cargar datos e inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando agenda anual...');

    // Cargar datos guardados
    cargarDesdeLocalStorage();

    // Obtener fecha/hora actual desde API
    await obtenerFechaHoraActual();

    // Renderizar tabla
    renderAgenda();

    // Mostrar actividades de hoy si existen
    setTimeout(() => {
        const actividadesHoy = obtenerActividadesHoy();
        if (actividadesHoy.length === 0) {
            console.log('✨ ¡Perfecto día para agregar nuevas actividades!');
        }
    }, 1000);

    console.log('✅ Agenda anual lista para usar');
});

// Actualizar fecha/hora cada 60 segundos
setInterval(async () => {
    console.log('🔄 Actualizando fecha/hora automáticamente...');
    await obtenerFechaHoraActual();
    renderAgenda(); // Re-renderizar para actualizar actividades de "hoy"
}, 60000); // 60 segundos