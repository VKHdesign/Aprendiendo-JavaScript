const mesesDias = {
    "Enero": 31, "Febrero": 28, "Marzo": 31, "Abril": 30, "Mayo": 31, "Junio": 30,
    "Julio": 31, "Agosto": 31, "Septiembre": 30, "Octubre": 31, "Noviembre": 30, "Diciembre": 31
};

let agenda = [];
let fechaHoraActual = null;
const form = document.getElementById("agendaForm");
const tableBody = document.querySelector("#agendaTable tbody");

// Función para obtener fecha y hora actual desde API
async function obtenerFechaHoraActual() {
    try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/America/Argentina/Buenos_Aires');

        if (!response.ok) {
            throw new Error('Error en la respuesta de la API');
        }

        const data = await response.json();
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

        fechaHoraActual.mes = fechaHoraActual.mes.charAt(0).toUpperCase() + fechaHoraActual.mes.slice(1);
        fechaHoraActual.diaSemana = fechaHoraActual.diaSemana.charAt(0).toUpperCase() + fechaHoraActual.diaSemana.slice(1);

        console.log('📅 Fecha y hora actual obtenida:', fechaHoraActual);

        mostrarFechaHoraActual();
        autoCompletarFechaActual();

        return fechaHoraActual;

    } catch (error) {
        console.error('❌ Error al obtener fecha/hora actual:', error);
        console.log('🔄 Usando fecha local como respaldo...');
        usarFechaLocal();

        // Usar Toastify para mostrar error
        mostrarNotificacion('⚠️ No se pudo conectar al servidor de tiempo. Usando fecha local.', 'warning');
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

    fechaHoraActual.mes = fechaHoraActual.mes.charAt(0).toUpperCase() + fechaHoraActual.mes.slice(1);
    fechaHoraActual.diaSemana = fechaHoraActual.diaSemana.charAt(0).toUpperCase() + fechaHoraActual.diaSemana.slice(1);

    mostrarFechaHoraActual();
    autoCompletarFechaActual();
}

// ✨ FUNCIÓN MEJORADA CON TOASTIFY
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 4000) {
    // Verificar si Toastify está disponible
    if (typeof Toastify === 'undefined') {
        console.warn('Toastify no está cargado. Usando fallback.');
        mostrarNotificacionFallback(mensaje, tipo);
        return;
    }

    // Configuración de colores y estilos por tipo
    const configuraciones = {
        success: {
            backgroundColor: "linear-gradient(135deg, #4CAF50, #45a049)",
            text: `✅ ${mensaje}`,
            className: "toast-success"
        },
        error: {
            backgroundColor: "linear-gradient(135deg, #f44336, #d32f2f)",
            text: `❌ ${mensaje}`,
            className: "toast-error"
        },
        warning: {
            backgroundColor: "linear-gradient(135deg, #ff9800, #f57c00)",
            text: `⚠️ ${mensaje}`,
            className: "toast-warning"
        },
        info: {
            backgroundColor: "linear-gradient(135deg, #2196F3, #1976d2)",
            text: `ℹ️ ${mensaje}`,
            className: "toast-info"
        },
        loading: {
            backgroundColor: "linear-gradient(135deg, #9c27b0, #7b1fa2)",
            text: `⏳ ${mensaje}`,
            className: "toast-loading"
        }
    };

    const config = configuraciones[tipo] || configuraciones.info;

    // Crear la notificación con Toastify
    Toastify({
        text: config.text,
        duration: tipo === 'loading' ? -1 : duracion,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            background: config.backgroundColor,
            borderRadius: "10px",
            fontWeight: "600",
            fontSize: "14px",
            padding: "12px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            border: "none"
        },
        className: config.className,
        onClick: function () {
            console.log('Notificación clickeada:', mensaje);
        }
    }).showToast();

    console.log(`📢 [${tipo.toUpperCase()}] ${mensaje}`);
}

