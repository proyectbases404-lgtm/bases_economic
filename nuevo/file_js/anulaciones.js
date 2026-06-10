// ==========================================
// SISTEMA DE ANULACIÓN Y SOLICITUDES
// ==========================================

// Filtro activo de las tarjetas KPI
let filtroAnulacionActivo = "Todas";

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar bandeja si estamos en la sección de anulaciones
    renderSolicitudes();

    // Sincronizar al presionar el botón de la barra de navegación
    document.getElementById("nav_anulaciones")?.addEventListener("click", () => {
        renderSolicitudes();
    });

    // Vincular buscador local
    document.getElementById("buscar_solicitud_anulacion")?.addEventListener("input", filtrarTablaSolicitudes);

    // === CLICK EN TARJETAS KPI PARA FILTRAR TABLA ===
    document.querySelectorAll(".card_filtro_anulacion").forEach(card => {
        card.addEventListener("click", () => {
            const filtro = card.getAttribute("data-filter");
            filtroAnulacionActivo = filtro;

            // Actualizar estado visual de las tarjetas
            document.querySelectorAll(".card_filtro_anulacion").forEach(c => {
                c.classList.remove("active_filter_card");
            });
            card.classList.add("active_filter_card");

            // Actualizar título de la tabla según filtro
            const tituloTabla = document.querySelector("#anulaciones .box_tabla_operar h2");
            if (tituloTabla) {
                if (filtro === "Todas") {
                    tituloTabla.textContent = "Listado de Solicitudes de Anulación";
                } else if (filtro === "Pendiente") {
                    tituloTabla.textContent = "Solicitudes Pendientes de Revisión";
                } else if (filtro === "Aprobada") {
                    tituloTabla.textContent = "Solicitudes Aprobadas";
                } else if (filtro === "Rechazada") {
                    tituloTabla.textContent = "Solicitudes Rechazadas";
                }
            }

            // Re-renderizar tabla con el filtro
            renderSolicitudes();
        });
    });

    // Vincular cierre del modal de solicitud de anulación (volver al modal correspondiente)
    document.getElementById("regr_solicitar_anulacion")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.activeAnulacionTipo === "Compra") {
            mostrarModal("modal_ver_compras");
        } else {
            mostrarModal("modal_ver_ventas");
        }
    });

    // Vincular envío del formulario de anulación
    document.getElementById("form_solicitar_anulacion")?.addEventListener("submit", procesarEnvioSolicitud);
});

