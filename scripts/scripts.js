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

// Edición inline de título de lista
function iniciarEdicionTituloLista(tituloElemento, lista) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control form-control-sm';
    input.value = lista.titulo || '';
    tituloElemento.replaceWith(input);
    input.focus();
    input.select();

    const finalizar = (guardar) => {
        const nuevoTitulo = input.value.trim() || 'Sin título';
        if (guardar) {
            lista.titulo = nuevoTitulo;
            guardarEstadoTablero();
        }
        const h2 = document.createElement('h2');
        h2.className = 'columna__titulo h6 m-0';
        h2.id = `col-${lista.id.replace(/\s+/g, '-').toLowerCase()}-titulo`;
        h2.textContent = lista.titulo;
        h2.title = 'Haz doble clic para editar';
        h2.addEventListener('dblclick', () => iniciarEdicionTituloLista(h2, lista));
        input.replaceWith(h2);
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finalizar(true);
        if (e.key === 'Escape') finalizar(false);
    });
    input.addEventListener('blur', () => finalizar(true));
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
    // Debug: verificar que la tarjeta tenga todos los campos necesarios
    console.log('Creando tarjeta:', {
        id: tarjeta.id,
        titulo: tarjeta.titulo,
        tipo: tarjeta.tipo,
        complejidad: tarjeta.complejidad,
        estimacion: tarjeta.estimacion,
        subtareasCompletadas: tarjeta.subtareasCompletadas,
        subtareasTotal: tarjeta.subtareasTotal
    });
    const card = document.createElement('div');
    card.className = 'tarjeta card';
    card.tabIndex = 0;
    
    // Añadimos el atributo data-prioridad para el estilo del borde lateral
    if (tarjeta.prioridad) {
        card.setAttribute('data-prioridad', tarjeta.prioridad);
    }

    // Añadimos el atributo data-has-checklist si la tarjeta tiene checklist
    if (tarjeta.checklist && Array.isArray(tarjeta.checklist) && tarjeta.checklist.length > 0) {
        card.setAttribute('data-has-checklist', 'true');
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

    // Pie: metadatos (etiquetas, fecha, poker planning)
    const pie = document.createElement('div');
    pie.className = 'tarjeta__pie card-footer d-flex flex-column gap-2';

    // Sección de etiquetas - mostrar todas siempre
    const etiquetasContainer = document.createElement('div');
    etiquetasContainer.className = 'etiquetas-container';

    if (Array.isArray(tarjeta.etiquetas) && tarjeta.etiquetas.length > 0) {
        const etiquetasMostradas = document.createElement('div');
        etiquetasMostradas.className = 'metadatos d-flex gap-1 flex-wrap';

        // Mostrar todas las etiquetas
        tarjeta.etiquetas.forEach(e => etiquetasMostradas.appendChild(crearEtiqueta(e)));

        etiquetasContainer.appendChild(etiquetasMostradas);
    }

    // Sección de indicadores (fecha y poker planning)
    const indicadoresContainer = document.createElement('div');
    indicadoresContainer.className = 'indicadores-container d-flex align-items-center justify-content-between gap-2 flex-wrap';

    // Fecha
    if (tarjeta.fecha) {
        const time = document.createElement('time');
        time.className = 'fecha d-inline-flex align-items-center gap-1 text-muted small';
        time.dateTime = tarjeta.fecha;
        const fechaTexto = new Date(tarjeta.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        time.innerHTML = `
            <i data-lucide="calendar" width="14" height="14" aria-hidden="true"></i>
            ${fechaTexto}`;
        indicadoresContainer.appendChild(time);
    }

    // Poker Planning
    if (tarjeta.pokerPlanning && tarjeta.pokerPlanning !== '') {
        const pokerIndicator = document.createElement('span');
        pokerIndicator.className = 'poker-planning-indicator badge d-flex align-items-center gap-1';

        // Agregar clase de color basada en el valor
        const valor = tarjeta.pokerPlanning;
        if (valor === '?') {
            pokerIndicator.classList.add('poker-unknown');
        } else if (['1', '2', '3'].includes(valor)) {
            pokerIndicator.classList.add(`poker-${valor}`);
        } else if (['5', '8'].includes(valor)) {
            pokerIndicator.classList.add(`poker-${valor}`);
        } else if (['13', '20'].includes(valor)) {
            pokerIndicator.classList.add(`poker-${valor}`);
        } else if (['40', '100'].includes(valor)) {
            pokerIndicator.classList.add(`poker-${valor}`);
        }

        pokerIndicator.innerHTML = `
            <i data-lucide="credit-card" width="12" height="12" aria-hidden="true"></i>
            <span>${tarjeta.pokerPlanning}</span>
        `;
        pokerIndicator.title = `Estimación: ${tarjeta.pokerPlanning} ${tarjeta.pokerPlanning === '?' ? 'puntos (incierto)' : 'puntos'}`;
        indicadoresContainer.appendChild(pokerIndicator);
    }

    // Agregar secciones al pie
    pie.appendChild(etiquetasContainer);

    // Solo agregar indicadores si hay contenido
    if (indicadoresContainer.children.length > 0) {
        pie.appendChild(indicadoresContainer);
    }

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
    const pokerPlanning = document.getElementById('campo-poker-planning');
    const fecha = document.getElementById('campo-fecha');
    const descripcion = document.getElementById('campo-descripcion');

    titulo.value = tarjeta.titulo || '';
    etiquetas.value = (tarjeta.etiquetas || []).join(', ');
    prioridad.value = tarjeta.prioridad || 'baja';
    pokerPlanning.value = tarjeta.pokerPlanning || '';
    fecha.value = tarjeta.fecha ? new Date(tarjeta.fecha).toISOString().slice(0,10) : '';
    descripcion.value = tarjeta.descripcion || '';
    actualizarPreviewEtiquetas();

    // Cargar checklist
    cargarChecklistEnModal(tarjeta);

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
    const pokerPlanning = document.getElementById('campo-poker-planning').value;
    const fecha = document.getElementById('campo-fecha').value;
    const descripcion = document.getElementById('campo-descripcion').value;

    tarjeta.titulo = titulo;
    tarjeta.etiquetas = etiquetas;
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
    cardElemento.replaceWith(nuevoCard);

    // Actualizar la referencia en el estado
    estado.tarjetaActual.cardElemento = nuevoCard;

    // Inicializar iconos de Lucide para la tarjeta actualizada
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);

    // Cerrar modal
    const modalEl = document.getElementById('modalDetalleTarjeta');
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.hide();
}

