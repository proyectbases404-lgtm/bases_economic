// ==========================================
// OPERACIONES Y CONTROL DE SUCURSAL
// Sistema de Roles Jerárquicos:
//   gerente  → acceso total, cualquier sucursal, cualquier usuario
//   admin    → su propia sucursal, solo vendedores de su sucursal
//   vendedor → solo sí mismo, su propia sucursal
// ==========================================

let operacionesLogs = [];
let activeOperator = "Carmelo";
let activeSucursal = "Central";
let activeRole = "gerente";
let sessionStartTime = null;

// ==========================================
// UTILIDAD: Obtener el usuario logueado
// ==========================================
function obtenerUsuarioLogueado() {
    const data = sessionStorage.getItem("loggedInUser");
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    // Fallback: si no hay sesión guardada, se asume Carmelo (gerente)
    return { name: "Carmelo", username: "carmelo", role: "gerente", sucursal: "Central" };
}

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar fecha de sesión por defecto si no existe
    if (!sessionStartTime) {
        const now = new Date();
        sessionStartTime = formatDateTime(now);
        document.getElementById("card_operar_inicio").textContent = sessionStartTime;
    }

    // Cargar selector de usuarios al inicio
    cargarUsuariosSelect();

    // Cargar historial de logs desde localStorage
    cargarLogsDesdeStorage();

    // Actualizar KPIs del turno inicial
    actualizarTurnoKPIs();

    // Sincronizar con navegación
    document.querySelector('.nav_button[data-section="operar"]')?.addEventListener('click', () => {
        cargarUsuariosSelect();
        actualizarTurnoKPIs();
    });

    // Vincular botón Aplicar
    document.getElementById("btn_aplicar_operar")?.addEventListener("click", aplicarConfiguracion);

    // Vincular buscador de logs
    document.getElementById("buscar_log_operar")?.addEventListener("input", filtrarTablaLogs);

    // Vincular cambio de usuario para habilitar/deshabilitar sucursal
    document.getElementById("ope_usuario")?.addEventListener("change", manejarCambioUsuario);

    // Actualizar visibilidad inicial de la pestaña de anulaciones
    if (typeof window.actualizarVisibilidadAnulaciones === "function") {
        window.actualizarVisibilidadAnulaciones();
    }

    // Actualizar visibilidad de secciones restringidas por rol
    actualizarVisibilidadPorRol();
});

// ==========================================
// CONTROL DE VISIBILIDAD POR ROL
// ==========================================
function actualizarVisibilidadPorRol() {
    const loggedUser = obtenerUsuarioLogueado();
    const role = loggedUser ? loggedUser.role : activeRole;

    // El botón de operar solo lo ven gerente y admin
    const navOperar = document.querySelector('.nav_button[data-section="operar"]');
    if (navOperar) {
        if (role === "gerente" || role === "admin") {
            navOperar.style.display = "flex";
        } else {
            navOperar.style.display = "none";
            // Si un vendedor está viendo operar, redirigir al inicio
            const activeSection = document.querySelector(".content-section.active");
            if (activeSection && activeSection.id === "operar") {
                const btnInicio = document.querySelector('.nav_button[data-section="inicio"]');
                if (btnInicio) btnInicio.click();
            }
        }
    }
}

window.actualizarVisibilidadPorRol = actualizarVisibilidadPorRol;

// ==========================================
// CAMBIO DE USUARIO - RESTRICCIÓN DE SUCURSAL
// ==========================================
function manejarCambioUsuario() {
    const userSelect = document.getElementById("ope_usuario");
    const sucursalSelect = document.getElementById("ope_sucursal");
    if (!userSelect || !sucursalSelect) return;

    const selectedOption = userSelect.selectedOptions[0];
    if (!selectedOption) return;

    const role = selectedOption.dataset.rol || "vendedor";
    const sucursal = selectedOption.dataset.sucursal || "Central";

    if (role === "gerente") {
        // Gerente puede elegir cualquier sucursal
        sucursalSelect.disabled = false;
    } else {
        // Admin y Vendedor: sucursal fija a la del usuario seleccionado
        sucursalSelect.value = sucursal;
        sucursalSelect.disabled = true;
    }
}

