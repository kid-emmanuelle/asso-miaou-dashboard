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

            if (userStatus === 'ACTIF') {
                commandeSwitch.href = '../pages/billing.html';
            } else if (userStatus === 'CLIENT') {
                commandeSwitch.href = '../pages/commande.html';
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
}