// Función fallback para cuando Toastify no está disponible
function mostrarNotificacionFallback(mensaje, tipo = 'info') {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-fallback';

    const colores = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };

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
        background: ${colores[tipo] || colores.info};
        animation: slideIn 0.3s ease-out;
    `;

    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 4000);
}

// Funciones auxiliares para tipos específicos de notificaciones
function notificarExito(mensaje, duracion = 3000) {
    mostrarNotificacion(mensaje, 'success', duracion);
}

function notificarError(mensaje, duracion = 5000) {
    mostrarNotificacion(mensaje, 'error', duracion);
}

function notificarAdvertencia(mensaje, duracion = 4000) {
    mostrarNotificacion(mensaje, 'warning', duracion);
}

function notificarInfo(mensaje, duracion = 3000) {
    mostrarNotificacion(mensaje, 'info', duracion);
}

function notificarCargando(mensaje) {
    return mostrarNotificacion(mensaje, 'loading');
}

// Función para mostrar la fecha/hora actual en la interfaz
function mostrarFechaHoraActual() {
    let infoFechaHora = document.getElementById('infoFechaHora');

    if (!infoFechaHora) {
        infoFechaHora = document.createElement('div');
        infoFechaHora.id = 'infoFechaHora';

        const contenedor = form.parentNode;
        contenedor.insertBefore(infoFechaHora, form);
    }

    if (fechaHoraActual) {
        infoFechaHora.innerHTML = `
            <div class="info-fecha-container">
                <div class="info-fecha-left">
                    <h3>📅 Información Actual</h3>
                    <p>
                        ${fechaHoraActual.diaSemana}, ${fechaHoraActual.dia} de ${fechaHoraActual.mes} de ${fechaHoraActual.año}
                    </p>
                </div>
                <div class="info-fecha-right">
                    <div class="hora-display">
                        ⏰ ${fechaHoraActual.hora}
                    </div>
                    <div class="timezone-display">
                        ${fechaHoraActual.timezone}
                    </div>
                </div>
            </div>
            <div class="botones-fecha-container">
                <button onclick="actualizarFechaHora()" class="btn-fecha">
                    🔄 Actualizar Fecha/Hora
                </button>
                <button onclick="usarFechaActualEnFormulario()" class="btn-fecha">
                    📝 Usar Fecha Actual
                </button>
            </div>
        `;
    }
}

// Función para auto-completar el formulario con la fecha actual
function autoCompletarFechaActual() {
    if (fechaHoraActual) {
        const campoDia = document.getElementById("dia");
        const campoMes = document.getElementById("mes");

        if (campoDia && campoMes) {
            if (!campoDia.value) {
                campoDia.value = fechaHoraActual.dia;
            }
            if (!campoMes.value) {
                campoMes.value = fechaHoraActual.mes;
            }
        }
    }
}

// Función para usar fecha actual en el formulario
function usarFechaActualEnFormulario() {
    if (fechaHoraActual) {
        const campoDia = document.getElementById("dia");
        const campoMes = document.getElementById("mes");

        if (campoDia && campoMes) {
            campoDia.value = fechaHoraActual.dia;
            campoMes.value = fechaHoraActual.mes;

            const campoActividad = document.getElementById("actividad");
            if (campoActividad) {
                campoActividad.focus();
            }

            notificarExito('Fecha actual aplicada al formulario');
        }
    }
}

// Función para actualizar fecha/hora manualmente
async function actualizarFechaHora() {
    notificarInfo('Actualizando fecha y hora...');
    await obtenerFechaHoraActual();
    notificarExito('Fecha y hora actualizadas correctamente');
}

// Función para obtener actividades del día actual
function obtenerActividadesHoy() {
    if (!fechaHoraActual) {
        notificarAdvertencia('Primero se debe cargar la fecha actual');
        return [];
    }

    const actividadesHoy = agenda.filter(item =>
        item.dia === fechaHoraActual.dia &&
        item.mes === fechaHoraActual.mes
    );

    if (actividadesHoy.length > 0) {
        console.log(`📋 Actividades para hoy (${fechaHoraActual.dia} de ${fechaHoraActual.mes}):`, actividadesHoy);
        mostrarActividadesHoy(actividadesHoy);
        notificarInfo(`Tienes ${actividadesHoy.length} actividad${actividadesHoy.length > 1 ? 'es' : ''} para hoy`);
    } else {
        console.log(`📋 No hay actividades programadas para hoy (${fechaHoraActual.dia} de ${fechaHoraActual.mes})`);
        notificarInfo('No tienes actividades programadas para hoy');
    }

    return actividadesHoy;
}

// Función para mostrar actividades de hoy con SweetAlert2
async function mostrarActividadesHoy(actividadesHoy) {
    // Verificar si SweetAlert2 está disponible
    if (typeof Swal === 'undefined') {
        // Fallback a alert básico
        let mensaje = `📅 Actividades para hoy ${fechaHoraActual.dia} de ${fechaHoraActual.mes}:\n\n`;
        actividadesHoy.forEach((actividad, index) => {
            mensaje += `${index + 1}. ${actividad.actividad}\n`;
        });
        alert(mensaje);
        return;
    }

    // Crear HTML para mostrar las actividades
    let actividadesHTML = '';
    actividadesHoy.forEach((actividad, index) => {
        actividadesHTML += `
            <div style="text-align: left; margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 5px;">
                <strong>${index + 1}.</strong> ${actividad.actividad}
            </div>
        `;
    });

    await Swal.fire({
        title: `📅 Actividades de Hoy`,
        html: `
            <div style="text-align: center; margin-bottom: 15px;">
                <p><strong>${fechaHoraActual.diaSemana}, ${fechaHoraActual.dia} de ${fechaHoraActual.mes}</strong></p>
            </div>
            <div>${actividadesHTML}</div>
        `,
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3b82f6',
        width: '500px'
    });
}

// Función para guardar en localStorage
function guardarEnLocalStorage() {
    localStorage.setItem('agendaAnual', JSON.stringify(agenda));

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
                <td colspan="4" class="sin-actividades-mensaje">
                    📅 No hay actividades programadas
                    <small>¡Agrega tu primera actividad!</small>
                </td>
            </tr>
        `;
        return;
    }

    agenda.forEach((item, index) => {
        const row = document.createElement("tr");

        const esHoy = fechaHoraActual &&
            item.dia === fechaHoraActual.dia &&
            item.mes === fechaHoraActual.mes;

        if (esHoy) {
            row.className = 'actividad-hoy';
        }

        row.innerHTML = `
            <td>${item.dia}${esHoy ? '<span class="indicador-hoy-icono">🔹</span>' : ''}</td>
            <td>${item.mes}</td>
            <td>${item.actividad}${esHoy ? '<span class="indicador-hoy-texto">(HOY)</span>' : ''}</td>
            <td>
                <button class="editar" onclick="editarActividad(${index})">✏️ Editar</button>
                <button class="eliminar" onclick="eliminarActividad(${index})">🗑️ Eliminar</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Agregar actividad con notificaciones mejoradas
form.addEventListener("submit", e => {
    e.preventDefault();
    const mes = document.getElementById("mes").value;
    const dia = parseInt(document.getElementById("dia").value, 10);
    let actividad = document.getElementById("actividad").value.trim();

    // Validación de días
    if (dia < 1 || dia > mesesDias[mes]) {
        notificarError(`${mes} tiene solo ${mesesDias[mes]} días. Por favor, ingresa un día válido.`);
        return;
    }
    if (!actividad) actividad = "Sin actividad";

    // Si ya existe, actualizar
    const existente = agenda.find(e => e.mes === mes && e.dia === dia);
    if (existente) {
        existente.actividad = actividad;
        existente.fechaModificacion = fechaHoraActual ? fechaHoraActual.timestamp : Date.now();
        notificarExito(`Actividad actualizada para el ${dia} de ${mes}`);
    } else {
        const nuevaActividad = {
            dia,
            mes,
            actividad,
            fechaCreacion: fechaHoraActual ? fechaHoraActual.timestamp : Date.now()
        };
        agenda.push(nuevaActividad);
        notificarExito(`Nueva actividad agregada para el ${dia} de ${mes}`);
    }

    guardarEnLocalStorage();
    renderAgenda();
    form.reset();
    autoCompletarFechaActual();
});

// 🔥 FUNCIÓN EDITAR ACTIVIDAD CON SWEETALERT2
async function editarActividad(index) {
    const item = agenda[index];

    // Verificar si SweetAlert2 está disponible
    if (typeof Swal === 'undefined') {
        // Fallback a prompt básico
        const nuevaActividad = prompt(`Nueva actividad para el ${item.dia} de ${item.mes}:`, item.actividad);
        if (nuevaActividad !== null) {
            agenda[index].actividad = nuevaActividad.trim() || "Sin actividad";
            agenda[index].fechaModificacion = fechaHoraActual ? fechaHoraActual.timestamp : Date.now();
            guardarEnLocalStorage();
            renderAgenda();
            notificarExito('Actividad editada correctamente');
        }
        return;
    }

    // Usar SweetAlert2 para editar
    const { value: nuevaActividad } = await Swal.fire({
        title: '✏️ Editar Actividad',
        html: `
            <div style="text-align: left; margin-bottom: 15px;">
                <p><strong>Fecha:</strong> ${item.dia} de ${item.mes}</p>
                <p><strong>Actividad actual:</strong></p>
            </div>
        `,
        input: 'textarea',
        inputValue: item.actividad,
        inputPlaceholder: 'Escribe la nueva actividad...',
        inputAttributes: {
            'aria-label': 'Nueva actividad',
            style: 'min-height: 100px; font-size: 14px;'
        },
        showCancelButton: true,
        confirmButtonText: 'Guardar Cambios',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        inputValidator: (value) => {
            if (!value || !value.trim()) {
                return 'La actividad no puede estar vacía';
            }
            if (value.trim().length < 3) {
                return 'La actividad debe tener al menos 3 caracteres';
            }
            return null;
        }
    });

    if (nuevaActividad) {
        agenda[index].actividad = nuevaActividad.trim();
        agenda[index].fechaModificacion = fechaHoraActual ? fechaHoraActual.timestamp : Date.now();
        guardarEnLocalStorage();
        renderAgenda();

        // Notificación de éxito con SweetAlert2
        await Swal.fire({
            title: '✅ ¡Actividad Actualizada!',
            text: 'Los cambios se guardaron correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

        notificarExito('Actividad editada correctamente');
    }
}

// 🔥 FUNCIÓN ELIMINAR ACTIVIDAD CON SWEETALERT2
async function eliminarActividad(index) {
    const actividad = agenda[index];

    // Verificar si SweetAlert2 está disponible
    if (typeof Swal === 'undefined') {
        // Fallback a confirm básico
        if (confirm("¿Seguro que quieres eliminar esta actividad?")) {
            agenda.splice(index, 1);
            guardarEnLocalStorage();
            renderAgenda();
            notificarExito(`Actividad del ${actividad.dia} de ${actividad.mes} eliminada`);
        }
        return;
    }

    // Usar SweetAlert2 para confirmar eliminación
    const result = await Swal.fire({
        title: '🗑️ ¿Eliminar Actividad?',
        html: `
            <div style="text-align: left; margin: 20px 0;">
                <p><strong>Fecha:</strong> ${actividad.dia} de ${actividad.mes}</p>
                <p><strong>Actividad:</strong></p>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin-top: 5px; border-left: 4px solid #dc3545;">
                    ${actividad.actividad}
                </div>
            </div>
            <p style="color: #dc3545; font-weight: 500; margin-top: 15px;">
                ⚠️ Esta acción no se puede deshacer
            </p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true
    });

    if (result.isConfirmed) {
        // Eliminar la actividad
        agenda.splice(index, 1);
        guardarEnLocalStorage();
        renderAgenda();

        // Mostrar confirmación de eliminación
        await Swal.fire({
            title: '🗑️ Actividad Eliminada',
            text: `La actividad del ${actividad.dia} de ${actividad.mes} fue eliminada correctamente`,
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });

        notificarExito(`Actividad del ${actividad.dia} de ${actividad.mes} eliminada`);
    }
}

