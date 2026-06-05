// ==========================================
// BASE DE DATOS SIMULADA (LICORERÍA)
// ==========================================
const REPORT_DATABASE = {
    // Ventas detalladas
    ventas: [
        // Hoy (2026-05-31)
        { id: "VTA-0010", fecha: "2026-05-31", cliente: "Juan Pérez", vendedor: "Carmelo", metodoPago: "Tarjeta", total: 2500, costo: 1600, sucursal: "Central", productos: ["Flor de Caña x5", "Pepsi x10"] },
        { id: "VTA-0009", fecha: "2026-05-31", cliente: "María López", vendedor: "Carmelo", metodoPago: "Transferencia", total: 800, costo: 520, sucursal: "Central", productos: ["Vino Tinto x2", "Cerveza Toña x4"] },
        { id: "VTA-0008", fecha: "2026-05-31", cliente: "Invitado", vendedor: "Elizabeth", metodoPago: "Efectivo", total: 350, costo: 230, sucursal: "Plaza", productos: ["Cerveza Toña x10"] },
        
        // Esta Semana (Últimos 7 días: 2026-05-25 a 2026-05-30)
        { id: "VTA-0007", fecha: "2026-05-30", cliente: "Carlos Ruiz", vendedor: "Elizabeth", metodoPago: "Tarjeta", total: 1200, costo: 780, sucursal: "Norte", productos: ["Absolut Vodka x2", "Pepsi x6"] },
        { id: "VTA-0006", fecha: "2026-05-29", cliente: "Ana Torres", vendedor: "Elizabeth", metodoPago: "Efectivo", total: 450, costo: 290, sucursal: "Plaza", productos: ["Marlboro x10", "Victoria x5"] },
        { id: "VTA-0005", fecha: "2026-05-28", cliente: "Juan Pérez", vendedor: "Carmelo", metodoPago: "Transferencia", total: 3100, costo: 2000, sucursal: "Central", productos: ["Chivas Regal x2", "Pepsi x4"] },
        { id: "VTA-0004", fecha: "2026-05-26", cliente: "Carlos Mendoza", vendedor: "Elizabeth", metodoPago: "Efectivo", total: 1800, costo: 1170, sucursal: "Norte", productos: ["Flor de Caña x3", "Cerveza Toña x20"] },
        
        // Este Mes (Mayo 2026 - anterior a últimos 7 días)
        { id: "VTA-0003", fecha: "2026-05-22", cliente: "Juan Pérez", vendedor: "Carmelo", metodoPago: "Tarjeta", total: 4500, costo: 2900, sucursal: "Central", productos: ["Chivas Regal x3"] },
        { id: "VTA-0002", fecha: "2026-05-18", cliente: "Invitado", vendedor: "Elizabeth", metodoPago: "Transferencia", total: 6200, costo: 4000, sucursal: "Plaza", productos: ["Flor de Caña x10", "Victoria x24"] },
        { id: "VTA-0001", fecha: "2026-05-15", cliente: "María López", vendedor: "Carmelo", metodoPago: "Efectivo", total: 950, costo: 610, sucursal: "Norte", productos: ["Vino Tinto x3"] },
        { id: "VTA-0000", fecha: "2026-05-05", cliente: "Ana Torres", vendedor: "Elizabeth", metodoPago: "Efectivo", total: 3500, costo: 2200, sucursal: "Plaza", productos: ["Flor de Caña x6", "Marlboro x20"] },
        
        // Historial General (Meses anteriores)
        { id: "VTA-OLD2", fecha: "2026-04-28", cliente: "Invitado", vendedor: "Elizabeth", metodoPago: "Transferencia", total: 8000, costo: 5200, sucursal: "Central", productos: ["Flor de Caña x15", "Pepsi x30"] },
        { id: "VTA-OLD1", fecha: "2026-04-15", cliente: "Juan Pérez", vendedor: "Carmelo", metodoPago: "Tarjeta", total: 15000, costo: 9800, sucursal: "Central", productos: ["Chivas Regal x10"] },
        { id: "VTA-OLD0", fecha: "2026-03-20", cliente: "Carlos Mendoza", vendedor: "Elizabeth", metodoPago: "Efectivo", total: 22000, costo: 14000, sucursal: "Norte", productos: ["Flor de Caña x40", "Cerveza Toña x200"] }
    ],

    // Categorías de Licorería y sus estadísticas agregadas
    categorias: [
        { nombre: "Licores (Ron, Vodka)", ventas: 54000, porcentaje: 45 },
        { nombre: "Cervezas", ventas: 36000, porcentaje: 30 },
        { nombre: "Vinos", ventas: 18000, porcentaje: 15 },
        { nombre: "Cigarros y Tabaco", ventas: 7200, porcentaje: 6 },
        { nombre: "Refrescos y Snacks", ventas: 4800, porcentaje: 4 }
    ],

    // Top de productos estrella
    productosEstrella: [
        { nombre: "Flor de Caña 7 Años", categoria: "Licores", vendidos: 120, ingresos: 30000, costoTotal: 19500, ranking: "1" },
        { nombre: "Cerveza Toña (Unidad)", categoria: "Cervezas", vendidos: 450, ingresos: 15750, costoTotal: 11250, ranking: "2" },
        { nombre: "Vino Tinto Concha y Toro", categoria: "Vinos", vendidos: 60, ingresos: 18000, costoTotal: 12000, ranking: "3" },
        { nombre: "Cerveza Victoria (Unidad)", categoria: "Cervezas", vendidos: 280, ingresos: 8400, costoTotal: 5600, ranking: "4" },
        { nombre: "Whisky Chivas Regal 12 Años", categoria: "Licores", vendidos: 25, ingresos: 37500, costoTotal: 27500, ranking: "5" }
    ],

    // Inventario detallado actual
    inventario: [
        { id: "INV-001", nombre: "Flor de Caña 7 Años", categoria: "Licores", costo: 180, precio: 250, stock: 45, status: "En Stock" },
        { id: "INV-002", nombre: "Cerveza Toña (Unidad)", categoria: "Cervezas", costo: 25, precio: 35, stock: 150, status: "En Stock" },
        { id: "INV-003", nombre: "Vino Tinto Concha y Toro", categoria: "Vinos", costo: 200, precio: 300, stock: 8, status: "Stock Bajo" },
        { id: "INV-004", nombre: "Cerveza Victoria (Unidad)", categoria: "Cervezas", costo: 20, precio: 30, stock: 50, status: "En Stock" },
        { id: "INV-005", nombre: "Whisky Chivas Regal 12 Años", categoria: "Licores", costo: 1100, precio: 1500, stock: 12, status: "En Stock" },
        { id: "INV-006", nombre: "Marlboro Rojo (Cajilla)", categoria: "Cigarros", costo: 15, precio: 20, stock: 4, status: "Stock Bajo" },
        { id: "INV-007", nombre: "Pepsi Cola 2L", categoria: "Bebidas", costo: 15, precio: 20, stock: 85, status: "En Stock" },
        { id: "INV-008", nombre: "Absolut Vodka 750ml", categoria: "Licores", costo: 450, precio: 650, stock: 3, status: "Stock Bajo" }
    ]
};

