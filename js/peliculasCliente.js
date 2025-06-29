let usuario = JSON.parse(localStorage.getItem('user') || '{}');
let peliculas = [];
let peliculasFiltradas = [];
let categorias = [];
let categoriaSeleccionada = null;
let peliculaSeleccionada = null;

document.addEventListener('DOMContentLoaded', function() {
    if (!usuario || usuario.role !== 'cliente') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('nombreUsuario').innerText = usuario.nombre || usuario.email || 'Usuario';
    cargarCategorias();
    cargarPeliculas();
});

function cerrarSesion() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

function editarPerfil() {
    window.location.href = 'editarPerfil.html';
}

function cargarCategorias() {
    fetch('php/categorias.php?action=getCategories')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                categorias = data.categories;
                mostrarCategorias();
            }
        });
}

function mostrarCategorias() {
    const bar = document.getElementById('categoriasBar');
    bar.innerHTML = '<button onclick="seleccionarCategoria(null)" ' + (categoriaSeleccionada === null ? 'class="selected"' : '') + '>Todas</button>';
    categorias.forEach(cat => {
        bar.innerHTML += `<button onclick="seleccionarCategoria(${cat.id})" ${categoriaSeleccionada == cat.id ? 'class="selected"' : ''}>${cat.nombre}</button>`;
    });
}

window.seleccionarCategoria = function(id) {
    categoriaSeleccionada = id;
    filtrarPeliculas();
    mostrarCategorias();
}

function cargarPeliculas() {
    fetch('php/peliculas.php?action=getMovies')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                peliculas = data.movies;
                filtrarPeliculas();
            }
        });
}

window.filtrarPeliculas = function() {
    let texto = document.getElementById('busquedaPeliculas').value.toLowerCase();
    peliculasFiltradas = peliculas.filter(p => {
        let coincideCategoria = categoriaSeleccionada === null || p.categoria_id == categoriaSeleccionada;
        let coincideBusqueda = p.titulo.toLowerCase().includes(texto) || (p.director && p.director.toLowerCase().includes(texto));
        return coincideCategoria && coincideBusqueda;
    });
    mostrarPeliculas();
}

function mostrarPeliculas() {
    const cont = document.getElementById('peliculasContainer');
    cont.innerHTML = '';
    (peliculasFiltradas.length ? peliculasFiltradas : peliculas).forEach(p => {
        cont.innerHTML += `
            <div class="pelicula-card">
                <img src="${p.poster || 'https://via.placeholder.com/200x300/274690/fff?text=Película'}" alt="${p.titulo}">
                <h3 style="color:#274690;">${p.titulo}</h3>
                <p>${p.anio}</p>
                <button class="btn-azul" onclick="verPelicula(${p.id})">Ver detalles</button>
            </div>
        `;
    });
}

window.verPelicula = function(id) {
    peliculaSeleccionada = peliculas.find(p => p.id == id);
    let p = peliculaSeleccionada;
    let horarios = `
        <option value="1:00pm a 3:00pm">1:00pm a 3:00pm</option>
        <option value="3:00pm a 5:00pm">3:00pm a 5:00pm</option>
        <option value="5:00pm a 7:00pm">5:00pm a 7:00pm</option>
    `;
    let asientos = '<div style="overflow-x:auto;"><table style="margin:auto;">';
    for (let f = 1; f <= 10; f++) {
        asientos += '<tr>';
        for (let c = 1; c <= 20; c++) {
            let idAsiento = String.fromCharCode(64+f) + c;
            asientos += `<td><input type="checkbox" class="asiento" value="${idAsiento}">${idAsiento}</td>`;
        }
        asientos += '</tr>';
    }
    asientos += '</table></div>';

    document.getElementById('modalBody').innerHTML = `
        <div style="display: flex; gap: 30px; align-items: flex-start;">
            <img src="${p.poster || 'https://via.placeholder.com/200x300/274690/fff?text=Película'}" style="width: 340px; height: 500px; object-fit: cover; border-radius: 12px; box-shadow: 0 2px 8px #b3c6ff;">
            <div style="flex: 1; min-width: 0;">
                <h2 style="color:#274690; margin-top:0;">${p.titulo}</h2>
                <p><b>Sinopsis:</b> ${p.sinopsis}</p>
                <p><b>Director:</b> ${p.director}</p>
                <p><b>Categoría:</b> ${p.categoria}</p>
                <p><b>Clasificación:</b> ${p.clasificacion}</p>
                <p><b>Fecha de estreno:</b> ${p.anio}</p>
                <p><b>Precio:</b> $${p.precio}</p>
                <label><b>Hora de función:</b>
                    <select id="horaFuncion">${horarios}</select>
                </label>
                <br><br>
                <label><b>Selecciona tus asientos:</b></label>
                ${asientos}
                <br>
                <label>¿Llevas niños? <input type="checkbox" id="llevaNinos"></label>
                <div id="validacionNinos" style="color:red;display:none;"></div>
                <br>
                <label><b>Califica la película:</b>
                    <span id="estrellas"></span>
                </label>
                <br>
                <button class="btn-azul" onclick="pagarBoletos()">Pagar boletos</button>
            </div>
        </div>
    `;
    mostrarEstrellas();
    document.getElementById('llevaNinos').addEventListener('change', validarClasificacionNinos);
    document.getElementById('modalPelicula').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalPelicula').style.display = 'none';
}

