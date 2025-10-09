// Estado de la aplicación en memoria
const estado = {
    tablero: null,
    tarjetaActual: null,
};

// Persistencia
function guardarEstadoTablero() {
    localStorage.setItem('qanban:tablero', JSON.stringify(estado.tablero));
}

function cargarEstadoTablero() {
    const guardado = localStorage.getItem('qanban:tablero');
    return guardado ? JSON.parse(guardado) : null;
}
