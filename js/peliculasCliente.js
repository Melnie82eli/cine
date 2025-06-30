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
            if (data.success && data.categories && data.categories.length > 0) {
                categorias = data.categories;
                mostrarCategorias();
            } else {
                categorias = [];
                mostrarCategorias();
                document.getElementById('categoriasSidebar').innerHTML = '<p style="color:#fff;text-align:center;">No hay categorías disponibles</p>';
            }
        })
        .catch(err => {
            categorias = [];
            mostrarCategorias();
            document.getElementById('categoriasSidebar').innerHTML = '<p style="color:#fff;text-align:center;">Error al cargar categorías</p>';
        });
}

function mostrarCategorias() {
    const sidebar = document.getElementById('categoriasSidebar');
    sidebar.innerHTML = '<button class="categoria-item' + (categoriaSeleccionada === null ? ' selected' : '') + '" onclick="seleccionarCategoria(null)">Todas las películas</button>';
    categorias.forEach(cat => {
        sidebar.innerHTML += `<button class="categoria-item${categoriaSeleccionada == cat.id ? ' selected' : ''}" onclick="seleccionarCategoria(${cat.id})">${cat.nombre}</button>`;
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
            if (data.success && data.movies && data.movies.length > 0) {
                peliculas = data.movies;
                filtrarPeliculas();
            } else {
                peliculas = [];
                filtrarPeliculas();
                document.getElementById('peliculasContainer').innerHTML = '<p style="color:#274690;text-align:center;">No hay películas disponibles</p>';
            }
        })
        .catch(err => {
            peliculas = [];
            filtrarPeliculas();
            document.getElementById('peliculasContainer').innerHTML = '<p style="color:#274690;text-align:center;">Error al cargar películas</p>';
        });
}

window.filtrarPeliculas = filtrarPeliculas;

function filtrarPeliculas() {
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
                <button class="btn-azul" id="btnPagar" type="button">Pagar</button>
                <button class="btn-azul" onclick="pagarBoletos()">Generar ticket</button>
            </div>
        </div>
    `;
    document.getElementById('llevaNinos').addEventListener('change', validarClasificacionNinos);
    document.getElementById('modalPelicula').style.display = 'flex';
    document.getElementById('btnPagar').onclick = function() {
        mostrarModalPago();
    };
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
    const posterUrl = peliculaSeleccionada.poster || 'https://via.placeholder.com/200x300/274690/fff?text=Película';

    toDataURL(posterUrl, function(base64Img) {
        doc.addImage(base64Img, 'JPEG', 10, 10, 60, 90);
        doc.setFontSize(22);
        doc.text("Boleto de Cine", 80, 25);
        doc.setFontSize(14);
        let y = 40;
        doc.text(`Pelicula: ${peliculaSeleccionada.titulo}`, 80, y);
        y += 10;
        doc.text(`Sala: ${sala}`, 80, y);
        y += 10;
        doc.text(`Fecha: ${datos.fecha_funcion}`, 80, y);
        y += 10;
        doc.text(`Hora: ${datos.hora_funcion}`, 80, y);
        y += 10;
        doc.text(`Asientos: ${datos.asientos}`, 80, y);
        y += 10;
        if (datos.descuento > 0) {
            doc.setTextColor(0, 128, 0);
            doc.text(`Descuento aplicado: -$${datos.descuento.toFixed(2)}`, 80, y);
            doc.setTextColor(0, 0, 0);
            y += 10;
            doc.text(`Total pagado: $${datos.total.toFixed(2)}`, 80, y);
        } else {
            doc.text(`Precio total: $${datos.total.toFixed(2)}`, 80, y);
        }
        y += 15;
        doc.setFontSize(13);
        doc.text(`Cliente: ${usuario.nombre || usuario.email}`, 80, y);
        doc.save(`boleto_${peliculaSeleccionada.titulo.replace(/\s+/g, '_')}.pdf`);
        Swal.fire({
            icon: 'success',
            title: '¡Compra exitosa!',
            text: 'Tu boleto ha sido descargado en PDF.',
            confirmButtonText: 'Aceptar'
        });
    });
}

function toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = function() {
        callback('');
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

function mostrarModalPago() {
    let llevaNinos = document.getElementById('llevaNinos').checked;
    let clasif = peliculaSeleccionada.clasificacion;
    let precio = 50; // Precio fijo por boleto
    let descuento = 0;
    if (llevaNinos && (clasif === 'A' || clasif === 'R')) {
        descuento = 0.3 * precio;
    }
    let precioFinal = precio - descuento;
    let modal = document.createElement('div');
    modal.id = 'modalPago';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:3000;';
    modal.innerHTML = `
        <div style="background:#fff;padding:32px 28px;border-radius:14px;min-width:320px;max-width:90vw;box-shadow:0 8px 32px #27469033;position:relative;">
            <span id="cerrarModalPago" style="position:absolute;top:10px;right:20px;cursor:pointer;font-size:22px;">&times;</span>
            <h2 style="color:#274690;text-align:center;margin-bottom:18px;">¿Cuántos boletos deseas?</h2>
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <label style="font-weight:500;">Cantidad de boletos:
                    <input type="number" id="cantidadBoletos" min="1" value="1" style="width:60px;padding:6px 8px;margin-left:8px;border-radius:6px;border:1px solid #b3c6ff;">
                </label>
                <div id="totalPagar" style="font-size:1.2em;color:#274690;font-weight:600;">Total: $${precioFinal.toFixed(2)}</div>
                <button class="btn-azul" id="confirmarPago">Confirmar pago</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cerrarModalPago').onclick = function() {
        document.body.removeChild(modal);
    };
    function actualizarTotal() {
        let cant = parseInt(document.getElementById('cantidadBoletos').value) || 1;
        let llevaNinos = document.getElementById('llevaNinos').checked;
        let descuento = 0;
        if (llevaNinos && (clasif === 'A' || clasif === 'R')) {
            descuento = 0.3 * precio;
        }
        let precioFinal = precio - descuento;
        document.getElementById('totalPagar').innerText = `Total: $${(precioFinal * cant).toFixed(2)}`;
    }
    document.getElementById('cantidadBoletos').oninput = actualizarTotal;
    document.getElementById('llevaNinos').addEventListener('change', actualizarTotal);
    document.getElementById('confirmarPago').onclick = function() {
        Swal.fire({icon:'success',title:'Pago realizado',text:'¡El pago se ha realizado correctamente!'});
        document.body.removeChild(modal);
    };
} 