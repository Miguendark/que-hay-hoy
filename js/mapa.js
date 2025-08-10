let mapa;
let marcadores = [];

function inicializarMapa() {
    mapa = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 18.4861, lng: -69.9312 }, // Santo Domingo
        zoom: 13
    });

    const lugares = [
        { nombre: "Restaurante La Bandera", categoria: "restaurantes", lat: 18.476, lng: -69.93 },
        { nombre: "Hotel Caribe", categoria: "hoteles", lat: 18.49, lng: -69.94 },
        { nombre: "Tienda Colonial", categoria: "tiendas", lat: 18.48, lng: -69.92 },
    ];

    lugares.forEach(lugar => {
        const marcador = new google.maps.Marker({
            position: { lat: lugar.lat, lng: lugar.lng },
            map: mapa,
            title: lugar.nombre
        });
        marcador.categoria = lugar.categoria;
        marcadores.push(marcador);
    });
}

function filtrarMarcadores(categoria) {
    marcadores.forEach(marcador => {
        if (categoria === "todos" || marcador.categoria === categoria) {
            marcador.setMap(mapa);
        } else {
            marcador.setMap(null);
        }
    });
}