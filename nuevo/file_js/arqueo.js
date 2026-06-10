document.addEventListener("DOMContentLoaded", () => {
    // 1. GESTIÓN DE PESTAÑAS (TABS) PARA VENTAS / ARQUEO
    const tabButtons = document.querySelectorAll(".tab_ventas_btn");
    const tabHistorial = document.getElementById("tab_historial_ventas");
    const tabArqueo = document.getElementById("tab_arqueo_caja");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.dataset.tab;
            if (tab === "historial-ventas") {
                if (tabHistorial) tabHistorial.style.display = "block";
                if (tabArqueo) tabArqueo.style.display = "none";
            } else {
                if (tabHistorial) tabHistorial.style.display = "none";
                if (tabArqueo) tabArqueo.style.display = "block";
                
                // Recalcular ventas en efectivo y volver a calcular cuadre al abrir arqueo
                recalcularVentasEfectivo();
                calcularCuadre();
            }
        });
    });

    // 2. FILTRAR VENTAS POR MÉTODO DE PAGO
    const selectPago = document.getElementById("Selec_pago");
    const tablaVentas = document.getElementById("tabla_ventas_realizadas");
    
    selectPago?.addEventListener("change", () => {
        const metodo = selectPago.value;
        const rows = tablaVentas?.querySelectorAll("tbody tr");
        if (!rows) return;

        rows.forEach(row => {
            const pagoAttr = row.getAttribute("data-pago");
            if (!metodo || pagoAttr === metodo) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    // 3. LÓGICA DE ARQUEO DE CAJA DIARIO
    const inputMontoInicial = document.getElementById("arq_monto_inicial");
    const displayMontoInicial = document.getElementById("arq_monto_inicial_disp");
    const displayVentasEfectivo = document.getElementById("arq_ventas_efectivo");
    const displayEsperado = document.getElementById("arq_efectivo_esperado");
    const displayContado = document.getElementById("arq_efectivo_contado");
    const resultBadgeContainer = document.getElementById("arq_resultado_badge");
    const denominacionInputs = document.querySelectorAll(".denominacion_input");
    const arqObservacion = document.getElementById("arq_observacion");
    const btnGuardarArqueo = document.getElementById("btn_guardar_arqueo");
    const btnImprimirArqueo = document.getElementById("btn_imprimir_arqueo");
    const tablaHistorialArqueos = document.getElementById("tabla_historial_arqueos");

    let totalVentasEfectivo = 350.00; // Monto base por defecto

    function cargarVentasRealizadas() {
        const tbody = document.querySelector("#tabla_ventas_realizadas tbody");
        if (!tbody) return;

        let ventas = JSON.parse(localStorage.getItem("ventasSistema")) || [];
        if (ventas.length === 0 && typeof REPORT_DATABASE !== 'undefined') {
            ventas = [...REPORT_DATABASE.ventas];
            localStorage.setItem("ventasSistema", JSON.stringify(ventas));
        }

        tbody.innerHTML = ventas.map(venta => {
            const estado = venta.estado || "Completada";
            const isAnulada = (estado === "Anulada");
            const strikeStyle = isAnulada ? "text-decoration: line-through; opacity: 0.6;" : "";
            
            // Format total
            const totalVal = (typeof venta.total === 'number') ? `C$ ${venta.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : venta.total;
            
            let badgeHTML = "";
            if (isAnulada) {
                badgeHTML = `<span style="background: #fee2e2; color: #b91c1c; font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">Anulada</span>`;
            }

            return `
                <tr data-pago="${venta.metodoPago}" data-status="${estado}" style="${strikeStyle}">
                    <td><strong>${venta.id}</strong></td>
                    <td>${venta.fecha}</td>
                    <td style="color: ${isAnulada ? '#94a3b8' : 'green'}; font-weight: bold;">${totalVal}${badgeHTML}</td>
                    <td>${venta.metodoPago}</td>
                    <td>${venta.vendedor}</td>
                    <td>
                        <button class="btn_observar_v" onclick="window.mostrarDetallesVenta('${venta.id}')">Observar venta</button>
                    </td>
                </tr>
            `;
        }).join("");
    }
    window.cargarVentasRealizadas = cargarVentasRealizadas;

    // Función para calcular dinámicamente las ventas en efectivo del día basándose en la tabla de ventas
    function recalcularVentasEfectivo() {
        const rows = tablaVentas?.querySelectorAll("tbody tr");
        if (!rows) return;

        let total = 0;
        rows.forEach(row => {
            const pagoAttr = row.getAttribute("data-pago");
            const statusAttr = row.getAttribute("data-status");
            // Ignorar si está anulada
            if (statusAttr === "Anulada") return;

            // Se suman las ventas cuyo método de pago sea Efectivo
            if (pagoAttr === "Efectivo") {
                const amountCell = row.cells[2];
                if (amountCell) {
                    const amountText = amountCell.textContent.replace("Anulada", "").replace("C$", "").replace(/,/g, "").trim();
                    const amount = parseFloat(amountText) || 0;
                    total += amount;
                }
            }
        });

        totalVentasEfectivo = total;
        if (displayVentasEfectivo) {
            displayVentasEfectivo.textContent = `C$ ${totalVentasEfectivo.toFixed(2)}`;
        }
        
        // Actualizar también el KPI del encabezado de ventas
        const kpiMonto = document.getElementById("ventas_hoy_monto");
        if (kpiMonto) {
            kpiMonto.textContent = `C$ ${totalVentasEfectivo.toFixed(2)}`;
        }
        const kpiCant = document.getElementById("ventas_hoy_cant");
        if (kpiCant) {
            const cashRowsCount = Array.from(rows).filter(r => r.getAttribute("data-pago") === "Efectivo" && r.getAttribute("data-status") !== "Anulada").length;
            kpiCant.textContent = `${cashRowsCount} Venta${cashRowsCount !== 1 ? 's' : ''} realizada${cashRowsCount !== 1 ? 's' : ''}`;
        }
    }

    function calcularCuadre() {
        const inicial = parseFloat(inputMontoInicial?.value) || 0;
        
        // Actualizar el monto inicial mostrado
        if (displayMontoInicial) {
            displayMontoInicial.textContent = `C$ ${inicial.toFixed(2)}`;
        }

        // Obtener el total de gastos aprobados para restar
        const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
        const totalGastosAprobados = solicitudes
            .filter(s => s.tipo === "Gasto" && s.estado === "Aprobada")
            .reduce((sum, s) => sum + (parseFloat(s.monto) || 0), 0);

        // Actualizar el elemento del total de gastos aprobados en la UI
        const displayGastosAprobados = document.getElementById("arq_gastos_aprobados");
        if (displayGastosAprobados) {
            displayGastosAprobados.textContent = `C$ ${totalGastosAprobados.toFixed(2)}`;
        }

        // Efectivo esperado = Efectivo Inicial + Ventas en Efectivo del día - Gastos Aprobados
        const esperado = inicial + totalVentasEfectivo - totalGastosAprobados;
        if (displayEsperado) {
            displayEsperado.textContent = `C$ ${esperado.toFixed(2)}`;
        }

        // Calcular efectivo contado físicamente
        let contado = 0;
        denominacionInputs.forEach(input => {
            const valorDenom = parseFloat(input.dataset.value) || 0;
            const cantidad = parseInt(input.value) || 0;
            contado += valorDenom * cantidad;
        });

        if (displayContado) {
            displayContado.textContent = `C$ ${contado.toFixed(2)}`;
        }

        // Diferencia de arqueo
        const diferencia = contado - esperado;
        
        // Actualizar el badge del estado del arqueo
        if (resultBadgeContainer) {
            const haIngresadoDatos = Array.from(denominacionInputs).some(i => i.value && parseInt(i.value) > 0);
            
            if (!haIngresadoDatos) {
                resultBadgeContainer.innerHTML = `<span class="badge_cuadre neutral">Sin Conteo</span>`;
            } else if (Math.abs(diferencia) < 0.01) {
                resultBadgeContainer.innerHTML = `<span class="badge_cuadre success">Caja Cuadrada (C$ 0.00)</span>`;
            } else if (diferencia < 0) {
                resultBadgeContainer.innerHTML = `<span class="badge_cuadre danger">Faltante (-C$ ${Math.abs(diferencia).toFixed(2)})</span>`;
            } else {
                resultBadgeContainer.innerHTML = `<span class="badge_cuadre warning">Sobrante (+C$ ${diferencia.toFixed(2)})</span>`;
            }
        }
    }

    // Vincular eventos de entrada de datos
    inputMontoInicial?.addEventListener("input", calcularCuadre);
    denominacionInputs.forEach(input => {
        input.addEventListener("input", calcularCuadre);
    });

    // Guardar Arqueo de Caja
    btnGuardarArqueo?.addEventListener("click", () => {
        const inicial = parseFloat(inputMontoInicial?.value) || 0;
        
        // Obtener el total de gastos aprobados para restar
        const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
        const totalGastosAprobados = solicitudes
            .filter(s => s.tipo === "Gasto" && s.estado === "Aprobada")
            .reduce((sum, s) => sum + (parseFloat(s.monto) || 0), 0);

        const esperado = inicial + totalVentasEfectivo - totalGastosAprobados;
        
        let contado = 0;
        denominacionInputs.forEach(input => {
            const valorDenom = parseFloat(input.dataset.value) || 0;
            const cantidad = parseInt(input.value) || 0;
            contado += valorDenom * cantidad;
        });

        const diferencia = contado - esperado;
        const haIngresadoDatos = Array.from(denominacionInputs).some(i => i.value && parseInt(i.value) > 0);

        if (!haIngresadoDatos) {
            alert("Por favor, realice el recuento físico de efectivo introduciendo valores en las denominaciones antes de guardar.");
            return;
        }

        // Definir estado y estilos visuales del badge en el historial
        let estadoText = "Cuadrada";
        let difColor = "green";
        let badgeStyle = "background: rgba(34, 197, 94, 0.15); color: #166534;";

        if (diferencia < 0) {
            estadoText = "Faltante";
            difColor = "#ef4444";
            badgeStyle = "background: #fee2e2; color: #b91c1c;";
        } else if (diferencia > 0) {
            estadoText = "Sobrante";
            difColor = "#2563eb";
            badgeStyle = "background: #eff6ff; color: #1d4ed8;";
        }

        // Obtener fecha actual en formato local AAAA-MM-DD
        const hoy = new Date();
        const dateString = hoy.toISOString().split('T')[0];

        // Crear una nueva fila
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${dateString}</strong></td>
            <td>Carmelo</td>
            <td>C$ ${inicial.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>C$ ${totalVentasEfectivo.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>C$ ${esperado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td>C$ ${contado.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="color: ${difColor}; font-weight: bold;">${diferencia < 0 ? '-' : ''}C$ ${Math.abs(diferencia).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td><span class="badge_pct" style="${badgeStyle}">${estadoText}</span></td>
        `;

        if (tablaHistorialArqueos) {
            // Insertar al principio del historial de la tabla para que se visualice inmediatamente arriba
            tablaHistorialArqueos.insertBefore(tr, tablaHistorialArqueos.firstChild);
        }

        alert("El Arqueo de caja diario ha sido registrado exitosamente en el historial.");

        // Limpiar inputs de conteo y observaciones
        denominacionInputs.forEach(input => input.value = 0);
        if (arqObservacion) arqObservacion.value = "";
        calcularCuadre();
    });

    // Imprimir Arqueo
    btnImprimirArqueo?.addEventListener("click", () => {
        window.print();
    });

    // Inicializar cálculos
    cargarVentasRealizadas();
    recalcularVentasEfectivo();
    calcularCuadre();
});
