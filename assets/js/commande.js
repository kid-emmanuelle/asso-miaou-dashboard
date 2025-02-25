// Get current user ID from localStorage
const CLIENT_ID = localStorage.getItem('userId');

// Store vendors data
let vendors = [];
// Store products data
let products = [];
// Store cart items
let cart = [];

// Fetch all active members (vendors) and order history when page loads
document.addEventListener('DOMContentLoaded', function () {
    fetchVendors();
    fetchOrderHistory();
});

// Fetch vendors from API
function fetchVendors() {
    fetch('http://localhost:8080/api/membres/actifs')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            vendors = data;
            populateVendorSelect(data);
        })
        .catch(error => {
            console.error('Error fetching vendors:', error);
            showNotification('Erreur lors du chargement des vendeurs. Veuillez réessayer plus tard.');
        });
}

// Populate vendor select dropdown
function populateVendorSelect(vendors) {
    const vendorSelect = document.getElementById('vendeur-select');

    // Clear existing options except the default
    while (vendorSelect.options.length > 1) {
        vendorSelect.remove(1);
    }

    // Add vendors to dropdown
    vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.id;
        option.setAttribute('data-group', vendor.numeroGroupe);
        option.textContent = `${vendor.prenom} ${vendor.nom}`;
        vendorSelect.appendChild(option);
    });
}

// Load products when a vendor is selected
function loadProducts() {
    const vendorSelect = document.getElementById('vendeur-select');
    const vendorId = vendorSelect.value;

    if (!vendorId) return;

    // Get the selected vendor's group number
    const selectedOption = vendorSelect.options[vendorSelect.selectedIndex];
    const groupNumber = selectedOption.getAttribute('data-group');

    // Fetch products for this group
    fetch(`http://localhost:8080/api/materiels/groupe/${groupNumber}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            products = data;
            displayProducts(data);

            // Show products and cart containers
            document.getElementById('products-container').style.display = 'block';
            document.getElementById('cart-container').style.display = 'block';
            document.getElementById('confirm-container').style.display = 'block';

            // Initialize cart if empty
            if (cart.length === 0) {
                document.getElementById('cart-items').innerHTML = '<tr><td colspan="5" class="text-center">Votre panier est vide</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            showNotification('Erreur lors du chargement des produits. Veuillez réessayer plus tard.');
        });
}

// Display products in the table
function displayProducts(products) {
    const productsList = document.getElementById('products-list');

    // Clear previous products
    productsList.innerHTML = '';

    if (products.length === 0) {
        productsList.innerHTML = '<tr><td colspan="6" class="text-center">Aucun produit disponible pour ce groupe</td></tr>';
        return;
    }

    // Add products to the list
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
      <td>
        <div class="d-flex px-2 py-1">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${product.marque}</h6>
            <p class="text-xs text-secondary mb-0">N° série: ${product.numeroSerie}</p>
          </div>
        </div>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${product.type}</p>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${product.modele}</p>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${product.prix.toFixed(2)} €</p>
      </td>
      <td>
        <input type="number" class="form-control form-control-sm" min="0" max="10" value="0" id="qty-${product.id}">
      </td>
      <td>
        <button class="btn btn-link text-secondary mb-0" onclick="addToCart('${product.id}')">
          <i class="fa fa-plus text-xs"></i> Ajouter
        </button>
      </td>
    `;
        productsList.appendChild(row);
    });
}

