// main.js - controla UI, mapa, filtros, modal y paginación
const pb = new PocketBase("http://127.0.0.1:8090"); // Initialize PocketBase
let map, markers = [];
let currentData = []; // datos cargados

// --- helper para formatear fecha
function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleString();
  }catch(e){ return iso; }
}

// --- Inicializar Google Map (callback en index.html)
function initMap(){ // Moved outside of any listener
  const center = {lat: 18.7357, lng: -70.1627}; // RD centro aproximado
  map = new google.maps.Map(document.getElementById('map'), {
    center, zoom: 7, disableDefaultUI: true,
    mapId: "AIzaSyAV4BqU_6HFjbQihwRkjiylatFaXC5zqVo" // Added this line
  });
  // después de mapa, cargar datos
  loadDataAndRender();
}

// --- carga de datos (por defecto usa DATA_SIM). Puedes reemplazar la función para llamar PocketBase
async function fetchData(){
  try {
    const records = await pb.collection('publicaciones').getFullList({
      sort: '-created'
    });
    return records;
  } catch (error) {
    console.error("Error fetching data from PocketBase:", error);
    return []; // Return empty array if PocketBase fails
  }
}

// --- limpiar markers
function clearMarkers(){
  markers.forEach(m => m.setMap(null));
  markers = [];
}

// --- agregar markers al mapa
function addMarkers(items){
  clearMarkers();
  items.forEach(it => {
    if(it.lat && it.lng){
      const marker = new google.maps.marker.AdvancedMarkerElement({ // Changed here
        position: {lat: it.lat, lng: it.lng},
        map,
        title: it.title
      });
      marker.addListener('click', () => openModal(it));
      markers.push(marker);
    }
  });
}

