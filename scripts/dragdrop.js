// Funcionalidad de Drag and Drop para tarjetas

let tarjetaEnArrastre = null;
let listaOrigen = null;
let tarjetaDataOrigen = null;
let tarjetaPlaceholder = null;

// Inicializar drag and drop
function inicializarDragDrop() {
    document.addEventListener('dragstart', manejarDragStart);
    document.addEventListener('dragover', manejarDragOver);
    document.addEventListener('drop', manejarDrop);
    document.addEventListener('dragend', manejarDragEnd);
    document.addEventListener('dragleave', manejarDragLeave);
}

function manejarDragStart(e) {
    const tarjeta = e.target.closest('.tarjeta.card');
    if (!tarjeta) return;

    e.dataTransfer.effectAllowed = 'move';
    
    tarjetaEnArrastre = tarjeta;
    listaOrigen = tarjeta.closest('.columna');
    
    // Buscar la tarjeta en el estado
    const titulo = tarjeta.querySelector('.tarjeta__titulo').textContent;
    for (let lista of estado.tablero.listas) {
        const tarjetaData = lista.tarjetas.find(t => t.titulo === titulo);
        if (tarjetaData) {
            tarjetaDataOrigen = tarjetaData;
            break;
        }
    }
    
    tarjeta.style.opacity = '0.5';
    tarjeta.style.cursor = 'grabbing';
    tarjeta.classList.add('tarjeta-arrastrada');
}

function manejarDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const tarjetasContainer = e.target.closest('.tarjetas-container');
    const columna = e.target.closest('.columna:not(.columna--nueva)');
    
    if (tarjetasContainer && columna) {
        tarjetasContainer.classList.add('drag-over');
        
        // Encontrar la tarjeta sobre la que estamos
        const tarjetaDestino = e.target.closest('.tarjeta.card');
        if (tarjetaDestino && tarjetaDestino !== tarjetaEnArrastre) {
            const allTarjetas = Array.from(tarjetasContainer.querySelectorAll('.tarjeta.card'));
            const indexTarjetaDestino = allTarjetas.indexOf(tarjetaDestino);
            const indexTarjetaArrastre = allTarjetas.indexOf(tarjetaEnArrastre);
            
            // Insertar visualización de reorden
            if (indexTarjetaDestino >= 0) {
                if (indexTarjetaArrastre < indexTarjetaDestino) {
                    // Arrastrando hacia abajo
                    tarjetaDestino.parentNode.insertBefore(tarjetaEnArrastre, tarjetaDestino.nextSibling);
                } else {
                    // Arrastrando hacia arriba
                    tarjetaDestino.parentNode.insertBefore(tarjetaEnArrastre, tarjetaDestino);
                }
            }
        }
    }
}

function manejarDragLeave(e) {
    const tarjetasContainer = e.target.closest('.tarjetas-container');
    if (tarjetasContainer && !tarjetasContainer.contains(e.relatedTarget)) {
        tarjetasContainer.classList.remove('drag-over');
    }
}

function manejarDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!tarjetaEnArrastre || !tarjetaDataOrigen) return;

    const tarjetasContainerDestino = e.target.closest('.tarjetas-container');
    const columnaDestino = e.target.closest('.columna:not(.columna--nueva)');
    
    if (!tarjetasContainerDestino || !columnaDestino) {
        restaurarOrdenOriginal();
        limpiarDragOver();
        return;
    }

    // Obtener índices de listas
    const todasLasListas = Array.from(document.querySelectorAll('.columna:not(.columna--nueva)'));
    const indiceListaOrigen = todasLasListas.indexOf(listaOrigen);
    const indiceListaDestino = todasLasListas.indexOf(columnaDestino);

    if (indiceListaOrigen === -1 || indiceListaDestino === -1) {
        restaurarOrdenOriginal();
        limpiarDragOver();
        return;
    }

    const listaOrigenData = estado.tablero.listas[indiceListaOrigen];
    const listaDestinoData = estado.tablero.listas[indiceListaDestino];

    // Obtener la nueva posición en el DOM
    const todasLasTarjetasDestino = Array.from(tarjetasContainerDestino.querySelectorAll('.tarjeta.card'));
    const nuevaPosicion = todasLasTarjetasDestino.indexOf(tarjetaEnArrastre);

    // Eliminar de la lista origen
    const indexTarjetaOrigen = listaOrigenData.tarjetas.indexOf(tarjetaDataOrigen);
    if (indexTarjetaOrigen > -1) {
        listaOrigenData.tarjetas.splice(indexTarjetaOrigen, 1);
    }

    // Insertar en la nueva posición en la lista destino
    if (nuevaPosicion >= 0) {
        listaDestinoData.tarjetas.splice(nuevaPosicion, 0, tarjetaDataOrigen);
    } else {
        listaDestinoData.tarjetas.push(tarjetaDataOrigen);
    }

    // Guardar estado
    guardarEstadoTablero();

    // Actualizar contadores
    const contadorOrigen = listaOrigen.querySelector('.contador');
    const contadorDestino = columnaDestino.querySelector('.contador');
    
    if (contadorOrigen) contadorOrigen.textContent = listaOrigenData.tarjetas.length;
    if (contadorDestino) contadorDestino.textContent = listaDestinoData.tarjetas.length;

    // Si la lista origen quedó vacía, mostrar mensaje
    if (listaOrigenData.tarjetas.length === 0) {
        const contTarjetasOrigen = listaOrigen.querySelector('.tarjetas-container');
        const vacio = contTarjetasOrigen.querySelector('.vacio');
        if (!vacio) {
            const p = document.createElement('p');
            p.className = 'vacio text-muted small m-0';
            p.textContent = 'Aún no hay tareas.';
            contTarjetasOrigen.appendChild(p);
        }
    }

    // Reinicializar iconos
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);

    limpiarDragOver();
}

function manejarDragEnd(e) {
    if (tarjetaEnArrastre) {
        tarjetaEnArrastre.style.opacity = '1';
        tarjetaEnArrastre.style.cursor = 'grab';
        tarjetaEnArrastre.classList.remove('tarjeta-arrastrada');
    }
    limpiarDragOver();
    tarjetaEnArrastre = null;
    listaOrigen = null;
    tarjetaDataOrigen = null;
}

function limpiarDragOver() {
    document.querySelectorAll('.tarjetas-container').forEach(container => {
        container.classList.remove('drag-over');
    });
}

function restaurarOrdenOriginal() {
    // Las tarjetas se restaurarán automáticamente al renderizar
    // Por ahora simplemente limpiamos los estilos
}

// Hacer las tarjetas arrastrables
function hacerTarjetasArrastrables() {
    document.querySelectorAll('.tarjeta.card').forEach(tarjeta => {
        tarjeta.draggable = true;
        tarjeta.style.cursor = 'grab';
    });
}

// Observer para detectar nuevas tarjetas y hacerlas arrastrables
const observerDragDrop = new MutationObserver(() => {
    hacerTarjetasArrastrables();
});

// Inicializar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        inicializarDragDrop();
        hacerTarjetasArrastrables();
        
        // Observar cambios en el DOM
        const tableroElement = document.querySelector('.tablero');
        if (tableroElement) {
            observerDragDrop.observe(tableroElement, {
                childList: true,
                subtree: true
            });
        }
    }, 100);
});