// Eliminar lista
function eliminarLista(lista, listElemento) {
    if (!confirm(`¿Eliminar la lista "${lista.titulo}"? Esta acción eliminará todas las tarjetas que contiene y no se puede deshacer.`)) return;

    // Remover del estado
    estado.tablero.listas = estado.tablero.listas.filter(l => l.id !== lista.id);
    
    // Animación de salida
    listElemento.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    listElemento.style.opacity = '0';
    listElemento.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        listElemento.remove();
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
    const tableroContainer = document.querySelector('.tablero__contenedor');
    const colNueva = tableroContainer.querySelector('.columna--nueva');
    const nuevaListaElement = crearLista(nuevaLista);
    
    // Animación de entrada
    nuevaListaElement.style.opacity = '0';
    nuevaListaElement.style.transform = 'translateY(10px)';
    tableroContainer.insertBefore(nuevaListaElement, colNueva);
    
    // Guardar estado
    guardarEstadoTablero();

    // Aplicar animación
    void nuevaListaElement.offsetWidth;
    nuevaListaElement.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    nuevaListaElement.style.opacity = '1';
    nuevaListaElement.style.transform = 'translateY(0)';

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
    h2.title = 'Haz doble clic para editar';
    
    // Edición inline del título de lista
    h2.addEventListener('dblclick', () => iniciarEdicionTituloLista(h2, lista));
    
    const headerRight = document.createElement('div');
    headerRight.className = 'd-flex align-items-center gap-2';
    
    const contador = document.createElement('span');
    contador.className = 'contador badge text-bg-light';
    contador.setAttribute('aria-label', 'Tareas');
    contador.textContent = (Array.isArray(lista.tarjetas) ? lista.tarjetas.length : 0);
    
    // Menú kebab para columna
    const menuDropdown = document.createElement('div');
    menuDropdown.className = 'dropdown';
    const menuButton = document.createElement('button');
    menuButton.className = 'btn btn-sm btn-outline-light border-0 p-1';
    menuButton.type = 'button';
    menuButton.setAttribute('data-bs-toggle', 'dropdown');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Opciones de columna');
    menuButton.innerHTML = `<i data-lucide="more-vertical" width="16" height="16" aria-hidden="true"></i>`;
    
    const menuList = document.createElement('ul');
    menuList.className = 'dropdown-menu dropdown-menu-end';
    menuList.innerHTML = `
        <li><a class="dropdown-item renombrar-lista" href="#"><span class="me-2">✏️</span>Renombrar lista</a></li>
        <li><a class="dropdown-item copiar-lista" href="#"><span class="me-2">📋</span>Copiar lista</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-danger eliminar-lista" href="#"><span class="me-2">🗑️</span>Eliminar lista</a></li>`;
    
    // Event listeners para las acciones del menú
    menuList.querySelector('.renombrar-lista').addEventListener('click', (e) => {
        e.preventDefault();
        iniciarEdicionTituloLista(h2, lista);
    });
    
    menuList.querySelector('.copiar-lista').addEventListener('click', (e) => {
        e.preventDefault();
        copiarLista(lista);
    });
    
    menuList.querySelector('.eliminar-lista').addEventListener('click', (e) => {
        e.preventDefault();
        eliminarLista(lista, article);
    });
    
    menuDropdown.appendChild(menuButton);
    menuDropdown.appendChild(menuList);
    
    headerRight.appendChild(contador);
    headerRight.appendChild(menuDropdown);
    
    header.appendChild(h2);
    header.appendChild(headerRight);

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

    // Pie con botón fijo (fuera del área de scroll)
    const pie = document.createElement('div');
    pie.className = 'columna__pie';
    const btnNueva = document.createElement('button');
    btnNueva.className = 'tarjeta tarjeta--nueva';
    btnNueva.type = 'button';
    btnNueva.innerHTML = `\n        <i data-lucide="plus-circle" width="20" height="20" aria-hidden="true"></i>\n        <span>Crear nueva tarea</span>`;
    // Crear nueva tarjeta con edición inmediata del título
    btnNueva.addEventListener('click', () => {
        const nuevaTarjeta = {
            id: Date.now().toString(),
            titulo: 'Nueva tarea',
            prioridad: 'baja',
            etiquetas: [],
            descripcion: ''
        };
        
        // Añadir al estado
        if (!Array.isArray(lista.tarjetas)) {
            lista.tarjetas = [];
        }
        lista.tarjetas.push(nuevaTarjeta);
        
        // Añadir al DOM y actualizar contador
        const nuevaCard = crearTarjeta(nuevaTarjeta);
        contTarjetas.appendChild(nuevaCard);
        const nuevoCont = contTarjetas.querySelectorAll('.tarjeta.card').length;
        contador.textContent = nuevoCont;
        
        // Si antes estaba el mensaje vacío, eliminarlo
        const vacio = contTarjetas.querySelector('.vacio');
        if (vacio) vacio.remove();
        
        // Guardar estado
        guardarEstadoTablero();
        
        // Scroll to bottom para mostrar la nueva tarjeta
        contenidoScroll.scrollTop = contenidoScroll.scrollHeight;

        // Inicializar iconos de Lucide para la nueva tarjeta
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }

            // Iniciar edición del título automáticamente
            const tituloElemento = nuevaCard.querySelector('.tarjeta__titulo');
            iniciarEdicionTitulo(tituloElemento, nuevaTarjeta);
        }, 50);
    });

    pie.appendChild(btnNueva);
    article.appendChild(header);
    article.appendChild(cuerpo);
    article.appendChild(pie);

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
    btnLista.innerHTML = `\n        <i data-lucide="plus-square" width="24" height="24" aria-hidden="true"></i>\n        <span>Crear nueva lista</span>`;
    // Evento para añadir lista
    btnLista.addEventListener('click', () => {
        const nueva = { id: `lista-${Date.now()}`, titulo: 'Nueva lista', tarjetas: [] };
        
        // Añadir al estado del tablero
        if (!estado.tablero.listas) {
            estado.tablero.listas = [];
        }
        estado.tablero.listas.push(nueva);
        
        // Crear elemento DOM
        const nuevaLista = crearLista(nueva);
        
        // Añadimos una animación de entrada
        nuevaLista.style.opacity = '0';
        nuevaLista.style.transform = 'translateY(10px)';
        contenedor.insertBefore(nuevaLista, colNueva);
        
        // Guardar estado
        guardarEstadoTablero();

        // Forzamos un reflow para que la animación funcione
        void nuevaLista.offsetWidth;
        nuevaLista.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        nuevaLista.style.opacity = '1';
        nuevaLista.style.transform = 'translateY(0)';

        // Inicializar iconos de Lucide para la nueva lista
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }

            // Focus en el título para editarlo
            const tituloLista = nuevaLista.querySelector('.columna__titulo');
            iniciarEdicionTituloLista(tituloLista, nueva);
        }, 300);
    });

    cab.appendChild(btnLista);
    colNueva.appendChild(cab);
    contenedor.appendChild(colNueva);

    seccion.appendChild(contenedor);
}

