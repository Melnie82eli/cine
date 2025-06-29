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
                Swal.fire({ icon: 'success', title: 'Éxito', text: 'Película agregada exitosamente' });
                document.getElementById('addMovieForm').reset();
                loadMovies();
            } else {
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al agregar la película' });
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
    fetch(`php/peliculas.php?action=getMovieById&id=${id}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                Swal.fire({ icon: 'error', title: 'Error', text: data.message });
                return;
            }
            const movie = data.movie;
            Swal.fire({
                title: 'Editar película',
                html: `
                    <div style='text-align:center;margin-bottom:10px;'>
                        <img src='${movie.poster ? movie.poster : 'img/placeholder_pelicula.png'}' alt='${movie.titulo}' style='width:100px;height:150px;object-fit:cover;border-radius:8px;margin-bottom:10px;'>
                    </div>
                    <input id='swal-input-titulo' class='swal2-input' placeholder='Título' value='${movie.titulo}'>
                    <input id='swal-input-anio' class='swal2-input' type='number' min='1900' max='2100' placeholder='Año' value='${movie.anio}'>
                    <input id='swal-input-duracion' class='swal2-input' type='number' min='1' placeholder='Duración (min)' value='${movie.duracion}'>
                    <input id='swal-input-precio' class='swal2-input' type='number' min='0' step='0.01' placeholder='Precio' value='${movie.precio}'>
                    <input id='swal-input-categoria' class='swal2-input' placeholder='Categoría' value='${movie.categoria}'>
                    <input id='swal-input-clasificacion' class='swal2-input' placeholder='Clasificación' value='${movie.clasificacion}'>
                    <input id='swal-input-director' class='swal2-input' placeholder='Director' value='${movie.director}'>
                    <input id='swal-input-reparto' class='swal2-input' placeholder='Reparto' value='${movie.reparto}'>
                    <textarea id='swal-input-sinopsis' class='swal2-textarea' placeholder='Sinopsis'>${movie.sinopsis || ''}</textarea>
                    <label style='display:block;margin-top:10px;'>Cambiar imagen: <input type='file' id='swal-input-poster' accept='image/*'></label>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        titulo: document.getElementById('swal-input-titulo').value,
                        anio: document.getElementById('swal-input-anio').value,
                        duracion: document.getElementById('swal-input-duracion').value,
                        precio: document.getElementById('swal-input-precio').value,
                        categoria: document.getElementById('swal-input-categoria').value,
                        clasificacion: document.getElementById('swal-input-clasificacion').value,
                        director: document.getElementById('swal-input-director').value,
                        reparto: document.getElementById('swal-input-reparto').value,
                        sinopsis: document.getElementById('swal-input-sinopsis').value,
                        poster: document.getElementById('swal-input-poster').files[0]
                    };
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    const values = result.value;
                    if (!values.titulo || !values.anio || !values.duracion || !values.precio || !values.categoria || !values.clasificacion || !values.director) {
                        Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Completa todos los campos obligatorios.' });
                        return;
                    }
                    const formData = new FormData();
                    formData.append('action', 'updateMovie');
                    formData.append('id', id);
                    formData.append('title', values.titulo);
                    formData.append('year', values.anio);
                    formData.append('duration', values.duracion);
                    formData.append('price', values.precio);
                    formData.append('category', values.categoria);
                    formData.append('classification', values.clasificacion);
                    formData.append('director', values.director);
                    formData.append('cast', values.reparto);
                    formData.append('synopsis', values.sinopsis);
                    if (values.poster) {
                        formData.append('poster', values.poster);
                    }
                    fetch('php/peliculas.php', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            Swal.fire({ icon: 'success', title: 'Éxito', text: 'Película actualizada exitosamente' });
                            loadMovies();
                        } else {
                            Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al actualizar la película' });
                    });
                }
            });
        });
}

function deleteMovie(id) {
    Swal.fire({
        title: '¿Está seguro de que desea eliminar esta película?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
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
                    Swal.fire({ icon: 'success', title: 'Éxito', text: 'Película eliminada exitosamente' });
                    loadMovies();
                } else {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Error: ' + data.message });
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Error al eliminar la película' });
            });
        }
    });
} 