// Variable global para mantener el reporte filtrado en memoria
let currentReportData = [];
let currentReportType = 'ventas';

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Escuchar cambios en navegación para disparar el reporte
    document.querySelector('.nav_button[data-section="reportes"]')?.addEventListener('click', () => {
        setTimeout(renderReports, 100);
    });

    // Vincular controles de la sección de reportes
    document.getElementById("btn_generar_reporte")?.addEventListener("click", renderReports);
    document.getElementById("rep_tipo")?.addEventListener("change", renderReports);
    document.getElementById("rep_rango_tiempo")?.addEventListener("change", renderReports);
    document.getElementById("rep_sucursal")?.addEventListener("change", renderReports);
    document.getElementById("rep_cliente")?.addEventListener("change", renderReports);
    document.getElementById("buscar_reporte")?.addEventListener("input", filterReportTable);

    // Vincular acciones de exportación
    document.getElementById("btn_exportar_pdf")?.addEventListener("click", () => {
        window.print();
    });
    document.getElementById("btn_exportar_excel")?.addEventListener("click", exportCSV);

    // Carga inicial
    renderReports();
});

// ==========================================
// RENDERING PRINCIPAL
// ==========================================
function renderReports() {
    const rangoTiempo = document.getElementById("rep_rango_tiempo")?.value || 'mes';
    const tipoReporte = document.getElementById("rep_tipo")?.value || 'ventas';
    const sucursal = document.getElementById("rep_sucursal")?.value || 'todas';
    const cliente = document.getElementById("rep_cliente")?.value || 'todos';
    currentReportType = tipoReporte;

    // 1. Filtrar las ventas según el periodo, sucursal y cliente seleccionados
    const ventasFiltradas = filtrarVentas(REPORT_DATABASE.ventas, rangoTiempo, sucursal, cliente);

    // 2. Calcular KPIs
    calcularKPIs(ventasFiltradas, REPORT_DATABASE.inventario);

    // 3. Renderizar gráficos/visualizaciones
    renderGraficoCategorias(ventasFiltradas);
    renderGraficoMetodosPago(ventasFiltradas);
    renderGraficoTopProductos();

    // 4. Cargar tabla de detalle según el tipo
    cargarTablaDetalle(tipoReporte, ventasFiltradas, REPORT_DATABASE.inventario, REPORT_DATABASE.productosEstrella);
}

