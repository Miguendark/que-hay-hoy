async function cargarFiltros() {
    const categorias = await pb.collection("categorias").getFullList();
    const nav = document.getElementById("filtros");
    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat.nombre;
        btn.addEventListener("click", () => {
            paginaActual = 1;
            categoriaSeleccionada = cat.nombre;
            cargarNoticias();
        });
        nav.appendChild(btn);
    });
}