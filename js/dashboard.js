document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está logueado
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        window.location.href = 'index.html';
        return;
    }
    // Mostrar información del usuario
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    if (user.image) {
        userAvatar.src = user.image;
    } else {
        userAvatar.src = 'https://via.placeholder.com/50x50/667eea/ffffff?text=' + (user.name ? user.name.charAt(0).toUpperCase() : 'U');
    }
    userName.textContent = user.name || user.email || 'Usuario';
    // Cargar datos del dashboard solo si es admin
    if (user.role === 'admin') {
        loadDashboardData();
    }
});

function loadDashboardData() {
    // Aquí puedes cargar datos reales desde el servidor
    // Por ahora usamos datos de ejemplo
    console.log('Dashboard cargado para administrador');
}

function logout() {
    // Limpiar localStorage
    localStorage.removeItem('user');
    // Redirigir al login
    window.location.href = 'index.html';
}

// Función para verificar sesión en todas las páginas
function checkSession() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Verificar sesión cada 5 minutos
setInterval(checkSession, 300000); 