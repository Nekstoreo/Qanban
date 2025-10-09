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

    // Preview de etiquetas en tiempo real usando jQuery
    $('#campo-etiquetas').on('input', actualizarPreviewEtiquetas);
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
