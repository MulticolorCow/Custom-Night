const STORAGE_KEY = 'customNightCards';

const state = {
    cardData: {
        name: '',
        bio: '',
        avatarUrl: 'src/assets/Avatares0.png', // Avatar por defecto
        color: '#8c3bf6'
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
    previewAvatar: document.getElementById('avatar-preview'),
    previewHeader: document.getElementById('preview-header'),
    viewCreate: document.getElementById('view-create'),
    viewGaleria: document.getElementById('view-galeria'),
    galleryContainer: document.getElementById('gallery-container'),
    navLinks: document.querySelectorAll('.nav-link'),
};

// ---------- Persistencia ----------

const getSavedCards = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
};

const saveCard = (card) => {
    const cards = getSavedCards();
    cards.push({ ...card, id: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
};

const deleteCard = (id) => {
    const cards = getSavedCards().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    renderGallery();
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
        color: '#8c3bf6'
    };
    renderCard();
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

    dom.form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!state.cardData.name.trim()) {
            alert('Ponle un nombre a tu tarjeta antes de guardar.');
            return;
        }
        saveCard(state.cardData);
        alert('¡Tarjeta guardada!');
        resetForm();
        window.location.hash = '#/galeria';
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

// ---------- Vista Galería ----------

const crearTarjetaHTML = (card) => {
    const article = document.createElement('article');
    article.className = 'card';

    article.innerHTML = `
        <div class="card-header" style="background-color: ${card.color}"></div>
        <img src="${card.avatarUrl}" alt="Avatar" class="avatar">
        <div class="card-body">
            <h3>${card.name}</h3>
            <p>${card.bio || 'Sin biografía.'}</p>
            <button class="btn-delete" data-id="${card.id}">Eliminar</button>
        </div>
    `;

    article.querySelector('.btn-delete').addEventListener('click', () => {
        deleteCard(card.id);
    });

    return article;
};

const renderGallery = () => {
    const cards = getSavedCards();
    dom.galleryContainer.innerHTML = '';

    if (cards.length === 0) {
        dom.galleryContainer.innerHTML = '<p>Todavía no has guardado ninguna tarjeta.</p>';
        return;
    }

    cards.forEach(card => {
        dom.galleryContainer.appendChild(crearTarjetaHTML(card));
    });
};

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

