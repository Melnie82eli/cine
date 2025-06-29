document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Cargar clasificaciones existentes
    loadClassifications();

    // Manejar formulario de agregar clasificación
    document.getElementById('addClassificationForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('classificationName').value;
        const ageRange = document.getElementById('ageRange').value;
        const description = document.getElementById('classificationDescription').value;

        const formData = new FormData();
        formData.append('action', 'addClassification');
        formData.append('name', name);
        formData.append('ageRange', ageRange);
        formData.append('description', description);

        fetch('php/clasificaciones.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Clasificación agregada exitosamente' });
                document.getElementById('addClassificationForm').reset();
                loadClassifications();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al agregar la clasificación' });
        });
    });
});

function loadClassifications() {
    fetch('php/clasificaciones.php?action=getClassifications')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayClassifications(data.classifications);
        } else {
            console.error('Error al cargar clasificaciones:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayClassifications(classifications) {
    const classificationsList = document.getElementById('classificationsList');
    
    if (classifications.length === 0) {
        classificationsList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay clasificaciones registradas</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 15px;">';
    
    classifications.forEach(classification => {
        html += `
            <div style="border: 1px solid #e1e5e9; border-radius: 10px; padding: 20px; background: #f8f9fa;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div>
                        <h3 style="color: #333; margin: 0 0 5px 0;">${classification.nombre}</h3>
                        <span style="background: #667eea; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.9em;">${classification.rango_edad}</span>
                    </div>
                    <div>
                        <button onclick="editClassification(${classification.id})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button onclick="deleteClassification(${classification.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Eliminar
                        </button>
                    </div>
                </div>
                <p style="color: #666; margin: 0;">${classification.descripcion || 'Sin descripción'}</p>
            </div>
        `;
    });
    
    html += '</div>';
    classificationsList.innerHTML = html;
}

function editClassification(id) {
    Swal.fire({
        title: 'Ingrese el nuevo nombre de la clasificación:',
        input: 'text',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return '¡Debes ingresar un valor!';
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const newName = result.value;
            const newAgeRange = prompt('Ingrese el nuevo rango de edad:');
            if (newAgeRange) {
                const newDescription = prompt('Ingrese la nueva descripción:');
                
                const formData = new FormData();
                formData.append('action', 'updateClassification');
                formData.append('id', id);
                formData.append('name', newName);
                formData.append('ageRange', newAgeRange);
                formData.append('description', newDescription);

                fetch('php/clasificaciones.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire({ icon: 'success', title: 'Éxito', text: 'Clasificación actualizada exitosamente' });
                        loadClassifications();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar la clasificación' });
                });
            }
        }
    });
}

function deleteClassification(id) {
    Swal.fire({
        title: '¿Está seguro de que desea eliminar esta clasificación?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            const formData = new FormData();
            formData.append('action', 'deleteClassification');
            formData.append('id', id);

            fetch('php/clasificaciones.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Clasificación eliminada exitosamente' });
                    loadClassifications();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la clasificación' });
            });
        }
    });
} 