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
                alert('Categoría agregada exitosamente');
                document.getElementById('addCategoryForm').reset();
                loadCategories();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar la categoría');
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
    const newName = prompt('Ingrese el nuevo nombre de la categoría:');
    if (newName) {
        const newDescription = prompt('Ingrese la nueva descripción:');
        
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
                alert('Categoría actualizada exitosamente');
                loadCategories();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al actualizar la categoría');
        });
    }
}

function deleteCategory(id) {
    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
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
                alert('Categoría eliminada exitosamente');
                loadCategories();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar la categoría');
        });
    }
} 