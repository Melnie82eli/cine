document.addEventListener('DOMContentLoaded', function() {
    // Eliminar checkSession para no borrar la sesión
    // const user = JSON.parse(localStorage.getItem('user') || '{}');
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.name) {
        window.location.href = 'index.html';
        return;
    }
    // Cargar datos actuales del usuario
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
    
    // Mostrar avatar actual
    const currentAvatar = document.getElementById('currentAvatar');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (user.image) {
        currentAvatar.src = user.image;
        userAvatar.src = user.image;
    } else {
        const placeholderUrl = 'https://via.placeholder.com/120x120/667eea/ffffff?text=' + user.name.charAt(0).toUpperCase();
        currentAvatar.src = placeholderUrl;
        userAvatar.src = 'https://via.placeholder.com/50x50/667eea/ffffff?text=' + user.name.charAt(0).toUpperCase();
    }
    
    userName.textContent = user.name;

    // Previsualización de nueva imagen
    document.getElementById('newProfileImage').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Manejar envío del formulario
    document.getElementById('editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const password = document.getElementById('editPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const newImage = document.getElementById('newProfileImage').files[0];

        if (password && password !== confirmPassword) {
            Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'Las contraseñas no coinciden' });
            return;
        }

        const formData = new FormData();
        formData.append('action', 'updateProfile');
        formData.append('id', user.id);
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);
        if (newImage) {
            formData.append('profileImage', newImage);
        }

        fetch('php/auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Actualizar localStorage
                user.name = name;
                user.email = email;
                if (data.user && data.user.image) user.image = data.user.image;
                localStorage.setItem('user', JSON.stringify(user));
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Perfil actualizado exitosamente' }).then(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'dashboard.html';
                    } else {
                        window.location.href = 'peliculasCliente.html';
                    }
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el perfil' });
        });
    });
}); 