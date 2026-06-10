// ==========================================
// LÓGICA DE MOVIMIENTOS DE INVENTARIO Y STOCK
// ==========================================

// Stocks iniciales precargados para los productos por defecto en cada sucursal
const defaultBranchStocks = {
    // "id": { "Sucursal": stockEnUnidades }
    "1": { "Central": 120, "Plaza": 45, "Norte": 30 },   // Cerveza Toña
    "2": { "Central": 50, "Plaza": 20, "Norte": 15 },    // Flor de Caña 7 Años
    "3": { "Central": 35, "Plaza": 12, "Norte": 8 },     // Vino Tinto Concha y Toro
    "4": { "Central": 200, "Plaza": 80, "Norte": 50 },   // Cerveza Victoria
    "5": { "Central": 15, "Plaza": 5, "Norte": 3 },      // Whisky Chivas Regal
    "6": { "Central": 80, "Plaza": 30, "Norte": 25 },    // Marlboro
    "7": { "Central": 150, "Plaza": 60, "Norte": 40 }    // Pepsi
};

// Detalles de lote y fecha de vencimiento iniciales para simulación
const defaultStockDetails = {
    "1": { lote: "L-TON01", vencimiento: "2026-09-28" },
    "2": { lote: "L-FDC07", vencimiento: "2028-12-31" },
    "3": { lote: "L-CYT03", vencimiento: "2027-06-30" },
    "4": { lote: "L-VIC04", vencimiento: "Sin venc." },
    "5": { lote: "L-CHV05", vencimiento: "Sin venc." },
    "6": { lote: "L-MAR06", vencimiento: "Sin venc." },
    "7": { lote: "L-PEP07", vencimiento: "2026-11-15" }
};

let inventarioStock = {};
let movimientosInventario = [];

// Cargar stock de localStorage o inicializarlo
function cargarInventarioStock() {
    try {
        const storedStock = localStorage.getItem("inventarioStock");
        if (storedStock) {
            inventarioStock = JSON.parse(storedStock);
        } else {
            inventarioStock = { ...defaultBranchStocks };
            localStorage.setItem("inventarioStock", JSON.stringify(inventarioStock));
        }

        // Asegurar que todos los productos en productosInventario tengan un registro de stock
        const productos = window.productosInventario || [];
        let modificado = false;
        productos.forEach(p => {
            if (!inventarioStock[p.id]) {
                inventarioStock[p.id] = { "Central": 0, "Plaza": 0, "Norte": 0 };
                modificado = true;
            }
        });
        if (modificado) {
            localStorage.setItem("inventarioStock", JSON.stringify(inventarioStock));
        }
    } catch (e) {
        console.error("Error al cargar inventarioStock", e);
        inventarioStock = { ...defaultBranchStocks };
    }
}

