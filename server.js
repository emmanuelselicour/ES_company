const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir tous les fichiers statiques

// Fichier de données
const DATA_FILE = path.join(__dirname, 'products.json');

// Initialiser les données
function initializeData() {
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            products: [],
            orders: [],
            messages: []
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
}

// Lire les données
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { products: [], orders: [], messages: [] };
    }
}

// Écrire les données
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

// ===== ROUTES API =====

// GET - Tous les produits
app.get('/api/products', (req, res) => {
    const data = readData();
    res.json(data.products);
});

// POST - Ajouter un produit
app.post('/api/products', (req, res) => {
    const { name, price, description, image } = req.body;
    
    const data = readData();
    const newProduct = {
        id: 'prod_' + Date.now(),
        name: name,
        price: parseFloat(price),
        description: description || '',
        image: image || null,
        createdAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    writeData(data);
    
    res.json({ success: true, product: newProduct });
});

// DELETE - Supprimer un produit
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const data = readData();
    
    const initialLength = data.products.length;
    data.products = data.products.filter(p => p.id !== productId);
    
    if (data.products.length < initialLength) {
        writeData(data);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Produit non trouvé' });
    }
});

// Route pour toutes les autres requêtes - servir les fichiers HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Initialiser
initializeData();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ES Company démarré sur le port ${PORT}`);
});
