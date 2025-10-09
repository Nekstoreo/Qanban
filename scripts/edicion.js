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
