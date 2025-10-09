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
    const $seccion = $('.tablero');
    if ($seccion.length === 0) return;
    
    // Limpiar contenido previo usando jQuery
    $seccion.empty();

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
    
    // Evento para añadir lista con jQuery
    $(btnLista).on('click', function() {
        const nueva = { id: `lista-${Date.now()}`, titulo: 'Nueva lista', tarjetas: [] };
        
        // Añadir al estado del tablero
        if (!estado.tablero.listas) {
            estado.tablero.listas = [];
        }
        estado.tablero.listas.push(nueva);
        
        // Crear elemento DOM
        const nuevaLista = crearLista(nueva);
        
        // Añadimos una animación de entrada con jQuery
        $(nuevaLista).css({
            opacity: '0',
            transform: 'translateY(10px)'
        }).insertBefore($(colNueva));
        
        // Guardar estado
        guardarEstadoTablero();

        // Aplicar animación
        setTimeout(() => {
            $(nuevaLista).css({
                transition: 'opacity 0.3s ease-out, transform 0.3s ease-out',
                opacity: '1',
                transform: 'translateY(0)'
            });
        }, 10);

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

    $seccion.append(contenedor);
}
