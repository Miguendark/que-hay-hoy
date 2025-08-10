function mostrarNoticias(lista) {
    const contenedor = document.getElementById("contenedorNoticias");
    contenedor.innerHTML = "";
    lista.items.forEach(noticia => {
        const card = document.createElement("div");
        card.classList.add("noticia");
        card.innerHTML = `
            <img src="${noticia.imagen}" alt="${noticia.titulo}">
            <h2>${noticia.titulo}</h2>
            <p>${noticia.resumen}</p>
        `;
        contenedor.appendChild(card);
    });
}