const userId = localStorage.getItem('userId');
if (userId) {
    function logout() {
        localStorage.removeItem('userId');
        window.location.href = 'sign-in.html';
    }

    console.log('User ID:', userId);

    fetch(`http://localhost:8080/api/membres/${userId}`)
        .then(response => response.json())
        .then(data => {
            var userStatus = data.type;
            var commandeSwitch = document.getElementById('commande-switch');
            var materielActive = document.getElementById('materiel-active');
            var groupeActive = document.getElementById('groupe-active');

            if (userStatus === 'ACTIF') {
                commandeSwitch.href = '../pages/billing.html';
                materielActive.href = '../pages/materiels.html';
                groupeActive.href = '../pages/groupes.html';
            } else if (userStatus === 'CLIENT') {
                commandeSwitch.href = '../pages/commande.html';
                materielActive.href = '#';
                groupeActive.href = '#';
                // Add event listener to materielActive and groupeActive
                materielActive.addEventListener('click', function() {
                    showNotification('Vous devez être un membre actif pour accéder à cette page.');
                });
                groupeActive.addEventListener('click', function() {
                    showNotification('Vous devez être un membre actif pour accéder à cette page.');
                });
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
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