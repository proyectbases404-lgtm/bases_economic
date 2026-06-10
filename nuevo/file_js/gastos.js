// ==========================================
// SISTEMA DE GESTIÓN DE GASTOS DE CAJA
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    cargarAdministradoresGastos();
    renderGastos();

    // Actualizar datos al hacer clic en el botón de navegación de gastos
    document.querySelector('.nav_button[data-section="gastos"]')?.addEventListener('click', () => {
        cargarAdministradoresGastos();
        renderGastos();
    });

    // Escuchar el formulario de gastos
    document.getElementById("form_solicitar_gasto")?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const montoInput = document.getElementById("gasto_monto");
        const motivoInput = document.getElementById("gasto_motivo");
        const adminSelect = document.getElementById("gasto_admin");

        if (!montoInput || !motivoInput || !adminSelect) return;

        const monto = parseFloat(montoInput.value);
        const motivo = motivoInput.value.trim();
        const admin = adminSelect.value;
        const solicitante = (typeof activeOperator !== "undefined" && activeOperator) ? activeOperator : "Carmelo";

        if (isNaN(monto) || monto <= 0) {
            alert("Por favor, ingrese un monto de retiro válido.");
            return;
        }

        if (!motivo) {
            alert("Por favor, escriba la razón de pago o justificación.");
            return;
        }

        const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
        const nuevoGastoId = `GAST-${String(Date.now()).slice(-4)}`;

        const nuevaSol = {
            id: nuevoGastoId,
            ventaId: nuevoGastoId, // Usamos el ID del gasto como referencia
            monto: monto,
            tipo: "Gasto",
            fecha: new Date().toISOString().split("T")[0],
            motivo: motivo,
            solicitadoPor: solicitante,
            adminAsignado: admin,
            estado: "Pendiente"
        };

        solicitudes.unshift(nuevaSol);
        localStorage.setItem("solicitudesAnulacion", JSON.stringify(solicitudes));

        // Registro de Auditoría/Operación
        if (typeof registrarLogOperar === "function") {
            const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
            registrarLogOperar(solicitante, sucursal, `Solicitó retiro de caja por gasto de C$ ${monto.toFixed(2)} asignado a ${admin} por: ${motivo}`);
        }

        alert(`Solicitud de salida de efectivo registrada. Requiere la aprobación del administrador asignado (${admin}) en la pestaña de Anulaciones.`);

        // Restablecer campos
        montoInput.value = "";
        motivoInput.value = "";

        // Re-renderizar tablas
        renderGastos();
        if (typeof window.renderSolicitudes === "function") {
            window.renderSolicitudes();
        }
        
        // Recalcular caja
        if (typeof window.recalcularVentasEfectivo === "function") {
            window.recalcularVentasEfectivo();
        }
        if (typeof window.calcularCuadre === "function") {
            window.calcularCuadre();
        }
    });
});

// Carga de administradores del sistema
function cargarAdministradoresGastos() {
    const selectAdmin = document.getElementById("gasto_admin");
    if (!selectAdmin) return;

    selectAdmin.innerHTML = "";

    // Carmelo es el gerente por defecto
    const optCarmelo = document.createElement("option");
    optCarmelo.value = "Carmelo";
    optCarmelo.textContent = "Carmelo (Gerente)";
    selectAdmin.appendChild(optCarmelo);

    // Buscar otros administradores y gerentes en la lista de usuarios
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

// Renderizado de las solicitudes locales de gastos
function renderGastos() {
    const tbody = document.getElementById("tabla_gastos_cuerpo");
    if (!tbody) return;

    const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
    const gastos = solicitudes.filter(s => s.tipo === "Gasto");

    if (gastos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #64748b; padding: 25px; font-weight: 500;">
                    No se han registrado solicitudes de gasto.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = gastos.map(g => {
        let badgeStyle = "background: #fef3c7; color: #d97706; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        if (g.estado === "Aprobada") {
            badgeStyle = "background: #dcfce7; color: #16a34a; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        } else if (g.estado === "Rechazada") {
            badgeStyle = "background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold;";
        }

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; transition: background 0.15s;">
                <td style="padding: 12px; font-weight: bold; color: #1e293b;">${g.id}</td>
                <td style="padding: 12px; color: #475569;">${g.fecha}</td>
                <td style="padding: 12px; font-weight: 700; color: #ef4444;">C$ ${parseFloat(g.monto).toFixed(2)}</td>
                <td style="padding: 12px; color: #475569; font-weight: 500;">${g.solicitadoPor}</td>
                <td style="padding: 12px; color: #475569; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${g.motivo}">${g.motivo}</td>
                <td style="padding: 12px;"><span style="${badgeStyle}">${g.estado}</span></td>
            </tr>
        `;
    }).join("");
}

// Exponer funciones globalmente
window.cargarAdministradoresGastos = cargarAdministradoresGastos;
window.renderGastos = renderGastos;
