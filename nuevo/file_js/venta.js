const estado = {
    productos: [],
    total: 0
};

// Elementos del DOM
const elementos = {
    productosContainer: document.getElementById('productos-container'),
    tablaVentas: document.getElementById('tabla_ventas'),
    totalVenta: document.getElementById('total_venta'),
    pagoCon: document.getElementById('pago_con'),
    vuelto: document.getElementById('vuelto'),
    btnPagar: document.getElementById('btn_pagar'),
    btnCancelar: document.getElementById('btn_cancelar'),
    buscador: document.getElementById('buscador'),
    categorias: document.querySelectorAll('.cat_bot')
};

function agregarProducto(productoElement) {
    const id = parseInt(productoElement.dataset.id);
    const nombre = productoElement.dataset.name;
    const precio = parseFloat(productoElement.dataset.price);

    // Verificar si ya existe en la venta
    const productoExistente = estado.productos.find(p => p.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        estado.productos.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    actualizarTabla();
}

function actualizarTabla() {
    if (estado.productos.length === 0) {
        elementos.tablaVentas.innerHTML = `
                <tr id="fila_vacia">
                    <td colspan="4" style="color: #94a3b8; padding: 20px; text-align: center;">
                        No hay productos en la venta
                    </td>
                </tr>
            `;
        estado.total = 0;
    } else {
        elementos.tablaVentas.innerHTML = estado.productos.map((producto, index) => {
            const totalProducto = producto.precio * producto.cantidad;
            return `
                    <tr data-index="${index}">
                        <td>${producto.nombre}</td>
                        <td>
                            <div class="box_edit">
                                <button class="bot_mod" onclick="cambiarCantidad(${index}, -1)">-</button>
                                <input type="number" class="cant_input" value="${producto.cantidad}" 
                                       min="1" onchange="actualizarCantidadManual(${index}, this.value)">
                                <button class="bot_mod" onclick="cambiarCantidad(${index}, 1)">+</button>
                            </div>
                        </td>
                        <td>C$${totalProducto.toFixed(0)}</td>
                        <td>
                            <button class="btn_eliminar" onclick="eliminarProducto(${index})" title="Eliminar">
                                <img src="img/borrar.png" alt="Eliminar">
                            </button>
                        </td>
                    </tr>
                `;
        }).join('');

        // Calcular total
        estado.total = estado.productos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
    }

    // Actualizar display del total
    elementos.totalVenta.textContent = `C$${estado.total.toFixed(0)}`;

    // Actualizar cambio si hay pago
    calcularCambio();
}

// ============================================
// CAMBIAR CANTIDAD
// ============================================
function cambiarCantidad(index, cambio) {
    const producto = estado.productos[index];
    if (producto) {
        producto.cantidad += cambio;
        if (producto.cantidad < 1) {
            producto.cantidad = 1;
        }
        actualizarTabla();
    }
}

// ============================================
// ACTUALIZAR CANTIDAD MANUAL
// ============================================
function actualizarCantidadManual(index, valor) {
    const nuevaCantidad = parseInt(valor);
    if (nuevaCantidad && nuevaCantidad > 0) {
        estado.productos[index].cantidad = nuevaCantidad;
        actualizarTabla();
    }
}

// ============================================
// ELIMINAR PRODUCTO
// ============================================
function eliminarProducto(index) {
    estado.productos.splice(index, 1);
    actualizarTabla();
}

// ============================================
// CALCULAR CAMBIO
// ============================================
function calcularCambio() {
    const pago = parseFloat(elementos.pagoCon.value) || 0;
    const cambio = pago - estado.total;

    if (pago >= estado.total && pago > 0) {
        elementos.vuelto.value = cambio.toFixed(0);
    } else {
        elementos.vuelto.value = '';
    }
}

// ============================================
// FILTRAR POR CATEGORÍA
// ============================================
function filtrarPorCategoria(categoria) {
    const productos = document.querySelectorAll('.producto');

    productos.forEach(producto => {
        if (categoria === 'todos' || producto.dataset.category === categoria) {
            producto.style.display = 'flex';
        } else {
            producto.style.display = 'none';
        }
    });
}

// ============================================
// BUSCAR PRODUCTOS
// ============================================
function buscarProductos(termino) {
    const productos = document.querySelectorAll('.producto');
    const busqueda = termino.toLowerCase().trim();

    productos.forEach(producto => {
        const nombre = producto.dataset.name.toLowerCase();
        if (nombre.includes(busqueda) || busqueda === '') {
            producto.style.display = 'flex';
        } else {
            producto.style.display = 'none';
        }
    });
}

// ============================================
// PROCESAR PAGO
// ============================================
function procesarPago() {
    if (estado.productos.length === 0) {
        alert('No hay productos en la venta');
        return;
    }

    const pago = parseFloat(elementos.pagoCon.value) || 0;

    if (pago < estado.total) {
        alert('El monto pagado es menor al total');
        return;
    }

    // Aquí puedes agregar la lógica para guardar la venta
    const metodoPago = document.getElementById('metodo_pago').value;
    const cambio = pago - estado.total;

    alert(`Venta procesada:\nTotal: C$${estado.total}\nMétodo: ${metodoPago}\nPago: C$${pago}\nCambio: C$${cambio.toFixed(0)}`);

    // Limpiar después de pagar
    estado.productos = [];
    estado.total = 0;
    elementos.pagoCon.value = '';
    elementos.vuelto.value = '';
    actualizarTabla();
}

// ============================================
// CANCELAR VENTA
// ============================================
function cancelarVenta() {
    if (confirm('¿Está seguro de cancelar la venta?')) {
        estado.productos = [];
        estado.total = 0;
        elementos.pagoCon.value = '';
        elementos.vuelto.value = '';
        actualizarTabla();
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Agregar productos al hacer clic
elementos.productosContainer.addEventListener('click', (e) => {
    const producto = e.target.closest('.producto');
    if (producto) {
        agregarProducto(producto);
    }
});

// Categorías
elementos.categorias.forEach(boton => {
    boton.addEventListener('click', () => {
        // Quitar clase active de todos
        elementos.categorias.forEach(b => b.classList.remove('active'));
        // Agregar active al actual
        boton.classList.add('active');
        // Filtrar
        filtrarPorCategoria(boton.dataset.category);
    });
});

// Buscador
elementos.buscador.addEventListener('input', (e) => {
    buscarProductos(e.target.value);
});

// Calcular cambio al escribir
elementos.pagoCon.addEventListener('input', calcularCambio);

// Botón pagar
elementos.btnPagar.addEventListener('click', procesarPago);

// Botón cancelar
elementos.btnCancelar.addEventListener('click', cancelarVenta);