// Cargar historial de movimientos de localStorage
function cargarMovimientosInventario() {
    try {
        const storedMovs = localStorage.getItem("movimientosInventario");
        if (storedMovs) {
            movimientosInventario = JSON.parse(storedMovs);
        } else {
            // Un par de movimientos demo para poblar el historial
            movimientosInventario = [
                {
                    id: "MOV-0001",
                    fecha: "2026-06-08",
                    productoId: "1",
                    productoNombre: "Cerveza Toña",
                    sucursalOrigen: "Central",
                    sucursalDestino: "Plaza",
                    agrupacion: "Caja",
                    cantidadAgrupacion: 2,
                    cantidadUnidades: 48,
                    vendedor: "Carmelo"
                },
                {
                    id: "MOV-0002",
                    fecha: "2026-06-09",
                    productoId: "4",
                    productoNombre: "Cerveza Victoria",
                    sucursalOrigen: "Central",
                    sucursalDestino: "Norte",
                    agrupacion: "Six Pack",
                    cantidadAgrupacion: 5,
                    cantidadUnidades: 30,
                    vendedor: "Carmelo"
                }
            ];
            localStorage.setItem("movimientosInventario", JSON.stringify(movimientosInventario));
        }
    } catch (e) {
        console.error("Error al cargar movimientosInventario", e);
        movimientosInventario = [];
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 1. MANEJO DE PESTAÑAS (TABS) EN INVENTARIO
    const inventTabButtons = document.querySelectorAll(".tab_invent_btn");
    const tabVerInventario = document.getElementById("tab_ver_inventario");
    const tabMovimientos = document.getElementById("tab_movimientos_inventario");

    inventTabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            inventTabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.dataset.tab;
            if (tab === "ver-inventario") {
                tabVerInventario.style.display = "block";
                tabMovimientos.style.display = "none";
                actualizarInventario(); // Re-renderizar para reflejar cambios
            } else {
                tabVerInventario.style.display = "none";
                tabMovimientos.style.display = "block";
                actualizarHistorialMovimientos();
                actualizarDropdownPreciosAgrupacionMovimientos();
            }
        });
    });

    // 2. AUTOCOMPLETADO EN EL FORMULARIO DE TRANSFERENCIAS
    const buscarProdMovInput = document.getElementById("buscar_prod_movimiento");
    const selectProdMovId = document.getElementById("select_prod_movimiento");
    const resultadosBusquedaMov = document.getElementById("resultados_busqueda_movimiento");
    const selectAgrupacionMov = document.getElementById("mov_select_agrupacion");
    const cantidadAgrupacionMovInput = document.getElementById("mov_cantidad_agrupacion");
    const equivUdsEl = document.getElementById("mov_equiv_uds");
    const equivInfoDiv = document.getElementById("mov_equivalencia_info");

    const iniciarAutocompletadoMovimientos = () => {
        if (!buscarProdMovInput || !resultadosBusquedaMov) return;

        buscarProdMovInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                resultadosBusquedaMov.style.display = "none";
                selectProdMovId.value = "";
                resetearCamposAgrupacionTransferencia();
                return;
            }

            const productos = window.productosInventario || [];
            const filtrados = productos.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            );

            if (filtrados.length === 0) {
                resultadosBusquedaMov.innerHTML = `<div class="autocomplete-item-no-results">No se encontraron productos</div>`;
                resultadosBusquedaMov.style.display = "block";
                return;
            }

            resultadosBusquedaMov.innerHTML = filtrados.map(prod => `
                <div class="autocomplete-item" data-id="${prod.id}" data-name="${prod.name}">
                    <strong>${prod.name}</strong> <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${prod.category})</span>
                </div>
            `).join("");

            resultadosBusquedaMov.style.display = "block";

            resultadosBusquedaMov.querySelectorAll(".autocomplete-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.dataset.id;
                    const name = item.dataset.name;

                    buscarProdMovInput.value = name;
                    selectProdMovId.value = id;
                    resultadosBusquedaMov.style.display = "none";

                    cargarAgrupacionesProductoMovimientos(id);
                    actualizarStockOrigenInfo();
                });
            });
        });

        buscarProdMovInput.addEventListener("focus", () => {
            const query = buscarProdMovInput.value.toLowerCase().trim();
            const productos = window.productosInventario || [];
            const filtrados = query ? 
                productos.filter(p => p.name.toLowerCase().includes(query)) : 
                productos;

            if (filtrados.length === 0) {
                resultadosBusquedaMov.innerHTML = `<div class="autocomplete-item-no-results">No se encontraron productos</div>`;
                resultadosBusquedaMov.style.display = "block";
                return;
            }

            resultadosBusquedaMov.innerHTML = filtrados.map(prod => `
                <div class="autocomplete-item" data-id="${prod.id}" data-name="${prod.name}">
                    <strong>${prod.name}</strong> <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${prod.category})</span>
                </div>
            `).join("");

            resultadosBusquedaMov.style.display = "block";

            resultadosBusquedaMov.querySelectorAll(".autocomplete-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.dataset.id;
                    const name = item.dataset.name;

                    buscarProdMovInput.value = name;
                    selectProdMovId.value = id;
                    resultadosBusquedaMov.style.display = "none";

                    cargarAgrupacionesProductoMovimientos(id);
                    actualizarStockOrigenInfo();
                });
            });
        });

        document.addEventListener("click", (e) => {
            if (!buscarProdMovInput.contains(e.target) && !resultadosBusquedaMov.contains(e.target)) {
                resultadosBusquedaMov.style.display = "none";
            }
        });
    };

    const cargarAgrupacionesProductoMovimientos = (prodId) => {
        if (!selectAgrupacionMov) return;
        selectAgrupacionMov.innerHTML = '';
        
        const productos = window.productosInventario || [];
        const productoObj = productos.find(p => p.id === prodId);
        
        if (productoObj && productoObj.groupings) {
            Object.entries(productoObj.groupings).forEach(([groupName, equiv]) => {
                const option = document.createElement("option");
                option.value = groupName;
                option.dataset.equiv = equiv;
                option.textContent = `${groupName} (${equiv} ud${equiv > 1 ? 's' : ''})`;
                selectAgrupacionMov.appendChild(option);
            });
            selectAgrupacionMov.disabled = false;
            if (cantidadAgrupacionMovInput) {
                cantidadAgrupacionMovInput.disabled = false;
                cantidadAgrupacionMovInput.value = "1";
            }
        } else {
            const option = document.createElement("option");
            option.value = "Unidad";
            option.dataset.equiv = "1";
            option.textContent = "Unidad (1 ud)";
            selectAgrupacionMov.appendChild(option);
            selectAgrupacionMov.disabled = true;
            if (cantidadAgrupacionMovInput) {
                cantidadAgrupacionMovInput.disabled = true;
                cantidadAgrupacionMovInput.value = "1";
            }
        }
        
        calcularEquivalenciaUnidades();
    };

    const resetearCamposAgrupacionTransferencia = () => {
        if (selectAgrupacionMov) {
            selectAgrupacionMov.innerHTML = '<option value="Unidad" data-equiv="1">Unidad (1 ud)</option>';
            selectAgrupacionMov.disabled = true;
        }
        if (cantidadAgrupacionMovInput) {
            cantidadAgrupacionMovInput.value = "1";
            cantidadAgrupacionMovInput.disabled = true;
        }
        if (equivInfoDiv) equivInfoDiv.style.display = "none";
        ocultarStockOrigenInfo();
    };

    const calcularEquivalenciaUnidades = () => {
        const selectedOpt = selectAgrupacionMov.options[selectAgrupacionMov.selectedIndex];
        if (!selectedOpt) {
            if (equivInfoDiv) equivInfoDiv.style.display = "none";
            return;
        }

        const equiv = parseFloat(selectedOpt.dataset.equiv) || 1;
        const cantidad = parseFloat(cantidadAgrupacionMovInput.value) || 0;
        const totalUds = Math.round(cantidad * equiv);

        if (equivUdsEl) {
            equivUdsEl.textContent = `${totalUds} unidad${totalUds !== 1 ? 'es' : ''}`;
        }
        if (equivInfoDiv) {
            equivInfoDiv.style.display = totalUds > 0 ? "block" : "none";
        }
    };

    selectAgrupacionMov?.addEventListener("change", calcularEquivalenciaUnidades);
    cantidadAgrupacionMovInput?.addEventListener("input", calcularEquivalenciaUnidades);

    // 3. MOSTRAR STOCK ACTUAL DE SUCURSAL ORIGEN
    const selectOrigen = document.getElementById("mov_sucursal_origen");
    const selectDestino = document.getElementById("mov_sucursal_destino");
    const stockInfoDiv = document.getElementById("mov_stock_info");
    const stockOrigenValEl = document.getElementById("mov_stock_origen_val");

    const actualizarStockOrigenInfo = () => {
        const prodId = selectProdMovId.value;
        const origen = selectOrigen?.value;

        if (!prodId || !origen) {
            ocultarStockOrigenInfo();
            return;
        }

        cargarInventarioStock();
        const stockProd = inventarioStock[prodId] || { "Central": 0, "Plaza": 0, "Norte": 0 };
        const cantidadDisponible = stockProd[origen] || 0;

        if (stockOrigenValEl) {
            stockOrigenValEl.textContent = `${cantidadDisponible} unidad${cantidadDisponible !== 1 ? 'es' : ''}`;
            // Cambiar color si está en cero
            if (cantidadDisponible === 0) {
                stockOrigenValEl.style.color = "#ef4444";
            } else {
                stockOrigenValEl.style.color = "#1e3a8a";
            }
        }
        if (stockInfoDiv) {
            stockInfoDiv.style.display = "block";
        }
    };

    const ocultarStockOrigenInfo = () => {
        if (stockInfoDiv) stockInfoDiv.style.display = "none";
    };

    selectOrigen?.addEventListener("change", actualizarStockOrigenInfo);

    // 4. EJECUTAR TRANSFERENCIA DE PRODUCTOS
    const btnRealizarMov = document.getElementById("btn_realizar_movimiento");

    btnRealizarMov?.addEventListener("click", (e) => {
        e.preventDefault();

        const prodId = selectProdMovId.value;
        const prodNombre = buscarProdMovInput.value.trim();
        const origen = selectOrigen.value;
        const destino = selectDestino.value;
        const agrupacion = selectAgrupacionMov.value;
        const cantidadAgrup = parseInt(cantidadAgrupacionMovInput.value) || 0;

        if (!prodId || !prodNombre) {
            alert("Por favor, seleccione un producto primero.");
            return;
        }

        if (!origen) {
            alert("Por favor, seleccione la sucursal de origen.");
            selectOrigen.focus();
            return;
        }

        if (!destino) {
            alert("Por favor, seleccione la sucursal de destino.");
            selectDestino.focus();
            return;
        }

        if (origen === destino) {
            alert("La sucursal de destino debe ser diferente a la sucursal de origen.");
            selectDestino.focus();
            return;
        }

        if (cantidadAgrup <= 0) {
            alert("La cantidad a mover debe ser mayor que cero.");
            cantidadAgrupacionMovInput.focus();
            return;
        }

        // Obtener unidades equivalentes
        const selectedOpt = selectAgrupacionMov.options[selectAgrupacionMov.selectedIndex];
        const equiv = parseFloat(selectedOpt?.dataset.equiv) || 1;
        const totalUnidades = Math.round(cantidadAgrup * equiv);

        cargarInventarioStock();
        const stockOrigen = inventarioStock[prodId]?.[origen] || 0;

        if (stockOrigen < totalUnidades) {
            alert(`No hay suficiente stock en la sucursal ${origen} para transferir. Stock disponible: ${stockOrigen} uds, Solicitado: ${totalUnidades} uds.`);
            return;
        }

        // Restar stock en origen y sumar en destino
        inventarioStock[prodId][origen] -= totalUnidades;
        if (!inventarioStock[prodId][destino]) inventarioStock[prodId][destino] = 0;
        inventarioStock[prodId][destino] += totalUnidades;

        // Guardar stock
        localStorage.setItem("inventarioStock", JSON.stringify(inventarioStock));

        // Registrar movimiento
        cargarMovimientosInventario();
        let maxMovIdNum = 2;
        movimientosInventario.forEach(m => {
            const match = m.id.match(/MOV-0*(\d+)/);
            if (match) {
                const idNum = parseInt(match[1]);
                if (idNum >= maxMovIdNum) maxMovIdNum = idNum + 1;
            }
        });
        const nuevoMovId = `MOV-${String(maxMovIdNum).padStart(4, '0')}`;
        const activeOperator = document.querySelector("header .box_comp label")?.textContent || "Carmelo";

        const nuevoMov = {
            id: nuevoMovId,
            fecha: new Date().toISOString().split("T")[0],
            productoId: prodId,
            productoNombre: prodNombre,
            sucursalOrigen: origen,
            sucursalDestino: destino,
            agrupacion: agrupacion,
            cantidadAgrupacion: cantidadAgrup,
            cantidadUnidades: totalUnidades,
            vendedor: activeOperator
        };

        movimientosInventario.unshift(nuevoMov);
        localStorage.setItem("movimientosInventario", JSON.stringify(movimientosInventario));

        // Registrar en Auditoría
        if (typeof registrarLogOperar === "function") {
            registrarLogOperar(activeOperator, origen, `Transfirió ${cantidadAgrup} ${agrupacion}(s) (${totalUnidades} uds) de "${prodNombre}" hacia sucursal ${destino}`);
        }

        alert(`¡Transferencia de inventario realizada exitosamente!`);

        // Resetear formulario
        buscarProdMovInput.value = "";
        selectProdMovId.value = "";
        selectOrigen.value = "";
        selectDestino.value = "";
        resetearCamposAgrupacionTransferencia();

        // Actualizar vistas
        actualizarHistorialMovimientos();
        actualizarInventario();
    });

    const actualizarDropdownPreciosAgrupacionMovimientos = () => {
        const prodId = selectProdMovId.value;
        if (prodId) {
            cargarAgrupacionesProductoMovimientos(prodId);
        }
    };

    window.actualizarDropdownPreciosAgrupacionMovimientos = actualizarDropdownPreciosAgrupacionMovimientos;

    // 5. INTERACTIVIDAD DE FILTROS EN EL INVENTARIO GENERAL
    const busqFiltroInput = document.getElementById("busc_inventario_input");
    const catFiltroSelect = document.getElementById("cat_invent");
    const ubicaFiltroSelect = document.getElementById("ubica_i");
    const sucurFiltroSelect = document.getElementById("select_sucur");

    [busqFiltroInput, catFiltroSelect, ubicaFiltroSelect, sucurFiltroSelect].forEach(filt => {
        filt?.addEventListener("input", actualizarInventario);
        filt?.addEventListener("change", actualizarInventario);
    });

    // Cargar información inicial
    iniciarAutocompletadoMovimientos();
    cargarInventarioStock();
    cargarMovimientosInventario();
    actualizarInventario();
});

