// Eliminar lista
function eliminarLista(lista, listElemento) {
    if (!confirm(`¿Eliminar la lista "${lista.titulo}"? Esta acción eliminará todas las tarjetas que contiene y no se puede deshacer.`)) return;

    // Remover del estado
    estado.tablero.listas = estado.tablero.listas.filter(l => l.id !== lista.id);
    
    // Animación de salida con jQuery
    $(listElemento).css({
        transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
        opacity: '0',
        transform: 'translateY(-10px)'
    });
    
    setTimeout(() => {
        $(listElemento).remove();
        guardarEstadoTablero();
    }, 300);
}

// Copiar lista
function copiarLista(lista) {
    const nuevaLista = {
        id: `lista-${Date.now()}`,
        titulo: `${lista.titulo} (copia)`,
        tarjetas: lista.tarjetas.map(tarjeta => ({
            ...tarjeta,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
    };
    
    // Añadir al estado
    estado.tablero.listas.push(nuevaLista);
    
    // Crear elemento DOM
    const $tableroContainer = $('.tablero__contenedor');
    const $colNueva = $tableroContainer.find('.columna--nueva');
    const nuevaListaElement = crearLista(nuevaLista);
    
    // Animación de entrada con jQuery
    $(nuevaListaElement).css({
        opacity: '0',
        transform: 'translateY(10px)'
    }).insertBefore($colNueva);
    
    // Guardar estado
    guardarEstadoTablero();

    // Aplicar animación
    setTimeout(() => {
        $(nuevaListaElement).css({
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            opacity: '1',
            transform: 'translateY(0)'
        });
    }, 10);

    // Inicializar iconos de Lucide para la lista copiada
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

// Eliminar tarjeta
function eliminarTarjeta(tarjeta, cardElemento) {
    if (!confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;

    // Remover del estado
    estado.tablero.listas.forEach(lista => {
        lista.tarjetas = lista.tarjetas.filter(t => t.id !== tarjeta.id);
    });

    // Actualizar contador y UI usando jQuery
    const $columna = $(cardElemento).closest('.columna');
    const $contador = $columna.find('.contador');
    const $contTarjetas = $columna.find('.tarjetas-container');
    
    // Remover del DOM con animación
    $(cardElemento).fadeOut(300, function() {
        $(this).remove();
        
        const nuevoCont = $contTarjetas.find('.tarjeta.card').length;
        $contador.text(nuevoCont);

        // Mostrar mensaje vacío si no hay tarjetas
        if (nuevoCont === 0) {
            $contTarjetas.html('<p class="vacio text-muted small m-0">Aún no hay tareas.</p>');
        }
    });

    guardarEstadoTablero();

    // Cerrar modal si está abierto
    $('#modalDetalleTarjeta').modal('hide');
}

// Función para cargar checklist en el modal
function cargarChecklistEnModal(tarjeta) {
    const $checklistItems = $('.checklist-items');
    $checklistItems.empty();

    // Si la tarjeta tiene checklist, cargarlo
    if (tarjeta.checklist && Array.isArray(tarjeta.checklist)) {
        tarjeta.checklist.forEach(item => {
            const $checklistItem = $(`
                <div class="checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2">
                    <input type="checkbox" class="form-check-input" ${item.completado ? 'checked' : ''}>
                    <span class="flex-grow-1 ${item.completado ? 'text-decoration-line-through text-muted' : ''}">${item.texto}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
                        <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
                    </button>
                </div>
            `);

            // Evento para marcar como completado usando jQuery
            $checklistItem.find('input[type="checkbox"]').on('change', function() {
                const $span = $(this).siblings('span');
                if ($(this).is(':checked')) {
                    $span.addClass('text-decoration-line-through text-muted');
                } else {
                    $span.removeClass('text-decoration-line-through text-muted');
                }
            });

            // Evento para eliminar item usando jQuery
            $checklistItem.find('button').on('click', function() {
                $checklistItem.fadeOut(200, function() { $(this).remove(); });
            });

            $checklistItems.append($checklistItem);
        });
    }

    // Inicializar iconos de Lucide para los nuevos elementos
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

// Función para obtener checklist desde el modal
function obtenerChecklistDesdeModal() {
    const checklist = [];

    $('.checklist-item').each(function(index) {
        const $item = $(this);
        const completado = $item.find('input[type="checkbox"]').is(':checked');
        const texto = $item.find('span').text().trim();

        if (texto) {
            checklist.push({
                id: `temp-${Date.now()}-${index}`,
                texto: texto,
                completado: completado
            });
        }
    });

    return checklist;
}

// Función para añadir nuevo item al checklist
function agregarItemChecklist(texto = 'Nueva subtarea') {
    const $checklistItem = $(`
        <div class="checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2">
            <input type="checkbox" class="form-check-input">
            <span class="flex-grow-1">${texto}</span>
            <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
                <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
            </button>
        </div>
    `);

    // Evento para marcar como completado usando jQuery
    $checklistItem.find('input[type="checkbox"]').on('change', function() {
        const $span = $(this).siblings('span');
        if ($(this).is(':checked')) {
            $span.addClass('text-decoration-line-through text-muted');
        } else {
            $span.removeClass('text-decoration-line-through text-muted');
        }
    });

    // Evento para eliminar item usando jQuery
    $checklistItem.find('button').on('click', function() {
        $checklistItem.fadeOut(200, function() { $(this).remove(); });
    });

    $('.checklist-items').append($checklistItem);

    // Inicializar iconos de Lucide
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}