function validarClasificacionNinos() {
    let llevaNinos = document.getElementById('llevaNinos').checked;
    let clasif = peliculaSeleccionada.clasificacion;
    let validacion = document.getElementById('validacionNinos');
    if (llevaNinos) {
        if (clasif === 'C') {
            validacion.innerText = '¡No puedes llevar niños a esta película!';
            validacion.style.display = 'block';
        } else if (clasif === 'B') {
            validacion.innerText = 'Advertencia: Película para adolescentes, se recomienda discreción.';
            validacion.style.display = 'block';
        } else if (clasif === 'R') {
            validacion.innerText = 'Solo pueden entrar niños acompañados de un adulto.';
            validacion.style.display = 'block';
        } else {
            validacion.innerText = '';
            validacion.style.display = 'none';
        }
    } else {
        validacion.innerText = '';
        validacion.style.display = 'none';
    }
}

window.pagarBoletos = pagarBoletos;
window.calificarPelicula = calificarPelicula;

function pagarBoletos() {
    let asientos = Array.from(document.querySelectorAll('.asiento:checked')).map(x => x.value);
    if (asientos.length === 0) {
        Swal.fire({ icon: 'warning', title: 'Advertencia', text: 'Selecciona al menos un asiento.' });
        return;
    }
    let llevaNinos = document.getElementById('llevaNinos').checked;
    let clasif = peliculaSeleccionada.clasificacion;
    if (llevaNinos && clasif === 'C') {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No puedes llevar niños a esta película.' });
        return;
    }
    let precio = parseFloat(peliculaSeleccionada.precio);
    let descuento = 0;
    if (llevaNinos && (clasif === 'A' || clasif === 'R')) {
        descuento = 0.3 * precio;
    }
    let total = (precio - descuento) * asientos.length;
    let datos = {
        id_usuario: usuario.id,
        id_pelicula: peliculaSeleccionada.id,
        fecha_funcion: new Date().toISOString().slice(0,10),
        hora_funcion: document.getElementById('horaFuncion').value,
        asientos: asientos.join(','),
        lleva_ninos: llevaNinos ? 1 : 0,
        descuento: descuento * asientos.length,
        total: total
    };
    fetch('php/boletos.php', {
        method: 'POST',
        body: JSON.stringify({action:'comprarBoleto', ...datos}),
        headers: {'Content-Type':'application/json'}
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            descargarPDFBoleto(datos, data.sala);
            cerrarModal();
        } else {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al pagar: ' + data.message });
        }
    })
    .catch(error => {
        console.error('Error en pagarBoletos:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al procesar el pago.' });
    });
}

function descargarPDFBoleto(datos, sala) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Boleto de Cine", 20, 20);

    doc.setFontSize(12);
    doc.text(`Pelicula: ${peliculaSeleccionada.titulo}`, 20, 35);
    doc.text(`Sala: ${sala}`, 20, 45);
    doc.text(`Fecha: ${datos.fecha_funcion}`, 20, 55);
    doc.text(`Hora: ${datos.hora_funcion}`, 20, 65);
    doc.text(`Asientos: ${datos.asientos}`, 20, 75);
    doc.text(`Precio total: $${datos.total.toFixed(2)}`, 20, 85);

    if (datos.descuento > 0) {
        doc.setTextColor(0, 128, 0);
        doc.text(`¡Descuento aplicado! -$${datos.descuento.toFixed(2)}`, 20, 95);
        doc.setTextColor(0, 0, 0);
    }

    doc.text(`Cliente: ${usuario.nombre || usuario.email}`, 20, 105);

    doc.save(`boleto_${peliculaSeleccionada.titulo.replace(/\s+/g, '_')}.pdf`);
    Swal.fire({
        icon: 'success',
        title: '¡Compra exitosa!',
        text: 'Tu boleto ha sido descargado en PDF.',
        confirmButtonText: 'Aceptar'
    });
}

function mostrarEstrellas() {
    let cont = document.getElementById('estrellas');
    cont.innerHTML = '';
    for (let i = 1; i <= 5; i++) {
        cont.innerHTML += `<span class="estrella inactiva" onclick="calificarPelicula(${i})">&#9733;</span>`;
    }
}

function calificarPelicula(estrellas) {
    fetch('php/calificaciones.php', {
        method: 'POST',
        body: JSON.stringify({
            action: 'calificar',
            id_usuario: usuario.id,
            id_pelicula: peliculaSeleccionada.id,
            estrellas: estrellas
        }),
        headers: {'Content-Type':'application/json'}
    }).then(res => res.json())
    .then(data => {
        if (data.success) {
            Swal.fire({ icon: 'success', title: '¡Gracias!', text: '¡Gracias por tu calificación!' });
        }
    })
    .catch(error => {
        console.error('Error en calificarPelicula:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Error al calificar la película.' });
    });
} 