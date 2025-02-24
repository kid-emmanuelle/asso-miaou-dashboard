document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        console.log('User ID:', userId);

        fetch(`http://localhost:8080/api/membres/${userId}`)
            .then(response => response.json())
            .then(data => {
                // Update profile header
                document.getElementById('nom-prenom').textContent = `${data.prenom} ${data.nom}`;

                // Update form fields
                const formControls = document.querySelectorAll('.form-control');
                formControls.forEach(input => {
                    const label = input.parentElement.querySelector('label');
                    if (!label) return;

                    const labelText = label.textContent.trim();

                    switch(labelText) {
                        case "Nom d'utilisateur":
                            input.value = `${data.prenom.toLowerCase()}.${data.nom.toLowerCase()}`;
                            break;
                        case "Adresse mail":
                            input.value = data.email;
                            break;
                        case "Prénom":
                            input.value = data.prenom;
                            break;
                        case "Nom":
                            input.value = data.nom;
                            break;
                        case "Addresse":
                            input.value = `${data.numeroRue} ${data.rue}`;
                            break;
                        case "Ville":
                            input.value = data.ville;
                            break;
                        case "Code postal":
                            input.value = data.codePostal;
                            break;
                    }
                });

                // Update user type display
                const userTypeElement = document.querySelector('.text-sm.font-weight-bold');
                if (userTypeElement) {
                    userTypeElement.textContent = data.type === 'ACTIF' ? 'Membre actif' : 'Membre client';
                }
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
});