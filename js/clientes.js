document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Cargar clientes y estadísticas
    loadClients();
    loadClientStats();

    // Event listeners para filtros
    document.getElementById('searchClient').addEventListener('input', function() {
        searchClients();
    });

    document.getElementById('filterDate').addEventListener('change', function() {
        searchClients();
    });

    document.getElementById('sortClients').addEventListener('change', function() {
        searchClients();
    });
});

function loadClients() {
    fetch('php/clientes.php?action=getClients')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayClients(data.clients);
        } else {
            console.error('Error al cargar clientes:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function loadClientStats() {
    fetch('php/clientes.php?action=getStats')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('totalClients').textContent = data.stats.total;
            document.getElementById('newClients').textContent = data.stats.newThisMonth;
            document.getElementById('activeClients').textContent = data.stats.active;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function searchClients() {
    const searchTerm = document.getElementById('searchClient').value;
    const filterDate = document.getElementById('filterDate').value;
    const sortBy = document.getElementById('sortClients').value;

    const params = new URLSearchParams();
    params.append('action', 'searchClients');
    params.append('search', searchTerm);
    params.append('date', filterDate);
    params.append('sort', sortBy);

    fetch('php/clientes.php?' + params.toString())
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayClients(data.clients);
        } else {
            console.error('Error al buscar clientes:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayClients(clients) {
    const clientsList = document.getElementById('clientsList');
    
    if (clients.length === 0) {
        clientsList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No se encontraron clientes</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    
    clients.forEach(client => {
        const registrationDate = new Date(client.fecha_registro).toLocaleDateString('es-ES');
        
        html += `
            <div style="border: 1px solid #e1e5e9; border-radius: 10px; padding: 20px; background: #f8f9fa;">
                <div style="display: flex; gap: 20px; align-items: center;">
                    <img src="${client.imagen_perfil || 'https://via.placeholder.com/80x80/667eea/ffffff?text=' + client.nombre.charAt(0).toUpperCase()}" 
                         alt="${client.nombre}" 
                         style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%;">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div>
                                <h3 style="color: #333; margin: 0 0 5px 0;">${client.nombre}</h3>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Email:</strong> ${client.email}</p>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Fecha de registro:</strong> ${registrationDate}</p>
                                <p style="color: #666; margin: 0;"><strong>Rol:</strong> <span style="background: #667eea; color: white; padding: 2px 8px; border-radius: 10px; font-size: 0.8em;">${client.role}</span></p>
                            </div>
                            <div>
                                <button onclick="viewClientDetails(${client.id})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                                <button onclick="deleteClient(${client.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    clientsList.innerHTML = html;
}

function viewClientDetails(id) {
    // Implementar vista detallada del cliente
    Swal.fire({ icon: 'info', title: 'En desarrollo', text: 'Función de vista detallada en desarrollo' });
}

function deleteClient(id) {
    Swal.fire({
        title: '¿Está seguro de que desea eliminar este cliente?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'deleteClient');
            formData.append('id', id);

            fetch('php/clientes.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Cliente eliminado exitosamente' });
                    loadClients();
                    loadClientStats();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el cliente' });
            });
        }
    });
} 