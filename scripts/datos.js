// Función para validar y normalizar una tarjeta
function normalizarTarjeta(tarjeta) {
    return {
        id: tarjeta.id || Date.now().toString(),
        titulo: tarjeta.titulo || 'Sin título',
        prioridad: tarjeta.prioridad || 'baja',
        etiquetas: Array.isArray(tarjeta.etiquetas) ? tarjeta.etiquetas : [],
        descripcion: tarjeta.descripcion || '',
        pokerPlanning: tarjeta.pokerPlanning || '',
        fecha: tarjeta.fecha || undefined
    };
}

// Función para cargar los datos del tablero desde JSON
async function cargarDatosTablero() {
    try {
        const respuesta = await fetch('./data/tablero.json');
        if (!respuesta.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        const datos = await respuesta.json();

        // Normalizar todas las tarjetas
        if (datos.tablero && datos.tablero.listas) {
            datos.tablero.listas.forEach(lista => {
                if (lista.tarjetas && Array.isArray(lista.tarjetas)) {
                    lista.tarjetas = lista.tarjetas.map(normalizarTarjeta);
                }
            });
        }

        console.log('Datos del tablero cargados y normalizados:', datos.tablero);
        return datos.tablero;
    } catch (error) {
        console.error('Error cargando datos del tablero:', error);
        return null;
    }
}
