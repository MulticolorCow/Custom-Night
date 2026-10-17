console.log("🔥 APP.JS SE ESTÁ CARGANDO");

const state = {
    cardData: {
        name: '', 
        bio: '', 
        avatarUrl: 'src/assets/Avatares0.png', 
        color: '#8c3bf6', 
        quote: '' 
    }
};

const dom = {
    inputName: document.getElementById('input-name'),
    inputBio: document.getElementById('input-bio'),
    inputColor: document.getElementById('input-color'),
    inputSearch: document.getElementById('github-search'),
    btnFetch: document.getElementById('btn-fetch'),
    apiStatus: document.getElementById('api-status'),
    form: document.getElementById('profile-form'),
    avatarSelector: document.getElementById('avatar-selector'),
    previewName: document.getElementById('name-preview'),
    previewBio: document.getElementById('bio-preview'),
    previewQuote: document.getElementById('quote-preview'),
    previewAvatar: document.getElementById('avatar-preview'),
    previewHeader: document.getElementById('preview-header'),
    viewCreate: document.getElementById('view-create'),
    viewGaleria: document.getElementById('view-galeria'),
    galleryContainer: document.getElementById('gallery-container'),
    gallerySearch: document.getElementById('gallery-search'),
    navLinks: document.querySelectorAll('.nav-link'),
};

const API_URL = '/api/cards';

const getSavedCards = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al cargar tarjetas');
    return res.json();
};

const saveCard = async (card) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card),
    });
    if (!res.ok) throw new Error('Error al guardar la tarjeta');
    return res.json();
};

const deleteCard = async (id) => {
    try {
        const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Error al borrar');
        renderGallery(dom.gallerySearch.value);
    } catch (error) {
        alert('No se pudo eliminar la tarjeta. Intenta de nuevo.');
    }
};

// ---------- Vista Crear ----------

const initAvatarSelector = () => {
    const totalAvatares = 12;
    for (let i = 0; i < totalAvatares; i++) {
        const rutaImagen = `src/assets/Avatares${i}.png`;
        const img = document.createElement('img');
        img.src = rutaImagen;
        img.alt = `Avatar ${i}`;
        img.className = 'avatar-option';
        img.dataset.url = rutaImagen;

        img.addEventListener('click', () => {
            state.cardData.avatarUrl = rutaImagen;
            renderCard();
        });

        dom.avatarSelector.appendChild(img);
    }
};

const renderCard = () => {
    dom.previewName.textContent = state.cardData.name || 'Nombre Apellido';
    dom.previewBio.textContent = state.cardData.bio || 'La biografía aparecerá aquí...';
    dom.previewQuote.textContent = state.cardData.quote || 'Obteniendo una quote...';
    dom.previewAvatar.src = state.cardData.avatarUrl;
    dom.previewHeader.style.backgroundColor = state.cardData.color;
    dom.inputName.value = state.cardData.name;
    dom.inputBio.value = state.cardData.bio;
    dom.inputColor.value = state.cardData.color;
    const avatares = dom.avatarSelector.querySelectorAll('.avatar-option');
    avatares.forEach(img => {
        if (img.dataset.url === state.cardData.avatarUrl) {
            img.classList.add('selected');
        } else {
            img.classList.remove('selected');
        }
    });
};

const resetForm = () => {
    state.cardData = {
        name: '',
        bio: '',
        avatarUrl: 'src/assets/Avatares0.png',
        color: '#8c3bf6',
        quote: ''
    };

    renderCard();
    fetchKanyeQuote();
};

/**
 * INICIALIZACIÓN DE LA APLICACIÓN
 */
document.addEventListener('DOMContentLoaded', () => {
    initAvatarSelector();
    setupManualEvents();
    dom.btnFetch.addEventListener('click', () => {
        const username = dom.inputSearch.value.trim();
        fetchGitHubData(username);
    });
    
    dom.inputSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            dom.btnFetch.click();
        }
    });
    renderCard();
    fetchKanyeQuote();
    router();
});

