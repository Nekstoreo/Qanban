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

// Tema: inicializar y persistir
function aplicarTemaInicial() {
    const preferido = localStorage.getItem('qanban:tema');
    const root = document.documentElement;
    if (preferido === 'oscuro') {
        root.classList.add('dark');
        document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0F172A');
    }
}

function alternarTema() {
    const root = document.documentElement;
    const esOscuro = root.classList.toggle('dark');
    localStorage.setItem('qanban:tema', esOscuro ? 'oscuro' : 'claro');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', esOscuro ? '#0F172A' : '#3b82f6');
}

// Función para cargar los datos del tablero desde JSON
async function cargarDatosTablero() {
    try {
        const respuesta = await fetch('./data/tablero.json');
        if (!respuesta.ok) {
            throw new Error('Error al cargar el archivo JSON');
        }
        const datos = await respuesta.json();
        return datos.tablero;
    } catch (error) {
        console.error('Error cargando datos del tablero:', error);
        return null;
    }
}

// Crear elemento de etiqueta (badge)
function crearEtiqueta(text) {
    const span = document.createElement('span');
    span.className = 'etiqueta badge text-bg-light';
    span.textContent = text;
    return span;
}

// Crear insignia de prioridad
function crearInsigniaPrioridad(prioridad) {
    const span = document.createElement('span');
    const clase = `insignia insignia--${prioridad} badge`;
    span.className = clase;
    span.textContent = prioridad ? prioridad.charAt(0).toUpperCase() + prioridad.slice(1) : '';
    return span;
}

// Edición inline de título de tarjeta
function iniciarEdicionTitulo(tituloElemento, tarjeta) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm';
    input.value = tarjeta.titulo || '';
    tituloElemento.replaceWith(input);
    input.focus();
    input.select();

    const finalizar = (guardar) => {
        const nuevoTitulo = input.value.trim() || 'Sin título';
        if (guardar) {
            tarjeta.titulo = nuevoTitulo;
            guardarEstadoTablero();
        }
        const h3 = document.createElement('h3');
        h3.className = 'tarjeta__titulo h6 m-0 tarjeta__titulo--full';
        h3.textContent = tarjeta.titulo;
        h3.title = 'Haz doble clic para editar';
        h3.addEventListener('dblclick', () => iniciarEdicionTitulo(h3, tarjeta));
        input.replaceWith(h3);
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finalizar(true);
        if (e.key === 'Escape') finalizar(false);
    });
    input.addEventListener('blur', () => finalizar(true));
}