// Add product to cart
function addToCart(productId) {
    const quantity = parseInt(document.getElementById(`qty-${productId}`).value);
    if (quantity <= 0) {
        showNotification('Veuillez sélectionner une quantité valide');
        return;
    }

    // Find the product in our products array
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Produit non trouvé');
        return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.product.id === productId);

    if (existingItem) {
        // Update quantity if already in cart
        existingItem.quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            product: product,
            quantity: quantity
        });
    }

    // Reset quantity input
    document.getElementById(`qty-${productId}`).value = 0;

    // Update cart display
    updateCartDisplay();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCartDisplay();
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = '<tr><td colspan="5" class="text-center">Votre panier est vide</td></tr>';
        cartTotal.textContent = '0.00 €';
        return;
    }

    let total = 0;
    cartItems.innerHTML = '';

    cart.forEach(item => {
        const itemTotal = item.product.prix * item.quantity;
        total += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
      <td>
        <div class="d-flex px-2 py-1">
          <div class="d-flex flex-column justify-content-center">
            <h6 class="mb-0 text-sm">${item.product.marque} ${item.product.modele}</h6>
            <p class="text-xs text-secondary mb-0">N° série: ${item.product.numeroSerie}</p>
          </div>
        </div>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${item.product.prix.toFixed(2)} €</p>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${item.quantity}</p>
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${itemTotal.toFixed(2)} €</p>
      </td>
      <td>
        <button class="btn btn-link text-danger mb-0" onclick="removeFromCart('${item.product.id}')">
          <i class="fa fa-trash text-xs"></i> Supprimer
        </button>
      </td>
    `;
        cartItems.appendChild(row);
    });

    cartTotal.textContent = `${total.toFixed(2)} €`;
}

function confirmOrder() {
    if (cart.length === 0) {
        showNotification('Votre panier est vide. Veuillez ajouter des produits avant de confirmer.');
        return;
    }

    // Get selected vendor ID
    const vendorId = document.getElementById('vendeur-select').value;

    // Calculate total price
    const totalPrice = cart.reduce((sum, item) => sum + (item.product.prix * item.quantity), 0);

    // Create array of product IDs (repeated according to quantity)
    const productIds = [];
    cart.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            productIds.push(item.product.id);
        }
    });

    // Prepare order data
    const orderData = {
        idClient: CLIENT_ID,
        idVendeur: vendorId,
        dateCommande: new Date().toISOString(),
        numerosSerie: productIds,
        prixTotal: totalPrice
    };

    // Send order to API
    fetch('http://localhost:8080/api/commandes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            const successAlert = document.getElementById('order-success');
            successAlert.classList.add('show');

            // Reset cart
            cart = [];
            updateCartDisplay();

            // Hide product list and cart
            document.getElementById('products-container').style.display = 'none';
            document.getElementById('cart-container').style.display = 'none';
            document.getElementById('confirm-container').style.display = 'none';

            // Reset vendor selection
            document.getElementById('vendeur-select').value = '';

            // Auto-hide alert after 5 seconds
            setTimeout(() => {
                successAlert.classList.remove('show');
            }, 5000);

            // Refresh order history
            fetchOrderHistory();
        })
        .catch(error => {
            console.error('Error creating order:', error);
            showNotification('Erreur lors de la création de la commande. Veuillez réessayer plus tard.');
        });
}

// Fetch order history
function fetchOrderHistory() {
    // If no client ID, exit early
    if (!CLIENT_ID) {
        console.error('Client ID not found in localStorage');
        return;
    }

    fetch(`http://localhost:8080/api/commandes/search/client/${CLIENT_ID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayOrderHistory(data);
        })
        .catch(error => {
            console.error('Error fetching order history:', error);
        });
}

