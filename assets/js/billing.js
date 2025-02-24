document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        console.log('User ID:', userId);

        fetch(`http://localhost:8080/api/membres/${userId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('titulaire-de-carte').textContent = `${data.prenom} ${data.nom}`;
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                showNotification('Erreur lors de la récupération des données utilisateur.');
            });
    }
});

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

