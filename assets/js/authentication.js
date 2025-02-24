/****************************************************************/
/* REGISTER */
/****************************************************************/
// Load list of groups by city and code postal
const villeSelect = document.getElementById('ville-select');
if (villeSelect) {
    villeSelect.addEventListener('change', function () {
        const ville = this.value;

        const groupeSelect = document.getElementById('groupe-select');
        groupeSelect.innerHTML = '<option value="" disabled selected>Groupe</option>';

        fetch(`http://localhost:8080/api/groupes/ville/${ville}`)
            .then(response => {
                return response.json();
            })
            .then(data => {
                data.forEach(groupe => {
                    const option = document.createElement('option');
                    option.value = groupe.numero;
                    option.textContent = groupe.nom;
                    groupeSelect.appendChild(option);
                });
                if (data.length === 0) {
                    document.getElementById('code-postal').value = '';
                } else {
                    document.getElementById('code-postal').value = data[0].codePostal;
                }
            })
            .catch(error => console.error('Error fetching group data:', error));
    });
}

// Create new member
const signupForm = document.getElementById('signup-form');
if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent form from submitting normally

        const formData = {
            nom: document.getElementById('nom').value,
            prenom: document.getElementById('prenom').value,
            numeroRue: document.getElementById('numeroRue').value,
            rue: document.getElementById('rue').value,
            ville: document.getElementById('ville-select').value,
            codePostal: document.getElementById('code-postal').value,
            email: document.getElementById('email').value,
            type: document.getElementById('type').value,
            numeroGroupe: document.getElementById('groupe-select').value,
            password: document.getElementById('password').value
        };

        try {
            // Disable submit button while processing
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Création en cours...';

            const response = await fetch('http://localhost:8080/api/membres', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Success:', data);

            // Show success message
            console.log('Compte créé avec succès!');

            // Redirect to login page
            window.location.href = 'sign-in.html';

        } catch (error) {
            console.error('Error:', error);
            showNotification('Erreur lors de la création du compte. Veuillez réessayer.');
        } finally {
            // Re-enable submit button
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'S\'inscrire';
        }
    });
}

/****************************************************************/
/* LOGIN */
/****************************************************************/
// Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const formData = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        try {
            // Disable submit button while processing
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Connexion en cours...';

            const response = await fetch(`http://localhost:8080/api/membres/login?email=${encodeURIComponent(formData.email)}&password=${encodeURIComponent(formData.password)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const memberData = await response.json();
            console.log('Success:', memberData);

            // Store only the user ID in localStorage
            localStorage.setItem('userId', memberData.id);

            // Redirect to home page
            window.location.href = 'dashboard.html';

        } catch (error) {
            console.error('Error:', error);
            showNotification('Erreur lors de la connexion. Veuillez réessayer.');
        } finally {
            // Re-enable submit button
            const submitBtn = document.getElementById('submit-btn');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Se connecter';
        }
    });
}

function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'notification-popup';
    notification.innerText = message;

    var closeButton = document.createElement('button');
    closeButton.innerText = 'X';
    closeButton.className = 'close-button';
    closeButton.onclick = function() {
        document.body.removeChild(notification);
    };

    notification.appendChild(closeButton);
    document.body.appendChild(notification);

    setTimeout(function() {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 2000);
}