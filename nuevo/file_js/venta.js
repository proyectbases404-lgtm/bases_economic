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
    categorias: document.querySelectorAll('.cat_bot'),
    metodoPago: document.getElementById('metodo_pago')
};

function agregarProducto(productoElement) {
    const id = productoElement.dataset.id;
    const nombre = productoElement.dataset.name;
    const precioBase = parseFloat(productoElement.dataset.price);

    // Verificar si ya existe en la venta con la misma agrupación "Unidad"
    const productoExistente = estado.productos.find(p => String(p.id) === String(id) && p.agrupacion === "Unidad");

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        estado.productos.push({
            id: id,
            nombre: nombre,
            basePrice: precioBase,
            precio: precioBase,
            agrupacion: "Unidad",
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
            const prodInventario = window.productosInventario?.find(p => String(p.id) === String(producto.id));
            let selectAgrupacionHTML = '';

            if (prodInventario && prodInventario.groupings) {
                const groupingsList = Object.keys(prodInventario.groupings);
                if (groupingsList.length > 0) {
                    selectAgrupacionHTML = `
                        <div class="venta_agrupacion_select_wrapper" style="margin-top: 4px; display: flex; align-items: center; justify-content: center;">
                            <select class="venta_agrupacion_select" onchange="cambiarAgrupacion(${index}, this.value)" style="padding: 4px 8px; font-size: 0.75rem; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; background: #f8fafc; color: #334155; font-weight: 600; cursor: pointer; width: 100%; max-width: 140px; text-align: center;">
                                ${groupingsList.map(gName => {
                                    const equiv = prodInventario.groupings[gName];
                                    const isSelected = producto.agrupacion === gName ? 'selected' : '';
                                    return `<option value="${gName}" ${isSelected}>${gName} (${equiv} ud${equiv > 1 ? 's' : ''})</option>`;
                                }).join('')}
                            </select>
                        </div>
                    `;
                }
            }

            const totalProducto = producto.precio * producto.cantidad;
            return `
                    <tr data-index="${index}">
                        <td>
                            <div style="font-weight: 700; color: #0f172a; text-align: center;">${producto.nombre}</div>
                            ${selectAgrupacionHTML}
                        </td>
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
// CAMBIAR AGRUPACIÓN
// ============================================
function cambiarAgrupacion(index, nuevaAgrupacion) {
    const producto = estado.productos[index];
    if (!producto) return;

    producto.agrupacion = nuevaAgrupacion;

    // Buscar el producto en el inventario para obtener la equivalencia
    const prodInventario = window.productosInventario?.find(p => String(p.id) === String(producto.id));
    const equiv = (prodInventario && prodInventario.groupings) ? (prodInventario.groupings[nuevaAgrupacion] || 1) : 1;

    let precioAgrup = producto.basePrice * equiv;

    // Buscar si hay precio especial configurado
    if (window.preciosConfigurados && window.preciosConfigurados[producto.id]) {
        const config = window.preciosConfigurados[producto.id].find(c => c.name === nuevaAgrupacion);
        if (config) {
            precioAgrup = config.price;
        }
    }

    producto.precio = precioAgrup;
    actualizarTabla();
}
window.cambiarAgrupacion = cambiarAgrupacion;

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
    const metodo = elementos.metodoPago ? elementos.metodoPago.value : 'efectivo';
    if (metodo !== 'efectivo') {
        elementos.pagoCon.value = estado.total > 0 ? estado.total.toFixed(0) : '';
        elementos.vuelto.value = estado.total > 0 ? '0' : '';
        return;
    }

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

    const metodoPago = elementos.metodoPago.value;
    let pago = parseFloat(elementos.pagoCon.value) || 0;

    if (metodoPago === 'efectivo') {
        if (pago < estado.total) {
            alert('El monto pagado es menor al total');
            return;
        }
    } else {
        pago = estado.total;
    }

    const cambio = pago - estado.total;

    // Obtener ventas del sistema
    let ventas = JSON.parse(localStorage.getItem("ventasSistema")) || [];
    if (ventas.length === 0 && typeof REPORT_DATABASE !== 'undefined') {
        ventas = [...REPORT_DATABASE.ventas];
    }

    // Incrementar ID
    let nextIdNum = 11;
    ventas.forEach(v => {
        const match = v.id.match(/VTA-0*(\d+)/);
        if (match) {
            const idNum = parseInt(match[1]);
            if (idNum >= nextIdNum) nextIdNum = idNum + 1;
        }
    });
    const nextId = `VTA-${String(nextIdNum).padStart(4, '0')}`;

    const activeOperator = document.querySelector("header .box_comp label")?.textContent || "Carmelo";
    const activeSucursal = document.getElementById("card_operar_sucursal")?.textContent || "Central";
    const productNames = estado.productos.map(p => `${p.nombre} x${p.cantidad}`);

    // Crear venta
    const nuevaVenta = {
        id: nextId,
        fecha: new Date().toISOString().split('T')[0],
        cliente: "Invitado",
        vendedor: activeOperator,
        metodoPago: metodoPago.charAt(0).toUpperCase() + metodoPago.slice(1),
        total: estado.total,
        costo: estado.productos.reduce((sum, p) => {
            const prodInv = window.productosInventario?.find(i => String(i.id) === String(p.id));
            const cost = prodInv ? prodInv.price * 0.65 : p.precio * 0.65;
            return sum + (cost * p.cantidad);
        }, 0),
        sucursal: activeSucursal,
        productos: productNames,
        detallesProductos: [...estado.productos],
        pagoCon: pago,
        vuelto: cambio,
        estado: "Completada"
    };

    ventas.unshift(nuevaVenta);
    localStorage.setItem("ventasSistema", JSON.stringify(ventas));

    alert("Venta realizada con éxito");

    // Limpiar después de pagar
    estado.productos = [];
    estado.total = 0;
    elementos.pagoCon.value = '';
    elementos.vuelto.value = '';
    actualizarTabla();

    // Actualizar historial de ventas si existe
    if (typeof window.cargarVentasRealizadas === "function") {
        window.cargarVentasRealizadas();
    }
    if (typeof window.recalcularVentasEfectivo === "function") {
        window.recalcularVentasEfectivo();
        window.calcularCuadre();
    }
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

// Manejar cambio de método de pago
elementos.metodoPago.addEventListener('change', () => {
    const metodo = elementos.metodoPago.value;
    if (metodo === 'efectivo') {
        elementos.pagoCon.disabled = false;
        elementos.pagoCon.value = '';
        elementos.vuelto.value = '';
    } else {
        elementos.pagoCon.disabled = true;
        elementos.pagoCon.value = estado.total > 0 ? estado.total.toFixed(0) : '';
        elementos.vuelto.value = estado.total > 0 ? '0' : '';
    }
});

// Botón pagar
elementos.btnPagar.addEventListener('click', procesarPago);

// Botón cancelar
elementos.btnCancelar.addEventListener('click', cancelarVenta);
