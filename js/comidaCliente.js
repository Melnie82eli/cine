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
        cont.innerHTML += `
            <div class="comida-card">
                <img src="${c.imagen || 'https://via.placeholder.com/200x120/274690/fff?text=Comida'}" alt="${c.nombre}">
                <h3 style="color:#274690;">${c.nombre}</h3>
                <p>${c.descripcion}</p>
                <p><b>$${c.precio}</b></p>
                <button class="btn-azul" onclick="agregarCarrito(${c.id})">Agregar</button>
            </div>
        `;
    });
}

window.agregarCarrito = function(id) {
    let item = comida.find(c => c.id == id);
    let existe = carrito.find(c => c.id == id);
    if (existe) {
        existe.cantidad++;
    } else {
        carrito.push({...item, cantidad: 1});
    }
    localStorage.setItem('carritoComida', JSON.stringify(carrito));
    actualizarCarrito();
}

function actualizarCarrito() {
    document.getElementById('carritoCount').innerText = carrito.reduce((a,b) => a + b.cantidad, 0);
}

window.verCarrito = function() {
    let llevaNinos = confirm('¿Llevas niños? Si llevas niños tendrás 30% de descuento en la comida.');
    let descuento = llevaNinos ? 0.3 : 0;
    let total = carrito.reduce((a,b) => a + b.precio * b.cantidad, 0);
    let totalDesc = total - (total * descuento);
    let html = '<h2>Carrito</h2><ul>';
    carrito.forEach(item => {
        html += `<li>${item.nombre} x${item.cantidad} - $${item.precio * item.cantidad}</li>`;
    });
    html += `</ul>
        <p><b>Subtotal:</b> $${total.toFixed(2)}</p>
        ${descuento ? `<p><b>Descuento:</b> 30% (-$${(total*descuento).toFixed(2)})</p>` : ''}
        <p><b>Total:</b> $${totalDesc.toFixed(2)}</p>
        <button class="btn-azul" onclick="pagarComida(${llevaNinos})">Pagar</button>
    `;
    document.getElementById('carritoBody').innerHTML = html;
    document.getElementById('modalCarrito').style.display = 'flex';
}

window.cerrarCarrito = function() {
    document.getElementById('modalCarrito').style.display = 'none';
}

window.pagarComida = function(llevaNinos) {
    let descuento = llevaNinos ? 0.3 : 0;
    let total = carrito.reduce((a,b) => a + b.precio * b.cantidad, 0);
    let totalDesc = total - (total * descuento);
    let productos = carrito.map(item => `${item.nombre}x${item.cantidad}`).join(',');
    fetch('php/compras_comida.php', {
        method: 'POST',
        body: JSON.stringify({
            action: 'comprarComida',
            id_usuario: usuario.id,
            productos: productos,
            lleva_ninos: llevaNinos ? 1 : 0,
            descuento: total*descuento,
            total: totalDesc
        }),
        headers: {'Content-Type':'application/json'}
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert('¡Compra exitosa! (Aquí se descargaría el PDF con los datos de la compra)');
            carrito = [];
            localStorage.setItem('carritoComida', JSON.stringify(carrito));
            actualizarCarrito();
            cerrarCarrito();
        } else {
            alert('Error al pagar: ' + data.message);
        }
    });
} 