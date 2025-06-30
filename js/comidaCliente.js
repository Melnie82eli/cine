let usuario = JSON.parse(localStorage.getItem('user') || '{}');
let comida = [];
let comidaFiltrada = [];
let categoriasComida = [
    { tipo: null, nombre: 'Todos' },
    { tipo: 'comida', nombre: 'Comida' },
    { tipo: 'bebida', nombre: 'Bebidas' },
    { tipo: 'dulce', nombre: 'Dulces' },
    { tipo: 'snack', nombre: 'Snacks' }
];
let categoriaSeleccionada = null;
let carrito = JSON.parse(localStorage.getItem('carritoComida') || '[]');

document.addEventListener('DOMContentLoaded', function() {
    if (!usuario || usuario.role !== 'cliente') {
        window.location.href = 'index.html';
        return;
    }
    cargarComida();
    mostrarCategoriasComida();
    actualizarCarrito();
});

function mostrarCategoriasComida() {
    const sidebar = document.getElementById('categoriasSidebar');
    sidebar.innerHTML = '';
    categoriasComida.forEach(cat => {
        sidebar.innerHTML += `<button class="categoria-item${categoriaSeleccionada === cat.tipo ? ' selected' : ''}" onclick="seleccionarCategoriaComida('${cat.tipo === null ? '' : cat.tipo}')">${cat.nombre}</button>`;
    });
}

window.seleccionarCategoriaComida = function(tipo) {
    categoriaSeleccionada = tipo || null;
    filtrarComida();
    mostrarCategoriasComida();
}

function cargarComida() {
    fetch('php/comida.php?action=getFood')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                comida = data.food;
                filtrarComida();
            }
        });
}

function filtrarComida() {
    if (!categoriaSeleccionada) {
        comidaFiltrada = comida;
    } else {
        comidaFiltrada = comida.filter(c => c.tipo === categoriaSeleccionada);
    }
    mostrarComida();
}

function mostrarComida() {
    const cont = document.getElementById('comidaContainer');
    cont.innerHTML = '';
    (comidaFiltrada.length ? comidaFiltrada : comida).forEach(c => {
        let enCarrito = carrito.find(item => item.id === c.id);
        let stockDisponible = c.stock - (enCarrito ? enCarrito.cantidad : 0);
        cont.innerHTML += `
            <div class="comida-card">
                <img src="${c.imagen || 'https://via.placeholder.com/200x120/274690/fff?text=Comida'}" alt="${c.nombre}">
                <h3 style="color:#274690;">${c.nombre}</h3>
                <p>${c.descripcion}</p>
                <p><b>$${c.precio}</b></p>
                <p style="margin:0 0 8px 0;"><b>Stock:</b> ${stockDisponible}</p>
                <button class="btn-azul" onclick="agregarCarrito(${c.id})" ${stockDisponible <= 0 ? 'disabled style=\'background:#ccc;cursor:not-allowed;\'' : ''}>${stockDisponible <= 0 ? 'Sin stock' : 'Agregar'}</button>
            </div>
        `;
    });
}

window.agregarCarrito = function(id) {
    let item = comida.find(c => c.id == id);
    let enCarrito = carrito.find(c => c.id == id);
    let stockDisponible = item.stock - (enCarrito ? enCarrito.cantidad : 0);
    if (stockDisponible <= 0) {
        Swal.fire('Sin stock', 'No hay stock disponible para este producto.', 'warning');
        return;
    }
    if (enCarrito) {
        enCarrito.cantidad++;
    } else {
        carrito.push({...item, cantidad: 1});
    }
    localStorage.setItem('carritoComida', JSON.stringify(carrito));
    actualizarCarrito();
    mostrarComida();
}

function actualizarCarrito() {
    document.getElementById('carritoCount').innerText = carrito.reduce((a,b) => a + b.cantidad, 0);
}

window.verCarrito = function() {
    if (carrito.length === 0) {
        document.getElementById('carritoBody').innerHTML = '<h2>Carrito</h2><p>El carrito está vacío.</p>';
        document.getElementById('modalCarrito').style.display = 'flex';
        return;
    }
    Swal.fire({
        title: '¿Llevas niños?',
        text: 'Si llevas niños tendrás 30% de descuento en la comida.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        reverseButtons: true
    }).then((result) => {
        let llevaNinos = result.isConfirmed;
        let descuento = llevaNinos ? 0.3 : 0;
        let total = carrito.reduce((a,b) => a + b.precio * b.cantidad, 0);
        let totalDesc = total - (total * descuento);
        let html = '<h2>Carrito</h2><ul>';
        carrito.forEach(item => {
            html += `<li>${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</li>`;
        });
        html += `</ul>
            <p><b>Subtotal:</b> $${total.toFixed(2)}</p>
            ${descuento ? `<p><b>Descuento:</b> 30% (-$${(total*descuento).toFixed(2)})</p>` : ''}
            <p><b>Total:</b> $${totalDesc.toFixed(2)}</p>
            <button class="btn-azul" id="btnPagarComida">Pagar</button>
            <button class="btn-azul" id="btnVaciarCarrito" style="background:#e74c3c;margin-left:10px;">Vaciar carrito</button>
            <div id="ticketContainer"></div>
        `;
        document.getElementById('carritoBody').innerHTML = html;
        document.getElementById('modalCarrito').style.display = 'flex';
        document.getElementById('btnPagarComida').onclick = function() {
            mostrarModalPagoComida(total, descuento, totalDesc);
        };
        document.getElementById('btnVaciarCarrito').onclick = function() {
            carrito = [];
            localStorage.setItem('carritoComida', JSON.stringify(carrito));
            actualizarCarrito();
            document.getElementById('carritoBody').innerHTML = '<h2>Carrito</h2><p>El carrito está vacío.</p>';
        };
    });
}

