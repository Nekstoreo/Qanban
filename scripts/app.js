// Función principal para inicializar la aplicación
async function inicializarAplicacion() {
    aplicarTemaInicial();
    
    // Eventos usando jQuery
    $('#toggle-tema').on('click', alternarTema);

    // Intentar cargar desde localStorage primero, luego desde JSON
    let tablero = cargarEstadoTablero();
    if (!tablero) {
        tablero = await cargarDatosTablero();
    }
    if (tablero) {
        estado.tablero = tablero;
        renderizarTablero(tablero);

        // Inicializar iconos después de renderizar
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }, 50);
    }

    // Modal: eventos de UI usando jQuery
    $('#btn-guardar-tarjeta').on('click', guardarTarjetaDesdeModal);
    
    $('#btn-eliminar-tarjeta').on('click', function() {
        if (estado.tarjetaActual) {
            eliminarTarjeta(estado.tarjetaActual.tarjeta, estado.tarjetaActual.cardElemento);
        }
    });

    // Evento para agregar etiqueta
    $('#btn-agregar-etiqueta').on('click', agregarEtiqueta);
    
    // Permitir agregar etiqueta con Enter
    $('#campo-etiquetas').on('keypress', function(e) {
        if (e.which === 13) {
            e.preventDefault();
            agregarEtiqueta();
        }
    });
    
    // Limitar caracteres en tiempo real (escritura, pega, etc)
    $('#campo-etiquetas').on('input paste', limitarCaracteresEtiqueta);
}

// Ejecutar cuando el DOM esté listo usando jQuery
$(document).ready(function() {
    inicializarAplicacion();
    
    // Inicializar Lucide Icons después de que se cargue la aplicación
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 100);
});

// === EXPORTAR TABLERO COMO JSON ===
$(document).on('click', '.dropdown-item:contains("Exportar Tablero")', function(e) {
    e.preventDefault();
    if (!estado.tablero) {
        alert('No hay tablero para exportar.');
        return;
    }
    const contenido = JSON.stringify({ tablero: estado.tablero }, null, 2);
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'qanban_tablero.json';
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
});

// === IMPORTAR TABLERO DESDE JSON ===
$(document).on('click', '#importar-json-trigger', function(e) {
    e.preventDefault();
    $('#importar-json-input').trigger('click');
});

$(document).on('change', '#importar-json-input', function(e) {
    const archivo = this.files[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(evt) {
        try {
            const data = JSON.parse(evt.target.result);
            if (!data.tablero || !data.tablero.listas) {
                alert('El archivo seleccionado no contiene un tablero válido.');
                return;
            }
            // Validar estructura básica
            estado.tablero = data.tablero;
            guardarEstadoTablero();
            renderizarTablero(estado.tablero);
            alert('¡Tablero importado correctamente!');
        } catch (err) {
            alert('El archivo seleccionado no es un JSON válido o está corrupto.');
        }
    };
    lector.readAsText(archivo);
    // Reiniciar input para poder importar el mismo archivo varias veces si se desea
    this.value = '';
});

// === NUEVO TABLERO ===
$(document).on('click', '#nuevo-tablero', function(e) {
    e.preventDefault();
    if (confirm('¿Seguro que quieres crear un nuevo tablero? ¡Esta acción eliminará todo el contenido actual del tablero!')) {
        // Estado inicial: ajustar si deseas cambiar la estructura base
        estado.tablero = {
            listas: []
        };
        guardarEstadoTablero();
        renderizarTablero(estado.tablero);
        alert('¡Nuevo tablero creado!');
    }
});

$(document).on('click', '.dropdown-item:contains("Acerca de")', function(e) {
    e.preventDefault();
    // Usa Bootstrap Modal para mostrar el modal Acerca de
    const acercaModal = new bootstrap.Modal(document.getElementById('modalAcerca'));
    acercaModal.show();
});
