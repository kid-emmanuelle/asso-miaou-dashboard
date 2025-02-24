// Load code postal
const villeSelect = document.getElementById('ville');
if (villeSelect) {
    villeSelect.addEventListener('change', function () {
        const ville = this.value;

        fetch(`http://localhost:8080/api/groupes/ville/${ville}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (data.length === 0) {
                    document.getElementById('codePostal').value = '';
                } else {
                    document.getElementById('codePostal').value = data[0].codePostal;
                }
            })
            .catch(error => console.error('Error fetching group data:', error));
    });
}

// Create new group
document.querySelector('form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent form from submitting normally

    // Get form values
    const numero = document.getElementById('numero').value;
    const nom = document.getElementById('nom').value;
    const ville = document.getElementById('ville').value;
    const codePostal = document.getElementById('codePostal').value;

    try {
        // First, check if the group number already exists
        const checkResponse = await fetch(`http://localhost:8080/api/groupes/numero/${numero}`);
        let existingGroup;
        try {
            existingGroup = await checkResponse.json();
        } catch (error) {
            // If JSON parsing fails, it means there's no group (empty response)
            existingGroup = null;
        }

        if (existingGroup !== null) {
            // Group already exists (response is a group object)
            alert('Ce numéro de groupe existe déjà.');
            return;
        }

        // If group doesn't exist, create new group
        const createResponse = await fetch('http://localhost:8080/api/groupes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numero: numero,
                nom: nom,
                ville: ville,
                codePostal: codePostal
            })
        });

        if (createResponse.ok) {
            const result = await createResponse.json();
            alert('Groupe créé avec succès!');
            // Reset form
            this.reset();
            loadGroupes(); // Reload the table
        } else {
            alert('Erreur lors de la création du groupe.');
        }

    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la communication avec le serveur.');
    }
});

// Function to fetch and display groups
async function loadGroupes() {
    try {
        const response = await fetch('http://localhost:8080/api/groupes');

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des groupes');
        }

        const groupes = await response.json();
        const tableBody = document.getElementById('groupesTableBody');
        tableBody.innerHTML = '';

        for (const groupe of groupes) {
            // Create main group row
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex px-2 py-1">
                        <div class="d-flex flex-column justify-content-center">
                            <h6 class="mb-0 text-sm">
                                <a href="javascript:void(0)" 
                                   data-bs-toggle="collapse" 
                                   data-bs-target="#members-${groupe.numero}" 
                                   class="text-primary">
                                    ${groupe.numero} 
                                    <i class="fas fa-chevron-down ms-1"></i>
                                </a>
                            </h6>
                        </div>
                    </div>
                </td>
                <td>
                    <p class="text-xs font-weight-bold mb-0">${groupe.nom}</p>
                </td>
                <td class="align-middle text-center text-sm">
                    <span class="text-secondary text-xs font-weight-bold">${groupe.ville}</span>
                </td>
                <td class="align-middle text-center">
                    <span class="text-secondary text-xs font-weight-bold">${groupe.codePostal}</span>
                </td>
                <td class="align-middle">
                    <a href="javascript:deleteGroupe('${groupe.id}', '${groupe.numero}')" class="text-danger font-weight-bold text-xs">
                        Supprimer
                    </a>
                </td>
            `;
            tableBody.appendChild(row);

            // Create members row
            const membersRow = document.createElement('tr');
            membersRow.innerHTML = `
                <td colspan="5" class="p-0">
                    <div class="collapse" id="members-${groupe.numero}">
                        <div class="p-3 bg-light">
                            <div class="table-responsive">
                                <table class="table align-items-center mb-0">
                                    <thead>
                                        <tr>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Membre</th>
                                            <th class="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7 ps-2">Type</th>
                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Adresse</th>
                                            <th class="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Code Postal</th>
                                        </tr>
                                    </thead>
                                    <tbody id="members-body-${groupe.numero}">
                                        <tr>
                                            <td colspan="5" class="text-center">
                                                <div class="spinner-border spinner-border-sm" role="status">
                                                    <span class="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </td>
            `;
            tableBody.appendChild(membersRow);

            // Add click event to load members
            const collapseElement = document.querySelector(`#members-${groupe.numero}`);
            collapseElement.addEventListener('show.bs.collapse', async () => {
                try {
                    const membersResponse = await fetch(`http://localhost:8080/api/membres/groupe/${groupe.numero}`);
                    const members = await membersResponse.json();

                    const membersBody = document.getElementById(`members-body-${groupe.numero}`);
                    membersBody.innerHTML = members.length ? members.map(member => `
                        <tr>
                            <td>
                                <div class="d-flex px-2 py-1">
                                    <div>
                                        <img src="../assets/img/tim.png" class="avatar avatar-sm me-3" alt="${member.prenom} ${member.nom}">
                                    </div>
                                    <div class="d-flex flex-column justify-content-center">
                                        <h6 class="mb-0 text-sm">${member.prenom} ${member.nom}</h6>
                                        <p class="text-xs text-secondary mb-0">${member.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <p class="text-xs font-weight-bold mb-0">${member.type}</p>
                                <p class="text-xs text-secondary mb-0">Membre du groupe ${member.numeroGroupe}</p>
                            </td>
                            <td class="align-middle text-center text-sm">
                                <p class="text-xs font-weight-bold mb-0">${member.numeroRue} ${member.rue}</p>
                                <p class="text-xs text-secondary mb-0">${member.ville}</p>
                            </td>
                            <td class="align-middle text-center">
                                <span class="text-secondary text-xs font-weight-bold">${member.codePostal}</span>
                            </td>
                        </tr>
                    `).join('') : `
                        <tr>
                            <td colspan="5" class="text-center text-xs">Aucun membre dans ce groupe</td>
                        </tr>
                    `;
                } catch (error) {
                    console.error('Erreur lors du chargement des membres:', error);
                    const membersBody = document.getElementById(`members-body-${groupe.numero}`);
                    membersBody.innerHTML = `
                        <tr>
                            <td colspan="5" class="text-center text-xs text-danger">
                                Erreur lors du chargement des membres
                            </td>
                        </tr>
                    `;
                }
            });
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du chargement des groupes');
    }
}

// Function to delete a group
async function deleteGroupe(id, numero) {
    try {
        // First check if the group has members
        const membersResponse = await fetch(`http://localhost:8080/api/membres/groupe/${numero}`);
        const members = await membersResponse.json();

        if (members && members.length > 0) {
            alert('Impossible de supprimer ce groupe car il contient encore des membres. Veuillez d\'abord supprimer ou déplacer tous les membres.');
            return;
        }

        // If no members, proceed with deletion after confirmation
        if (confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
            const response = await fetch(`http://localhost:8080/api/groupes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                loadGroupes();
                alert('Groupe supprimé avec succès');
            } else {
                throw new Error('Erreur lors de la suppression du groupe');
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors de la suppression du groupe');
    }
}

// Load groups when the page loads
document.addEventListener('DOMContentLoaded', loadGroupes);