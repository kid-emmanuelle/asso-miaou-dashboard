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
    const orderHistoryList = document.getElementById('order-history-list');

    // Clear previous orders
    orderHistoryList.innerHTML = '';

    if (orders.length === 0) {
        orderHistoryList.innerHTML = '<tr><td colspan="5" class="text-center">Aucune commande trouvée</td></tr>';
        return;
    }

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

        // Count number of products
        const productCount = order.numerosSerie.length;

        const row = document.createElement('tr');
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
      </td>
      <td>
        <p class="text-xs font-weight-bold mb-0">${productCount} article(s)</p>
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
    });
}

// Show order details in a modal (placeholder function)
function showOrderDetails(orderId) {
    // Find the order
    fetch(`http://localhost:8080/api/commandes/search/client/${CLIENT_ID}`)
        .then(response => response.json())
        .then(orders => {
            const order = orders.find(o => o.id === orderId);
            if (!order) {
                showNotification('Commande non trouvée');
                return;
            }

            // For simplicity, we'll use an alert to show details
            // In a real application, you would use a modal
            // Create a modal to show order details
            const orderDate = new Date(order.dateCommande).toLocaleDateString('fr-FR');
            const vendor = vendors.find(v => v.id === order.idVendeur) || {prenom: 'Inconnu', nom: 'Inconnu'};

            let message = `
  <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="orderDetailsModalLabel">Détails de la commande du ${orderDate}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p><strong>Vendeur:</strong> ${vendor.prenom} ${vendor.nom}</p>
          <p><strong>Nombre d'articles:</strong> ${order.numerosSerie.length}</p>
          <p><strong>Total:</strong> ${order.prixTotal.toFixed(2)} €</p>
          <p><strong>Produits:</strong></p>
          <ul>
`;

            const productCounts = {};
            order.numerosSerie.forEach(id => {
                productCounts[id] = (productCounts[id] || 0) + 1;
            });

            for (const [productId, count] of Object.entries(productCounts)) {
                message += `<li>ID: ${productId} (x${count})</li>`;
            }

            message += `
          </ul>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
        </div>
      </div>
    </div>
  </div>
`;

            document.body.insertAdjacentHTML('beforeend', message);
            const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
            orderDetailsModal.show();

            // Remove the modal from the DOM when closed
            orderDetailsModal._element.addEventListener('hidden.bs.modal', function () {
                document.body.removeChild(this);
            });
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            showNotification('Erreur lors du chargement des détails de la commande');
        });
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