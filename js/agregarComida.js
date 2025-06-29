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
                    <img src="${item.imagen ? item.imagen : 'img/placeholder_producto.png'}" 
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
    // Obtener los datos actuales del producto
    fetch(`php/comida.php?action=getFoodById&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                return;
            }
            const food = data.food;
            Swal.fire({
                title: 'Editar producto',
                html: `
                    <div style='text-align:center;margin-bottom:10px;'>
                        <img src='${food.imagen ? food.imagen : 'img/placeholder_producto.png'}' alt='${food.nombre}' style='width:120px;height:120px;object-fit:cover;border-radius:8px;margin-bottom:10px;'>
                    </div>
                    <input id='swal-input-nombre' class='swal2-input' placeholder='Nombre' value='${food.nombre}'>
                    <select id='swal-input-tipo' class='swal2-input'>
                        <option value='comida' ${food.tipo === 'comida' ? 'selected' : ''}>Comida</option>
                        <option value='bebida' ${food.tipo === 'bebida' ? 'selected' : ''}>Bebida</option>
                        <option value='dulce' ${food.tipo === 'dulce' ? 'selected' : ''}>Dulce</option>
                        <option value='snack' ${food.tipo === 'snack' ? 'selected' : ''}>Snack</option>
                    </select>
                    <input id='swal-input-precio' class='swal2-input' type='number' min='0' step='0.01' placeholder='Precio' value='${food.precio}'>
                    <input id='swal-input-stock' class='swal2-input' type='number' min='0' placeholder='Stock' value='${food.stock}'>
                    <textarea id='swal-input-descripcion' class='swal2-textarea' placeholder='Descripción'>${food.descripcion || ''}</textarea>
                    <label style='display:block;margin-top:10px;'>Cambiar imagen: <input type='file' id='swal-input-imagen' accept='image/*'></label>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        nombre: document.getElementById('swal-input-nombre').value,
                        tipo: document.getElementById('swal-input-tipo').value,
                        precio: document.getElementById('swal-input-precio').value,
                        stock: document.getElementById('swal-input-stock').value,
                        descripcion: document.getElementById('swal-input-descripcion').value,
                        imagen: document.getElementById('swal-input-imagen').files[0]
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const values = result.value;
                    if (!values.nombre || !values.tipo || !values.precio || !values.stock) {
                        Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos obligatorios.' });
                        return;
                    }
                    const formData = new FormData();
                    formData.append('action', 'updateFood');
                    formData.append('id', id);
                    formData.append('name', values.nombre);
                    formData.append('type', values.tipo);
                    formData.append('price', values.precio);
                    formData.append('stock', values.stock);
                    formData.append('description', values.descripcion);
                    if (values.imagen) {
                        formData.append('image', values.imagen);
                    }
                    fetch('php/comida.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Producto actualizado exitosamente' });
                            loadFood();
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar el producto' });
                    });
                }
            });
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