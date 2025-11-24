// Application principale
document.addEventListener('DOMContentLoaded', function() {
    // Initialisation de l'application
    initApp();
});

function initApp() {
    // Gestion du thème
    initTheme();
    
    // Gestion des notifications
    initNotifications();
    
    // Gestion du panier
    initCart();
    
    // Gestion du formulaire de contact
    initContactForm();
    
    // Gestion des paramètres
    initSettings();
    
    // Gestion de la langue
    initLanguage();
    
    // Chargement des produits
    loadProducts();
}

// Gestion du thème
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Appliquer le thème sauvegardé
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Écouter le changement de thème
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    themeIcon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Gestion des notifications
function initNotifications() {
    const notificationToggle = document.getElementById('notification-toggle');
    const notificationPanel = document.getElementById('notification-panel');
    const closeNotifications = document.getElementById('close-notifications');
    
    notificationToggle.addEventListener('click', function() {
        notificationPanel.classList.toggle('active');
    });
    
    closeNotifications.addEventListener('click', function() {
        notificationPanel.classList.remove('active');
    });
    
    // Simuler des notifications (à remplacer par des vraies notifications)
    setTimeout(() => {
        showNotification('Bienvenue sur ES Company!', 'info');
    }, 2000);
}

function showNotification(message, type = 'info') {
    const notificationCount = document.querySelector('.notification-count');
    const notificationContent = document.querySelector('.notification-content');
    
    // Mettre à jour le compteur
    let count = parseInt(notificationCount.textContent) || 0;
    count++;
    notificationCount.textContent = count;
    notificationCount.style.display = 'flex';
    
    // Ajouter la notification
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification-item notification-${type}`;
    notificationElement.innerHTML = `
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    
    if (notificationContent.querySelector('p').textContent === 'Aucune notification pour le moment.') {
        notificationContent.innerHTML = '';
    }
    
    notificationContent.prepend(notificationElement);
    
    // Notification push (si autorisé)
    if (Notification.permission === 'granted') {
        new Notification('ES Company', {
            body: message,
            icon: '/favicon.ico'
        });
    }
}

// Gestion du panier
function initCart() {
    const cartToggle = document.getElementById('cart-toggle');
    const cartPanel = document.getElementById('cart-panel');
    const closeCart = document.getElementById('close-cart');
    
    cartToggle.addEventListener('click', function() {
        cartPanel.classList.toggle('active');
    });
    
    closeCart.addEventListener('click', function() {
        cartPanel.classList.remove('active');
    });
    
    // Charger le panier depuis le localStorage
    loadCart();
}

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartDisplay(cart);
}