const setupManualEvents = () => {
    dom.inputName.addEventListener('input', (e) => {
        state.cardData.name = e.target.value;
        renderCard();
    });

    dom.inputBio.addEventListener('input', (e) => {
        state.cardData.bio = e.target.value;
        renderCard();
    });

    dom.inputColor.addEventListener('input', (e) => {
        state.cardData.color = e.target.value;
        renderCard();
    });

    dom.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!state.cardData.name.trim()) {
        alert('Ponle un nombre a tu tarjeta antes de guardar.');
        return;
    }
    try {
        await saveCard(state.cardData);
        alert('¡Tarjeta guardada!');
        resetForm();
        window.location.hash = '#/galeria';
    } catch (error) {
        alert('No se pudo guardar la tarjeta. Intenta de nuevo.');
    }
});
};

const fetchGitHubData = async (username) => {
    if (!username) return;

    dom.apiStatus.textContent = 'Buscando usuario en GitHub...';
    dom.apiStatus.className = 'status-msg status-loading';
    dom.btnFetch.disabled = true;

    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        
        if (!response.ok) throw new Error('Usuario no encontrado');
        
        const data = await response.json();

        state.cardData.name = data.name || data.login; 
        state.cardData.bio = data.bio || 'Este usuario no tiene biografía pública.';
        state.cardData.avatarUrl = data.avatar_url; 
        
        renderCard();

        dom.apiStatus.textContent = '¡Datos cargados correctamente!';
        dom.apiStatus.className = 'status-msg status-success';

    } catch (error) {
        dom.apiStatus.textContent = error.message;
        dom.apiStatus.className = 'status-msg status-error';
    } finally {
        dom.btnFetch.disabled = false;
        setTimeout(() => dom.apiStatus.textContent = '', 3000);
    }
};
const fetchKanyeQuote = async () => {
    try {
        console.log("Consultando Kanye REST...");

        const response = await fetch("https://api.kanye.rest/");

        console.log("Status:", response.status);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        console.log("Respuesta de Kanye REST:", data);

        if (!data.quote) {
            throw new Error("La API no devolvió una quote");
        }

        state.cardData.quote = data.quote;

        renderCard();

    } catch (error) {
        console.error("Error con Kanye REST:", error);

        state.cardData.quote = "No se pudo obtener la quote.";

        renderCard();
    }
};


// ---------- Vista Galería ----------
const crearTarjetaHTML = (card) => {
    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
        <div class="card-header"></div>
        <img alt="Avatar" class="avatar">
        <div class="card-body">
            <h3></h3>
            <p class="card-bio"></p>
            <div class="ye-quote">
                <span class="quote-label">YE SAYS:</span>
                <p class="card-quote"></p>
            </div>
            <button class="btn-delete">Eliminar</button>
        </div>
    `;

    article.querySelector('.card-header').style.backgroundColor = card.color;
    article.querySelector('.avatar').src = card.avatarUrl;
    article.querySelector('h3').textContent = card.name;
    article.querySelector('.card-bio').textContent = card.bio || 'Sin biografía.';
    article.querySelector('.card-quote').textContent = card.quote || 'Sin quote.';
    article.querySelector('.btn-delete').addEventListener('click', () => deleteCard(card.id));

    return article;
};
const renderGallery = async (filtro = '') => {
    dom.galleryContainer.innerHTML = '<p>Cargando tarjetas...</p>';

    try {
        const todas = await getSavedCards();
        const cards = todas.filter(card =>
            card.name.toLowerCase().includes(filtro.toLowerCase())
        );

        dom.galleryContainer.innerHTML = '';

        if (cards.length === 0) {
            dom.galleryContainer.innerHTML = '<p>No se encontraron tarjetas.</p>';
            return;
        }

        cards.forEach(card => {
            dom.galleryContainer.appendChild(crearTarjetaHTML(card));
        });
    } catch (error) {
        dom.galleryContainer.innerHTML = '<p>No se pudieron cargar las tarjetas.</p>';
    }
};
dom.gallerySearch.addEventListener('input', (e) => {
    renderGallery(e.target.value);
});

// ---------- Router ----------

const routes = {
    '#/crear': dom.viewCreate,
    '#/galeria': dom.viewGaleria,
};

const router = () => {
    const hash = window.location.hash || '#/crear';
    const activeView = routes[hash] || dom.viewCreate;

    Object.values(routes).forEach(view => view.classList.remove('active'));
    activeView.classList.add('active');

    dom.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === hash);
    });

    if (hash === '#/galeria') {
        renderGallery();
    }
};

window.addEventListener('hashchange', router);