// ==========================================
// CARGAR USUARIOS DINÁMICAMENTE (CON PERMISOS)
// ==========================================
function cargarUsuariosSelect() {
    const userSelect = document.getElementById("ope_usuario");
    if (!userSelect) return;

    // Guardar selección actual para restablecerla
    const selectedVal = userSelect.value || activeOperator;

    // Limpiar select
    userSelect.innerHTML = "";

    // Obtener el usuario logueado actualmente para aplicar filtros de permisos
    const loggedUser = obtenerUsuarioLogueado();
    const loggedRole = loggedUser ? loggedUser.role : "gerente";
    const loggedSucursal = loggedUser ? loggedUser.sucursal : "Central";

    // ============================================================
    // CASO 1: VENDEDOR → Solo se ve a sí mismo, no puede cambiar
    // ============================================================
    if (loggedRole === "vendedor") {
        const opt = document.createElement("option");
        opt.value = loggedUser.name;
        opt.textContent = `${loggedUser.name} (Vendedor)`;
        opt.dataset.rol = "vendedor";
        opt.dataset.sucursal = loggedSucursal;
        userSelect.appendChild(opt);
        userSelect.disabled = true;

        // También deshabilitar sucursal
        const sucursalSelect = document.getElementById("ope_sucursal");
        if (sucursalSelect) {
            sucursalSelect.value = loggedSucursal;
            sucursalSelect.disabled = true;
        }

        // Deshabilitar botón aplicar (no tiene nada que cambiar)
        const btnAplicar = document.getElementById("btn_aplicar_operar");
        if (btnAplicar) {
            btnAplicar.disabled = true;
            btnAplicar.style.opacity = "0.5";
            btnAplicar.style.cursor = "not-allowed";
        }

        manejarCambioUsuario();
        return;
    }

    // Habilitar select de usuario si estaba deshabilitado
    userSelect.disabled = false;
    const btnAplicar = document.getElementById("btn_aplicar_operar");
    if (btnAplicar) {
        btnAplicar.disabled = false;
        btnAplicar.style.opacity = "1";
        btnAplicar.style.cursor = "pointer";
    }

    // ============================================================
    // CASO 2: GERENTE → Ve TODOS los usuarios de todas las sucursales
    // ============================================================
    if (loggedRole === "gerente") {
        // Siempre agregar a Carmelo (gerente) primero
        const optCarmelo = document.createElement("option");
        optCarmelo.value = "Carmelo";
        optCarmelo.textContent = "Carmelo (Gerente)";
        optCarmelo.dataset.rol = "gerente";
        optCarmelo.dataset.sucursal = "Todas";
        userSelect.appendChild(optCarmelo);

        // Buscar usuarios en la tabla de Gestión de Usuarios del DOM
        const userRows = document.querySelectorAll("#tabla_usuarios_body tr");
        const addedUsers = new Set(["carmelo"]);

        userRows.forEach(row => {
            const cells = row.cells;
            if (cells && cells.length >= 5) {
                const name = cells[0].textContent.trim();
                const roleText = cells[3].textContent.trim();
                const sucursal = cells[4].textContent.trim();
                const lowerName = name.toLowerCase();

                if (name && !addedUsers.has(lowerName)) {
                    addedUsers.add(lowerName);
                    const opt = document.createElement("option");
                    opt.value = name;
                    opt.dataset.sucursal = sucursal || "Central";

                    // Mapear rol del texto de la tabla
                    const mappedRole = mapearRolDesdeTexto(roleText);
                    opt.dataset.rol = mappedRole;

                    const rolLabel = mappedRole === "gerente" ? "Gerente"
                                   : mappedRole === "admin" ? "Administrador"
                                   : "Vendedor";
                    opt.textContent = `${name} (${rolLabel} - ${sucursal})`;
                    userSelect.appendChild(opt);
                }
            }
        });

        // Habilitar sucursal
        const sucursalSelect = document.getElementById("ope_sucursal");
        if (sucursalSelect) sucursalSelect.disabled = false;
    }

    // ============================================================
    // CASO 3: ADMIN → Se ve a sí mismo + vendedores de SU sucursal
    // ============================================================
    if (loggedRole === "admin") {
        // Agregar el admin logueado primero
        const optSelf = document.createElement("option");
        optSelf.value = loggedUser.name;
        optSelf.textContent = `${loggedUser.name} (Administrador - ${loggedSucursal})`;
        optSelf.dataset.rol = "admin";
        optSelf.dataset.sucursal = loggedSucursal;
        userSelect.appendChild(optSelf);

        // Buscar vendedores en la tabla de Gestión de Usuarios del DOM
        // SOLO los de la misma sucursal que el admin logueado
        const userRows = document.querySelectorAll("#tabla_usuarios_body tr");
        const addedUsers = new Set([loggedUser.name.toLowerCase()]);

        userRows.forEach(row => {
            const cells = row.cells;
            if (cells && cells.length >= 5) {
                const name = cells[0].textContent.trim();
                const roleText = cells[3].textContent.trim();
                const sucursal = cells[4].textContent.trim();
                const lowerName = name.toLowerCase();
                const mappedRole = mapearRolDesdeTexto(roleText);

                // Solo agregar VENDEDORES de la MISMA SUCURSAL
                if (name && !addedUsers.has(lowerName)
                    && mappedRole === "vendedor"
                    && sucursal.toLowerCase() === loggedSucursal.toLowerCase()) {
                    addedUsers.add(lowerName);
                    const opt = document.createElement("option");
                    opt.value = name;
                    opt.textContent = `${name} (Vendedor - ${sucursal})`;
                    opt.dataset.rol = "vendedor";
                    opt.dataset.sucursal = sucursal;
                    userSelect.appendChild(opt);
                }
            }
        });

        // Fijar sucursal a la del admin
        const sucursalSelect = document.getElementById("ope_sucursal");
        if (sucursalSelect) {
            sucursalSelect.value = loggedSucursal;
            sucursalSelect.disabled = true;
        }
    }

    // Restablecer selección
    userSelect.value = selectedVal;

    // Si la selección guardada no existe en el nuevo listado, seleccionar el primero
    if (!userSelect.value && userSelect.options.length > 0) {
        userSelect.selectedIndex = 0;
    }
    
    // Aplicar estado habilitado/deshabilitado de sucursal según selección inicial
    manejarCambioUsuario();
}

