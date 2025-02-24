document.addEventListener('DOMContentLoaded', function() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        console.log('User ID:', userId);

        fetch(`http://localhost:8080/api/membres/${userId}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('titulaire-de-carte').textContent = `${data.prenom} ${data.nom}`;
            })
            .catch(error => console.error('Error fetching user data:', error));
    }
});