// Función global para actualizar la tabla del inventario general
function actualizarInventario() {
    const tbody = document.getElementById("tabla_inventario_body");
    if (!tbody) return;

    cargarInventarioStock();

    const query = document.getElementById("busc_inventario_input")?.value.toLowerCase().trim() || "";
    const cat = document.getElementById("cat_invent")?.value || "";
    const ubica = document.getElementById("ubica_i")?.value || "";
    const sucursalSel = document.getElementById("select_sucur")?.value || "todas";

    const productos = window.productosInventario || [];

    const filtrados = productos.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
        const matchesCategory = !cat || p.category.toLowerCase() === cat.toLowerCase();
        const matchesUbica = !ubica || p.location.toLowerCase() === ubica.toLowerCase();
        return matchesQuery && matchesCategory && matchesUbica;
    });

    let stockBajoCount = 0;
    let vencidoCount = 0;
    const hoyTimestamp = Date.now();
    const seisMesesMs = 6 * 30 * 24 * 60 * 60 * 1000;

    tbody.innerHTML = filtrados.map(prod => {
        const details = defaultProductDetails[prod.id] || { lote: "L-GEN01", vencimiento: "Sin venc." };
        
        // Calcular stock según filtro de sucursal
        let stockVisual = 0;
        let sucursalLabel = "";
        const stockProd = inventarioStock[prod.id] || { "Central": 0, "Plaza": 0, "Norte": 0 };

        if (sucursalSel === "todas") {
            stockVisual = Object.values(stockProd).reduce((a, b) => a + b, 0);
            sucursalLabel = "Total";
        } else {
            stockVisual = stockProd[sucursalSel] || 0;
            sucursalLabel = sucursalSel;
        }

        // Evaluar stock bajo (umbral: <= 15 unidades)
        if (stockVisual <= 15) {
            stockBajoCount++;
        }

        // Evaluar vencimiento próximo (dentro de los próximos 6 meses)
        if (details.vencimiento && details.vencimiento !== "Sin venc.") {
            try {
                const vencDate = new Date(details.vencimiento).getTime();
                if (vencDate - hoyTimestamp > 0 && vencDate - hoyTimestamp <= seisMesesMs) {
                    vencidoCount++;
                }
            } catch(e) {
                // ignore
            }
        }

        const stockBadgeClass = stockVisual <= 15 ? "badge" : "badge";
        const stockBadgeStyle = stockVisual <= 15 
            ? "background: rgba(239, 68, 68, 0.12); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.25);" 
            : "background: rgba(34, 197, 94, 0.12); color: #166534; border: 1px solid rgba(34, 197, 94, 0.25);";

        return `
            <tr>
                <td><strong>${prod.name}</strong></td>
                <td>${prod.category}</td>
                <td>C$ ${prod.price.toFixed(2)}</td>
                <td>
                    <span class="${stockBadgeClass}" style="${stockBadgeStyle} font-weight: 700; font-size: 0.825rem; padding: 4px 10px;">
                        ${stockVisual} uds <span style="font-size: 0.65rem; font-weight: 500; opacity: 0.8; margin-left: 2px;">(${sucursalLabel})</span>
                    </span>
                </td>
                <td>${prod.location}</td>
                <td><span style="${details.vencimiento !== 'Sin venc.' ? 'color: #d97706; font-weight: 600;' : ''}">${details.vencimiento}</span></td>
                <td><span class="badge" style="background: #e2e8f0; color: #475569; border: 1px solid #cbd5e1;">${details.lote}</span></td>
            </tr>
        `;
    }).join("");

    // Actualizar KPIs en la UI
    const kpiStockBajo = document.getElementById("inventario_kpi_stock_bajo");
    const kpiVencimiento = document.getElementById("inventario_kpi_vencimiento_proximo");

    if (kpiStockBajo) kpiStockBajo.textContent = stockBajoCount;
    if (kpiVencimiento) kpiVencimiento.textContent = vencidoCount;
}

window.actualizarInventario = actualizarInventario;

// Función para actualizar la tabla del historial de movimientos
function actualizarHistorialMovimientos() {
    const tbody = document.getElementById("tabla_historial_movimientos_body");
    if (!tbody) return;

    cargarMovimientosInventario();

    if (movimientosInventario.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; color: #64748b; padding: 24px; font-weight: 500;">
                    No se han registrado transferencias entre sucursales.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = movimientosInventario.map(mov => `
        <tr>
            <td><strong>${mov.id}</strong></td>
            <td>${mov.fecha}</td>
            <td><strong>${mov.productoNombre}</strong></td>
            <td><span class="badge" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe;">${mov.sucursalOrigen}</span></td>
            <td><span class="badge" style="background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0;">${mov.sucursalDestino}</span></td>
            <td>${mov.cantidadAgrupacion} ${mov.agrupacion}(s)</td>
            <td style="font-weight: 700; color: #0f172a;">${mov.cantidadUnidades} uds</td>
            <td><span style="font-size: 0.8rem; color: #475569; font-weight: 500;">${mov.vendedor}</span></td>
        </tr>
    `).join("");
}

window.actualizarHistorialMovimientos = actualizarHistorialMovimientos;
