// Modal Detalle
function abrirModalDetalle(tarjeta, cardElemento) {
    estado.tarjetaActual = { tarjeta, cardElemento };
    
    // Usar jQuery para obtener y setear valores
    $('#campo-titulo').val(tarjeta.titulo || '');
    $('#titulo-modal').text(tarjeta.titulo || 'Detalle de la tarjeta');
    $('#titulo-modal-input').val(tarjeta.titulo || '');
    
    $('#campo-prioridad').val(tarjeta.prioridad || 'baja');
    $('#campo-poker-planning').val(tarjeta.pokerPlanning || '');
    $('#campo-fecha').val(tarjeta.fecha ? new Date(tarjeta.fecha).toISOString().slice(0,10) : '');
    $('#campo-descripcion').val(tarjeta.descripcion || '');
    
    // Inicializar etiquetas del modal
    etiquetasDelModal = Array.isArray(tarjeta.etiquetas) ? [...tarjeta.etiquetas] : [];
    $('#campo-etiquetas').val('');
    actualizarPreviewEtiquetas();

    // Cargar checklist
    cargarChecklistEnModal(tarjeta);

    // Mostrar la descripción renderizada inicialmente
    mostrarDescripcionRenderizada();

    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // Focus en el título usando jQuery
    setTimeout(() => $('#campo-titulo').focus(), 100);
}

// Iniciar edición del título en el header del modal
function iniciarEdicionTituloModal() {
    const tituloDisplay = document.getElementById('titulo-modal');
    const tituloInput = document.getElementById('titulo-modal-input');
    const tituloFormField = document.getElementById('campo-titulo');
    
    if (!tituloDisplay || !tituloInput || !tituloFormField) return;
    
    // Mostrar input, ocultar display
    tituloDisplay.style.display = 'none';
    tituloInput.style.display = 'block';
    tituloInput.value = tituloFormField.value;
    tituloInput.focus();
    tituloInput.select();
}

// Finalizar edición del título en el header del modal
function finalizarEdicionTituloModal() {
    const tituloDisplay = document.getElementById('titulo-modal');
    const tituloInput = document.getElementById('titulo-modal-input');
    const tituloFormField = document.getElementById('campo-titulo');
    
    if (!tituloDisplay || !tituloInput || !tituloFormField) return;
    
    // Obtener el nuevo título del input
    const nuevoTitulo = tituloInput.value.trim() || 'Sin título';
    
    // Actualizar ambos campos
    tituloFormField.value = nuevoTitulo;
    tituloDisplay.textContent = nuevoTitulo;
    
    // Mostrar display, ocultar input
    tituloInput.style.display = 'none';
    tituloDisplay.style.display = 'block';
}

// Renderizar markdown a HTML de forma segura
function renderizarMarkdown(markdown) {
    if (!markdown) return '';
    
    try {
        // Usar marked si está disponible
        if (typeof marked !== 'undefined' && marked.parse) {
            // Configurar opciones seguras
            const html = marked.parse(markdown, {
                breaks: true,  // Convertir saltos de línea en <br>
                gfm: true      // GitHub Flavored Markdown
            });
            return html;
        }
    } catch (e) {
        console.error('Error al renderizar markdown:', e);
    }
    
    // Si marked no está disponible, devolver el texto escapado
    return escapeHtml(markdown);
}

// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Mostrar la descripción renderizada (vista por defecto)
function mostrarDescripcionRenderizada() {
    const textarea = document.getElementById('campo-descripcion');
    const previewDisplay = document.getElementById('descripcion-preview-display');
    
    if (!textarea || !previewDisplay) return;
    
    const markdown = textarea.value;
    
    // Mostrar preview, ocultar textarea
    previewDisplay.style.display = 'block';
    textarea.style.display = 'none';
    
    if (markdown.trim()) {
        previewDisplay.innerHTML = renderizarMarkdown(markdown);
    } else {
        previewDisplay.innerHTML = '<span class="text-muted">Sin descripción. Doble clic para añadir.</span>';
    }
}

// Iniciar edición de la descripción
function iniciarEdicionDescripcion() {
    const textarea = document.getElementById('campo-descripcion');
    const previewDisplay = document.getElementById('descripcion-preview-display');
    
    if (!textarea || !previewDisplay) return;
    
    // Mostrar textarea, ocultar preview
    previewDisplay.style.display = 'none';
    textarea.style.display = 'block';
    textarea.focus();
}

// Finalizar edición y volver a mostrar preview
function finalizarEdicionDescripcion() {
    mostrarDescripcionRenderizada();
}

function guardarTarjetaDesdeModal() {
    if (!estado.tarjetaActual) return;
    const { tarjeta, cardElemento } = estado.tarjetaActual;
    
    // Usar jQuery para obtener valores
    const titulo = $('#campo-titulo').val().trim() || 'Sin título';
    const prioridad = $('#campo-prioridad').val();
    const pokerPlanning = $('#campo-poker-planning').val();
    const fecha = $('#campo-fecha').val();
    const descripcion = $('#campo-descripcion').val();

    tarjeta.titulo = titulo;
    tarjeta.etiquetas = etiquetasDelModal;
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

// Event listeners para doble clic en descripción y título del modal
document.addEventListener('DOMContentLoaded', () => {
    // Listeners para descripción
    const previewDisplay = document.getElementById('descripcion-preview-display');
    const textarea = document.getElementById('campo-descripcion');
    
    if (previewDisplay) {
        previewDisplay.addEventListener('dblclick', iniciarEdicionDescripcion);
    }
    
    if (textarea) {
        // Finalizar edición al hacer blur o presionar Escape
        textarea.addEventListener('blur', finalizarEdicionDescripcion);
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                finalizarEdicionDescripcion();
            }
        });
    }
    
    // Listeners para título del modal
    const tituloModal = document.getElementById('titulo-modal');
    const tituloModalInput = document.getElementById('titulo-modal-input');
    
    if (tituloModal) {
        tituloModal.addEventListener('dblclick', iniciarEdicionTituloModal);
    }
    
    if (tituloModalInput) {
        // Finalizar edición al hacer blur o presionar Escape
        tituloModalInput.addEventListener('blur', finalizarEdicionTituloModal);
        tituloModalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                finalizarEdicionTituloModal();
            }
        });
        // Finalizar edición al presionar Enter
        tituloModalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                finalizarEdicionTituloModal();
            }
        });
    }
});

