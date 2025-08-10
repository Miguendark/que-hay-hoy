let paginaActual = 1;
let categoriaSeleccionada = "";
let busquedaActual = "";

document.getElementById("verMas").addEventListener("click", () => {
    paginaActual++;
    cargarNoticias(true);
});

document.getElementById("buscador").addEventListener("input", e => {
    busquedaActual = e.target.value;
    paginaActual = 1;
    cargarNoticias();
});

document.getElementById("modoOscuroBtn").addEventListener("click", () => {
    document.body.classList.toggle("oscuro");
});

async function cargarNoticias(append = false) {
    const noticias = await obtenerNoticias(paginaActual, 10, categoriaSeleccionada, busquedaActual);
    if (append) {
        mostrarNoticias({ items: [...document.querySelectorAll(".noticia")].map(n => n.dataset), ...noticias });
    } else {
        mostrarNoticias(noticias);
    }
}

cargarFiltros();
cargarNoticias();