// 🔥 FUNCIÓN LIMPIAR TODAS LAS ACTIVIDADES CON SWEETALERT2
async function limpiarTodasLasActividades() {
    // Verificar si SweetAlert2 está disponible
    if (typeof Swal === 'undefined') {
        // Fallback a confirm básico
        if (confirm("¿Seguro que quieres eliminar TODAS las actividades? Esta acción no se puede deshacer.")) {
            const cantidadEliminada = agenda.length;
            agenda = [];
            guardarEnLocalStorage();
            renderAgenda();
            notificarAdvertencia(`${cantidadEliminada} actividades han sido eliminadas`);
        }
        return;
    }

    const cantidadActividades = agenda.length;

    if (cantidadActividades === 0) {
        await Swal.fire({
            title: 'No hay actividades',
            text: 'No tienes actividades para eliminar',
            icon: 'info',
            confirmButtonColor: '#3b82f6'
        });
        return;
    }

    // Usar SweetAlert2 para confirmar eliminación masiva
    const result = await Swal.fire({
        title: '🚨 ¿Eliminar TODAS las Actividades?',
        html: `
            <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 16px; margin-bottom: 15px;">
                    Estás a punto de eliminar <strong>${cantidadActividades} actividades</strong>
                </p>
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <p style="color: #856404; font-weight: 500; margin: 0;">
                        ⚠️ Esta acción NO se puede deshacer
                    </p>
                </div>
                <p style="color: #6c757d;">
                    Se eliminará toda tu agenda permanentemente
                </p>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, Eliminar Todo',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6b7280',
        reverseButtons: true,
        focusCancel: true,
        input: 'checkbox',
        inputValue: 0,
        inputPlaceholder: 'Confirmo que quiero eliminar todas las actividades',
        inputValidator: (result) => {
            return !result && 'Debes confirmar la eliminación marcando la casilla';
        }
    });

    if (result.isConfirmed) {
        // Eliminar todas las actividades
        agenda = [];
        guardarEnLocalStorage();
        renderAgenda();

        // Mostrar confirmación de eliminación
        await Swal.fire({
            title: '🗑️ Todas las Actividades Eliminadas',
            text: `Se eliminaron ${cantidadActividades} actividades correctamente`,
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            timer: 4000
        });

        notificarAdvertencia(`${cantidadActividades} actividades han sido eliminadas`);
    }
}

// Hacer accesibles las funciones desde los botones
window.editarActividad = editarActividad;
window.eliminarActividad = eliminarActividad;
window.limpiarTodasLasActividades = limpiarTodasLasActividades;
window.actualizarFechaHora = actualizarFechaHora;
window.usarFechaActualEnFormulario = usarFechaActualEnFormulario;
window.obtenerActividadesHoy = obtenerActividadesHoy;

// También hacer accesibles las funciones de notificación
window.notificarExito = notificarExito;
window.notificarError = notificarError;
window.notificarAdvertencia = notificarAdvertencia;
window.notificarInfo = notificarInfo;
window.notificarCargando = notificarCargando;

// Cargar datos e inicializar al cargar la página
document.addEventListener('DOMContentLoaded', async function () {
    console.log('🚀 Iniciando agenda anual...');

    // Verificar si las librerías están cargadas
    if (typeof Toastify !== 'undefined') {
        console.log('✅ Toastify cargado correctamente');
        notificarInfo('🚀 Agenda anual iniciando...');
    } else {
        console.warn('⚠️ Toastify no está disponible, usando notificaciones básicas');
    }

    if (typeof Swal !== 'undefined') {
        console.log('✅ SweetAlert2 cargado correctamente');
    } else {
        console.warn('⚠️ SweetAlert2 no está disponible, usando confirmaciones básicas');
    }

    cargarDesdeLocalStorage();
    await obtenerFechaHoraActual();
    renderAgenda();

    // Mostrar actividades de hoy si existen
    setTimeout(() => {
        const actividadesHoy = agenda.filter(item =>
            fechaHoraActual &&
            item.dia === fechaHoraActual.dia &&
            item.mes === fechaHoraActual.mes
        );

        if (actividadesHoy.length === 0) {
            console.log('✨ ¡Perfecto día para agregar nuevas actividades!');
        } else {
            console.log(`📋 Tienes ${actividadesHoy.length} actividad(es) para hoy`);
        }
    }, 1000);

    notificarExito('✅ Agenda anual lista para usar');
    console.log('✅ Agenda anual lista para usar');
});

// Actualizar fecha/hora cada 60 segundos
setInterval(async () => {
    console.log('🔄 Actualizando fecha/hora automáticamente...');
    await obtenerFechaHoraActual();
    renderAgenda();
}, 60000);