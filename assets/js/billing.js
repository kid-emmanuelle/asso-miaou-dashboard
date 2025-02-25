document.addEventListener('DOMContentLoaded', function () {
    const userId = localStorage.getItem('userId');
    if (userId) {
        console.log('User ID:', userId);

        // Fetch user data and display name of the card holder
        fetch(`http://localhost:8080/api/membres/${userId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('titulaire-de-carte').textContent = `${data.prenom} ${data.nom}`;
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                showNotification('Erreur lors de la récupération des données utilisateur.');
            });

        // Fetch total price
        fetch(`http://localhost:8080/api/commandes/search/totalprice/${userId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-price').textContent = `+€${data}`;
            })
            .catch(error => {
                console.error('Error fetching total price:', error);
                showNotification('Erreur lors de la récupération du prix total.');
            });

        // Fetch total orders
        fetch(`http://localhost:8080/api/commandes/search/amount/${userId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-orders').textContent = data;
            })
            .catch(error => {
                console.error('Error fetching total orders:', error);
                showNotification('Erreur lors de la récupération du nombre de commandes.');
            });

        // Fetch last 5 factures
        fetch(`http://localhost:8080/api/commandes/search/vendeur/${userId}`)
            .then(response => response.json())
            .then(data => {
                const facturesList = document.getElementById('factures-list');
                facturesList.innerHTML = ''; // Clear existing content

                const facturesToShow = data.slice(0, 5); // Show maximum 5 factures
                facturesToShow.forEach(facture => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg';
                    listItem.innerHTML = `
                <div class="d-flex flex-column">
                    <h6 class="mb-1 text-dark font-weight-bold text-sm">${new Date(facture.dateCommande).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    })}</h6>
                    <span class="text-xs">#${facture.id}</span>
                </div>
                <div class="d-flex align-items-center text-sm">
                    €${facture.prixTotal.toFixed(2)}
                    <button class="btn btn-link text-dark text-sm mb-0 px-0 ms-4" onclick="generatePDF('${facture.id}', '${encodeURIComponent(JSON.stringify(facture))}')"><i class="fas fa-file-pdf text-lg me-1"></i> PDF</button>
                </div>
            `;
                    facturesList.appendChild(listItem);
                });

                // Process data for the recent transactions list (new section)
                const recentTransactionsList = document.getElementById('transactions-list')
                if (recentTransactionsList) {
                    recentTransactionsList.innerHTML = ''; // Clear existing content

                    // Sort transactions by date
                    data.sort((a, b) => new Date(b.dateCommande) - new Date(a.dateCommande));
                    data.forEach(transaction => {
                        // fetch client data
                        fetch(`http://localhost:8080/api/membres/${transaction.idClient}`)
                            .then(response => response.json())
                            .then(data => {
                                const clientName = `${data.prenom} ${data.nom}`;

                                const transactionDate = new Date(transaction.dateCommande);

                                // Format date as "DD Month YYYY, at HH:MM"
                                const formattedDate = transactionDate.toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric'
                                }) + ', à ' + transactionDate.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                const isIncome = transaction.prixTotal > 0;

                                const listItem = document.createElement('li');
                                listItem.className = 'list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg';
                                listItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <button class="btn btn-icon-only btn-rounded btn-outline-${isIncome ? 'success' : 'danger'} mb-0 me-3 btn-sm d-flex align-items-center justify-content-center">
                        <i class="fas fa-arrow-${isIncome ? 'up' : 'down'}"></i>
                    </button>
                    <div class="d-flex flex-column">
                        <h6 class="mb-1 text-dark text-sm">${transaction.description || 'Commande #' + transaction.id}</h6>
                        <span class="text-xs">${formattedDate}</span>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <span class="text-sm">${clientName}</span>
                </div>
                <div class="d-flex align-items-center text-${isIncome ? 'success' : 'danger'} text-gradient text-sm font-weight-bold">
                    ${isIncome ? '+' : '-'} ${transaction.prixTotal.toFixed(2)} €
                </div>
                <div class="d-flex text-end">
                  <a class="btn btn-link text-danger text-gradient px-3 mb-0" href="javascript:deleteCommande('${transaction.id}');"><i class="far fa-trash-alt me-2"></i>Supprimer</a>
                </div>
            `;
                                recentTransactionsList.appendChild(listItem);
                            })
                            .catch(error => {
                                console.error('Error fetching user data:', error);
                                showNotification('Erreur lors de la récupération des données utilisateur.');
                            });
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching factures:', error);
                showNotification('Erreur lors de la récupération des factures.');
            });
    }
});

function generatePDF(factureId, encodedFacture) {
    const { jsPDF } = window.jspdf;
    const facture = JSON.parse(decodeURIComponent(encodedFacture));
    // console.log('generatePDF called with:', factureId, facture);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Facture', 105, 10, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`Facture ID: ${facture.id}`, 10, 30);
    doc.text(`Client ID: ${facture.idClient}`, 10, 40);
    doc.text(`Vendeur ID: ${facture.idVendeur}`, 10, 50);
    doc.text(`Date de Commande: ${new Date(facture.dateCommande).toLocaleDateString('fr-FR')}`, 10, 60);
    doc.text(`Prix Total: €${facture.prixTotal.toFixed(2)}`, 10, 70);
    // add the signature of 'Asso Miaou'
    doc.addImage('../assets/img/logo-ct-dark.png', 'PNG', 160, 80, 20, 20);
    doc.text('Asso Miaou', 160, 105);
    doc.save(`facture_${factureId}.pdf`);
}

async function deleteCommande(commandId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/commandes/${commandId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                console.log('Commande supprimée avec succès');
                // Optionally, refresh the list of commandes
                document.location.reload();
            } else {
                throw new Error('Erreur lors de la suppression de la commande');
            }
        } catch (error) {
            console.error('Erreur:', error);
            showNotification('Une erreur est survenue lors de la suppression de la commande');
        }
    }
}

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

