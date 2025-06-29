document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Cargar productos existentes
    loadFood();

    // Manejar formulario de agregar producto
    document.getElementById('addFoodForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', 'addFood');
        formData.append('name', document.getElementById('foodName').value);
        formData.append('type', document.getElementById('foodType').value);
        formData.append('price', document.getElementById('foodPrice').value);
        formData.append('stock', document.getElementById('foodStock').value);
        formData.append('description', document.getElementById('foodDescription').value);
        
        const image = document.getElementById('foodImage').files[0];
        if (image) {
            formData.append('image', image);
        }

        fetch('php/comida.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Producto agregado exitosamente' });
                document.getElementById('addFoodForm').reset();
                loadFood();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al agregar el producto' });
        });
    });
});

function loadFood() {
    fetch('php/comida.php?action=getFood')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayFood(data.food);
        } else {
            console.error('Error al cargar productos:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayFood(food) {
    const foodList = document.getElementById('foodList');
    
    if (food.length === 0) {
        foodList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay productos registrados</p>';
        return;
    }

    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
    
    food.forEach(item => {
        const typeColors = {
            'comida': '#28a745',
            'bebida': '#007bff',
            'dulce': '#ffc107',
            'snack': '#fd7e14'
        };
        
        const typeColor = typeColors[item.tipo] || '#667eea';
        
        html += `
            <div style="border: 1px solid #e1e5e9; border-radius: 10px; padding: 20px; background: #f8f9fa;">
                <div style="text-align: center; margin-bottom: 15px;">
                    <img src="${item.imagen || 'https://via.placeholder.com/150x150/667eea/ffffff?text=Producto'}" 
                         alt="${item.nombre}" 
                         style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <h3 style="color: #333; margin: 0 0 5px 0;">${item.nombre}</h3>
                    <span style="background: ${typeColor}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.9em; text-transform: capitalize;">${item.tipo}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <p style="color: #666; margin: 0 0 5px 0;"><strong>Precio:</strong> $${item.precio}</p>
                    <p style="color: #666; margin: 0 0 5px 0;"><strong>Stock:</strong> ${item.stock} unidades</p>
                    <p style="color: #666; margin: 0;"><strong>Descripción:</strong> ${item.descripcion || 'Sin descripción'}</p>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button onclick="editFood(${item.id})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; flex: 1;">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="deleteFood(${item.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; flex: 1;">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    foodList.innerHTML = html;
}

function editFood(id) {
    // Implementar edición de producto
    Swal.fire({
        title: 'En desarrollo',
        text: 'Función de edición en desarrollo',
        icon: 'info'
    });
}

function deleteFood(id) {
    Swal.fire({
        title: '¿Está seguro de que desea eliminar este producto?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'deleteFood');
            formData.append('id', id);

            fetch('php/comida.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Producto eliminado exitosamente' });
                    loadFood();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar el producto' });
            });
        }
    });
} 