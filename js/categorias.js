document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Cargar categorías existentes
    loadCategories();

    // Manejar formulario de agregar categoría
    document.getElementById('addCategoryForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('categoryName').value;
        const description = document.getElementById('categoryDescription').value;

        const formData = new FormData();
        formData.append('action', 'addCategory');
        formData.append('name', name);
        formData.append('description', description);

        fetch('php/categorias.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Categoría agregada exitosamente' });
                document.getElementById('addCategoryForm').reset();
                loadCategories();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al agregar la categoría' });
        });
    });
});

function loadCategories() {
    fetch('php/categorias.php?action=getCategories')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCategories(data.categories);
        } else {
            console.error('Error al cargar categorías:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        categoriesList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay categorías registradas</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    
    categories.forEach(category => {
        html += `
            <div style="border: 1px solid #e1e5e9; border-radius: 10px; padding: 20px; background: #f8f9fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="color: #333; margin: 0;">${category.nombre}</h3>
                    <div>
                        <button onclick="editCategory(${category.id})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="deleteCategory(${category.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
                <p style="color: #666; margin: 0;">${category.descripcion || 'Sin descripción'}</p>
            </div>
        `;
    });
    
    html += '</div>';
    categoriesList.innerHTML = html;
}

function editCategory(id) {
    Swal.fire({
        title: 'Ingrese el nuevo nombre de la categoría:',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return '¡Debes ingresar un valor!';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newName = result.value;
            Swal.fire({
                title: 'Ingrese la nueva descripción:',
                input: 'textarea',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocomplete: 'off',
                    spellcheck: 'true',
                    rows: 4
                },
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) return '¡Debes ingresar una descripción!';
                },
                didOpen: () => {
                    const textarea = Swal.getInput();
                    if (textarea) textarea.focus();
                }
            }).then((descResult) => {
                if (descResult.isConfirmed) {
                    const newDescription = descResult.value;
                    const formData = new FormData();
                    formData.append('action', 'updateCategory');
                    formData.append('id', id);
                    formData.append('name', newName);
                    formData.append('description', newDescription);

                    fetch('php/categorias.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Categoría actualizada exitosamente' });
                            loadCategories();
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar la categoría' });
                    });
                }
            });
        }
    });
}

function deleteCategory(id) {
    Swal.fire({
        title: '¿Está seguro de que desea eliminar esta categoría?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'deleteCategory');
            formData.append('id', id);

            fetch('php/categorias.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Categoría eliminada exitosamente' });
                    loadCategories();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la categoría' });
            });
        }
    });
} 