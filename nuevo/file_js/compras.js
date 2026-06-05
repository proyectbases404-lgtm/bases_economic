// ==========================================
// LÓGICA DE COMPRAS (FACTURACIÓN DE COMPRA)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Elementos del DOM
    const numFacturaInput = document.getElementById("compra_num_factura");
    const fechaInput = document.getElementById("compra_fecha");
    const usuarioInput = document.getElementById("compra_usuario");
    const metodoPagoSelect = document.getElementById("compra_metodo_pago");
    const selectProveedor = document.getElementById("compra_select_proveedor");

    const buscarProductoInput = document.getElementById("compra_buscar_producto");
    const selectProductoId = document.getElementById("compra_select_producto_id");
    const resultadosBusqueda = document.getElementById("compra_resultados_busqueda");
    const selectAgrupacion = document.getElementById("compra_select_agrupacion");
    const cantidadAgrupacionInput = document.getElementById("compra_cantidad_agrupacion");
    const cantidadInput = document.getElementById("compra_cantidad");
    const precioCostoInput = document.getElementById("compra_precio_costo");
    const ivaInput = document.getElementById("compra_iva");
    const descuentoInput = document.getElementById("compra_descuento");
    const bonificacionInput = document.getElementById("compra_bonificacion");
    const loteInput = document.getElementById("compra_lote");
    const fechaEntregaInput = document.getElementById("compra_fecha_entrega");
    const fechaCaducidadInput = document.getElementById("compra_fecha_caducidad");

    const precioUnitarioCalc = document.getElementById("compra_precio_unitario_calc");
    const formulaDisplay = document.getElementById("compra_formula_display");
    const gananciaCalc = document.getElementById("compra_ganancia_calc");
    const gananciaFormula = document.getElementById("compra_ganancia_formula");
    const margenDeseadoInput = document.getElementById("compra_margen_deseado");
    const gananciaLabel = document.getElementById("compra_ganancia_label");

    const tablaBody = document.getElementById("compra_tabla_body");
    const subtotalFacturaEl = document.getElementById("compra_subtotal_factura");
    const ivaFacturaEl = document.getElementById("compra_iva_factura");
    const totalFacturaEl = document.getElementById("compra_total_factura");

    const btnAgregarProd = document.getElementById("btn_compra_agregar_prod");
    const btnEliminarProd = document.getElementById("btn_compra_eliminar_prod");
    const btnEditarFactura = document.getElementById("btn_compra_editar_factura");
    const btnVerFactura = document.getElementById("btn_compra_ver_factura");

    // Estado local de la factura actual
    let compraItems = [];
    let selectedItemIndex = null;

    // A. Funciones auxiliares para proveedores y agrupaciones
    const popularProveedoresSelect = () => {
        if (!selectProveedor) return;
        const valorActual = selectProveedor.value;
        selectProveedor.innerHTML = '<option value="">Seleccione un proveedor...</option>';
        
        const filasProveedores = document.querySelectorAll("#proveedores .tabla_agg tbody tr:not(.no-results-row)");
        filasProveedores.forEach(fila => {
            const celdaNombre = fila.cells[1];
            if (celdaNombre) {
                const nombre = celdaNombre.textContent.trim();
                const option = document.createElement("option");
                option.value = nombre;
                option.textContent = nombre;
                selectProveedor.appendChild(option);
            }
        });
        
        if (valorActual && Array.from(selectProveedor.options).some(opt => opt.value === valorActual)) {
            selectProveedor.value = valorActual;
        }
    };
    window.popularProveedoresSelect = popularProveedoresSelect;

    const cargarAgrupacionesProducto = (prodId) => {
        if (!selectAgrupacion) return;
        selectAgrupacion.innerHTML = '';
        
        const productos = window.productosInventario || [];
        const productoObj = productos.find(p => p.id === prodId);
        
        if (productoObj && productoObj.groupings) {
            Object.entries(productoObj.groupings).forEach(([groupName, equiv]) => {
                const option = document.createElement("option");
                option.value = groupName;
                option.dataset.equiv = equiv;
                option.textContent = `${groupName} (${equiv} ud${equiv > 1 ? 's' : ''})`;
                selectAgrupacion.appendChild(option);
            });
        } else {
            const option = document.createElement("option");
            option.value = "Unidad";
            option.dataset.equiv = "1";
            option.textContent = "Unidad (1 ud)";
            selectAgrupacion.appendChild(option);
        }
        
        if (cantidadAgrupacionInput) cantidadAgrupacionInput.value = "1";
        if (cantidadInput) {
            const equiv = parseFloat(selectAgrupacion.options[0]?.dataset.equiv) || 1;
            cantidadInput.value = equiv;
        }
    };

    // 2. Inicialización de valores por defecto
    const inicializarValores = () => {
        // Establecer fecha de hoy para la factura
        const hoy = new Date().toISOString().split("T")[0];
        if (fechaInput) fechaInput.value = hoy;
        if (fechaEntregaInput) fechaEntregaInput.value = "";

        // Cargar usuario activo del header
        const labelUser = document.querySelector("header .box_comp label")?.textContent || "Carmelo";
        if (usuarioInput) usuarioInput.value = labelUser;

        // Cargar proveedores
        popularProveedoresSelect();

        // Iniciar comportamiento de búsqueda de productos (autocompletado escrito)
        iniciarAutocompletado();

        // Calcular precio unitario inicial
        calcularPrecioUnitario();
    };

    // 3. Manejo de Autocompletado / Búsqueda Escrita
    const iniciarAutocompletado = () => {
        if (!buscarProductoInput || !resultadosBusqueda) return;

        // Filtrar y mostrar resultados mientras escribe
        buscarProductoInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                resultadosBusqueda.style.display = "none";
                selectProductoId.value = "";
                calcularPrecioUnitario();
                return;
            }

            const productos = window.productosInventario || [];
            const filtrados = productos.filter(p => 
                p.name.toLowerCase().includes(query) || 
                p.category.toLowerCase().includes(query)
            );

            if (filtrados.length === 0) {
                resultadosBusqueda.innerHTML = `<div class="autocomplete-item-no-results">No se encontraron productos</div>`;
                resultadosBusqueda.style.display = "block";
                return;
            }

            resultadosBusqueda.innerHTML = filtrados.map(prod => `
                <div class="autocomplete-item" data-id="${prod.id}" data-name="${prod.name}">
                    <strong>${prod.name}</strong> <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${prod.category})</span>
                </div>
            `).join("");

            resultadosBusqueda.style.display = "block";

            // Vincular evento de clic a las opciones filtradas
            resultadosBusqueda.querySelectorAll(".autocomplete-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.dataset.id;
                    const name = item.dataset.name;

                    buscarProductoInput.value = name;
                    selectProductoId.value = id;
                    resultadosBusqueda.style.display = "none";
                    cargarAgrupacionesProducto(id);

                    calcularPrecioUnitario();
                });
            });
        });

        // Mostrar lista completa al hacer click/focus
        buscarProductoInput.addEventListener("focus", () => {
            const query = buscarProductoInput.value.toLowerCase().trim();
            const productos = window.productosInventario || [];
            const filtrados = query ? 
                productos.filter(p => p.name.toLowerCase().includes(query)) : 
                productos;

            if (filtrados.length === 0) {
                resultadosBusqueda.innerHTML = `<div class="autocomplete-item-no-results">No se encontraron productos</div>`;
                resultadosBusqueda.style.display = "block";
                return;
            }

            resultadosBusqueda.innerHTML = filtrados.map(prod => `
                <div class="autocomplete-item" data-id="${prod.id}" data-name="${prod.name}">
                    <strong>${prod.name}</strong> <span style="font-size: 11px; color: #64748b; margin-left: 8px;">(${prod.category})</span>
                </div>
            `).join("");

            resultadosBusqueda.style.display = "block";

            // Vincular evento de clic a las opciones
            resultadosBusqueda.querySelectorAll(".autocomplete-item").forEach(item => {
                item.addEventListener("click", () => {
                    const id = item.dataset.id;
                    const name = item.dataset.name;

                    buscarProductoInput.value = name;
                    selectProductoId.value = id;
                    resultadosBusqueda.style.display = "none";
                    cargarAgrupacionesProducto(id);

                    calcularPrecioUnitario();
                });
            });
        });

        // Cerrar resultados al hacer click fuera
        document.addEventListener("click", (e) => {
            if (!buscarProductoInput.contains(e.target) && !resultadosBusqueda.contains(e.target)) {
                resultadosBusqueda.style.display = "none";
            }
        });
    };

    // 4. Calcular el precio unitario y precio sugerido en tiempo real
    const calcularPrecioUnitario = () => {
        const cantidad = parseFloat(cantidadInput?.value) || 0;
        const costo = parseFloat(precioCostoInput?.value) || 0;
        const ivaPct = parseFloat(ivaInput?.value) || 0;
        const descuento = parseFloat(descuentoInput?.value) || 0;
        const bonificacion = parseFloat(bonificacionInput?.value) || 0;
        const margenDeseado = parseFloat(margenDeseadoInput?.value) || 0;

        // Fórmula: Costo total = (Cantidad * Costo) - Descuento + IVA
        const subtotalBruto = cantidad * costo;
        const baseDescuento = subtotalBruto - descuento;
        const ivaCalculado = baseDescuento > 0 ? baseDescuento * (ivaPct / 100) : 0;
        const totalNeto = Math.max(0, baseDescuento + ivaCalculado);
        const cantidadTotalRecibida = cantidad + bonificacion;

        const precioUnitarioVal = cantidadTotalRecibida > 0 ? (totalNeto / cantidadTotalRecibida) : 0;

        if (precioUnitarioCalc) {
            precioUnitarioCalc.textContent = `C$ ${precioUnitarioVal.toFixed(2)}`;
        }

        if (formulaDisplay) {
            formulaDisplay.textContent = `Fórmula: ((${cantidad} * C$${costo.toFixed(0)}) - C$${descuento.toFixed(0)} + C$${ivaCalculado.toFixed(0)}) / (${cantidad} + ${bonificacion} uds) = C$${precioUnitarioVal.toFixed(2)}`;
        }

        // Cálculo de Precio Sugerido basado en el margen deseado
        // Fórmula del margen comercial estándar: Precio Venta = Costo / (1 - Margen%)
        const precioSugerido = margenDeseado < 100 ? (precioUnitarioVal / (1 - (margenDeseado / 100))) : 0;

        if (gananciaLabel) {
            gananciaLabel.textContent = `Precio Venta Sugerido (${margenDeseado.toFixed(0)}% Ganancia):`;
        }

        if (gananciaCalc) {
            gananciaCalc.textContent = `C$ ${precioSugerido.toFixed(2)}`;
        }

        if (gananciaFormula) {
            gananciaFormula.textContent = `Fórmula: Costo C$ ${precioUnitarioVal.toFixed(2)} / (1 - ${(margenDeseado/100).toFixed(2)})`;
        }

        return {
            precioUnitario: precioUnitarioVal,
            subtotalNeto: totalNeto,
            ivaVal: ivaCalculado,
            precioSugerido: precioSugerido,
            margenDeseado: margenDeseado
        };
    };

    // Escuchar cambios en la agrupación y cantidad de agrupación
    selectAgrupacion?.addEventListener("change", () => {
        const selectedOpt = selectAgrupacion.options[selectAgrupacion.selectedIndex];
        const equiv = parseFloat(selectedOpt?.dataset.equiv) || 1;
        const cantAgrup = parseFloat(cantidadAgrupacionInput?.value) || 0;
        
        if (cantidadInput) {
            cantidadInput.value = Math.round(cantAgrup * equiv);
        }
        calcularPrecioUnitario();
    });

    cantidadAgrupacionInput?.addEventListener("input", () => {
        const selectedOpt = selectAgrupacion?.options[selectAgrupacion.selectedIndex];
        const equiv = parseFloat(selectedOpt?.dataset.equiv) || 1;
        const cantAgrup = parseFloat(cantidadAgrupacionInput.value) || 0;
        
        if (cantidadInput) {
            cantidadInput.value = Math.round(cantAgrup * equiv);
        }
        calcularPrecioUnitario();
    });

    cantidadInput?.addEventListener("input", () => {
        const cantidad = parseFloat(cantidadInput.value) || 0;
        const selectedOpt = selectAgrupacion?.options[selectAgrupacion.selectedIndex];
        const equiv = parseFloat(selectedOpt?.dataset.equiv) || 1;
        
        if (cantidad % equiv === 0) {
            if (cantidadAgrupacionInput) {
                cantidadAgrupacionInput.value = Math.round(cantidad / equiv);
            }
        } else {
            // Si la cantidad modificada directamente no es divisible por la agrupación actual,
            // se restablece la agrupación a "Unidad" para no desacomodar la agrupación.
            if (selectAgrupacion) {
                selectAgrupacion.value = "Unidad";
            }
            if (cantidadAgrupacionInput) {
                cantidadAgrupacionInput.value = 0;
            }
        }
    });

    // Escuchar cambios en los inputs del producto para calcular el precio unitario
    [cantidadInput, precioCostoInput, ivaInput, descuentoInput, bonificacionInput, margenDeseadoInput].forEach(input => {
        input?.addEventListener("input", calcularPrecioUnitario);
    });

    // 5. Renderizar tabla de productos agregados
    const renderTablaItems = () => {
        if (!tablaBody) return;

        if (compraItems.length === 0) {
            tablaBody.innerHTML = `
                <tr id="compra_tabla_vacia">
                    <td colspan="10" style="text-align: center; color: #64748b; padding: 24px; font-weight: 500;">
                        No hay productos agregados a esta factura de compra.
                    </td>
                </tr>
            `;
            actualizarTotalesFactura(0, 0, 0);
            return;
        }

        let subtotalAcumulado = 0;
        let ivaAcumulado = 0;
        let totalAcumulado = 0;

        tablaBody.innerHTML = compraItems.map((item, index) => {
            subtotalAcumulado += (item.cantidad * item.costo) - item.descuento;
            ivaAcumulado += item.ivaVal;
            totalAcumulado += item.subtotalNeto;

            const isSelected = selectedItemIndex === index ? "selected" : "";
            
            const agrupacionText = item.agrupacion && item.agrupacion !== "Unidad" 
                ? `${item.cantidad} (${item.cantidadAgrupacion} ${item.agrupacion})` 
                : `${item.cantidad}`;

            return `
                <tr class="${isSelected}" data-index="${index}">
                    <td><strong>${item.nombre}</strong></td>
                    <td style="text-align: center;">${agrupacionText}</td>
                    <td style="text-align: center;">${item.bonificacion}</td>
                    <td>C$ ${item.costo.toFixed(2)}</td>
                    <td>C$ ${item.descuento.toFixed(2)}</td>
                    <td><span class="badge" style="background: #e2e8f0; color: #475569;">${item.lote}</span></td>
                    <td>${item.fechaEntrega}</td>
                    <td><span style="color: #ef4444; font-weight: 500;">${item.fechaCaducidad}</span></td>
                    <td style="font-weight: bold; color: #2563eb;">C$ ${item.precioUnitario.toFixed(2)}</td>
                    <td style="font-weight: bold; color: #10b981;">C$ ${item.subtotalNeto.toFixed(2)}</td>
                </tr>
            `;
        }).join("");

        actualizarTotalesFactura(subtotalAcumulado, ivaAcumulado, totalAcumulado);

        // Volver a vincular eventos de clic para la selección de fila
        const rows = tablaBody.querySelectorAll("tr");
        rows.forEach(row => {
            row.addEventListener("click", () => {
                const index = parseInt(row.dataset.index);
                if (isNaN(index)) return;

                if (selectedItemIndex === index) {
                    // Si ya está seleccionado, deseleccionar
                    selectedItemIndex = null;
                    row.classList.remove("selected");
                    btnEliminarProd.disabled = true;
                    btnEliminarProd.style.opacity = "0.5";
                } else {
                    // Seleccionar la fila
                    selectedItemIndex = index;
                    rows.forEach(r => r.classList.remove("selected"));
                    row.classList.add("selected");
                    btnEliminarProd.disabled = false;
                    btnEliminarProd.style.opacity = "1";
                    
                    // Cargar valores de la fila en el formulario para facilitar edición/visualización
                    cargarItemEnFormulario(compraItems[index]);
                }
            });
        });
    };

    // Cargar los valores de un item en el formulario de entrada
    const cargarItemEnFormulario = (item) => {
        if (buscarProductoInput) buscarProductoInput.value = item.nombre;
        if (selectProductoId) selectProductoId.value = item.id;
        
        // Cargar las agrupaciones del producto
        cargarAgrupacionesProducto(item.id);
        
        // Seleccionar la agrupación guardada si existe
        if (selectAgrupacion && item.agrupacion) {
            selectAgrupacion.value = item.agrupacion;
        }
        if (cantidadAgrupacionInput && item.cantidadAgrupacion !== undefined) {
            cantidadAgrupacionInput.value = item.cantidadAgrupacion;
        }

        if (cantidadInput) cantidadInput.value = item.cantidad;
        if (precioCostoInput) precioCostoInput.value = item.costo;
        if (ivaInput) ivaInput.value = item.ivaPct;
        if (descuentoInput) descuentoInput.value = item.descuento;
        if (bonificacionInput) bonificacionInput.value = item.bonificacion;
        if (loteInput) loteInput.value = item.lote;
        if (fechaEntregaInput) fechaEntregaInput.value = item.fechaEntrega;
        if (fechaCaducidadInput) fechaCaducidadInput.value = item.fechaCaducidad === "Sin venc." ? "" : item.fechaCaducidad;

        calcularPrecioUnitario();
    };

    // Actualizar los elementos de totales en la UI
    const actualizarTotalesFactura = (subtotal, iva, total) => {
        if (subtotalFacturaEl) subtotalFacturaEl.textContent = `C$ ${Math.max(0, subtotal).toFixed(2)}`;
        if (ivaFacturaEl) ivaFacturaEl.textContent = `C$ ${Math.max(0, iva).toFixed(2)}`;
        if (totalFacturaEl) totalFacturaEl.textContent = `C$ ${Math.max(0, total).toFixed(2)}`;
    };

    // 6. Botón: Agregar Producto
    btnAgregarProd?.addEventListener("click", (e) => {
        e.preventDefault();

        if (!selectProductoId || selectProductoId.value === "") {
            alert("Por favor, selecciona un producto de la lista primero.");
            return;
        }

        const id = selectProductoId.value;
        const nombre = buscarProductoInput.value.trim();

        const cantidad = parseInt(cantidadInput.value) || 0;
        const agrupacion = selectAgrupacion?.value || "Unidad";
        const cantidadAgrupacion = parseInt(cantidadAgrupacionInput?.value) || 1;
        const costo = parseFloat(precioCostoInput.value) || 0;
        const ivaPct = parseFloat(ivaInput.value) || 0;
        const descuento = parseFloat(descuentoInput.value) || 0;
        const bonificacion = parseInt(bonificacionInput.value) || 0;
        const lote = loteInput.value.trim() || "N/A";
        const fechaEntrega = fechaEntregaInput.value || new Date().toISOString().split("T")[0];
        const fechaCaducidad = fechaCaducidadInput.value || "Sin venc.";

        if (cantidad <= 0) {
            alert("La cantidad debe ser mayor a 0.");
            return;
        }
        if (costo < 0) {
            alert("El precio de compra no puede ser menor a 0.");
            return;
        }
        if (descuento < 0) {
            alert("El descuento no puede ser menor a 0.");
            return;
        }
        if (bonificacion < 0) {
            alert("La bonificación no puede ser menor a 0.");
            return;
        }

        // Obtener los cálculos
        const calculos = calcularPrecioUnitario();

        // Agregar al carrito de compra
        compraItems.push({
            id: id,
            nombre: nombre,
            cantidad: cantidad,
            agrupacion: agrupacion,
            cantidadAgrupacion: cantidadAgrupacion,
            costo: costo,
            ivaPct: ivaPct,
            ivaVal: calculos.ivaVal,
            descuento: descuento,
            bonificacion: bonificacion,
            lote: lote,
            fechaEntrega: fechaEntrega,
            fechaCaducidad: fechaCaducidad,
            precioUnitario: calculos.precioUnitario,
            subtotalNeto: calculos.subtotalNeto
        });

        // Limpiar formulario de producto
        buscarProductoInput.value = "";
        selectProductoId.value = "";
        if (selectAgrupacion) {
            selectAgrupacion.innerHTML = '<option value="Unidad" data-equiv="1">Unidad (1 ud)</option>';
            selectAgrupacion.value = "Unidad";
        }
        if (cantidadAgrupacionInput) cantidadAgrupacionInput.value = "1";
        cantidadInput.value = "1";
        precioCostoInput.value = "0.00";
        ivaInput.value = "15";
        descuentoInput.value = "0.00";
        bonificacionInput.value = "0";
        loteInput.value = "";
        fechaCaducidadInput.value = "";
        fechaEntregaInput.value = "";
        margenDeseadoInput.value = "20";

        calcularPrecioUnitario();
        renderTablaItems();

        // Deseleccionar cualquier fila
        selectedItemIndex = null;
        if (btnEliminarProd) {
            btnEliminarProd.disabled = true;
            btnEliminarProd.style.opacity = "0.5";
        }
    });

    // 7. Botón: Eliminar Producto Seleccionado
    btnEliminarProd?.addEventListener("click", (e) => {
        e.preventDefault();

        if (selectedItemIndex === null) {
            alert("Por favor, selecciona un producto de la tabla primero haciendo clic en su fila.");
            return;
        }

        const itemEliminado = compraItems[selectedItemIndex];
        if (confirm(`¿Estás seguro de que deseas eliminar "${itemEliminado.nombre}" de la factura?`)) {
            compraItems.splice(selectedItemIndex, 1);
            selectedItemIndex = null;

            renderTablaItems();

            btnEliminarProd.disabled = true;
            btnEliminarProd.style.opacity = "0.5";
        }
    });

    // 8. Botón: Editar Factura (Guardar/Modificar en el sistema)
    btnEditarFactura?.addEventListener("click", (e) => {
        e.preventDefault();

        const numFactura = numFacturaInput?.value.trim();
        const fecha = fechaInput?.value;
        const usuario = usuarioInput?.value;
        const metodoPago = metodoPagoSelect?.value;
        const proveedor = selectProveedor?.value || "";

        if (!numFactura) {
            alert("Por favor, ingresa el número de factura.");
            numFacturaInput.focus();
            return;
        }

        if (compraItems.length === 0) {
            alert("No puedes guardar una factura de compra sin productos. Agrega al menos uno.");
            return;
        }

        // Calcular totales acumulados
        let subtotalTotal = 0;
        let ivaTotal = 0;
        let totalTotal = 0;
        compraItems.forEach(item => {
            subtotalTotal += (item.cantidad * item.costo) - item.descuento;
            ivaTotal += item.ivaVal;
            totalTotal += item.subtotalNeto;
        });

        // Crear objeto de factura
        const factura = {
            numFactura: numFactura,
            fecha: fecha,
            usuario: usuario,
            metodoPago: metodoPago,
            proveedor: proveedor,
            items: compraItems,
            subtotal: subtotalTotal,
            iva: ivaTotal,
            total: totalTotal
        };

        // Guardar en localStorage
        let facturasGuardadas = [];
        const localData = localStorage.getItem("facturasCompras");
        if (localData) {
            try {
                facturasGuardadas = JSON.parse(localData);
            } catch (e) {
                console.error("Error al parsear facturas de compras", e);
            }
        }

        // Buscar si ya existe la factura con este número
        const indexExistente = facturasGuardadas.findIndex(f => f.numFactura === numFactura);
        if (indexExistente !== -1) {
            // Actualizar factura existente
            facturasGuardadas[indexExistente] = factura;
            alert(`¡Factura "${numFactura}" editada y guardada exitosamente en el sistema!`);
        } else {
            // Guardar nueva factura
            facturasGuardadas.push(factura);
            alert(`¡Factura de compra "${numFactura}" registrada exitosamente en el sistema!`);
        }

        localStorage.setItem("facturasCompras", JSON.stringify(facturasGuardadas));

        // Limpiar formulario completo de factura
        if (numFacturaInput) numFacturaInput.value = "";
        if (selectProveedor) selectProveedor.value = "";
        compraItems = [];
        renderTablaItems();
        inicializarValores();

        // Cerrar modal
        if (window.closeMostAggProdu) {
            window.closeMostAggProdu();
        }
    });

    // 8.5 Botón: Ver Factura (Abrir modal)
    btnVerFactura?.addEventListener("click", (e) => {
        e.preventDefault();

        // Poblar los metadatos generales en el modal
        const numFacturaVal = numFacturaInput?.value.trim() || "Borrador";
        const fechaVal = fechaInput?.value || "-";
        const proveedorVal = selectProveedor?.value || "Ninguno";
        const usuarioVal = usuarioInput?.value || "-";
        const metodoPagoVal = metodoPagoSelect?.value || "-";

        const verNumFactura = document.getElementById("ver_compra_num_factura");
        const verFecha = document.getElementById("ver_compra_fecha");
        const verProveedor = document.getElementById("ver_compra_proveedor");
        const verUsuario = document.getElementById("ver_compra_usuario");
        const verMetodo = document.getElementById("ver_compra_metodo_pago");

        if (verNumFactura) verNumFactura.textContent = numFacturaVal;
        if (verFecha) verFecha.textContent = fechaVal;
        if (verProveedor) verProveedor.textContent = proveedorVal;
        if (verUsuario) verUsuario.textContent = usuarioVal;
        if (verMetodo) verMetodo.textContent = metodoPagoVal;

        if (window.mostrarModal) {
            window.mostrarModal("modal_ver_factura_compra");
        }
    });

    // 9. Cargar factura al cambiar número de factura (Buscador automático / Carga de edición)
    numFacturaInput?.addEventListener("change", () => {
        const numFactura = numFacturaInput.value.trim();
        if (!numFactura) return;

        let facturasGuardadas = [];
        const localData = localStorage.getItem("facturasCompras");
        if (localData) {
            try {
                facturasGuardadas = JSON.parse(localData);
            } catch (e) {
                console.error(e);
            }
        }

        const facturaEncontrada = facturasGuardadas.find(f => f.numFactura === numFactura);
        if (facturaEncontrada) {
            if (confirm(`Se encontró la factura registrada "${numFactura}". ¿Deseas cargarla para editarla?`)) {
                if (fechaInput) fechaInput.value = facturaEncontrada.fecha;
                if (usuarioInput) usuarioInput.value = facturaEncontrada.usuario;
                if (metodoPagoSelect) metodoPagoSelect.value = facturaEncontrada.metodoPago;
                if (selectProveedor) selectProveedor.value = facturaEncontrada.proveedor || "";
                compraItems = [...facturaEncontrada.items];
                selectedItemIndex = null;
                renderTablaItems();
                if (btnEliminarProd) {
                    btnEliminarProd.disabled = true;
                    btnEliminarProd.style.opacity = "0.5";
                }
            }
        }
    });

    // Escuchar cuando el usuario hace clic en el apartado de compras para ocultar resultados de búsqueda y recargar proveedores
    document.querySelector('.nav_button[data-section="compras"]')?.addEventListener('click', () => {
        if (resultadosBusqueda) resultadosBusqueda.style.display = "none";
        popularProveedoresSelect();
    });

    // Carga inicial al iniciar la app
    inicializarValores();
});