// --- render tarjetas (show all)
function renderCards(items, reset=false){
  const container = document.getElementById('cards-container');
  if(reset) container.innerHTML = '';
  // create cards
  items.forEach(it => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${it.img}" alt="${it.title}">
      <div class="card-body">
        <h3>${it.title}</h3>
        <p>${it.place} • ${it.type}</p>
        <p class="muted">${formatDate(it.date)}</p>
      </div>
    `;
    card.addEventListener('click', () => openModal(it));
    container.appendChild(card);
  });
  // Hide "Ver más" button as it's no longer needed
  const btn = document.getElementById('btn-ver-mas');
  if (btn) btn.style.display = 'none';
}

// --- abrir modal
function openModal(item){
  const modal = document.getElementById('modal');
  // Construct image URL for modal
  const imageUrl = item.imagen
    ? pb.files.getUrl(item, item.imagen) // Full size image for modal
    : 'https://via.placeholder.com/600x400?text=No+Image'; // Placeholder if no image

  document.getElementById('modal-img').src = imageUrl;
  document.getElementById('modal-title').textContent = item.title;
  document.getElementById('modal-desc').textContent = item.desc || '';
  document.getElementById('modal-category').textContent = `${item.category} • ${item.type}`;
  document.getElementById('modal-place-time').textContent = `${item.place} — ${formatDate(item.date)}`;
  document.getElementById('modal-actions').innerHTML = `
    <a href="https://wa.me/?text=${encodeURIComponent(item.title + ' - ' + (item.desc||''))}" target="_blank">Compartir WhatsApp</a> |
    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(item.title)}" target="_blank">Compartir X</a>
  `;
  modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false');
}

// --- cerrar modal
function closeModal(){
  const modal = document.getElementById('modal');
  modal.style.display = 'none'; modal.setAttribute('aria-hidden','true');
}

// --- llenar chips dinamicamente
function renderChips(items){
  const container = document.getElementById('chips-container');
  container.innerHTML = '';
  const cats = [...new Set(items.map(i=>i.category))];
  cats.forEach(c=>{
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = c;
    btn.addEventListener('click', () => {
      document.getElementById('select-tipo').value = '';
      document.getElementById('select-lugar').value = '';
      document.getElementById('search-input').value = '';
      applyFilters({category:c});
    });
    container.appendChild(btn);
  });
}

// --- llenar selects lugar/tipo
function fillSelects(items){
  const lugarEl = document.getElementById('select-lugar');
  const tipoEl = document.getElementById('select-tipo');
  lugarEl.innerHTML = '<option value="">Todos los lugares</option>';
  tipoEl.innerHTML = '<option value="">Todos los tipos</option>';
  const places = [...new Set(items.map(i=>i.place).filter(Boolean))];
  const types = [...new Set(items.map(i=>i.type).filter(Boolean))];
  places.forEach(p=> lugarEl.innerHTML += `<option value="${p}">${p}</option>`);
  types.forEach(t=> tipoEl.innerHTML += `<option value="${t}">${t}</option>`);
}

// --- apply filters & search then re-render
function applyFilters(opts){
  const q = (document.getElementById('search-input').value || '').toLowerCase();
  const lugar = document.getElementById('select-lugar').value;
  const tipo = document.getElementById('select-tipo').value;
  const category = (opts && opts.category) ? opts.category : '';

  let filtered = currentData.filter(i=>{
    let okQ = !q || (i.title && i.title.toLowerCase().includes(q)) || (i.desc && i.desc.toLowerCase().includes(q));
    let okLugar = !lugar || i.place === lugar;
    let okTipo = !tipo || i.type === tipo;
    let okCat = !category || i.category === category;
    return okQ && okLugar && okTipo && okCat;
  });

  // center map to filtered markers
  addMarkers(filtered);
  renderCards(filtered, true);
}

// --- cargar datos iniciales y render general
async function loadDataAndRender(){
  document.getElementById('api-banner').style.display = 'block';
  try{
    currentData = await fetchData(); // obtiene datos de PocketBase
    // hide banner if you later detect real API
    document.getElementById('api-banner').style.display = 'none';
    renderChips(currentData);
    fillSelects(currentData);
    addMarkers(currentData);
    renderCards(currentData, true);
  }
  catch(err){
    console.error('Error fetching data', err);
  }
}

// --- listeners UI
function setupUI(){
  // hamburger offcanvas
  const ham = document.getElementById('hamburger');
  const box = document.getElementById('offcanvas');
  const boxClose = document.getElementById('offcanvas-close');
  ham.addEventListener('click', ()=>{ box.classList.add('open'); box.setAttribute('aria-hidden','false'); });
  boxClose.addEventListener('click', ()=>{ box.classList.remove('open'); box.setAttribute('aria-hidden','true'); });

  // dark mode toggle
  document.getElementById('dark-toggle').addEventListener('click', ()=>{
    document.body.classList.toggle('dark');
  });

  // modal close
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e)=>{ if(e.target.id==='modal') closeModal(); });

  // filters & search
  document.getElementById('select-lugar').addEventListener('change', ()=>applyFilters());
  document.getElementById('select-tipo').addEventListener('change', ()=>applyFilters());
  document.getElementById('search-input').addEventListener('input', ()=>applyFilters());

  // No "Ver más" button listener needed
  // document.getElementById('btn-ver-mas').addEventListener('click', ()=>{
  //   page++;
  //   applyFilters();
  // });

  // Optional: find near (geolocation)
  document.getElementById('find-near').addEventListener('click', ()=>{
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(pos=>{
        map.setCenter({lat: pos.coords.latitude, lng: pos.coords.longitude});
        map.setZoom(12);
      });
    } else alert('Geolocalización no disponible');
  });

  // offcanvas search to filter quickly
  document.getElementById('off-search').addEventListener('input', (e)=>{
    document.getElementById('search-input').value = e.target.value;
    applyFilters();
  });
}

// --- init after window load (map callback will call initMap)
window.addEventListener('load', ()=>{
  setupUI();
  // initMap will call loadDataAndRender()
});