// Display order history
function displayOrderHistory(orders) {
    const orderHistoryContainer = document.getElementById('order-history-content');

    // Clear previous content
    orderHistoryContainer.innerHTML = '';

    if (orders.length === 0) {
        orderHistoryContainer.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Aucune commande trouvée dans votre historique.
            </div>
        `;
        return;
    }

    // Calculate total amount
    const totalAmount = orders.reduce((sum, order) => sum + order.prixTotal, 0);

    // Create summary alert
    const summaryHTML = `
    `;

    // Create table for orders
    const tableHTML = `
        <div class="table-responsive">
            <table class="table align-items-center mb-0">
                <thead>
                    <tr>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">DATE</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">VENDEUR</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">PRODUITS</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">TOTAL</th>
                        <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">DÉTAILS</th>
                    </tr>
                </thead>
                <tbody id="order-history-list">
                </tbody>
            </table>
        </div>
    `;

    // Add summary and table to container
    orderHistoryContainer.innerHTML = summaryHTML + tableHTML;

    // Get the table body
    const orderHistoryList = document.getElementById('order-history-list');

    // Reverse the array to show most recent orders first
    orders.reverse().forEach(order => {
        // Format the date
        const orderDate = new Date(order.dateCommande);
        const formattedDate = orderDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Find vendor info
        const vendor = vendors.find(v => v.id === order.idVendeur) || {prenom: 'Inconnu', nom: 'Inconnu'};

        // Group products by type for better display
        const productTypes = {};
        const promises = [];

        // Collect all unique material IDs
        const uniqueMaterialIds = [...new Set(order.numerosSerie)];

        // Fetch material details if needed
        uniqueMaterialIds.forEach(materialId => {
            if (!materialCache) materialCache = {};

            if (!materialCache[materialId]) {
                const promise = fetch(`http://localhost:8080/api/materiels/${materialId}`)
                    .then(response => response.json())
                    .then(material => {
                        materialCache[materialId] = material;
                    })
                    .catch(() => {
                        materialCache[materialId] = { type: 'INCONNU', marque: 'Inconnu', modele: 'Inconnu' };
                    });
                promises.push(promise);
            }
        });

        // Create and add row with loading state
        const row = document.createElement('tr');
        row.id = `order-row-${order.id}`;
        row.innerHTML = `
            <td>
                <div class="d-flex px-2 py-1">
                    <div class="d-flex flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${formattedDate}</h6>
                        <p class="text-xs text-secondary mb-0">ID: ${order.id.substring(0, 8)}...</p>
                    </div>
                </div>
            </td>
            <td>
                <p class="text-xs font-weight-bold mb-0">${vendor.prenom} ${vendor.nom}</p>
                <p class="text-xs text-secondary mb-0">${vendor.email || ''}</p>
            </td>
            <td>
                <p class="text-xs font-weight-bold mb-0">${order.numerosSerie.length} article(s)</p>
                <p class="text-xs text-secondary mb-0">Chargement...</p>
            </td>
            <td>
                <p class="text-xs font-weight-bold mb-0">${order.prixTotal.toFixed(2)} €</p>
            </td>
            <td>
                <button class="btn btn-link text-primary mb-0" onclick="showOrderDetails('${order.id}')">
                    <i class="fas fa-info-circle text-xs"></i> Détails
                </button>
            </td>
        `;
        orderHistoryList.appendChild(row);

        // After all materials are fetched, update product info
        Promise.all(promises).then(() => {
            // Count products by type
            order.numerosSerie.forEach(materialId => {
                const type = materialCache[materialId]?.type || 'INCONNU';
                productTypes[type] = (productTypes[type] || 0) + 1;
            });

            // Format material summary
            const materialSummary = Object.entries(productTypes)
                .map(([type, count]) => `${count} × ${type}`)
                .join(', ');

            // Update the row with product type information
            const productsCell = row.querySelector('td:nth-child(3)');
            if (productsCell) {
                productsCell.innerHTML = `
                    <p class="text-xs font-weight-bold mb-0">${order.numerosSerie.length} article(s)</p>
                    <p class="text-xs text-secondary mb-0">${materialSummary}</p>
                `;
            }
        });
    });
}

// Initialize material cache if it doesn't exist
let materialCache = {};