function updateCartDisplay(cart) {
    const cartCount = document.querySelector('.cart-count');
    const cartContent = document.querySelector('.cart-content');
    const cartTotal = document.querySelector('.cart-total span');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Mettre à jour le compteur
    cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    
    if (cart.length === 0) {
        cartContent.innerHTML = '<p>Votre panier est vide.</p>';
        cartTotal.textContent = '0.00 €';
        checkoutBtn.disabled = true;
        return;
    }
    
    // Calculer le total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `${total.toFixed(2)} €`;
    checkoutBtn.disabled = false;
    
    // Afficher les articles du panier
    cartContent.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price.toFixed(2)} € x ${item.quantity}</p>
            </div>
            <div class="cart-item-actions">
                <button class="decrease-quantity" data-id="${item.id}">-</button>
                <button class="increase-quantity" data-id="${item.id}">+</button>
                <button class="remove-from-cart" data-id="${item.id}"><i class="fas fa-trash"></i></button>
            </div>
        `;
        cartContent.appendChild(cartItem);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            decreaseQuantity(productId);
        });
    });
    
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            increaseQuantity(productId);
        });
    });
    
    document.querySelectorAll('.remove-from-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            removeFromCart(productId);
        });
    });
}

function addToCart(product) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay(cart);
    
    // Afficher une notification
    showNotification(`${product.name} ajouté au panier`, 'success');
}

function decreaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay(cart);
    }
}

function increaseQuantity(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += 1;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay(cart);
    }
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay(cart);
    
    // Afficher une notification
    showNotification('Produit retiré du panier', 'info');
}

// Gestion du formulaire de contact
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les données du formulaire
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };
        
        // Simuler l'envoi du formulaire (à remplacer par une vraie requête)
        console.log('Données du formulaire:', data);
        
        // Afficher un message de succès
        alert('Votre message a été envoyé avec succès! Nous vous répondrons dans les plus brefs délais.');
        
        // Réinitialiser le formulaire
        contactForm.reset();
        
        // Envoyer une notification
        showNotification('Votre message a été envoyé avec succès!', 'success');
    });
}

// Gestion des paramètres
function initSettings() {
    const settingsLink = document.getElementById('settings-link');
    const settingsModal = document.getElementById('settings-modal');
    const closeModal = document.querySelector('.close-modal');
    
    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        settingsModal.classList.add('active');
    });
    
    closeModal.addEventListener('click', function() {
        settingsModal.classList.remove('active');
    });
    
    // Fermer la modal en cliquant à l'extérieur
    settingsModal.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Gérer les paramètres
    const pushNotifications = document.getElementById('push-notifications');
    const settingsLanguage = document.getElementById('settings-language');
    const settingsTheme = document.getElementById('settings-theme');
    
    // Charger les paramètres sauvegardés
    const savedSettings = JSON.parse(localStorage.getItem('settings')) || {};
    
    if (savedSettings.pushNotifications !== undefined) {
        pushNotifications.checked = savedSettings.pushNotifications;
    }
    
    if (savedSettings.language) {
        settingsLanguage.value = savedSettings.language;
    }
    
    if (savedSettings.theme) {
        settingsTheme.value = savedSettings.theme;
    }
    
    // Sauvegarder les paramètres
    pushNotifications.addEventListener('change', saveSettings);
    settingsLanguage.addEventListener('change', saveSettings);
    settingsTheme.addEventListener('change', function() {
        saveSettings();
        applyThemeFromSettings();
    });
    
    // Demander la permission pour les notifications push
    if ('Notification' in window && Notification.permission === 'default') {
        setTimeout(() => {
            Notification.requestPermission();
        }, 2000);
    }
}

function saveSettings() {
    const pushNotifications = document.getElementById('push-notifications').checked;
    const language = document.getElementById('settings-language').value;
    const theme = document.getElementById('settings-theme').value;
    
    const settings = {
        pushNotifications,
        language,
        theme
    };
    
    localStorage.setItem('settings', JSON.stringify(settings));
}

function applyThemeFromSettings() {
    const settings = JSON.parse(localStorage.getItem('settings')) || {};
    const themeToggle = document.getElementById('theme-toggle');
    
    if (settings.theme === 'auto') {
        // Détecter la préférence système
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        updateThemeIcon(prefersDark ? 'dark' : 'light');
    } else if (settings.theme === 'light' || settings.theme === 'dark') {
        document.documentElement.setAttribute('data-theme', settings.theme);
        updateThemeIcon(settings.theme);
    }
}

// Gestion de la langue
function initLanguage() {
    const languageSelect = document.getElementById('language-select');
    const settingsLanguage = document.getElementById('settings-language');
    
    // Charger la langue sauvegardée
    const savedLanguage = localStorage.getItem('language') || 'fr';
    languageSelect.value = savedLanguage;
    settingsLanguage.value = savedLanguage;
    
    // Écouter les changements de langue
    languageSelect.addEventListener('change', function() {
        const language = this.value;
        localStorage.setItem('language', language);
        settingsLanguage.value = language;
        applyLanguage(language);
    });
    
    settingsLanguage.addEventListener('change', function() {
        const language = this.value;
        localStorage.setItem('language', language);
        languageSelect.value = language;
        applyLanguage(language);
    });
}

function applyLanguage(language) {
    // Traductions (à compléter)
    const translations = {
        fr: {
            welcome: "Bienvenue chez ES Company",
            products: "Nos Produits",
            about: "À propos de nous",
            contact: "Contactez-nous",
            cart: "Votre Panier",
            notifications: "Notifications",
            emptyCart: "Votre panier est vide.",
            total: "Total",
            checkout: "Passer à la caisse",
            send: "Envoyer",
            name: "Nom",
            email: "Email",
            subject: "Sujet",
            message: "Message",
            noProducts: "Aucun produit disponible pour le moment.",
            companyDescription: "ES Company est une entreprise spécialisée dans la vente de produits numériques de qualité. Notre mission est de fournir à nos clients des solutions innovantes et performantes."
        },
        en: {
            welcome: "Welcome to ES Company",
            products: "Our Products",
            about: "About Us",
            contact: "Contact Us",
            cart: "Your Cart",
            notifications: "Notifications",
            emptyCart: "Your cart is empty.",
            total: "Total",
            checkout: "Checkout",
            send: "Send",
            name: "Name",
            email: "Email",
            subject: "Subject",
            message: "Message",
            noProducts: "No products available at the moment.",
            companyDescription: "ES Company is a company specialized in selling quality digital products. Our mission is to provide our customers with innovative and efficient solutions."
        },
        ht: {
            welcome: "Byenveni nan ES Company",
            products: "Pwodui nou yo",
            about: "A pwopo nou",
            contact: "Kontakte nou",
            cart: "Panye ou",
            notifications: "Notifikasyon",
            emptyCart: "Panye ou a vid.",
            total: "Total",
            checkout: "Fè kòmand",
            send: "Voye",
            name: "Non",
            email: "Imèl",
            subject: "Sijè",
            message: "Mesaj",
            noProducts: "Pa gen pwodui ki disponib pou moman sa a.",
            companyDescription: "ES Company se yon konpayi ki espesyalize nan vann pwodui dijital kalite. Misyon nou se bay kliyan nou yo solisyon inovatè ak efikas."
        }
    };
    
    // Appliquer les traductions
    const t = translations[language] || translations.fr;
    
    document.querySelector('.hero h2').textContent = t.welcome;
    document.querySelector('#products h2').textContent = t.products;
    document.querySelector('#about h2').textContent = t.about;
    document.querySelector('#contact h2').textContent = t.contact;
    document.querySelector('.cart-header h3').textContent = t.cart;
    document.querySelector('.notification-header h3').textContent = t.notifications;
    document.querySelector('.checkout-btn').textContent = t.checkout;
    document.querySelector('#contact-form button').textContent = t.send;
    
    // Mettre à jour les labels du formulaire
    document.querySelector('label[for="name"]').textContent = t.name;
    document.querySelector('label[for="email"]').textContent = t.email;
    document.querySelector('label[for="subject"]').textContent = t.subject;
    document.querySelector('label[for="message"]').textContent = t.message;
    
    // Mettre à jour la description de l'entreprise
    document.querySelector('#about p').textContent = t.companyDescription;
    
    // Mettre à jour le message du panier vide
    const emptyCartMessage = document.querySelector('.cart-content p');
    if (emptyCartMessage && emptyCartMessage.textContent.includes('Votre panier est vide')) {
        emptyCartMessage.textContent = t.emptyCart;
    }
    
    // Mettre à jour le label du total
    const totalLabel = document.querySelector('.cart-total p');
    if (totalLabel) {
        totalLabel.innerHTML = `${t.total}: <span>0.00 €</span>`;
    }
    
    // Mettre à jour le message "aucun produit"
    const noProductsMessage = document.querySelector('.no-products');
    if (noProductsMessage) {
        noProductsMessage.textContent = t.noProducts;
    }
}

// Chargement des produits
function loadProducts() {
    // Récupérer les produits depuis le localStorage (ou une API)
    const products = JSON.parse(localStorage.getItem('products')) || [];
    displayProducts(products);
}

function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">Aucun produit disponible pour le moment.</p>';
        return;
    }
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <i class="fas fa-box fa-3x"></i>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">${product.price.toFixed(2)} €</p>
                <button class="add-to-cart" data-id="${product.id}">Ajouter au panier</button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons "Ajouter au panier"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            const product = products.find(p => p.id === productId);
            
            if (product) {
                addToCart(product);
            }
        });
    });
}

// Fonction pour ajouter un produit (utilisée par l'admin)
function addProduct(product) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    displayProducts(products);
}

// Fonction pour supprimer un produit (utilisée par l'admin)
function deleteProduct(productId) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    displayProducts(products);
}

// Initialiser les paramètres au chargement
window.addEventListener('load', function() {
    applyThemeFromSettings();
    applyLanguage(localStorage.getItem('language') || 'fr');
});
