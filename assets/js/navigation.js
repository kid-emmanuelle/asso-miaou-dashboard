const userId = localStorage.getItem('userId');
if (userId) {
    function logout() {
        localStorage.removeItem('userId');
        window.location.href = 'sign-in.html';
    }
}