// ==========================================
// FUNCIONES AUXILIARES DE CÁLCULO
// ==========================================
function filtrarVentas(ventas, periodo, sucursal, cliente) {
    const hoyStr = "2026-05-31"; // Fecha simulada actual del sistema
    const hoy = new Date(hoyStr);

    return ventas.filter(venta => {
        // Filtro por Periodo de Tiempo
        const fechaVenta = new Date(venta.fecha);
        const diffTiempo = Math.abs(hoy - fechaVenta);
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

        let pasaPeriodo = true;
        if (periodo === 'hoy') {
            pasaPeriodo = (venta.fecha === hoyStr);
        } else if (periodo === 'semana') {
            pasaPeriodo = (diffDias <= 7);
        } else if (periodo === 'mes') {
            pasaPeriodo = (diffDias <= 30);
        }

        // Filtro por Sucursal
        let pasaSucursal = true;
        if (sucursal !== 'todas') {
            pasaSucursal = (venta.sucursal === sucursal);
        }

        // Filtro por Cliente
        let pasaCliente = true;
        if (cliente !== 'todos') {
            pasaCliente = (venta.cliente === cliente);
        }

        return pasaPeriodo && pasaSucursal && pasaCliente;
    });
}

function calcularKPIs(ventas, inventario) {
    // Ventas e ingresos
    let totalIngresos = 0;
    let totalCosto = 0;
    let efectivo = 0;
    let digital = 0; // Tarjeta + Transferencia
    let transacciones = ventas.length;

    ventas.forEach(v => {
        totalIngresos += v.total;
        totalCosto += v.costo;
        if (v.metodoPago === 'Efectivo') {
            efectivo += v.total;
        } else {
            digital += v.total;
        }
    });

    let totalGanancia = totalIngresos - totalCosto;
    let margenPromedio = totalIngresos > 0 ? ((totalGanancia / totalIngresos) * 100).toFixed(1) : 0;
    let ticketPromedio = transacciones > 0 ? (totalIngresos / transacciones).toFixed(2) : "0.00";

    // Alertas de stock bajo en inventario actual
    let bajoStock = inventario.filter(i => i.status === 'Stock Bajo' || i.stock < 10).length;

    // Actualizar elementos en el DOM
    const kpiIngresos = document.getElementById("kpi_ingresos");
    const kpiIngresosSub = document.getElementById("kpi_ingresos_sub");
    const kpiGanancias = document.getElementById("kpi_ganancias");
    const kpiGananciasSub = document.getElementById("kpi_ganancias_sub");
    const kpiTransacciones = document.getElementById("kpi_transacciones");
    const kpiTransaccionesSub = document.getElementById("kpi_transacciones_sub");
    const kpiAlertas = document.getElementById("kpi_alertas");
    const kpiAlertasSub = document.getElementById("kpi_alertas_sub");

    if (kpiIngresos) kpiIngresos.textContent = `C$ ${totalIngresos.toLocaleString()}`;
    if (kpiIngresosSub) kpiIngresosSub.textContent = `C$ ${efectivo.toLocaleString()} efectivo / C$ ${digital.toLocaleString()} digital`;

    if (kpiGanancias) kpiGanancias.textContent = `C$ ${totalGanancia.toLocaleString()}`;
    if (kpiGananciasSub) kpiGananciasSub.textContent = `Margen estimado: ${margenPromedio}%`;

    if (kpiTransacciones) kpiTransacciones.textContent = transacciones.toString();
    if (kpiTransaccionesSub) kpiTransaccionesSub.textContent = `Ticket prom: C$ ${parseFloat(ticketPromedio).toLocaleString()}`;

    if (kpiAlertas) kpiAlertas.textContent = bajoStock.toString();
    if (kpiAlertasSub) kpiAlertasSub.textContent = `${bajoStock} productos requieren reabastecimiento`;
}