// ==========================================
// RENDERIZAR DETALLES DE VENTA DINÁMICOS
// ==========================================
window.mostrarDetallesVenta = function(ventaId) {
    // Obtener ventas del sistema
    let ventas = JSON.parse(localStorage.getItem("ventasSistema")) || [];
    if (ventas.length === 0 && typeof REPORT_DATABASE !== 'undefined') {
        ventas = [...REPORT_DATABASE.ventas];
    }

    const venta = ventas.find(v => v.id === ventaId);
    if (!venta) {
        alert("No se encontró la venta especificada.");
        return;
    }

    // Guardar ID activo en el modal de detalles
    document.getElementById("anulacion_venta_id").value = ventaId;

    // Actualizar campos de texto principales
    document.getElementById("ver_venta_titulo").textContent = `Venta Número ${venta.id}`;
    
    const totalVal = typeof venta.total === 'number' ? `C$ ${venta.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : venta.total;
    const pagoConVal = typeof venta.pagoCon === 'number' ? `C$ ${venta.pagoCon.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : (venta.pagoCon || totalVal);
    const vueltoVal = typeof venta.vuelto === 'number' ? `C$ ${venta.vuelto.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : (venta.vuelto || "C$ 0.00");

    document.getElementById("ver_venta_total").textContent = totalVal;
    document.getElementById("ver_venta_pago").textContent = pagoConVal;
    document.getElementById("ver_venta_vuelto").textContent = vueltoVal;
    document.getElementById("ver_venta_fecha").textContent = venta.fecha;
    document.getElementById("ver_venta_metodo").textContent = venta.metodoPago || "Efectivo";

    // Cargar tabla de productos de la venta
    const tbody = document.getElementById("ver_venta_tbody");
    if (tbody) {
        tbody.innerHTML = "";
        let rowsHTML = "";

        if (venta.detallesProductos && venta.detallesProductos.length > 0) {
            venta.detallesProductos.forEach((prod, idx) => {
                const subtotal = prod.precio * prod.cantidad;
                rowsHTML += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><strong>${prod.nombre}</strong> <span style="font-size: 11px; color: #64748b;">(${prod.agrupacion || 'Unidad'})</span></td>
                        <td style="font-weight: 600;">${prod.cantidad}</td>
                        <td>C$ ${prod.precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td style="font-weight: 700; color: #0f172a;">C$ ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td><span class="estado" style="background: rgba(34, 197, 94, 0.12); color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">Entregado</span></td>
                    </tr>
                `;
            });
        } else if (venta.productos && venta.productos.length > 0) {
            // Caso de ventas de la BD semilla que solo contienen cadenas del tipo "Producto xCant"
            venta.productos.forEach((item, idx) => {
                const match = item.match(/(.+)\s+x(\d+)/);
                let nombre = item;
                let cantidad = 1;
                if (match) {
                    nombre = match[1].trim();
                    cantidad = parseInt(match[2]);
                }
                
                // Intentar deducir un precio estimado o buscar en catálogo
                let precio = 0;
                if (window.productosInventario) {
                    const prodInv = window.productosInventario.find(p => p.name.toLowerCase() === nombre.toLowerCase());
                    if (prodInv) precio = prodInv.price;
                }
                if (precio === 0 && typeof venta.total === 'number') {
                    precio = venta.total / venta.productos.length / cantidad;
                }
                
                const subtotal = precio * cantidad;
                rowsHTML += `
                    <tr>
                        <td>${idx + 1}</td>
                        <td><strong>${nombre}</strong></td>
                        <td style="font-weight: 600;">${cantidad}</td>
                        <td>C$ ${precio.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td style="font-weight: 700; color: #0f172a;">C$ ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td><span class="estado" style="background: rgba(34, 197, 94, 0.12); color: #166534; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600;">Entregado</span></td>
                    </tr>
                `;
            });
        } else {
            rowsHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #64748b; padding: 20px;">No hay información detallada de productos.</td>
                </tr>
            `;
        }
        tbody.innerHTML = rowsHTML;
    }

    // Configurar estado del botón Anular
    const btnAnular = document.getElementById("btn_anular_venta_modal");
    if (btnAnular) {
        // Buscar si hay solicitudes de anulación registradas
        const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
        const solicitudVenta = solicitudes.find(s => s.ventaId === ventaId);
        
        btnAnular.disabled = false;
        btnAnular.style.opacity = "1";
        btnAnular.style.cursor = "pointer";

        if (venta.estado === "Anulada") {
            btnAnular.disabled = true;
            btnAnular.style.background = "#94a3b8"; // gris neutral
            btnAnular.style.opacity = "0.7";
            btnAnular.style.cursor = "not-allowed";
            btnAnular.querySelector("span").textContent = "Venta Anulada";
        } else if (solicitudVenta && solicitudVenta.estado === "Pendiente") {
            btnAnular.disabled = true;
            btnAnular.style.background = "#eab308"; // amarillo
            btnAnular.style.opacity = "0.7";
            btnAnular.style.cursor = "not-allowed";
            btnAnular.querySelector("span").textContent = "Anulación Pendiente";
        } else {
            btnAnular.style.background = "linear-gradient(135deg, #ef4444, #dc2626)"; // rojo
            btnAnular.querySelector("span").textContent = "Anular Venta";
            
            // Re-vincular evento de click
            btnAnular.onclick = () => {
                abrirSolicitudAnulacion(ventaId);
            };
        }
    }

    // Mostrar modal
    mostrarModal("modal_ver_ventas");
};

// ==========================================
// ABRIR VENTANA DE SOLICITUD DE ANULACIÓN
// ==========================================
function abrirSolicitudAnulacion(ventaId) {
    window.activeAnulacionTipo = "Venta";
    // Restablecer campos
    document.getElementById("anulacion_motivo").value = "";
    document.getElementById("anulacion_venta_id").value = ventaId;

    // Cargar administradores en el select
    const selectAdmin = document.getElementById("anulacion_admin");
    if (selectAdmin) {
        selectAdmin.innerHTML = "";

        // Carmelo siempre es admin por defecto
        const optCarmelo = document.createElement("option");
        optCarmelo.value = "Carmelo";
        optCarmelo.textContent = "Carmelo (Gerente)";
        selectAdmin.appendChild(optCarmelo);

        // Buscar más administradores y gerentes registrados en la lista del DOM
        const userRows = document.querySelectorAll("#tabla_usuarios_body tr");
        userRows.forEach(row => {
            const cells = row.cells;
            if (cells && cells.length >= 5) {
                const nombre = cells[0].textContent.trim();
                const rolText = cells[3].textContent.trim();
                const lower = rolText.toLowerCase();
                if ((lower.includes("admin") || lower.includes("gerente")) && nombre.toLowerCase() !== "carmelo") {
                    const opt = document.createElement("option");
                    opt.value = nombre;
                    const label = lower.includes("gerente") ? "Gerente" : "Administrador";
                    opt.textContent = `${nombre} (${label})`;
                    selectAdmin.appendChild(opt);
                }
            }
        });
    }

    // Mostrar modal de solicitud
    mostrarModal("modal_solicitar_anulacion");
}

// ==========================================
// PROCESAR ENVÍO DE SOLICITUD DE ANULACIÓN
// ==========================================
function procesarEnvioSolicitud(e) {
    e.preventDefault();
    
    const ventaId = document.getElementById("anulacion_venta_id").value;
    const motivo = document.getElementById("anulacion_motivo").value.trim();
    const admin = document.getElementById("anulacion_admin").value;
    const solicitante = (typeof activeOperator !== "undefined" && activeOperator) ? activeOperator : "Carmelo";
    const tipoDoc = window.activeAnulacionTipo || "Venta";

    if (!motivo) {
        alert("Por favor, describa el motivo de la anulación.");
        return;
    }

    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    
    // Verificar si ya hay una pendiente
    if (solicitudes.some(s => s.ventaId === ventaId && (s.tipo || "Venta") === tipoDoc && s.estado === "Pendiente")) {
        const docName = tipoDoc === "Compra" ? "compra" : "venta";
        alert(`Ya existe una solicitud de anulación en curso para esta ${docName}.`);
        return;
    }

    const nuevaSol = {
        id: `ANUL-${String(Date.now()).slice(-4)}`,
        ventaId: ventaId,
        tipo: tipoDoc,
        fecha: new Date().toISOString().split("T")[0],
        motivo: motivo,
        solicitadoPor: solicitante,
        adminAsignado: admin,
        estado: "Pendiente"
    };

    solicitudes.unshift(nuevaSol);
    localStorage.setItem("solicitudesAnulacion", JSON.stringify(solicitudes));

    // Auditoría
    if (typeof registrarLogOperar === "function") {
        const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
        registrarLogOperar(solicitante, sucursal, `Solicitó la anulación de la ${tipoDoc === "Compra" ? "compra" : "venta"} ${ventaId} asignada a ${admin}`);
    }

    alert(`Solicitud de anulación registrada con éxito para revisión por ${admin}.`);
    
    // Cerrar modals
    closeMostAggProdu();

    // Actualizar historial en UI
    if (tipoDoc === "Compra") {
        if (typeof window.cargarComprasRealizadas === "function") {
            window.cargarComprasRealizadas();
        }
    } else {
        if (typeof window.cargarVentasRealizadas === "function") {
            window.cargarVentasRealizadas();
        }
    }
    renderSolicitudes();
}

// ==========================================
// MOSTRAR U OCULTAR SECCIÓN SEGÚN ROL (ADMIN)
// ==========================================
window.actualizarVisibilidadAnulaciones = function() {
    const navAnulaciones = document.getElementById("nav_anulaciones");
    if (!navAnulaciones) return;

    const currentRole = (typeof activeRole !== "undefined" && activeRole) ? activeRole : "gerente";

    // Gerente y Admin pueden ver anulaciones; Vendedor no
    if (currentRole === "gerente" || currentRole === "admin") {
        navAnulaciones.style.display = "flex";
    } else {
        navAnulaciones.style.display = "none";
        
        // Redirigir al inicio si el usuario estaba viendo la sección restringida
        const activeSection = document.querySelector(".content-section.active");
        if (activeSection && activeSection.id === "anulaciones") {
            const btnInicio = document.querySelector('.nav_button[data-section="inicio"]');
            if (btnInicio) btnInicio.click();
        }
    }
};

// ==========================================
// RENDERIZAR TABLA DE SOLICITUDES (ADMIN)
// ==========================================
function renderSolicitudes() {
    const tbody = document.getElementById("tabla_solicitudes_anulacion_body");
    if (!tbody) return;

    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    
    // Contadores de KPIs
    let pendientesCount = 0;
    let aprobadasCount = 0;
    let rechazadasCount = 0;

    solicitudes.forEach(s => {
        if (s.estado === "Pendiente") pendientesCount++;
        else if (s.estado === "Aprobada") aprobadasCount++;
        else if (s.estado === "Rechazada") rechazadasCount++;
    });

    // Actualizar badges/KPIs
    const elTotal = document.getElementById("cant_total_anulacion");
    if (elTotal) elTotal.textContent = solicitudes.length;
    document.getElementById("cant_pendientes_anulacion").textContent = pendientesCount;
    document.getElementById("cant_aprobadas_anulacion").textContent = aprobadasCount;
    document.getElementById("cant_rechazadas_anulacion").textContent = rechazadasCount;

    // Aplicar filtro activo
    const filtradas = (filtroAnulacionActivo === "Todas")
        ? solicitudes
        : solicitudes.filter(s => s.estado === filtroAnulacionActivo);

    if (filtradas.length === 0) {
        let mensajeVacio = "No se han registrado solicitudes de anulación en el sistema.";
        if (filtroAnulacionActivo === "Pendiente") mensajeVacio = "No hay solicitudes pendientes de revisión.";
        else if (filtroAnulacionActivo === "Aprobada") mensajeVacio = "No hay solicitudes aprobadas.";
        else if (filtroAnulacionActivo === "Rechazada") mensajeVacio = "No hay solicitudes rechazadas.";

        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #64748b; padding: 25px; font-weight: 500;">
                    ${mensajeVacio}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtradas.map(sol => {
        let badgeStyle = "background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        if (sol.estado === "Aprobada") {
            badgeStyle = "background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        } else if (sol.estado === "Rechazada") {
            badgeStyle = "background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        }

        let actionsHTML = `<span style="color: #94a3b8; font-style: italic;">Resuelto</span>`;
        if (sol.estado === "Pendiente") {
            actionsHTML = `
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button class="btn_aprobar" onclick="resolverSolicitudAnulacion('${sol.id}', 'Aprobada')" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">Aprobar</button>
                    <button class="btn_rechazar" onclick="resolverSolicitudAnulacion('${sol.id}', 'Rechazada')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">Rechazar</button>
                </div>
            `;
        }

        const isCompra = sol.tipo === "Compra";
        const isGasto = sol.tipo === "Gasto";
        const isProducto = sol.tipo === "Producto";
        let clickAction = "";
        let labelText = "";

        if (isGasto) {
            clickAction = `window.mostrarDetallesGasto('${sol.id}')`;
            labelText = `C$ ${parseFloat(sol.monto).toFixed(2)} (Gasto)`;
        } else if (isCompra) {
            clickAction = `window.mostrarDetallesCompra('${sol.ventaId}')`;
            labelText = `${sol.ventaId} (Compra)`;
        } else if (isProducto) {
            clickAction = `window.mostrarDetallesProducto('${sol.id}')`;
            labelText = `${sol.detallesProducto?.name || 'Producto'} (Eliminar)`;
        } else {
            clickAction = `window.mostrarDetallesVenta('${sol.ventaId}')`;
            labelText = `${sol.ventaId} (Venta)`;
        }

        return `
            <tr data-estado="${sol.estado}" style="border-bottom: 1px solid #e2e8f0; transition: background 0.15s;">
                <td style="padding: 14px; font-weight: bold; color: #1e293b;">${sol.id}</td>
                <td style="padding: 14px;"><a href="#" onclick="event.preventDefault(); ${clickAction}" style="color: #2563eb; font-weight: 600; text-decoration: none;">${labelText}</a></td>
                <td style="padding: 14px; color: #475569;">${sol.fecha}</td>
                <td style="padding: 14px; font-weight: 500; color: #0f172a;">${sol.solicitadoPor}</td>
                <td style="padding: 14px; max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #475569;" title="${sol.motivo}">${sol.motivo}</td>
                <td style="padding: 14px; color: #475569;">${sol.adminAsignado}</td>
                <td style="padding: 14px;"><span style="${badgeStyle}">${sol.estado}</span></td>
                <td style="padding: 14px; text-align: center;">${actionsHTML}</td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// RESOLVER SOLICITUD DE ANULACIÓN (ADMIN)
// ==========================================
window.resolverSolicitudAnulacion = function(solicitudId, nuevoEstado) {
    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    const idx = solicitudes.findIndex(s => s.id === solicitudId);
    
    if (idx === -1) return;

    const sol = solicitudes[idx];
    sol.estado = nuevoEstado;
    localStorage.setItem("solicitudesAnulacion", JSON.stringify(solicitudes));

    const adminResolutor = (typeof activeOperator !== "undefined" && activeOperator) ? activeOperator : "Administrador";
    const isCompra = sol.tipo === "Compra";
    const isGasto = sol.tipo === "Gasto";
    const isProducto = sol.tipo === "Producto";

    if (nuevoEstado === "Aprobada") {
        if (isCompra) {
            // Anular la compra físicamente
            let compras = JSON.parse(localStorage.getItem("facturasCompras")) || [];
            const compra = compras.find(c => c.numFactura === sol.ventaId);
            if (compra) {
                compra.estado = "Anulada";
                localStorage.setItem("facturasCompras", JSON.stringify(compras));

                // Recargar historial en UI si está la función
                if (typeof window.cargarComprasRealizadas === "function") {
                    window.cargarComprasRealizadas();
                }
            }
            // Registrar Log
            if (typeof registrarLogOperar === "function") {
                const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
                registrarLogOperar(adminResolutor, sucursal, `Aprobó la anulación de la compra ${sol.ventaId}`);
            }
            alert(`La solicitud ha sido aprobada y la compra ${sol.ventaId} ha sido anulada con éxito.`);
        } else if (isGasto) {
            // Registrar Log de Operación
            if (typeof registrarLogOperar === "function") {
                const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
                registrarLogOperar(adminResolutor, sucursal, `Aprobó la salida de caja del gasto ${sol.id} de C$ ${parseFloat(sol.monto).toFixed(2)} por: ${sol.motivo}`);
            }
            
            // Forzar actualización de Arqueo y Caja
            if (typeof window.recalcularVentasEfectivo === "function") {
                window.recalcularVentasEfectivo();
            }
            if (typeof window.calcularCuadre === "function") {
                window.calcularCuadre();
            }
            
            alert(`La solicitud de gasto ${sol.id} por C$ ${parseFloat(sol.monto).toFixed(2)} ha sido aprobada con éxito.`);
        } else if (isProducto) {
            // Eliminar producto físicamente del catálogo
            const prodId = sol.detallesProducto?.id;
            if (prodId) {
                window.productosInventario = window.productosInventario.filter(p => p.id !== prodId);
                // Guardar catálogo
                if (typeof window.guardarProductos === "function") {
                    window.guardarProductos();
                } else {
                    localStorage.setItem("productosInventario", JSON.stringify(window.productosInventario));
                }
            }

            // Registrar Log
            if (typeof registrarLogOperar === "function") {
                const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
                registrarLogOperar(adminResolutor, sucursal, `Aprobó la eliminación definitiva del producto "${sol.detallesProducto?.name}" (ID: ${prodId}) por: ${sol.motivo}`);
            }
            alert(`La solicitud ha sido aprobada y el producto "${sol.detallesProducto?.name || 'desconocido'}" ha sido eliminado del inventario con éxito.`);
        } else {
            // Anular la venta físicamente
            let ventas = JSON.parse(localStorage.getItem("ventasSistema")) || [];
            if (ventas.length === 0 && typeof REPORT_DATABASE !== 'undefined') {
                ventas = [...REPORT_DATABASE.ventas];
            }

            const venta = ventas.find(v => v.id === sol.ventaId);
            if (venta) {
                venta.estado = "Anulada";
                localStorage.setItem("ventasSistema", JSON.stringify(ventas));

                // Actualizar KPIs de la tabla de ventas, arqueos y cajas
                if (typeof window.cargarVentasRealizadas === "function") {
                    window.cargarVentasRealizadas();
                }
                if (typeof window.recalcularVentasEfectivo === "function") {
                    window.recalcularVentasEfectivo();
                    window.calcularCuadre();
                }
            }
            // Registrar Log
            if (typeof registrarLogOperar === "function") {
                const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
                registrarLogOperar(adminResolutor, sucursal, `Aprobó la anulación de la venta ${sol.ventaId}`);
            }
            alert(`La solicitud ha sido aprobada y la venta ${sol.ventaId} ha sido anulada con éxito.`);
        }
    } else {
        // Registrar Log
        if (typeof registrarLogOperar === "function") {
            const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
            if (isGasto) {
                registrarLogOperar(adminResolutor, sucursal, `Rechazó la salida de caja del gasto ${sol.id} de C$ ${parseFloat(sol.monto).toFixed(2)}`);
            } else if (isProducto) {
                registrarLogOperar(adminResolutor, sucursal, `Rechazó la eliminación del producto "${sol.detallesProducto?.name}" (ID: ${sol.detallesProducto?.id})`);
            } else {
                registrarLogOperar(adminResolutor, sucursal, `Rechazó la anulación de la ${isCompra ? 'compra' : 'venta'} ${sol.ventaId}`);
            }
        }

        if (isGasto) {
            alert(`La solicitud de gasto ${sol.id} ha sido rechazada.`);
        } else if (isProducto) {
            alert(`La solicitud de eliminación para el producto "${sol.detallesProducto?.name || 'desconocido'}" ha sido rechazada.`);
        } else {
            alert(`La solicitud de anulación para la ${isCompra ? 'compra' : 'venta'} ${sol.ventaId} ha sido rechazada.`);
        }
    }

    // Recargar vista local de gastos si está abierta
    if (typeof window.renderGastos === "function") {
        window.renderGastos();
    }

    // Recargar bandeja de solicitudes en UI
    renderSolicitudes();
};

// ==========================================
// FILTRAR SOLICITUDES DE LA TABLA
// ==========================================
function filtrarTablaSolicitudes(e) {
    const query = e.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#tabla_solicitudes_anulacion_body tr");

    rows.forEach(row => {
        // Ignorar filas de 'sin resultados'
        if (row.cells.length === 1 && row.cells[0].colSpan === 8) return;

        let textMatch = false;
        Array.from(row.cells).forEach(cell => {
            if (cell.textContent.toLowerCase().includes(query)) {
                textMatch = true;
            }
        });
        row.style.display = textMatch ? "" : "none";
    });
}

// ==========================================
// MOSTRAR DETALLES DE GASTO EN MODAL
// ==========================================
window.mostrarDetallesGasto = function(gastoId) {
    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    const sol = solicitudes.find(s => s.id === gastoId && s.tipo === "Gasto");
    if (!sol) {
        alert("No se encontró el detalle del gasto especificado.");
        return;
    }

    // Actualizar campos principales del modal
    document.getElementById("ver_gasto_titulo").textContent = `Gasto Número ${sol.id}`;
    document.getElementById("det_gasto_id").textContent = sol.id;
    document.getElementById("det_gasto_fecha").textContent = sol.fecha;
    document.getElementById("det_gasto_usuario").textContent = sol.solicitadoPor;
    document.getElementById("det_gasto_admin").textContent = sol.adminAsignado;
    
    // Formatear badge de estado
    const estadoEl = document.getElementById("det_gasto_estado");
    if (estadoEl) {
        estadoEl.textContent = sol.estado;
        estadoEl.style.padding = "4px 8px";
        estadoEl.style.borderRadius = "6px";
        estadoEl.style.fontSize = "12px";
        estadoEl.style.fontWeight = "bold";
        estadoEl.style.display = "inline-block";
        if (sol.estado === "Aprobada") {
            estadoEl.style.background = "#dcfce7";
            estadoEl.style.color = "#16a34a";
        } else if (sol.estado === "Rechazada") {
            estadoEl.style.background = "#fee2e2";
            estadoEl.style.color = "#dc2626";
        } else {
            estadoEl.style.background = "#fef3c7";
            estadoEl.style.color = "#d97706";
        }
    }

    // Motivo y total
    document.getElementById("det_gasto_motivo").textContent = sol.motivo;
    document.getElementById("det_gasto_total").textContent = `C$ ${parseFloat(sol.monto).toFixed(2)}`;

    // Configurar botones de acción
    const btnAcciones = document.getElementById("det_gasto_acciones");
    const btnAprobar = document.getElementById("btn_aprobar_gasto_modal");
    const btnRechazar = document.getElementById("btn_rechazar_gasto_modal");

    if (btnAcciones && btnAprobar && btnRechazar) {
        if (sol.estado === "Pendiente") {
            btnAcciones.style.display = "flex";
            
            // Vincular acciones a los botones del modal
            btnAprobar.onclick = () => {
                window.resolverSolicitudAnulacion(sol.id, "Aprobada");
                window.closeMostAggProdu(); // Cerrar el modal principal
            };
            
            btnRechazar.onclick = () => {
                window.resolverSolicitudAnulacion(sol.id, "Rechazada");
                window.closeMostAggProdu();
            };
        } else {
            btnAcciones.style.display = "none";
        }
    }

    window.mostrarModal("modal_ver_gastos");
};

// ==========================================
// MOSTRAR DETALLES DE ELIMINACIÓN DE PRODUCTO EN MODAL
// ==========================================
window.mostrarDetallesProducto = function(solicitudId) {
    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    const sol = solicitudes.find(s => s.id === solicitudId && s.tipo === "Producto");
    if (!sol) {
        alert("No se encontró el detalle de la solicitud especificada.");
        return;
    }

    // Actualizar campos principales del modal
    document.getElementById("ver_prod_elim_titulo").textContent = `Eliminación: ${sol.detallesProducto?.name || 'Producto'}`;
    document.getElementById("det_prod_elim_id").textContent = sol.detallesProducto?.id || "-";
    document.getElementById("det_prod_elim_categoria").textContent = sol.detallesProducto?.category || "-";
    document.getElementById("det_prod_elim_ubicacion").textContent = sol.detallesProducto?.location || "-";
    document.getElementById("det_prod_elim_usuario").textContent = sol.solicitadoPor;
    document.getElementById("det_prod_elim_fecha").textContent = sol.fecha;
    
    // Formatear badge de estado
    const estadoEl = document.getElementById("det_prod_elim_estado");
    if (estadoEl) {
        estadoEl.textContent = sol.estado;
        estadoEl.style.padding = "4px 8px";
        estadoEl.style.borderRadius = "6px";
        estadoEl.style.fontSize = "12px";
        estadoEl.style.fontWeight = "bold";
        estadoEl.style.display = "inline-block";
        if (sol.estado === "Aprobada") {
            estadoEl.style.background = "#dcfce7";
            estadoEl.style.color = "#16a34a";
        } else if (sol.estado === "Rechazada") {
            estadoEl.style.background = "#fee2e2";
            estadoEl.style.color = "#dc2626";
        } else {
            estadoEl.style.background = "#fef3c7";
            estadoEl.style.color = "#d97706";
        }
    }

    // Motivo
    document.getElementById("det_prod_elim_motivo").textContent = sol.motivo;

    // Configurar botones de acción
    const btnAcciones = document.getElementById("det_prod_elim_acciones");
    const btnAprobar = document.getElementById("btn_aprobar_prod_elim_modal");
    const btnRechazar = document.getElementById("btn_rechazar_prod_elim_modal");

    if (btnAcciones && btnAprobar && btnRechazar) {
        if (sol.estado === "Pendiente") {
            btnAcciones.style.display = "flex";
            
            // Vincular acciones a los botones del modal
            btnAprobar.onclick = () => {
                window.resolverSolicitudAnulacion(sol.id, "Aprobada");
                window.closeMostAggProdu(); // Cerrar el modal principal
            };
            
            btnRechazar.onclick = () => {
                window.resolverSolicitudAnulacion(sol.id, "Rechazada");
                window.closeMostAggProdu();
            };
        } else {
            btnAcciones.style.display = "none";
        }
    }

    window.mostrarModal("modal_ver_producto_eliminar");
};
