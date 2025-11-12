function eliminarLista(lista, listElemento) {
    if (!confirm(`¿Eliminar la lista "${lista.titulo}"? Esta acción eliminará todas las tarjetas que contiene y no se puede deshacer.`)) return;

    estado.tablero.listas = estado.tablero.listas.filter(l => l.id !== lista.id);
    
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

function copiarLista(lista) {
    const nuevaLista = {
        id: `lista-${Date.now()}`,
        titulo: `${lista.titulo} (copia)`,
        tarjetas: lista.tarjetas.map(tarjeta => ({
            ...tarjeta,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
    };
    
    estado.tablero.listas.push(nuevaLista);
    
    const $tableroContainer = $('.tablero__contenedor');
    const $colNueva = $tableroContainer.find('.columna--nueva');
    const nuevaListaElement = crearLista(nuevaLista);
    
    $(nuevaListaElement).css({
        opacity: '0',
        transform: 'translateY(10px)'
    }).insertBefore($colNueva);
    
    guardarEstadoTablero();

    setTimeout(() => {
        $(nuevaListaElement).css({
            transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
            opacity: '1',
            transform: 'translateY(0)'
        });
    }, 10);

    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

function eliminarTarjeta(tarjeta, cardElemento) {
    if (!confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;

    estado.tablero.listas.forEach(lista => {
        lista.tarjetas = lista.tarjetas.filter(t => t.id !== tarjeta.id);
    });

    const $columna = $(cardElemento).closest('.columna');
    const $contador = $columna.find('.contador');
    const $contTarjetas = $columna.find('.tarjetas-container');
    
    $(cardElemento).fadeOut(300, function() {
        $(this).remove();
        
        const nuevoCont = $contTarjetas.find('.tarjeta.card').length;
        $contador.text(nuevoCont);

        if (nuevoCont === 0) {
            $contTarjetas.html('<p class="vacio text-muted small m-0">Aún no hay tareas.</p>');
        }
    });

    guardarEstadoTablero();

    $('#modalDetalleTarjeta').modal('hide');
}

// Helper para habilitar edición inline en el texto del checklist
function habilitarEdicionChecklistTexto($span, $checkboxInput) {
    const textoActual = $span.text();
    
    const $input = $('<input type="text" class="form-control form-control-sm" />').val(textoActual);
    $span.replaceWith($input);
    $input.focus();
    $input.select();

    const guardarEdicion = function() {
        const nuevoTexto = $input.val().trim() || textoActual;
        const estaPachado = $checkboxInput.is(':checked');
        const $spanNueva = $(`<span class="flex-grow-1 checklist-texto ${estaPachado ? 'text-decoration-line-through text-muted' : ''}" title="Haz doble clic para editar">${nuevoTexto}</span>`);
        
        $input.replaceWith($spanNueva);
        $spanNueva.on('dblclick', function() {
            habilitarEdicionChecklistTexto($spanNueva, $checkboxInput);
        });
    };

    const cancelarEdicion = function() {
        const estaPachado = $checkboxInput.is(':checked');
        const $spanRestore = $(`<span class="flex-grow-1 checklist-texto ${estaPachado ? 'text-decoration-line-through text-muted' : ''}" title="Haz doble clic para editar">${textoActual}</span>`);
        $input.replaceWith($spanRestore);
        $spanRestore.on('dblclick', function() {
            habilitarEdicionChecklistTexto($spanRestore, $checkboxInput);
        });
    };

    $input.on('blur', guardarEdicion);
    $input.on('keydown', function(e) {
        if (e.key === 'Enter') guardarEdicion();
        if (e.key === 'Escape') cancelarEdicion();
    });
}

function cargarChecklistEnModal(tarjeta) {
    const $checklistItems = $('.checklist-items');
    $checklistItems.empty();

    if (tarjeta.checklist && Array.isArray(tarjeta.checklist)) {
        tarjeta.checklist.forEach(item => {
            const $checklistItem = $(
                `<div class="checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2">
                    <input type="checkbox" class="form-check-input" ${item.completado ? 'checked' : ''}>
                    <span class="flex-grow-1 checklist-texto ${item.completado ? 'text-decoration-line-through text-muted' : ''}" title="Haz doble clic para editar">${item.texto}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
                        <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
                    </button>
                </div>`
            );

            const $checkbox = $checklistItem.find('input[type="checkbox"]');
            const $span = $checklistItem.find('span.checklist-texto');

            $checkbox.on('change', function() {
                if ($(this).is(':checked')) {
                    $span.addClass('text-decoration-line-through text-muted');
                } else {
                    $span.removeClass('text-decoration-line-through text-muted');
                }
            });

            // Edición inline del texto del checklist
            $span.on('dblclick', function() {
                habilitarEdicionChecklistTexto($span, $checkbox);
            });

            $checklistItem.find('button').on('click', function() {
                $checklistItem.fadeOut(200, function() { $(this).remove(); });
            });

            $checklistItems.append($checklistItem);
        });
    }

    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

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

function agregarItemChecklist(texto = 'Nueva subtarea') {
    const $checklistItem = $(
        `<div class="checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2">
            <input type="checkbox" class="form-check-input">
            <span class="flex-grow-1 checklist-texto" title="Haz doble clic para editar">${texto}</span>
            <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
                <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
            </button>
        </div>`
    );

    const $checkbox = $checklistItem.find('input[type="checkbox"]');
    const $span = $checklistItem.find('span.checklist-texto');

    $checkbox.on('change', function() {
        if ($(this).is(':checked')) {
            $span.addClass('text-decoration-line-through text-muted');
        } else {
            $span.removeClass('text-decoration-line-through text-muted');
        }
    });

    // Edición inline del texto del checklist
    $span.on('dblclick', function() {
        habilitarEdicionChecklistTexto($span, $checkbox);
    });

    $checklistItem.find('button').on('click', function() {
        $checklistItem.fadeOut(200, function() { $(this).remove(); });
    });

    $('.checklist-items').append($checklistItem);

    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}
