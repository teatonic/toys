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
            loadHomePage();
        } else {
            localStorage.removeItem('token');
            updateUIForAuthState(false);
        }
    };

    const loadHomePage = async () => {
        const categoriesResponse = await fetch(`${API_URL}/categories`);
        const categories = await categoriesResponse.json();

        const usersResponse = await fetch(`${API_URL}/users`);
        const users = await usersResponse.json();
        console.log(users);

        // Simple icons for categories
        const categoryIcons = {
            'Action Figures': '🦸',
            'Dolls': '🤸',
            'Board Games': '🎲',
            'Puzzles': '🧩',
            'Building Blocks': '🧱',
            'Stuffed Animals': '🧸',
            'Remote Control Toys': '🚗',
            'Educational Toys': '🧠'
        };

        let content = `
            <h2>Categories</h2>
            <div class="category-grid">
                ${categories.map(category => `
                    <div class="category-card" data-category-id="${category.id}">
                        <div class="category-icon">${categoryIcons[category.name] || '❓'}</div>
                        <h3>${category.name}</h3>
                        <p>${category.item_count} items</p>
                    </div>
                `).join('')}
            </div>

            <h2 style="margin-top: 2rem;">Users</h2>
            <div class="user-grid">
                ${users.map(user => `
                    <div class="user-card" data-user-id="${user.id}">
                        <h3>${user.username}</h3>
                        <p>${user.item_count} items</p>
                    </div>
                `).join('')}
            </div>
        `;
        mainContent.innerHTML = content;

        // Add event listeners to the category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categoryId = card.dataset.categoryId;
                loadItemsPage({ categoryId });
            });
        });

        // Add event listeners to the user cards
        document.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', () => {
                const userId = card.dataset.userId;
                loadItemsPage({ userId });
            });
        });
    };

    const loadItemsPage = async (filter) => {
        let url = `${API_URL}/items?`;
        if (filter.categoryId) url += `category=${filter.categoryId}&`;
        if (filter.userId) url += `user=${filter.userId}&`;
        if (filter.search) url += `search=${filter.search}&`;

        const itemsResponse = await fetch(url);
        const items = await itemsResponse.json();

        const categoriesResponse = await fetch(`${API_URL}/categories`);
        const categories = await categoriesResponse.json();

        const usersResponse = await fetch(`${API_URL}/users`);
        const users = await usersResponse.json();

        let heading = 'Items';
        if (filter.categoryId) {
            const category = categories.find(c => c.id == filter.categoryId);
            if (category) heading = category.name;
        } else if (filter.userId) {
            const user = users.find(u => u.id == filter.userId);
            if (user) heading = `Items from ${user.username}`;
        }

        let content = `
            <h2>${heading}</h2>
            <div class="filter-container">
                <input type="search" id="search-input" placeholder="Search for items..." value="${filter.search || ''}">
                <select id="category-filter">
                    <option value="">All Categories</option>
                    ${categories.map(c => `<option value="${c.id}" ${c.id == filter.categoryId ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
                <select id="user-filter">
                    <option value="">All Users</option>
                    ${users.map(u => `<option value="${u.id}" ${u.id == filter.userId ? 'selected' : ''}>${u.username}</option>`).join('')}
                </select>
            </div>
            <div class="item-grid">
                ${items.map(item => `
                    <div class="item-card">
                        <img src="${UPLOADS_URL}/${item.image_file}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        <p class="user">Sold by: ${item.user.username}</p>
                    </div>
                `).join('')}
            </div>
        `;
        mainContent.innerHTML = content;

        const searchInput = document.getElementById('search-input');
        const categoryFilter = document.getElementById('category-filter');
        const userFilter = document.getElementById('user-filter');

        const applyFilters = () => {
            const newFilter = {
                search: searchInput.value,
                categoryId: categoryFilter.value,
                userId: userFilter.value
            };
            loadItemsPage(newFilter);
        };

        searchInput.addEventListener('input', applyFilters);
        categoryFilter.addEventListener('change', applyFilters);
        userFilter.addEventListener('change', applyFilters);
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
            loadHomePage();
        } else {
            mainContent.innerHTML = '<h2>Welcome to Catalog!</h2><p>Please log in to browse our catalog.</p>';
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