// Panel d'administration
document.addEventListener('DOMContentLoaded', function() {
    initAdmin();
});

function initAdmin() {
    // Navigation
    initNavigation();
    
    // Gestion des produits
    initProductsManagement();
    
    // Sauvegarde
    initBackup();
    
    // Paramètres
    initAdminSettings();
    
    // Charger les données
    loadAdminData();
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.admin-nav a');
    const sections = document.querySelectorAll('.admin-section');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    
    // Navigation entre les sections
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Masquer toutes les sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Afficher la section correspondante
            const targetId = this.getAttribute('href').substring(1);
            document.getElementById(targetId).classList.add('active');
            
            // Mettre à jour le titre de l'en-tête
            document.querySelector('.admin-header h1').textContent = this.textContent.trim();
        });
    });
    
    // Basculer la sidebar
    sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        document.querySelector('.admin-main').classList.toggle('sidebar-collapsed');
    });
}

// Gestion des produits
function initProductsManagement() {
    const addProductBtn = document.getElementById('add-product-btn');
    const addProductModal = document.getElementById('add-product-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const addProductForm = document.getElementById('add-product-form');
    
    // Ouvrir le modal d'ajout de produit
    addProductBtn.addEventListener('click', function() {
        addProductModal.classList.add('active');
    });
    
    // Fermer le modal
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            addProductModal.classList.remove('active');
        });
    });
    
    // Fermer le modal en cliquant à l'extérieur
    addProductModal.addEventListener('click', function(e) {
        if (e.target === addProductModal) {
            addProductModal.classList.remove('active');
        }
    });
    
    // Soumission du formulaire d'ajout de produit
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const productName = document.getElementById('product-name').value;
        const productPrice = parseFloat(document.getElementById('product-price').value);
        const productDescription = document.getElementById('product-description').value;
        const productImage = document.getElementById('product-image').value;
        
        const newProduct = {
            id: generateId(),
            name: productName,
            price: productPrice,
            description: productDescription,
            image: productImage || null,
            createdAt: new Date().toISOString()
        };
        
        addProductToAdmin(newProduct);
        addProductModal.classList.remove('active');
        addProductForm.reset();
        
        // Afficher un message de succès
        alert('Produit ajouté avec succès!');
    });
}

function generateId() {
    return 'prod_' + Math.random().toString(36).substr(2, 9);
}

function addProductToAdmin(product) {
    // Ajouter le produit au localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Mettre à jour l'affichage
    displayProductsInAdmin(products);
    updateStats();
}

function displayProductsInAdmin(products) {
    const tableBody = document.getElementById('products-table-body');
    
    if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucun produit disponible.</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price.toFixed(2)} €</td>
            <td>${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</td>
            <td class="actions">
                <button class="action-btn edit-btn" data-id="${product.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" data-id="${product.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Ajouter les écouteurs d'événements pour les boutons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            editProduct(productId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = this.getAttribute('data-id');
            deleteProductFromAdmin(productId);
        });
    });
}

function editProduct(productId) {
    // Récupérer le produit
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id === productId);
    
    if (product) {
        // Remplir le formulaire avec les données du produit
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-image').value = product.image || '';
        
        // Modifier le modal pour l'édition
        const modal = document.getElementById('add-product-modal');
        const modalHeader = modal.querySelector('.modal-header h3');
        const submitBtn = modal.querySelector('.btn-primary');
        
        modalHeader.textContent = 'Modifier le produit';
        submitBtn.textContent = 'Modifier le produit';
        
        // Ouvrir le modal
        modal.classList.add('active');
        
        // Modifier le comportement du formulaire pour l'édition
        const form = document.getElementById('add-product-form');
        const originalSubmit = form.onsubmit;
        
        form.onsubmit = function(e) {
            e.preventDefault();
            
            // Mettre à jour le produit
            product.name = document.getElementById('product-name').value;
            product.price = parseFloat(document.getElementById('product-price').value);
            product.description = document.getElementById('product-description').value;
            product.image = document.getElementById('product-image').value || null;
            
            // Sauvegarder les modifications
            localStorage.setItem('products', JSON.stringify(products));
            displayProductsInAdmin(products);
            
            // Fermer le modal
            modal.classList.remove('active');
            
            // Restaurer le comportement original
            form.onsubmit = originalSubmit;
            modalHeader.textContent = 'Ajouter un produit';
            submitBtn.textContent = 'Ajouter le produit';
            form.reset();
            
            alert('Produit modifié avec succès!');
        };
    }
}

function deleteProductFromAdmin(productId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== productId);
        
        localStorage.setItem('products', JSON.stringify(products));
        displayProductsInAdmin(products);
        updateStats();
        
        alert('Produit supprimé avec succès!');
    }
}

// Sauvegarde
function initBackup() {
    const backupBtn = document.getElementById('backup-btn');
    
    backupBtn.addEventListener('click', function() {
        createBackup();
    });
}

function createBackup() {
    // Récupérer toutes les données
    const data = {
        products: JSON.parse(localStorage.getItem('products')) || [],
        orders: JSON.parse(localStorage.getItem('orders')) || [],
        customers: JSON.parse(localStorage.getItem('customers')) || [],
        messages: JSON.parse(localStorage.getItem('messages')) || [],
        settings: JSON.parse(localStorage.getItem('settings')) || {},
        timestamp: new Date().toISOString()
    };
    
    // Créer un blob et télécharger
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `es-company-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Sauvegarde créée avec succès!');
}

// Paramètres de l'admin
function initAdminSettings() {
    const saveSettingsBtn = document.getElementById('save-settings');
    
    saveSettingsBtn.addEventListener('click', function() {
        saveAdminSettings();
    });
    
    // Charger les paramètres existants
    loadAdminSettings();
}

function loadAdminSettings() {
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || {};
    
    if (settings.siteName) {
        document.getElementById('site-name').value = settings.siteName;
    }
    
    if (settings.siteEmail) {
        document.getElementById('site-email').value = settings.siteEmail;
    }
    
    if (settings.sitePhone) {
        document.getElementById('site-phone').value = settings.sitePhone;
    }
    
    if (settings.backupFrequency) {
        document.getElementById('backup-frequency').value = settings.backupFrequency;
    }
}

function saveAdminSettings() {
    const settings = {
        siteName: document.getElementById('site-name').value,
        siteEmail: document.getElementById('site-email').value,
        sitePhone: document.getElementById('site-phone').value,
        backupFrequency: document.getElementById('backup-frequency').value
    };
    
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    alert('Paramètres enregistrés avec succès!');
}

// Chargement des données de l'admin
function loadAdminData() {
    // Charger les produits
    const products = JSON.parse(localStorage.getItem('products')) || [];
    displayProductsInAdmin(products);
    
    // Mettre à jour les statistiques
    updateStats();
}

function updateStats() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const customers = JSON.parse(localStorage.getItem('customers')) || [];
    const messages = JSON.parse(localStorage.getItem('messages')) || [];
    
    document.getElementById('products-count').textContent = products.length;
    document.getElementById('orders-count').textContent = orders.length;
    document.getElementById('customers-count').textContent = customers.length;
    document.getElementById('messages-count').textContent = messages.length;
}

// Déconnexion
document.getElementById('logout-btn').addEventListener('click', function() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        // Rediriger vers la page d'accueil
        window.location.href = '../index.html';
    }
});
