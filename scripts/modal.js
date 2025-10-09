// Modal Detalle
function abrirModalDetalle(tarjeta, cardElemento) {
    estado.tarjetaActual = { tarjeta, cardElemento };
    
    // Usar jQuery para obtener y setear valores
    $('#campo-titulo').val(tarjeta.titulo || '');
    $('#campo-etiquetas').val((tarjeta.etiquetas || []).join(', '));
    $('#campo-prioridad').val(tarjeta.prioridad || 'baja');
    $('#campo-poker-planning').val(tarjeta.pokerPlanning || '');
    $('#campo-fecha').val(tarjeta.fecha ? new Date(tarjeta.fecha).toISOString().slice(0,10) : '');
    $('#campo-descripcion').val(tarjeta.descripcion || '');
    
    actualizarPreviewEtiquetas();

    // Cargar checklist
    cargarChecklistEnModal(tarjeta);

    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // Focus en el título usando jQuery
    setTimeout(() => $('#campo-titulo').focus(), 100);
}

function guardarTarjetaDesdeModal() {
    if (!estado.tarjetaActual) return;
    const { tarjeta, cardElemento } = estado.tarjetaActual;
    
    // Usar jQuery para obtener valores
    const titulo = $('#campo-titulo').val().trim() || 'Sin título';
    const etiquetas = $('#campo-etiquetas').val().split(',').map(e => e.trim()).filter(Boolean);
    const prioridad = $('#campo-prioridad').val();
    const pokerPlanning = $('#campo-poker-planning').val();
    const fecha = $('#campo-fecha').val();
    const descripcion = $('#campo-descripcion').val();

    tarjeta.titulo = titulo;
    tarjeta.etiquetas = etiquetas;
    tarjeta.prioridad = prioridad;
    tarjeta.pokerPlanning = pokerPlanning || '';
    tarjeta.fecha = fecha || undefined;
    tarjeta.descripcion = descripcion;

    // Guardar checklist
    const checklist = obtenerChecklistDesdeModal();
    if (checklist.length > 0) {
        tarjeta.checklist = checklist;
    } else {
        delete tarjeta.checklist;
    }

    // Guardar en localStorage
    guardarEstadoTablero();

    // Actualizar UI de la tarjeta - regenerar para reflejar todos los cambios
    const nuevoCard = crearTarjeta(tarjeta);
    $(cardElemento).replaceWith(nuevoCard);

    // Actualizar la referencia en el estado
    estado.tarjetaActual.cardElemento = nuevoCard;

    // Inicializar iconos de Lucide para la tarjeta actualizada
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);

    // Cerrar modal usando jQuery
    $('#modalDetalleTarjeta').modal('hide');
}