// Función para cargar checklist en el modal
function cargarChecklistEnModal(tarjeta) {
    const checklistItems = document.querySelector('.checklist-items');
    checklistItems.innerHTML = '';

    // Si la tarjeta tiene checklist, cargarlo
    if (tarjeta.checklist && Array.isArray(tarjeta.checklist)) {
        tarjeta.checklist.forEach(item => {
            const checklistItem = document.createElement('div');
            checklistItem.className = 'checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2';
            checklistItem.innerHTML = `
                <input type="checkbox" class="form-check-input" ${item.completado ? 'checked' : ''}>
                <span class="flex-grow-1 ${item.completado ? 'text-decoration-line-through text-muted' : ''}">${item.texto}</span>
                <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
                    <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
                </button>
            `;

            // Evento para marcar como completado
            const checkbox = checklistItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', () => {
                const span = checklistItem.querySelector('span');
                if (checkbox.checked) {
                    span.classList.add('text-decoration-line-through', 'text-muted');
                } else {
                    span.classList.remove('text-decoration-line-through', 'text-muted');
                }
            });

            // Evento para eliminar item
            const deleteBtn = checklistItem.querySelector('button');
            deleteBtn.addEventListener('click', () => {
                checklistItem.remove();
            });

            checklistItems.appendChild(checklistItem);
        });
    } else {
        // Si no hay checklist, el contenedor queda vacío
        // Los usuarios pueden agregar items usando el botón "Añadir elemento"
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
    const checklistItems = document.querySelectorAll('.checklist-item');
    const checklist = [];

    checklistItems.forEach((item, index) => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        const span = item.querySelector('span');
        const texto = span.textContent.trim();

        if (texto) {
            checklist.push({
                id: `temp-${Date.now()}-${index}`,
                texto: texto,
                completado: checkbox.checked
            });
        }
    });

    return checklist;
}