// ==========================================
// MAPEO DE ROLES DESDE TEXTO DE LA TABLA
// ==========================================
function mapearRolDesdeTexto(roleText) {
    const lower = roleText.toLowerCase();
    if (lower.includes("gerente")) return "gerente";
    if (lower.includes("admin")) return "admin";
    return "vendedor";
}

// ==========================================
// APLICAR CONFIGURACIÓN DE OPERADOR/SUCURSAL
// ==========================================
function aplicarConfiguracion() {
    const userSelect = document.getElementById("ope_usuario");
    const sucursalSelect = document.getElementById("ope_sucursal");

    if (!userSelect || !sucursalSelect) return;

    const selectedUser = userSelect.value;
    const selectedSucursal = sucursalSelect.value;
    const selectedOption = userSelect.selectedOptions[0];
    const selectedRole = selectedOption?.dataset.rol || "vendedor";

    // ==========================================
    // VALIDACIONES DE SEGURIDAD
    // ==========================================
    const loggedUser = obtenerUsuarioLogueado();
    const loggedRole = loggedUser ? loggedUser.role : "gerente";
    const loggedSucursal = loggedUser ? loggedUser.sucursal : "Central";

    // Admin: no puede cambiar a otra sucursal
    if (loggedRole === "admin" && selectedSucursal.toLowerCase() !== loggedSucursal.toLowerCase()) {
        mostrarMensajeOperar("No tienes permisos para operar en otra sucursal. Solo puedes operar en " + loggedSucursal + ".", "warning");
        sucursalSelect.value = loggedSucursal;
        return;
    }

    // Vendedor: no puede cambiar nada
    if (loggedRole === "vendedor") {
        mostrarMensajeOperar("No tienes permisos para cambiar la configuración de operación.", "warning");
        return;
    }

    // Validar cambio
    const isNewUser = (selectedUser !== activeOperator);
    const isNewSucursal = (selectedSucursal !== activeSucursal);

    if (!isNewUser && !isNewSucursal) {
        mostrarMensajeOperar("La sesión ya se encuentra activa con estos parámetros.", "warning");
        return;
    }

    // Actualizar estados
    activeOperator = selectedUser;
    activeSucursal = selectedSucursal;
    activeRole = selectedRole;
    
    // Si cambia el usuario, reiniciamos la fecha de inicio del turno
    if (isNewUser) {
        const now = new Date();
        sessionStartTime = formatDateTime(now);
    }

    // 1. Actualizar el Encabezado Superior (Global Header)
    const headerLabel = document.querySelector(".header .box_comp label");
    const headerRol = document.querySelector(".header .Cont_usuario .rol");

    if (headerLabel) {
        headerLabel.textContent = activeOperator;
    }
    if (headerRol) {
        headerRol.textContent = activeRole;
        aplicarEstiloRolHeader(headerRol, activeRole);
    }

    if (typeof window.actualizarVisibilidadAnulaciones === "function") {
        window.actualizarVisibilidadAnulaciones();
    }

    // 2. Actualizar la tarjeta de Sesión Activa
    document.getElementById("card_operar_usuario").textContent = activeOperator;
    
    // Mostrar etiqueta de rol legible
    const rolLabel = activeRole === "gerente" ? "Gerente"
                   : activeRole === "admin" ? "Administrador"
                   : "Vendedor";
    document.getElementById("card_operar_rol").textContent = rolLabel;
    document.getElementById("card_operar_sucursal").textContent = activeSucursal;
    document.getElementById("card_operar_inicio").textContent = sessionStartTime;

    // 3. Recalcular KPIs basados en las ventas del nuevo operador en la nueva sucursal
    actualizarTurnoKPIs();

    // 4. Registrar Acción en la Auditoría
    let descLog = "";
    if (isNewUser && isNewSucursal) {
        descLog = `Cambio de operador a ${activeOperator} y cambio de sucursal a ${activeSucursal}`;
    } else if (isNewUser) {
        descLog = `Cambio de operador activo a ${activeOperator}`;
    } else {
        descLog = `Cambio de sucursal de trabajo a ${activeSucursal}`;
    }
    
    registrarLogOperar(activeOperator, activeSucursal, descLog);

    // 5. Mostrar Toast de Éxito
    mostrarMensajeOperar(`¡Configuración aplicada! Operando en ${activeSucursal} como ${activeOperator} (${rolLabel}).`, "success");
}