// ==========================================
// RENDERIZADO DE GRÁFICOS PERSONALIZADOS
// ==========================================
function renderGraficoCategorias(ventasFiltradas) {
    const container = document.getElementById("grafico_categorias");
    if (!container) return;

    // Agregación simulada proporcional al filtro
    let totalIngresos = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
    if (totalIngresos === 0) totalIngresos = 1; // evitar division por cero

    // Distribución por categorías (proporciones típicas en licorería)
    const dist = [
        { nombre: "Licores Fuertes (Ron, Vodka, Whisky)", porcentaje: 45, color: "linear-gradient(90deg, #3b82f6, #60a5fa)" },
        { nombre: "Cervezas Nacionales e Importadas", porcentaje: 30, color: "linear-gradient(90deg, #f59e0b, #fbbf24)" },
        { nombre: "Vinos Tintos y Blancos", porcentaje: 15, color: "linear-gradient(90deg, #ec4899, #f472b6)" },
        { nombre: "Cigarros y Tabacos", porcentaje: 6, color: "linear-gradient(90deg, #10b981, #34d399)" },
        { nombre: "Refrescos, Agua y Snacks", porcentaje: 4, color: "linear-gradient(90deg, #6b7280, #9ca3af)" }
    ];

    container.innerHTML = dist.map(c => {
        const montoSimulado = (totalIngresos * (c.porcentaje / 100)).toFixed(0);
        return `
            <div class="bar_categoria_row">
                <div class="bar_categoria_info">
                    <span>${c.nombre}</span>
                    <span class="bar_categoria_value">C$ ${parseInt(montoSimulado).toLocaleString()} (${c.porcentaje}%)</span>
                </div>
                <div class="bar_progress_bg">
                    <div class="bar_progress_fill" style="width: ${c.porcentaje}%; background: ${c.color}"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderGraficoMetodosPago(ventasFiltradas) {
    const container = document.getElementById("grafico_pagos");
    if (!container) return;

    let efectivo = 0;
    let tarjeta = 0;
    let transferencia = 0;

    ventasFiltradas.forEach(v => {
        if (v.metodoPago === 'Efectivo') efectivo += v.total;
        else if (v.metodoPago === 'Tarjeta') tarjeta += v.total;
        else if (v.metodoPago === 'Transferencia') transferencia += v.total;
    });

    const total = efectivo + tarjeta + transferencia;
    const pctEfectivo = total > 0 ? ((efectivo / total) * 100).toFixed(0) : 0;
    const pctTarjeta = total > 0 ? ((tarjeta / total) * 100).toFixed(0) : 0;
    const pctTransferencia = total > 0 ? ((transferencia / total) * 100).toFixed(0) : 0;

    container.innerHTML = `
        <div class="payment_methods_container">
            <div class="payment_bar_stacked">
                <div class="payment_bar_segment efectivo" style="width: ${pctEfectivo}%" title="Efectivo: ${pctEfectivo}%"></div>
                <div class="payment_bar_segment tarjeta" style="width: ${pctTarjeta}%" title="Tarjeta: ${pctTarjeta}%"></div>
                <div class="payment_bar_segment transferencia" style="width: ${pctTransferencia}%" title="Transferencia: ${pctTransferencia}%"></div>
            </div>
            
            <div class="payment_legend">
                <div class="payment_legend_item">
                    <div><span class="payment_dot efectivo"></span> Efectivo</div>
                    <strong>${pctEfectivo}%</strong>
                    <span>C$ ${efectivo.toLocaleString()}</span>
                </div>
                <div class="payment_legend_item">
                    <div><span class="payment_dot tarjeta"></span> Tarjeta</div>
                    <strong>${pctTarjeta}%</strong>
                    <span>C$ ${tarjeta.toLocaleString()}</span>
                </div>
                <div class="payment_legend_item">
                    <div><span class="payment_dot transferencia"></span> Transfer</div>
                    <strong>${pctTransferencia}%</strong>
                    <span>C$ ${transferencia.toLocaleString()}</span>
                </div>
            </div>
        </div>
    `;
}

function renderGraficoTopProductos() {
    const container = document.getElementById("grafico_top_productos");
    if (!container) return;

    const productos = REPORT_DATABASE.productosEstrella;
    
    // El máximo vendido para normalizar barra
    const maxVendidos = Math.max(...productos.map(p => p.vendidos));

    container.innerHTML = productos.map(p => {
        const pctBar = ((p.vendidos / maxVendidos) * 100).toFixed(0);
        return `
            <div class="top_prod_card">
                <span class="top_prod_badge">Top #${p.ranking}</span>
                <span class="top_prod_name">${p.nombre}</span>
                <div class="top_prod_sales">
                    <span>Uds vendidas: <strong>${p.vendidos}</strong></span>
                    <span>C$ ${p.ingresos.toLocaleString()}</span>
                </div>
                <div class="top_prod_bar_bg">
                    <div class="top_prod_bar_fill" style="width: ${pctBar}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ==========================================
// TABLA DE DATOS
// ==========================================
function cargarTablaDetalle(tipo, ventas, inventario, productosEstrella) {
    const tableHead = document.getElementById("tabla_reporte_head");
    const tableBody = document.getElementById("tabla_reporte_body");
    const tableTitle = document.getElementById("titulo_tabla_reporte");

    if (!tableHead || !tableBody || !tableTitle) return;

    tableBody.innerHTML = "";
    tableHead.innerHTML = "";

    if (tipo === 'ventas') {
        tableTitle.textContent = "Detalle de Transacciones (Ventas)";
        tableHead.innerHTML = `
            <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Vendedor</th>
                <th>Sucursal</th>
                <th>Método de Pago</th>
                <th>Total Facturado</th>
                <th>Ganancia Bruta</th>
            </tr>
        `;

        currentReportData = ventas.map(v => {
            const ganancia = v.total - v.costo;
            return {
                Venta: v.id,
                Fecha: v.fecha,
                Cliente: v.cliente,
                Vendedor: v.vendedor,
                Sucursal: v.sucursal || "Central",
                "Método de Pago": v.metodoPago,
                Total: `C$ ${v.total.toFixed(0)}`,
                Ganancia: `C$ ${ganancia.toFixed(0)}`,
                _rawTotal: v.total,
                _rawGanancia: ganancia
            };
        });

        tableBody.innerHTML = currentReportData.map(r => `
            <tr>
                <td><strong>${r.Venta}</strong></td>
                <td>${r.Fecha}</td>
                <td>${r.Cliente}</td>
                <td>${r.Vendedor}</td>
                <td><span style="font-weight: 500; color: #475569">${r.Sucursal}</span></td>
                <td><span style="font-weight: 600; color: #1e293b">${r["Método de Pago"]}</span></td>
                <td style="color: green; font-weight: bold;">${r.Total}</td>
                <td style="color: #2563eb; font-weight: bold;">${r.Ganancia}</td>
            </tr>
        `).join('');

    } else if (tipo === 'inventario') {
        tableTitle.textContent = "Valorización y Estado de Inventario";
        tableHead.innerHTML = `
            <tr>
                <th>Código ID</th>
                <th>Descripción Producto</th>
                <th>Categoría</th>
                <th>Costo Unitario</th>
                <th>Precio Venta</th>
                <th>Stock Físico</th>
                <th>Valor Neto</th>
                <th>Estado</th>
            </tr>
        `;

        currentReportData = inventario.map(i => {
            const valorNeto = i.costo * i.stock;
            return {
                ID: i.id,
                Producto: i.nombre,
                Categoría: i.categoria,
                Costo: `C$ ${i.costo.toFixed(0)}`,
                Precio: `C$ ${i.precio.toFixed(0)}`,
                Stock: i.stock,
                Valor: `C$ ${valorNeto.toFixed(0)}`,
                Estado: i.status,
                _rawStock: i.stock,
                _rawValor: valorNeto
            };
        });

        tableBody.innerHTML = currentReportData.map(r => {
            const stateClass = r.Estado === 'Stock Bajo' ? 'estado inactivo' : 'estado activo';
            return `
                <tr>
                    <td><strong>${r.ID}</strong></td>
                    <td>${r.Producto}</td>
                    <td>${r.Categoría}</td>
                    <td>${r.Costo}</td>
                    <td>${r.Precio}</td>
                    <td style="font-weight: bold; color: ${r.Stock < 10 ? 'red' : '#334155'}">${r.Stock}</td>
                    <td style="color: green; font-weight: bold;">${r.Valor}</td>
                    <td><span class="${stateClass}">${r.Estado}</span></td>
                </tr>
            `;
        }).join('');

    } else if (tipo === 'productos') {
        tableTitle.textContent = "Ranking de Productos Más Vendidos";
        tableHead.innerHTML = `
            <tr>
                <th>Ranking</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Unidades Vendidas</th>
                <th>Costo Total</th>
                <th>Monto Recaudado</th>
                <th>Utilidad (Ganancia)</th>
            </tr>
        `;

        currentReportData = productosEstrella.map(p => {
            const utilidad = p.ingresos - p.costoTotal;
            return {
                Ranking: `#${p.ranking}`,
                Producto: p.nombre,
                Categoría: p.categoria,
                Vendidos: p.vendidos,
                Costo: `C$ ${p.costoTotal.toLocaleString()}`,
                Ingresos: `C$ ${p.ingresos.toLocaleString()}`,
                Utilidad: `C$ ${utilidad.toLocaleString()}`,
                _rawVendidos: p.vendidos,
                _rawIngresos: p.ingresos,
                _rawUtilidad: utilidad
            };
        });

        tableBody.innerHTML = currentReportData.map(r => `
            <tr>
                <td><strong>${r.Ranking}</strong></td>
                <td>${r.Producto}</td>
                <td>${r.Categoría}</td>
                <td style="font-weight: bold;">${r.Vendidos}</td>
                <td>${r.Costo}</td>
                <td style="color: green; font-weight: bold;">${r.Ingresos}</td>
                <td style="color: #2563eb; font-weight: bold;">${r.Utilidad}</td>
            </tr>
        `).join('');
    }
}

// ==========================================
// FILTRADO LOCAL DE LA TABLA
// ==========================================
function filterReportTable(event) {
    const query = event.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#tabla_reporte_body tr");

    rows.forEach(row => {
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
// EXPORTACIÓN A CSV (EXCEL)
// ==========================================
function exportCSV() {
    if (currentReportData.length === 0) {
        alert("No hay datos disponibles para exportar.");
        return;
    }

    // Encabezados
    const headers = Object.keys(currentReportData[0]).filter(k => !k.startsWith('_'));
    let csvContent = "\uFEFF"; // Byte Order Mark para compatibilidad con caracteres especiales de Excel

    // Cabecera CSV
    csvContent += headers.join(",") + "\n";

    // Filas CSV
    currentReportData.forEach(row => {
        const rowData = headers.map(header => {
            let val = row[header];
            // Sanitizar comas o comillas en cadenas de texto
            if (typeof val === 'string') {
                val = val.replace(/"/g, '""');
                if (val.includes(',') || val.includes('\n')) {
                    val = `"${val}"`;
                }
            }
            return val;
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Crear el link de descarga
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    // Formatear nombre del archivo
    const fechaActual = new Date().toISOString().slice(0,10);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_${currentReportType}_${fechaActual}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