// Función para añadir nuevo item al checklist
function agregarItemChecklist(texto = 'Nueva subtarea') {
    const checklistItems = document.querySelector('.checklist-items');
    const checklistItem = document.createElement('div');
    checklistItem.className = 'checklist-item d-flex align-items-center gap-2 p-2 border rounded mb-2';

    checklistItem.innerHTML = `
        <input type="checkbox" class="form-check-input">
        <span class="flex-grow-1">${texto}</span>
        <button type="button" class="btn btn-sm btn-outline-danger border-0 opacity-50">
            <i data-lucide="trash-2" width="14" height="14" aria-hidden="true"></i>
        </button>
    `;

    // Evento para marcar como completado
    const checkbox = checklistItem.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        const span = checklistItem.querySelector('span');
        if (checkbox.checked) {
            span.classList.add('text-decoration-line-through', 'text-muted');
        } else {
            span.classList.remove('text-decoration-line-through', 'text-muted');
        }
    });

    // Evento para eliminar item
    const deleteBtn = checklistItem.querySelector('button');
    deleteBtn.addEventListener('click', () => {
        checklistItem.remove();
    });

    checklistItems.appendChild(checklistItem);

    // Inicializar iconos de Lucide
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
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

        // Inicializar iconos después de renderizar
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }, 50);
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

    const inputEtiquetas = document.getElementById('campo-etiquetas');

    // Preview de etiquetas en tiempo real
    if (inputEtiquetas) {
        inputEtiquetas.addEventListener('input', actualizarPreviewEtiquetas);
    }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarAplicacion);

// Inicializar Lucide Icons después de que se cargue la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño delay para asegurar que todos los elementos estén renderizados
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 100);
});