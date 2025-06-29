document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Cambiar entre formularios
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    });

    // Manejar login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Crear FormData para enviar datos
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('email', email);
        formData.append('password', password);

        fetch('php/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Guardar datos del usuario en localStorage
                localStorage.setItem('user', JSON.stringify(data.user));
                
                if (data.user.role === 'admin') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'cliente.html';
                }
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor' });
        });
    });

    // Manejar registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const profileImage = document.getElementById('profileImage').files[0];

        if (!profileImage) {
            Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'Por favor selecciona una foto de perfil' });
            return;
        }

        // Crear FormData para enviar datos
        const formData = new FormData();
        formData.append('action', 'register');
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('profileImage', profileImage);

        fetch('php/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: '¡Registro exitoso!', text: 'Ahora puedes iniciar sesión.' });
                // Cambiar al formulario de login
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
                // Limpiar formulario
                registerForm.reset();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al conectar con el servidor' });
        });
    });

    // Previsualización de imagen
    document.getElementById('profileImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const label = document.querySelector('.file-label');
            label.textContent = file.name;
        }
    });
}); 