// Crear tarjeta DOM
function crearTarjeta(tarjeta) {
    const card = document.createElement('div');
    card.className = 'tarjeta card';
    card.tabIndex = 0;
    
    // Añadimos el atributo data-prioridad para el estilo del borde lateral
    if (tarjeta.prioridad) {
        card.setAttribute('data-prioridad', tarjeta.prioridad);
    }

    // Cabecera: solo título (no truncado)
    const cab = document.createElement('div');
    cab.className = 'tarjeta__cabecera card-header';

    const h3 = document.createElement('h3');
    h3.className = 'tarjeta__titulo h6 m-0 tarjeta__titulo--full';
    h3.textContent = tarjeta.titulo;
    h3.title = 'Haz doble clic para editar';

    // Edición inline del título
    h3.addEventListener('dblclick', () => iniciarEdicionTitulo(h3, tarjeta));

    cab.appendChild(h3);

    // Pie: metadatos (prioridad, etiquetas, fecha)
    const pie = document.createElement('div');
    pie.className = 'tarjeta__pie card-footer d-flex flex-column gap-2';

    const metaTop = document.createElement('div');
    metaTop.className = 'metadatos d-flex gap-1 flex-wrap';
    if (Array.isArray(tarjeta.etiquetas)) {
        tarjeta.etiquetas.forEach(e => metaTop.appendChild(crearEtiqueta(e)));
    }

    const metaBottom = document.createElement('div');
    metaBottom.className = 'metadatos-bottom d-flex align-items-center justify-content-between';

    const prioridadCont = document.createElement('div');
    prioridadCont.className = 'insignias d-flex gap-1';
    if (tarjeta.prioridad) {
        prioridadCont.appendChild(crearInsigniaPrioridad(tarjeta.prioridad));
    }

    metaBottom.appendChild(prioridadCont);

    if (tarjeta.fecha) {
        const time = document.createElement('time');
        time.className = 'fecha d-inline-flex align-items-center gap-1 text-muted small';
        time.dateTime = tarjeta.fecha;
        const fechaTexto = new Date(tarjeta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        time.innerHTML = `\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>\n            </svg>\n            ${fechaTexto}`;
        metaBottom.appendChild(time);
    }

    pie.appendChild(metaTop);
    pie.appendChild(metaBottom);

    card.appendChild(cab);
    card.appendChild(pie);
    // Abrir modal al hacer clic en cualquier parte de la tarjeta excepto el botón crear
    card.addEventListener('click', (e) => {
        // Evitar si se hizo click en elementos interactivos internos
        const esInteractivo = e.target.closest('button, input, select, textarea');
        if (esInteractivo) return;
        abrirModalDetalle(tarjeta, card);
    });

    return card;
}

// Crear chip de etiqueta
function crearChipEtiqueta(etiqueta, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'badge etiqueta-chip d-inline-flex align-items-center gap-1';
    chip.innerHTML = `
        ${etiqueta}
        <button type="button" class="btn-close btn-close-sm ms-1" aria-label="Eliminar etiqueta"></button>
    `;
    chip.querySelector('.btn-close').addEventListener('click', () => onRemove(etiqueta));
    return chip;
}

// Actualizar preview de etiquetas
function actualizarPreviewEtiquetas() {
    const input = document.getElementById('campo-etiquetas');
    const preview = document.getElementById('etiquetas-preview');
    const etiquetas = input.value.split(',').map(e => e.trim()).filter(Boolean);

    preview.innerHTML = '';
    etiquetas.forEach(etiqueta => {
        const chip = crearChipEtiqueta(etiqueta, (remover) => {
            const actuales = input.value.split(',').map(e => e.trim()).filter(Boolean);
            const filtradas = actuales.filter(e => e !== remover);
            input.value = filtradas.join(', ');
            actualizarPreviewEtiquetas();
        });
        preview.appendChild(chip);
    });
}

// Modal Detalle
function abrirModalDetalle(tarjeta, cardElemento) {
    estado.tarjetaActual = { tarjeta, cardElemento };
    // Campos
    const titulo = document.getElementById('campo-titulo');
    const etiquetas = document.getElementById('campo-etiquetas');
    const prioridad = document.getElementById('campo-prioridad');
    const fecha = document.getElementById('campo-fecha');
    const estimacion = document.getElementById('campo-estimacion');
    const descripcion = document.getElementById('campo-descripcion');
    const preview = document.getElementById('preview-descripcion');
    const togglePreview = document.getElementById('toggle-preview');

    titulo.value = tarjeta.titulo || '';
    etiquetas.value = (tarjeta.etiquetas || []).join(', ');
    prioridad.value = tarjeta.prioridad || 'baja';
    fecha.value = tarjeta.fecha ? new Date(tarjeta.fecha).toISOString().slice(0,10) : '';
    estimacion.value = tarjeta.estimacion || '';
    descripcion.value = tarjeta.descripcion || '';
    togglePreview.checked = false;
    preview.classList.add('d-none');
    descripcion.classList.remove('d-none');
    preview.innerHTML = tarjeta.descripcion ? marked.parse(tarjeta.descripcion) : '';
    actualizarPreviewEtiquetas();

    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    // Focus en el título
    setTimeout(() => titulo.focus(), 100);
}

function guardarTarjetaDesdeModal() {
    if (!estado.tarjetaActual) return;
    const { tarjeta, cardElemento } = estado.tarjetaActual;
    const titulo = document.getElementById('campo-titulo').value.trim() || 'Sin título';
    const etiquetas = document.getElementById('campo-etiquetas').value.split(',').map(e => e.trim()).filter(Boolean);
    const prioridad = document.getElementById('campo-prioridad').value;
    const fecha = document.getElementById('campo-fecha').value;
    const estimacion = document.getElementById('campo-estimacion').value;
    const descripcion = document.getElementById('campo-descripcion').value;

    tarjeta.titulo = titulo;
    tarjeta.etiquetas = etiquetas;
    tarjeta.prioridad = prioridad;
    tarjeta.fecha = fecha || undefined;
    tarjeta.estimacion = estimacion ? Number(estimacion) : undefined;
    tarjeta.descripcion = descripcion;

    // Guardar en localStorage
    guardarEstadoTablero();

    // Actualizar UI de la tarjeta
    cardElemento.querySelector('.tarjeta__titulo').textContent = titulo;
    cardElemento.setAttribute('data-prioridad', prioridad);
    const metaTop = cardElemento.querySelector('.tarjeta__pie .metadatos');
    metaTop.innerHTML = '';
    etiquetas.forEach(e => metaTop.appendChild(crearEtiqueta(e)));
    const metaBottom = cardElemento.querySelector('.tarjeta__pie .metadatos-bottom');
    const contInsignias = metaBottom.querySelector('.insignias');
    contInsignias.innerHTML = '';
    if (prioridad) contInsignias.appendChild(crearInsigniaPrioridad(prioridad));
    let time = metaBottom.querySelector('time');
    if (fecha) {
        if (!time) {
            time = document.createElement('time');
            time.className = 'fecha d-inline-flex align-items-center gap-1 text-muted small';
            metaBottom.appendChild(time);
        }
        time.dateTime = fecha;
        const fechaTexto = new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        time.innerHTML = `\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>\n            </svg>\n            ${fechaTexto}`;
    } else if (time) {
        time.remove();
    }

    // Cerrar modal
    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

// Eliminar tarjeta
function eliminarTarjeta(tarjeta, cardElemento) {
    if (!confirm('¿Eliminar esta tarjeta? Esta acción no se puede deshacer.')) return;

    // Remover del estado
    estado.tablero.listas.forEach(lista => {
        lista.tarjetas = lista.tarjetas.filter(t => t.id !== tarjeta.id);
    });

    // Actualizar contador y UI
    const columna = cardElemento.closest('.columna');
    const contador = columna.querySelector('.contador');
    const contTarjetas = columna.querySelector('.tarjetas-container');
    const nuevoCont = contTarjetas.querySelectorAll('.tarjeta.card').length - 1;
    contador.textContent = nuevoCont;

    // Remover del DOM
    cardElemento.remove();

    // Mostrar mensaje vacío si no hay tarjetas
    if (nuevoCont === 0) {
        const p = document.createElement('p');
        p.className = 'vacio text-muted small m-0';
        p.textContent = 'Aún no hay tareas.';
        contTarjetas.appendChild(p);
    }

    guardarEstadoTablero();

    // Cerrar modal si está abierto
    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

// Crear lista DOM
function crearLista(lista) {
    const article = document.createElement('article');
    article.className = 'columna';
    article.setAttribute('aria-labelledby', `col-${lista.id.replace(/\s+/g, '-').toLowerCase()}-titulo`);

    // Header
    const header = document.createElement('header');
    header.className = 'columna__cabecera d-flex align-items-center justify-content-between border-bottom p-2';
    const h2 = document.createElement('h2');
    h2.className = 'columna__titulo h6 m-0';
    h2.id = `col-${lista.id.replace(/\s+/g, '-').toLowerCase()}-titulo`;
    h2.textContent = lista.titulo;
    const contador = document.createElement('span');
    contador.className = 'contador badge text-bg-light';
    contador.setAttribute('aria-label', 'Tareas');
    contador.textContent = (Array.isArray(lista.tarjetas) ? lista.tarjetas.length : 0);
    header.appendChild(h2);
    header.appendChild(contador);

    // Cuerpo
    const cuerpo = document.createElement('div');
    cuerpo.className = 'columna__cuerpo';

    const contenidoScroll = document.createElement('div');
    contenidoScroll.className = 'columna__contenido-scroll';

    const contTarjetas = document.createElement('div');
    contTarjetas.className = 'tarjetas-container';

    if (Array.isArray(lista.tarjetas) && lista.tarjetas.length > 0) {
        lista.tarjetas.forEach(t => contTarjetas.appendChild(crearTarjeta(t)));
    } else {
        const p = document.createElement('p');
        p.className = 'vacio text-muted small m-0';
        p.textContent = 'Aún no hay tareas.';
        contTarjetas.appendChild(p);
    }

    contenidoScroll.appendChild(contTarjetas);
    cuerpo.appendChild(contenidoScroll);

    // Pie con botón fijo
    const pie = document.createElement('div');
    pie.className = 'columna__pie';
    const btnNueva = document.createElement('button');
    btnNueva.className = 'tarjeta tarjeta--nueva';
    btnNueva.type = 'button';
    btnNueva.innerHTML = `\n        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\n        </svg>\n        <span>Crear nueva tarea</span>`;
    // Crear nueva tarjeta con edición inmediata del título
    btnNueva.addEventListener('click', () => {
        const nuevaTarjeta = { id: Date.now().toString(), titulo: 'Nueva tarea', prioridad: 'baja', etiquetas: [] };
        // Añadir al DOM y actualizar contador
        const nuevaCard = crearTarjeta(nuevaTarjeta);
        contTarjetas.appendChild(nuevaCard);
        const nuevoCont = contTarjetas.querySelectorAll('.tarjeta.card').length;
        contador.textContent = nuevoCont;
        // Si antes estaba el mensaje vacío, eliminarlo
        const vacio = contTarjetas.querySelector('.vacio');
        if (vacio) vacio.remove();
        // Scroll to bottom para mostrar la nueva tarjeta
        contenidoScroll.scrollTop = contenidoScroll.scrollHeight;
        // Iniciar edición del título automáticamente
        const tituloElemento = nuevaCard.querySelector('.tarjeta__titulo');
        iniciarEdicionTitulo(tituloElemento, nuevaTarjeta);
    });

    pie.appendChild(btnNueva);
    cuerpo.appendChild(pie);

    article.appendChild(header);
    article.appendChild(cuerpo);

    return article;
}

// Renderizar tablero
function renderizarTablero(tablero) {
    const seccion = document.querySelector('.tablero');
    if (!seccion) return;
    // Limpiar contenido previo
    seccion.innerHTML = '';

    const contenedor = document.createElement('div');
    contenedor.className = 'tablero__contenedor';

    if (tablero && Array.isArray(tablero.listas)) {
        tablero.listas.forEach(lista => contenedor.appendChild(crearLista(lista)));
    }

    // Botón para crear nueva lista
    const colNueva = document.createElement('article');
    colNueva.className = 'columna columna--nueva';
    const cab = document.createElement('div');
    cab.className = 'columna__cabecera';
    const btnLista = document.createElement('button');
    btnLista.className = 'boton-nueva-lista btn';
    btnLista.type = 'button';
    btnLista.innerHTML = `\n        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" />\n        </svg>\n        <span>Crear nueva lista</span>`;
    // Evento mínimo para añadir lista
    btnLista.addEventListener('click', () => {
        const nueva = { id: `lista-${Date.now()}`, titulo: 'Nueva lista', tarjetas: [] };
        const nuevaLista = crearLista(nueva);
        // Añadimos una animación de entrada
        nuevaLista.style.opacity = '0';
        nuevaLista.style.transform = 'translateY(10px)';
        contenedor.insertBefore(nuevaLista, colNueva);
        
        // Forzamos un reflow para que la animación funcione
        void nuevaLista.offsetWidth;
        nuevaLista.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        nuevaLista.style.opacity = '1';
        nuevaLista.style.transform = 'translateY(0)';
    });

    cab.appendChild(btnLista);
    colNueva.appendChild(cab);
    contenedor.appendChild(colNueva);

    seccion.appendChild(contenedor);
}

// Función principal para inicializar la aplicación
async function inicializarAplicacion() {
    aplicarTemaInicial();
    const toggle = document.getElementById('toggle-tema');
    if (toggle) toggle.addEventListener('click', alternarTema);

    // Intentar cargar desde localStorage primero, luego desde JSON
    let tablero = cargarEstadoTablero();
    if (!tablero) {
        tablero = await cargarDatosTablero();
    }
    if (tablero) {
        estado.tablero = tablero;
        renderizarTablero(tablero);
    }

    // Modal: eventos de UI
    const btnGuardar = document.getElementById('btn-guardar-tarjeta');
    if (btnGuardar) btnGuardar.addEventListener('click', guardarTarjetaDesdeModal);

    const btnEliminar = document.getElementById('btn-eliminar-tarjeta');
    if (btnEliminar) btnEliminar.addEventListener('click', () => {
        if (estado.tarjetaActual) {
            eliminarTarjeta(estado.tarjetaActual.tarjeta, estado.tarjetaActual.cardElemento);
        }
    });

    const togglePreview = document.getElementById('toggle-preview');
    const textarea = document.getElementById('campo-descripcion');
    const preview = document.getElementById('preview-descripcion');
    const inputEtiquetas = document.getElementById('campo-etiquetas');

    if (togglePreview && textarea && preview) {
        togglePreview.addEventListener('change', (e) => {
            const mostrar = e.target.checked;
            if (mostrar) {
                preview.classList.remove('d-none');
                textarea.classList.add('d-none');
                preview.innerHTML = marked.parse(textarea.value || '');
            } else {
                preview.classList.add('d-none');
                textarea.classList.remove('d-none');
            }
        });
        textarea.addEventListener('input', () => {
            if (!preview.classList.contains('d-none')) {
                preview.innerHTML = marked.parse(textarea.value || '');
            }
        });
    }

    // Preview de etiquetas en tiempo real
    if (inputEtiquetas) {
        inputEtiquetas.addEventListener('input', actualizarPreviewEtiquetas);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);