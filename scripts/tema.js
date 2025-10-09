// Tema: inicializar y persistir
function aplicarTemaInicial() {
    const preferido = localStorage.getItem('qanban:tema');
    if (preferido === 'oscuro') {
        $('html').addClass('dark');
        $('meta[name="theme-color"]').attr('content', '#0F172A');
    }
}

function alternarTema() {
    const $root = $('html');
    $root.toggleClass('dark');
    const esOscuro = $root.hasClass('dark');
    localStorage.setItem('qanban:tema', esOscuro ? 'oscuro' : 'claro');
    $('meta[name="theme-color"]').attr('content', esOscuro ? '#0F172A' : '#3b82f6');
}