// Show order details in a modal with improved UI
function showOrderDetails(orderId) {
    // Find the order
    fetch(`http://localhost:8080/api/commandes/search/client/${CLIENT_ID}`)
        .then(response => response.json())
        .then(async orders => {
            const order = orders.find(o => o.id === orderId);
            if (!order) {
                showNotification('Commande non trouvée');
                return;
            }

            // Format date
            const orderDate = new Date(order.dateCommande);
            const formattedDate = orderDate.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Get vendor details
            const vendor = vendors.find(v => v.id === order.idVendeur) || {prenom: 'Inconnu', nom: 'Inconnu'};

            // Get material details for each unique material
            const uniqueMaterialIds = [...new Set(order.numerosSerie)];
            const materialDetails = [];

            // Fetch material details if not in cache
            for (const materialId of uniqueMaterialIds) {
                if (!materialCache[materialId]) {
                    try {
                        const response = await fetch(`http://localhost:8080/api/materiels/${materialId}`);
                        materialCache[materialId] = await response.json();
                    } catch (error) {
                        materialCache[materialId] = {
                            id: materialId,
                            type: 'INCONNU',
                            marque: 'Inconnu',
                            modele: 'Inconnu',
                            prix: 0
                        };
                    }
                }

                // Count occurrences of this material
                const count = order.numerosSerie.filter(id => id === materialId).length;
                materialDetails.push({
                    ...materialCache[materialId],
                    count
                });
            }

            // Create modal HTML
            const modalHTML = `
                <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="orderDetailsModalLabel">Détails de la commande</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row mb-4">
                                    <div class="col-md-6">
                                        <h6 class="text-sm">Informations générales</h6>
                                        <p class="text-xs mb-1"><strong>ID:</strong> ${order.id}</p>
                                        <p class="text-xs mb-1"><strong>Date:</strong> ${formattedDate}</p>
                                        <p class="text-xs mb-1"><strong>Total:</strong> ${order.prixTotal.toFixed(2)} €</p>
                                    </div>
                                    <div class="col-md-6">
                                        <h6 class="text-sm">Vendeur</h6>
                                        <p class="text-xs mb-1"><strong>Nom:</strong> ${vendor.prenom} ${vendor.nom}</p>
                                        <p class="text-xs mb-1"><strong>Email:</strong> ${vendor.email || 'N/A'}</p>
                                        <p class="text-xs mb-1"><strong>Groupe:</strong> ${vendor.numeroGroupe || 'N/A'}</p>
                                    </div>
                                </div>
                                
                                <h6 class="text-sm mb-3">Articles (${order.numerosSerie.length})</h6>
                                <div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Marque</th>
                                                <th>Modèle</th>
                                                <th>Type</th>
                                                <th>Prix unitaire</th>
                                                <th>Quantité</th>
                                                <th>Sous-total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${materialDetails.map(material => `
                                                <tr>
                                                    <td>${material.marque}</td>
                                                    <td>${material.modele}</td>
                                                    <td><span class="badge bg-light text-dark">${material.type}</span></td>
                                                    <td>${material.prix ? material.prix.toFixed(2) + ' €' : 'N/A'}</td>
                                                    <td>${material.count}</td>
                                                    <td>${material.prix ? (material.prix * material.count).toFixed(2) + ' €' : 'N/A'}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td colspan="5" class="text-end"><strong>Total:</strong></td>
                                                <td><strong>${order.prixTotal.toFixed(2)} €</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                                <button type="button" class="btn btn-primary" onclick="printOrderDetails()">
                                    <i class="fas fa-print me-2"></i>Imprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Add modal to body
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = modalHTML;
            document.body.appendChild(modalContainer);

            // Initialize and show the modal
            const modal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
            modal.show();

            // Remove modal from DOM when hidden
            document.getElementById('orderDetailsModal').addEventListener('hidden.bs.modal', function() {
                document.body.removeChild(modalContainer);
            });
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            showNotification('Erreur lors du chargement des détails de la commande');
        });
}

// Print order details
function printOrderDetails() {
    const modalContent = document.querySelector('.modal-content').cloneNode(true);

    // Remove buttons
    modalContent.querySelector('.modal-footer').remove();
    modalContent.querySelector('.btn-close').remove();

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Détails de la commande</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <style>
                    body { padding: 20px; }
                    @media print {
                        body { padding: 0; }
                        .modal-header { border-bottom: 1px solid #dee2e6; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="row mb-4">
                        <div class="col-12 text-center">
                            <h4>Association Miaou - Détail de commande</h4>
                        </div>
                    </div>
                    ${modalContent.outerHTML}
                </div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
}

// Toggle order history visibility
function toggleOrderHistory() {
    const orderHistoryContent = document.getElementById('order-history-content');
    orderHistoryContent.style.display = orderHistoryContent.style.display === 'none' ? 'block' : 'none';
}

// Search functionality
document.getElementById('search-product').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    const rows = document.getElementById('products-list').getElementsByTagName('tr');

    Array.from(rows).forEach(row => {
        const brand = row.querySelector('h6')?.textContent.toLowerCase() || '';
        const model = row.querySelectorAll('td')[2]?.textContent.toLowerCase() || '';
        const type = row.querySelectorAll('td')[1]?.textContent.toLowerCase() || '';

        if (brand.includes(searchTerm) || model.includes(searchTerm) || type.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
});

function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerText = message;

    var closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function () {
        document.body.removeChild(notification);
    };

    notification.appendChild(closeButton);
    document.body.appendChild(notification);

    setTimeout(function () {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2000);
}