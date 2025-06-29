document.addEventListener('DOMContentLoaded', function() {
    // Verificar sesión
    if (!checkSession()) return;

    // Cargar categorías y clasificaciones
    loadCategories();
    loadClassifications();
    loadMovies();

    // Manejar formulario de agregar película
    document.getElementById('addMovieForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('action', 'addMovie');
        formData.append('title', document.getElementById('movieTitle').value);
        formData.append('year', document.getElementById('movieYear').value);
        formData.append('duration', document.getElementById('movieDuration').value);
        formData.append('price', document.getElementById('moviePrice').value);
        formData.append('category', document.getElementById('movieCategory').value);
        formData.append('classification', document.getElementById('movieClassification').value);
        formData.append('director', document.getElementById('movieDirector').value);
        formData.append('cast', document.getElementById('movieCast').value);
        formData.append('synopsis', document.getElementById('movieSynopsis').value);
        
        const poster = document.getElementById('moviePoster').files[0];
        if (poster) {
            formData.append('poster', poster);
        }

        fetch('php/peliculas.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Película agregada exitosamente');
                document.getElementById('addMovieForm').reset();
                loadMovies();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al agregar la película');
        });
    });
});

function loadCategories() {
    fetch('php/categorias.php?action=getCategories')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const select = document.getElementById('movieCategory');
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.nombre;
                select.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error al cargar categorías:', error);
    });
}

function loadClassifications() {
    fetch('php/clasificaciones.php?action=getClassifications')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const select = document.getElementById('movieClassification');
            data.classifications.forEach(classification => {
                const option = document.createElement('option');
                option.value = classification.id;
                option.textContent = `${classification.nombre} (${classification.rango_edad})`;
                select.appendChild(option);
            });
        }
    })
    .catch(error => {
        console.error('Error al cargar clasificaciones:', error);
    });
}

function loadMovies() {
    fetch('php/peliculas.php?action=getMovies')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayMovies(data.movies);
        } else {
            console.error('Error al cargar películas:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function displayMovies(movies) {
    const moviesList = document.getElementById('moviesList');
    
    if (movies.length === 0) {
        moviesList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No hay películas registradas</p>';
        return;
    }

    let html = '<div style="display: grid; gap: 20px;">';
    
    movies.forEach(movie => {
        html += `
            <div style="border: 1px solid #e1e5e9; border-radius: 10px; padding: 20px; background: #f8f9fa;">
                <div style="display: flex; gap: 20px;">
                    <img src="${movie.poster || 'https://via.placeholder.com/100x150/667eea/ffffff?text=Película'}" 
                         alt="${movie.titulo}" 
                         style="width: 100px; height: 150px; object-fit: cover; border-radius: 8px;">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                            <div>
                                <h3 style="color: #333; margin: 0 0 5px 0;">${movie.titulo} (${movie.anio})</h3>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Director:</strong> ${movie.director}</p>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Duración:</strong> ${movie.duracion} min</p>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Precio:</strong> $${movie.precio}</p>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Categoría:</strong> ${movie.categoria}</p>
                                <p style="color: #666; margin: 0 0 5px 0;"><strong>Clasificación:</strong> ${movie.clasificacion}</p>
                            </div>
                            <div>
                                <button onclick="editMovie(${movie.id})" style="background: #667eea; color: white; border: none; padding: 8px 15px; border-radius: 5px; margin-right: 10px; cursor: pointer;">
                                    <i class="fas fa-edit"></i> Editar
                                </button>
                                <button onclick="deleteMovie(${movie.id})" style="background: #dc3545; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                        <p style="color: #666; margin: 0;"><strong>Sinopsis:</strong> ${movie.sinopsis || 'Sin sinopsis disponible'}</p>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    moviesList.innerHTML = html;
}

function editMovie(id) {
    // Implementar edición de película
    alert('Función de edición en desarrollo');
}

function deleteMovie(id) {
    if (confirm('¿Está seguro de que desea eliminar esta película?')) {
        const formData = new FormData();
        formData.append('action', 'deleteMovie');
        formData.append('id', id);

        fetch('php/peliculas.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Película eliminada exitosamente');
                loadMovies();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al eliminar la película');
        });
    }
} 