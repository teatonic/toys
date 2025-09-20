document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const homeLink = document.getElementById('home-link');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const logoutLink = document.getElementById('logout-link');
    const sellItemLink = document.getElementById('sell-item-link');
    const authLinks = document.getElementById('auth-links');
    const userInfo = document.getElementById('user-info');
    const usernameDisplay = document.getElementById('username-display');

    const API_URL = 'http://127.0.0.1:5000/api';
    const UPLOADS_URL = 'http://127.0.0.1:5000/uploads';

    const loadPage = async (page) => {
        const response = await fetch(page);
        const content = await response.text();
        mainContent.innerHTML = content;
    };

    const updateUIForAuthState = (isAuthenticated, username = '') => {
        if (isAuthenticated) {
            authLinks.style.display = 'none';
            userInfo.style.display = 'block';
            usernameDisplay.textContent = username;
            sellItemLink.style.display = 'inline';
        } else {
            authLinks.style.display = 'block';
            userInfo.style.display = 'none';
            usernameDisplay.textContent = '';
            sellItemLink.style.display = 'none';
        }
    };

    const registerUser = async (username, password) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please log in.');
            loadPage('login.html');
        } else {
            alert(`Registration failed: ${data.msg}`);
        }
    };

    const loginUser = async (username, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.access_token);
            await checkAuthState();
        } else {
            alert(`Login failed: ${data.msg}`);
        }
    };

    const logoutUser = () => {
        localStorage.removeItem('token');
        updateUIForAuthState(false);
        homeLink.click();
    };

    const checkAuthState = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            updateUIForAuthState(false);
            return;
        }

        const response = await fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
            const user = await response.json();
            updateUIForAuthState(true, user.username);
            loadItems();
        } else {
            localStorage.removeItem('token');
            updateUIForAuthState(false);
        }
    };

    const loadItems = async (search = '', category = '') => {
        let url = `${API_URL}/items?`;
        if (search) url += `search=${search}&`;
        if (category) url += `category=${category}&`;

        const response = await fetch(url);
        const items = await response.json();

        const categoriesResponse = await fetch(`${API_URL}/categories`);
        const categories = await categoriesResponse.json();

        let content = `
            <h2>Catalog</h2>
            <div class="filter-container">
                <input type="search" id="search-input" placeholder="Search for items..." value="${search}">
                <select id="category-filter">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c.id}" ${c.id == category ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="item-grid">
                ${items.map(item => `
                    <div class="item-card">
                        <img src="${UPLOADS_URL}/${item.image_file}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <p class="category">${item.category.name}</p>
                    </div>
                `).join('')}
            </div>
        `;
        mainContent.innerHTML = content;

        document.getElementById('search-input').addEventListener('input', (e) => {
            loadItems(e.target.value, document.getElementById('category-filter').value);
        });
        document.getElementById('category-filter').addEventListener('change', (e) => {
            loadItems(document.getElementById('search-input').value, e.target.value);
        });
    };

    const loadAddItemForm = async () => {
        await loadPage('add-item.html');
        const categorySelect = document.getElementById('item-category');
        const response = await fetch(`${API_URL}/categories`);
        const categories = await response.json();
        categorySelect.innerHTML = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    };

    const addItem = async (formData) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/items`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        const data = await response.json();
        if (response.ok) {
            alert('Item added successfully!');
            homeLink.click();
        } else {
            alert(`Failed to add item: ${data.msg}`);
        }
    };

    mainContent.addEventListener('submit', (e) => {
        e.preventDefault();
        if (e.target.id === 'register-form') {
            const username = e.target.querySelector('#register-username').value;
            const password = e.target.querySelector('#register-password').value;
            registerUser(username, password);
        } else if (e.target.id === 'login-form') {
            const username = e.target.querySelector('#login-username').value;
            const password = e.target.querySelector('#login-password').value;
            loginUser(username, password);
        } else if (e.target.id === 'add-item-form') {
            const formData = new FormData();
            formData.append('name', e.target.querySelector('#item-name').value);
            formData.append('description', e.target.querySelector('#item-description').value);
            formData.append('category_id', e.target.querySelector('#item-category').value);
            formData.append('image', e.target.querySelector('#item-image').files[0]);
            addItem(formData);
        }
    });

    homeLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('token')) {
            loadItems();
        } else {
            mainContent.innerHTML = '<h2>Welcome to Sell Stuff!</h2><p>Please log in to browse our catalog.</p>';
        }
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage('login.html');
    });

    registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadPage('register.html');
    });

    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
    });

    sellItemLink.addEventListener('click', (e) => {
        e.preventDefault();
        loadAddItemForm();
    });

    // Initial setup
    checkAuthState();
    if (!localStorage.getItem('token')) {
        homeLink.click();
    }
});
