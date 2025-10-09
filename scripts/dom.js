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
    const $input = $('#campo-etiquetas');
    const $preview = $('#etiquetas-preview');
    const etiquetas = $input.val().split(',').map(e => e.trim()).filter(Boolean);

    $preview.empty();
    etiquetas.forEach(etiqueta => {
        const chip = crearChipEtiqueta(etiqueta, (remover) => {
            const actuales = $input.val().split(',').map(e => e.trim()).filter(Boolean);
            const filtradas = actuales.filter(e => e !== remover);
            $input.val(filtradas.join(', '));
            actualizarPreviewEtiquetas();
        });
        $preview.append(chip);
    });
}
