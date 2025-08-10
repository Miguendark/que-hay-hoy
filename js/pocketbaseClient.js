const pb = new PocketBase("http://127.0.0.1:8090");

async function obtenerNoticias(pagina = 1, limite = 10, filtro = "", busqueda = "") {
    let query = {
        page: pagina,
        perPage: limite,
        sort: "-created",
    };

    if (filtro) query.filter = `categoria="${filtro}"`;
    if (busqueda) query.filter = `titulo~"${busqueda}"`;

    return await pb.collection("noticias").getList(query.page, query.perPage, query);
}