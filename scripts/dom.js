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

// Array global para gestionar etiquetas en el modal
let etiquetasDelModal = [];

// Crear chip de etiqueta
function crearChipEtiqueta(etiqueta, onRemove) {
    const chip = document.createElement('span');
    chip.className = 'badge etiqueta-chip d-inline-flex align-items-center gap-2';
    chip.style.maxWidth = '200px';
    chip.innerHTML = `
        <span class="text-truncate">${etiqueta}</span>
        <button type="button" class="btn-close btn-close-sm" aria-label="Eliminar etiqueta"></button>
    `;
    chip.querySelector('.btn-close').addEventListener('click', (e) => {
        e.stopPropagation();
        onRemove(etiqueta);
    });
    return chip;
}

// Actualizar preview de etiquetas
function actualizarPreviewEtiquetas() {
    const $preview = $('#etiquetas-preview');
    $preview.empty();
    
    etiquetasDelModal.forEach(etiqueta => {
        const chip = crearChipEtiqueta(etiqueta, (remover) => {
            etiquetasDelModal = etiquetasDelModal.filter(e => e !== remover);
            actualizarPreviewEtiquetas();
        });
        $preview.append(chip);
    });
}

// Agregar nueva etiqueta
function agregarEtiqueta() {
    const $input = $('#campo-etiquetas');
    const etiqueta = $input.val().trim();
    
    if (!etiqueta) {
        alert('Por favor, ingresa una etiqueta');
        return;
    }
    
    if (etiqueta.length > 23) {
        alert('La etiqueta no puede tener más de 23 caracteres');
        return;
    }
    
    if (etiquetasDelModal.includes(etiqueta)) {
        alert('Esta etiqueta ya existe');
        return;
    }
    
    etiquetasDelModal.push(etiqueta);
    $input.val('').focus();
    actualizarPreviewEtiquetas();
}

// Limitar caracteres en tiempo real
function limitarCaracteresEtiqueta(event) {
    const $input = $(event.target);
    let valor = $input.val();
    
    if (valor.length > 23) {
        $input.val(valor.substring(0, 23));
    }
}