function mostrarModalPagoComida(subtotal, descuento, totalDesc) {
    let modal = document.createElement('div');
    modal.id = 'modalPagoComida';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:4000;';
    modal.innerHTML = `
        <div style="background:#fff;padding:32px 28px;border-radius:14px;min-width:320px;max-width:90vw;box-shadow:0 8px 32px #27469033;position:relative;">
            <span id="cerrarModalPagoComida" style="position:absolute;top:10px;right:20px;cursor:pointer;font-size:22px;">&times;</span>
            <h2 style="color:#274690;text-align:center;margin-bottom:18px;">Pago</h2>
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
                <div><b>Total a pagar:</b> $${totalDesc.toFixed(2)}</div>
                <label style="font-weight:500;">¿Con cuánto pagas?
                    <input type="number" id="dineroCliente" min="0" step="0.01" value="" style="width:100px;padding:6px 8px;margin-left:8px;border-radius:6px;border:1px solid #b3c6ff;">
                </label>
                <div id="cambioCliente" style="font-size:1.1em;color:#274690;font-weight:600;">Cambio: $0.00</div>
                <button class="btn-azul" id="btnConfirmarPagoComida" disabled>Pagar y generar ticket</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cerrarModalPagoComida').onclick = function() {
        document.body.removeChild(modal);
    };
    let inputDinero = document.getElementById('dineroCliente');
    let cambioDiv = document.getElementById('cambioCliente');
    let btnConfirmar = document.getElementById('btnConfirmarPagoComida');
    inputDinero.oninput = function() {
        let pagado = parseFloat(inputDinero.value) || 0;
        let cambio = pagado - totalDesc;
        cambioDiv.innerText = `Cambio: $${cambio >= 0 ? cambio.toFixed(2) : '0.00'}`;
        btnConfirmar.disabled = pagado < totalDesc;
    };
    btnConfirmar.onclick = function() {
        let pagado = parseFloat(inputDinero.value) || 0;
        let cambio = pagado - totalDesc;
        // Enviar productos al backend para descontar stock
        btnConfirmar.disabled = true;
        btnConfirmar.innerText = 'Procesando...';
        fetch('php/comida.php?action=descontarStock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'productos=' + encodeURIComponent(JSON.stringify(carrito.map(item => ({id: item.id, cantidad: item.cantidad}))))
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.body.removeChild(modal);
                mostrarTicketComida(subtotal, descuento, totalDesc, pagado, cambio);
            } else {
                btnConfirmar.disabled = false;
                btnConfirmar.innerText = 'Pagar y generar ticket';
                Swal.fire('Error', data.message || 'No se pudo descontar el stock. Intenta de nuevo.', 'error');
            }
        })
        .catch(() => {
            btnConfirmar.disabled = false;
            btnConfirmar.innerText = 'Pagar y generar ticket';
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
        });
    };
}

function mostrarTicketComida(subtotal, descuento, totalDesc, pagado, cambio) {
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) {
        Swal.fire({icon:'info',title:'Ticket',html:generarHtmlTicket(subtotal, descuento, totalDesc, pagado, cambio)});
        return;
    }
    let doc = new jsPDF();
    let y = 15;
    doc.setFontSize(18);
    doc.text('Ticket de Comida', 70, y);
    y += 10;
    doc.setFontSize(12);
    doc.text('Productos:', 10, y);
    y += 8;
    carrito.forEach(item => {
        doc.text(`- ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}`, 12, y);
        y += 7;
        let prod = comida.find(c => c.id === item.id);
        if (prod) prod.stock -= item.cantidad;
    });
    y += 2;
    doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 12, y);
    y += 7;
    if (descuento > 0) {
        doc.setTextColor(0,128,0);
        doc.text(`Descuento: 30% (-$${(subtotal*descuento).toFixed(2)})`, 12, y);
        doc.setTextColor(0,0,0);
        y += 7;
    }
    doc.text(`Total: $${totalDesc.toFixed(2)}`, 12, y);
    y += 7;
    doc.text(`Pagado: $${pagado.toFixed(2)}`, 12, y);
    y += 7;
    doc.text(`Cambio: $${cambio.toFixed(2)}`, 12, y);
    y += 10;
    doc.text('¡Gracias por tu compra!', 60, y);
    doc.save('ticket_comida.pdf');
    Swal.fire({icon:'success',title:'¡Compra exitosa!',text:'Tu ticket ha sido descargado en PDF.'});
    carrito = [];
    localStorage.setItem('carritoComida', JSON.stringify(carrito));
    actualizarCarrito();
    mostrarComida();
    cerrarCarrito();
}

function generarHtmlTicket(subtotal, descuento, totalDesc, pagado, cambio) {
    let html = '<b>Ticket de Comida</b><br><ul>';
    carrito.forEach(item => {
        html += `<li>${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toFixed(2)}</li>`;
    });
    html += '</ul>';
    html += `<b>Subtotal:</b> $${subtotal.toFixed(2)}<br>`;
    if (descuento > 0) {
        html += `<b>Descuento:</b> 30% (-$${(subtotal*descuento).toFixed(2)})<br>`;
    }
    html += `<b>Total:</b> $${totalDesc.toFixed(2)}<br>`;
    html += `<b>Pagado:</b> $${pagado.toFixed(2)}<br>`;
    html += `<b>Cambio:</b> $${cambio.toFixed(2)}<br>`;
    html += '<br>¡Gracias por tu compra!';
    return html;
}

window.cerrarCarrito = function() {
    document.getElementById('modalCarrito').style.display = 'none';
} 