// ==========================================
// ESTILOS DE ROL PARA EL HEADER
// ==========================================
function aplicarEstiloRolHeader(headerRolElement, role) {
    if (!headerRolElement) return;
    
    if (role === "gerente") {
        headerRolElement.style.background = "linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.12))";
        headerRolElement.style.color = "#d97706";
        headerRolElement.style.border = "1px solid rgba(245, 158, 11, 0.3)";
    } else if (role === "admin") {
        headerRolElement.style.background = "rgba(56, 189, 248, 0.15)";
        headerRolElement.style.color = "var(--color-acento)";
        headerRolElement.style.border = "none";
    } else {
        headerRolElement.style.background = "rgba(79, 70, 229, 0.15)";
        headerRolElement.style.color = "#818cf8";
        headerRolElement.style.border = "none";
    }
}

window.aplicarEstiloRolHeader = aplicarEstiloRolHeader;

// ==========================================
// CÁLCULO DE KPIS DEL TURNO EN TIEMPO REAL
// ==========================================
function actualizarTurnoKPIs() {
    let ventasMonto = 0;
    let transaccionesCant = 0;

    // Intentar leer la base de datos simulada del sistema
    const dbVentas = (typeof REPORT_DATABASE !== 'undefined' && REPORT_DATABASE.ventas) 
                     ? REPORT_DATABASE.ventas 
                     : [];

    if (dbVentas.length > 0) {
        // Filtrar ventas realizadas por el operador activo en la sucursal activa
        // Nota: En la base de datos de reportes:
        // - El operador está bajo la propiedad 'vendedor'
        // - La sucursal está bajo la propiedad 'sucursal' (e.g. Central, Plaza, Norte)
        dbVentas.forEach(v => {
            const matchVendedor = v.vendedor?.toLowerCase() === activeOperator.toLowerCase();
            const matchSucursal = v.sucursal?.toLowerCase() === activeSucursal.toLowerCase();

            if (matchVendedor && matchSucursal) {
                ventasMonto += v.total;
                transaccionesCant++;
            }
        });
    }

    // Actualizar elementos en el DOM
    const kpiMonto = document.getElementById("kpi_op_ventas_monto");
    const kpiCant = document.getElementById("kpi_op_ventas_cant");
    
    if (kpiMonto) {
        kpiMonto.textContent = `C$ ${ventasMonto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (kpiCant) {
        kpiCant.textContent = `${transaccionesCant} transacciones registradas`;
    }

    // Caja Inicial Dinámica según la sucursal
    const kpiCaja = document.getElementById("kpi_op_caja_inicial");
    if (kpiCaja) {
        let cajaInicial = 1000;
        if (activeSucursal === "Plaza") cajaInicial = 1200;
        if (activeSucursal === "Norte") cajaInicial = 800;
        kpiCaja.textContent = `C$ ${cajaInicial.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }
}

// ==========================================
// REGISTRO Y PERSISTENCIA DE AUDITORÍA
// ==========================================
function registrarLogOperar(usuario, sucursal, accion) {
    const now = new Date();
    const logItem = {
        fechaHora: formatDateTime(now),
        usuario: usuario,
        sucursal: sucursal,
        accion: accion
    };

    operacionesLogs.unshift(logItem); // Insertar al inicio para mostrar los más nuevos primero
    guardarLogsEnStorage();
    renderTablaLogs();
}

function renderTablaLogs() {
    const tbody = document.getElementById("tabla_logs_operar_body");
    if (!tbody) return;

    if (operacionesLogs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--color-gris); padding: 20px;">
                    No se han registrado actividades de operación.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = operacionesLogs.map(log => `
        <tr>
            <td><strong>${log.fechaHora}</strong></td>
            <td><span style="font-weight: 600; color: var(--color-principal);">${log.usuario}</span></td>
            <td><span style="font-weight: 500; color: #475569;">${log.sucursal}</span></td>
            <td><span style="color: #3b82f6; font-weight: 500;">${log.accion}</span></td>
        </tr>
    `).join('');
}

function guardarLogsEnStorage() {
    localStorage.setItem("operacionesLogs", JSON.stringify(operacionesLogs));
}

function cargarLogsDesdeStorage() {
    const data = localStorage.getItem("operacionesLogs");
    if (data) {
        try {
            operacionesLogs = JSON.parse(data);
        } catch (e) {
            console.error("Error al cargar logs de operación", e);
            operacionesLogs = [];
        }
    } else {
        // Inicializar con algunos logs históricos simulados para rellenar
        operacionesLogs = [
            {
                fechaHora: "2026-06-04 20:15:32",
                usuario: "Carmelo",
                sucursal: "Central",
                accion: "Apertura de Caja y verificación de inventario inicial"
            },
            {
                fechaHora: "2026-06-04 20:00:00",
                usuario: "Elizabeth",
                sucursal: "Plaza",
                accion: "Inicio de turno de facturación en terminal"
            }
        ];
        guardarLogsEnStorage();
    }
    renderTablaLogs();
}

// ==========================================
// FILTRADO DE LA TABLA DE LOGS
// ==========================================
function filtrarTablaLogs(event) {
    const query = event.target.value.toLowerCase().trim();
    const rows = document.querySelectorAll("#tabla_logs_operar_body tr");

    rows.forEach(row => {
        // Ignorar fila de 'no resultados' si existe
        if (row.cells.length === 1 && row.cells[0].colSpan === 4) return;
        
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
// UTILIDADES ADICIONALES
// ==========================================
function formatDateTime(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

// Sistema de Alerta Flotante Premium
function mostrarMensajeOperar(texto, tipo = "success") {
    // Buscar si ya existe un toast de operar y removerlo
    const existingToast = document.querySelector(".toast_operar");
    if (existingToast) existingToast.remove();

    // Crear elemento toast
    const toast = document.createElement("div");
    toast.className = `toast_operar toast_${tipo}`;
    
    // Estilos inline para no depender enteramente del CSS externo y asegurar máxima fiabilidad
    toast.style.position = "fixed";
    toast.style.top = "20px";
    toast.style.right = "20px";
    toast.style.padding = "14px 24px";
    toast.style.borderRadius = "10px";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
    toast.style.zIndex = "9999";
    toast.style.fontFamily = "inherit";
    toast.style.fontSize = "0.9rem";
    toast.style.fontWeight = "600";
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.gap = "10px";
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";

    // Colores según tipo
    if (tipo === "success") {
        toast.style.background = "#dcfce7";
        toast.style.color = "#15803d";
        toast.style.borderLeft = "5px solid #22c55e";
    } else if (tipo === "warning") {
        toast.style.background = "#fef3c7";
        toast.style.color = "#b45309";
        toast.style.borderLeft = "5px solid #f59e0b";
    } else {
        toast.style.background = "#eff6ff";
        toast.style.color = "#1d4ed8";
        toast.style.borderLeft = "5px solid #3b82f6";
    }

    toast.textContent = texto;
    document.body.appendChild(toast);

    // Animación de entrada
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 50);

    // Salida automática después de 3.5 segundos
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-10px)";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
