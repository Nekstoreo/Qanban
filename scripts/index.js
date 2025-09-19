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

// Crear tarjeta DOM
function crearTarjeta(tarjeta) {
    const card = document.createElement('div');
    card.className = 'tarjeta card';
    card.tabIndex = 0;

    const cab = document.createElement('div');
    cab.className = 'tarjeta__cabecera card-header d-flex justify-content-between align-items-start';

    const h3 = document.createElement('h3');
    h3.className = 'tarjeta__titulo h6 m-0';
    h3.textContent = tarjeta.titulo;

    const insignias = document.createElement('div');
    insignias.className = 'insignias d-flex gap-1';
    if (tarjeta.prioridad) {
        insignias.appendChild(crearInsigniaPrioridad(tarjeta.prioridad));
    }

    cab.appendChild(h3);
    cab.appendChild(insignias);

    const pie = document.createElement('div');
    pie.className = 'tarjeta__pie card-footer d-flex justify-content-between bg-white';

    const meta = document.createElement('div');
    meta.className = 'metadatos d-flex gap-1';
    if (Array.isArray(tarjeta.etiquetas)) {
        tarjeta.etiquetas.forEach(e => meta.appendChild(crearEtiqueta(e)));
    }

    pie.appendChild(meta);

    if (tarjeta.fecha) {
        const time = document.createElement('time');
        time.className = 'fecha d-inline-flex align-items-center gap-1 text-muted small';
        time.dateTime = tarjeta.fecha;
        const fechaTexto = new Date(tarjeta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        time.innerHTML = `\n            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">\n                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>\n            </svg>\n            ${fechaTexto}`;
        pie.appendChild(time);
    }

    card.appendChild(cab);
    card.appendChild(pie);
    return card;
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
    // Placeholder: evento para crear tarea (puede ampliarse)
    btnNueva.addEventListener('click', () => {
        const nuevaTarjeta = { id: Date.now().toString(), titulo: 'Nueva tarea', prioridad: 'baja', etiquetas: [] };
        // Añadir al DOM y actualizar contador
        contTarjetas.appendChild(crearTarjeta(nuevaTarjeta));
        const nuevoCont = contTarjetas.querySelectorAll('.tarjeta.card').length;
        contador.textContent = nuevoCont;
        // Si antes estaba el mensaje vacío, eliminarlo
        const vacio = contTarjetas.querySelector('.vacio');
        if (vacio) vacio.remove();
        // Scroll to bottom para mostrar la nueva tarjeta
        contenidoScroll.scrollTop = contenidoScroll.scrollHeight;
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
        contenedor.insertBefore(crearLista(nueva), colNueva);
    });

    cab.appendChild(btnLista);
    colNueva.appendChild(cab);
    contenedor.appendChild(colNueva);

    seccion.appendChild(contenedor);
}

// Función principal para inicializar la aplicación
async function inicializarAplicacion() {
    const tablero = await cargarDatosTablero();
    if (tablero) {
        console.log('Datos del tablero cargados:', tablero);
        renderizarTablero(tablero);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);