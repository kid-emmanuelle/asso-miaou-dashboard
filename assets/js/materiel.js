// Function to fetch and populate groups in the select element
async function loadGroups() {
    try {
        const response = await fetch('http://localhost:8080/api/groupes');
        const groups = await response.json();

        const selectElement = document.getElementById('numeroGroupe');
        // Clear existing options except the first one
        selectElement.innerHTML = '<option value="">Sélectionnez un groupe</option>';

        // Add new options
        groups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.numero;
            option.textContent = `${group.numero} - ${group.nom}`;
            selectElement.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des groupes:', error);
        alert('Erreur lors du chargement des groupes. Veuillez réessayer.');
    }
}

// Function to handle form submission
async function handleSubmit(event) {
    event.preventDefault();

    // Get form values
    const materiel = {
        numeroSerie: document.getElementById('numeroSerie').value,
        marque: document.getElementById('marque').value,
        modele: document.getElementById('modele').value,
        type: document.getElementById('type').value,
        prix: parseFloat(document.getElementById('prix').value),
        numeroGroupe: document.getElementById('numeroGroupe').value
    };

    console.log(JSON.stringify(materiel));

    try {
        const response = await fetch('http://localhost:8080/api/materiels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(materiel)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        alert('Matériel ajouté avec succès!');
        // Reload the table after successful addition
        loadMateriels();
        // Clear the form
        document.querySelector('form').reset();

    } catch (error) {
        console.error('Erreur lors de l\'ajout du matériel:', error);
        alert('Erreur lors de l\'ajout du matériel. Veuillez réessayer.');
    }
}

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load groups when page loads
    loadGroups();

    // Add submit event listener to the form
    const form = document.querySelector('form');
    form.addEventListener('submit', handleSubmit);
});

// Load all materiels
async function loadMateriels() {
    try {
        const response = await fetch('http://localhost:8080/api/materiels');
        const materiels = await response.json();

        const tableBody = document.getElementById('groupesTableBody');
        tableBody.innerHTML = ''; // Clear existing content

        materiels.forEach(materiel => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex px-2 py-1">
                        <div class="d-flex flex-column justify-content-center">
                            <h6 class="mb-0 text-sm">${materiel.numeroSerie}</h6>
                        </div>
                    </div>
                </td>
                <td>
                    <p class="text-xs font-weight-bold mb-0">${materiel.marque}</p>
                </td>
                <td>
                    <p class="text-xs font-weight-bold mb-0">${materiel.modele}</p>
                </td>
                <td class="align-middle text-center text-sm">
                    <span class="badge badge-sm bg-gradient-info">${materiel.type}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${materiel.prix.toFixed(2)} €</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${materiel.numeroGroupe}</span>
                </td>
                <td class="align-middle">
                    <a href="javascript:" 
                       class="text-danger font-weight-bold text-xs" 
                       onclick="deleteMateriel('${materiel.id}')"
                       data-toggle="tooltip" 
                       data-original-title="Supprimer matériel">
                        Supprimer
                    </a>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error);
        alert('Erreur lors du chargement des matériels. Veuillez réessayer.');
    }
}

// Function to delete a material (if you want to implement deletion)
async function deleteMateriel(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce matériel ?')) {
        try {
            const response = await fetch(`http://localhost:8080/api/materiels/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Reload the table after successful deletion
                loadMateriels();
                alert('Matériel supprimé avec succès!');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression du matériel. Veuillez réessayer.');
        }
    }
}

// Load materials when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadMateriels();
});