// ELEMENTOS
const sidebar = document.getElementById("sidebar");
const btnSidebar = document.getElementById("btnMenuSidebar");
const btnHeader = document.getElementById("btnMenuHeader");
const navButtons = document.querySelectorAll(".nav_button[data-section]");
const sections = document.querySelectorAll(".content-section");

const productosContainer = document.getElementById("productos");
const ventasContainer = document.getElementById("ventas");
const mostAggProdu = document.getElementById("most_agg_produ");
const mostAviso = document.getElementById("most_aviso");

let userRowBeingEdited = null;

// =========================
// FUNCIONES GENERALES
// =========================

const toggleSidebar = () => {
    sidebar.classList.toggle("expanded");
};

const showSection = (sectionId) => {
    sections.forEach(section =>
        section.classList.toggle("active", section.id === sectionId)
    );

    const header = document.querySelector("header.header");
    header?.classList.toggle("hidden", sectionId !== "inicio");

    if (sectionId !== "inicio") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        document.querySelector("main")
            ?.scrollTo({ top: 0, behavior: "smooth" });
    }
};

const setActiveButton = (clickedButton) => {
    navButtons.forEach(btn =>
        btn.classList.toggle("active", btn === clickedButton)
    );
};



// =========================
// MODAL PRODUCTO
// =========================

const openMostAggProdu = () => {
    mostAggProdu.classList.add("open");
    document.body.style.overflow = "hidden";
};

const closeMostAggProdu = () => {
    mostAggProdu.classList.remove("open");
    document.body.style.overflow = "";
    userRowBeingEdited = null;
    const form = document.querySelector(".container_new_user form");
    if (form) form.reset();
};

const mostrarModal = (modalId) => {
    document.getElementById("modal_crear_producto").style.display = "none";
    document.getElementById("modal_modificar_producto").style.display = "none";
    document.getElementById("modal_ver_ventas").style.display = "none";
    document.getElementById("modal_crear_usuario").style.display = "none";
    const modalVerFactura = document.getElementById("modal_ver_factura_compra");
    if (modalVerFactura) modalVerFactura.style.display = "none";
    const modalCrearCat = document.getElementById("modal_crear_categoria");
    if (modalCrearCat) modalCrearCat.style.display = "none";
    const modalEditarCat = document.getElementById("modal_editar_categoria");
    if (modalEditarCat) modalEditarCat.style.display = "none";
    const modalSolicitarAnulacion = document.getElementById("modal_solicitar_anulacion");
    if (modalSolicitarAnulacion) modalSolicitarAnulacion.style.display = "none";
    const modalVerCompras = document.getElementById("modal_ver_compras");
    if (modalVerCompras) modalVerCompras.style.display = "none";
    const modalVerGastos = document.getElementById("modal_ver_gastos");
    if (modalVerGastos) modalVerGastos.style.display = "none";
    const modalSolicitarEliminarProd = document.getElementById("modal_solicitar_eliminar_producto");
    if (modalSolicitarEliminarProd) modalSolicitarEliminarProd.style.display = "none";
    const modalVerProdElim = document.getElementById("modal_ver_producto_eliminar");
    if (modalVerProdElim) modalVerProdElim.style.display = "none";

    const selectedModal = document.getElementById(modalId);
    if (selectedModal) {
        selectedModal.style.display = "block";
    }
    openMostAggProdu();
};

window.mostrarModal = mostrarModal;
window.closeMostAggProdu = closeMostAggProdu;

let callbackConfirmarEliminar = null;

const mostrarConfirmacionEliminar = (titulo, mensaje, callback) => {
    const modal = document.getElementById("modal_confirmar_eliminar");
    const titEl = document.getElementById("confirmar_eliminar_titulo");
    const msgEl = document.getElementById("confirmar_eliminar_mensaje");
    
    if (titEl) titEl.textContent = titulo;
    if (msgEl) msgEl.textContent = mensaje;
    
    callbackConfirmarEliminar = callback;
    
    if (modal) {
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
};

const cerrarConfirmacionEliminar = () => {
    const modal = document.getElementById("modal_confirmar_eliminar");
    if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = "";
    }
    callbackConfirmarEliminar = null;
};

window.mostrarConfirmacionEliminar = mostrarConfirmacionEliminar;
window.cerrarConfirmacionEliminar = cerrarConfirmacionEliminar;

// =========================
// MODAL AVISO
// =========================

const openMostAviso = () => {
    mostAviso.classList.add("open");
    document.body.style.overflow = "hidden";
};

const closeMostAviso = () => {
    mostAviso.classList.remove("open");
    document.body.style.overflow = "";
};

// =========================
// NAVEGACIÓN
// =========================

navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const sectionId = button.dataset.section;

        showSection(sectionId);
        setActiveButton(button);
    });
});

// =========================
// EVENTOS PRODUCTO
// =========================

productosContainer?.addEventListener("click", (event) => {

    const clicked = event.target.closest("#agg_new_prod");
    const modify = event.target.closest("#btn_modi_gestion");

    if (clicked) {
        event.preventDefault();
        mostrarModal("modal_crear_producto");
        return;
    }

    if (modify) {
        event.preventDefault();
        mostrarModal("modal_modificar_producto");
        return;
    }
});

ventasContainer?.addEventListener("click", (event) => {
    const viewVenta = event.target.closest(".btn_observar_v");

    if (viewVenta) {
        event.preventDefault();
        mostrarModal("modal_ver_ventas");
        return;
    }
});

document.addEventListener("click", (event) => {

    const target = event.target;

    const closeButton = target.closest("#regr_new_produ");
    const modifyButton = target.closest("#regr_modify_produ");
    const verVentasClose = target.closest("#vol_v_venta");
    const verComprasClose = target.closest("#vol_v_compra");
    const verComprasHistClose = target.closest("#vol_v_compra_hist");
    const verGastoClose = target.closest("#vol_v_gasto");
    const crearUsuarioClose = target.closest("#regr_crear_usuario");
    const crearCatClose = target.closest("#regr_crear_categoria");
    const editarCatClose = target.closest("#regr_editar_categoria");
    const solicitarEliminarProdClose = target.closest("#regr_solicitar_eliminar_producto");
    const verProdElimClose = target.closest("#vol_v_prod_elim");
    const btnAceptar = target.closest("#btn_aceptar");
    const btnCancelar = target.closest("#btn_cancelar");
    const btnConfirmarEliminarAceptar = target.closest("#btn_confirmar_eliminar_aceptar");
    const btnConfirmarEliminarCancelar = target.closest("#btn_confirmar_eliminar_cancelar");

    // Abrir modal aviso
    if (closeButton || modifyButton || verVentasClose || crearUsuarioClose || verComprasClose || crearCatClose || editarCatClose || verComprasHistClose || verGastoClose || solicitarEliminarProdClose || verProdElimClose) {
        event.preventDefault();
        return openMostAviso();
    }

    // Cerrar modal producto
    if (modifyButton) {
        event.preventDefault();
        return closeMostAggProdu();
    }

    // Cerrar modal aviso
    if (btnCancelar) {
        event.preventDefault();
        return closeMostAviso();
    }

    if (btnAceptar) {
        event.preventDefault();
        closeMostAviso();
        closeMostAggProdu();
        return;
    }

    // Cerrar modal confirmacion eliminar
    if (btnConfirmarEliminarCancelar) {
        event.preventDefault();
        return cerrarConfirmacionEliminar();
    }

    if (btnConfirmarEliminarAceptar) {
        event.preventDefault();
        if (typeof callbackConfirmarEliminar === "function") {
            callbackConfirmarEliminar();
        }
        return cerrarConfirmacionEliminar();
    }
    // Cerrar al hacer click fuera
    if (
        mostAggProdu.classList.contains("open") &&
        target === mostAggProdu
    ) {
        closeMostAggProdu();
    }

    if (
        mostAviso.classList.contains("open") &&
        target === mostAviso
    ) {
        closeMostAviso();
    }

    const modalCE = document.getElementById("modal_confirmar_eliminar");
    if (
        modalCE &&
        modalCE.classList.contains("open") &&
        target === modalCE
    ) {
        cerrarConfirmacionEliminar();
    }

    // Cerrar sidebar fuera
    const insideSidebar = sidebar.contains(target);
    const clickBtn =
        btnSidebar?.contains(target) ||
        btnHeader?.contains(target);

    if (
        !insideSidebar &&
        !clickBtn &&
        sidebar.classList.contains("expanded")
    ) {
        sidebar.classList.remove("expanded");
    }
});

// =========================
// BOTONES SIDEBAR
// =========================

btnSidebar?.addEventListener("click", toggleSidebar);
btnHeader?.addEventListener("click", toggleSidebar);

// =========================
// GESTIÓN DE USUARIOS
// =========================

const btnAbrirCrearUsuario = document.getElementById("btn_abrir_crear_usuario");
const formCrearUsuario = document.querySelector(".container_new_user form");
const tablaUsuariosBody = document.getElementById("tabla_usuarios_body");

// Abrir modal (Creación limpia)
btnAbrirCrearUsuario?.addEventListener("click", (event) => {
    event.preventDefault();
    userRowBeingEdited = null;
    if (formCrearUsuario) formCrearUsuario.reset();
    
    document.querySelector("#modal_crear_usuario h1").textContent = "Crear Usuario";
    document.getElementById("btn_guardar_usuario").textContent = "Guardar Usuario";
    document.getElementById("reg_contrasena").required = true;
    
    mostrarModal("modal_crear_usuario");
});

// Guardar usuario (Crear o Editar)
formCrearUsuario?.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombre = document.getElementById("reg_nombre").value.trim();
    const usuario = document.getElementById("reg_usuario").value.trim();
    const contrasena = document.getElementById("reg_contrasena").value;
    const rol = document.getElementById("reg_rol").value;
    const sucursal = document.getElementById("reg_sucursal_usr").value;

    if (!nombre || !usuario || !contrasena) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const rolClass = rol === "Gerente" ? "rol_gerente" : rol === "Administrador" ? "rol_admin" : "rol_vendedor";

    if (userRowBeingEdited) {
        // Lógica de Edición: Actualizar la fila existente
        userRowBeingEdited.cells[0].textContent = nombre;
        userRowBeingEdited.cells[1].textContent = usuario;
        if (contrasena !== "********" && contrasena !== "") {
            userRowBeingEdited.cells[2].textContent = "********";
        }
        userRowBeingEdited.cells[3].innerHTML = `<span class="${rolClass}">${rol}</span>`;
        userRowBeingEdited.cells[4].textContent = sucursal;
    } else {
        // Lógica de Creación: Añadir una nueva fila
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${nombre}</td>
            <td>${usuario}</td>
            <td>********</td>
            <td>
                <span class="${rolClass}">${rol}</span>
            </td>
            <td>${sucursal}</td>
            <td class="ultima-sesion">Sin sesión</td>
            <td>
                <div class="box_acciones">
                    <button class="btn_editar">Editar</button>
                    <button class="btn_eliminar_cliente">Eliminar</button>
                </div>
            </td>
        `;
        tablaUsuariosBody?.appendChild(tr);
    }

    // Limpiar formulario y cerrar modal
    formCrearUsuario.reset();
    closeMostAggProdu();
});

// Delegación de eventos para Editar y Eliminar de la tabla
tablaUsuariosBody?.addEventListener("click", (event) => {
    const btnEditar = event.target.closest(".btn_editar");
    const btnEliminar = event.target.closest(".btn_eliminar_cliente");

    if (btnEditar) {
        event.preventDefault();
        const tr = btnEditar.closest("tr");
        userRowBeingEdited = tr;

        const nombre = tr.cells[0].textContent.trim();
        const usuario = tr.cells[1].textContent.trim();
        const rol = tr.cells[3].textContent.trim();
        const sucursal = tr.cells[4].textContent.trim();

        document.getElementById("reg_nombre").value = nombre;
        document.getElementById("reg_usuario").value = usuario;
        document.getElementById("reg_contrasena").value = "********"; // placeholder
        document.getElementById("reg_rol").value = rol;
        document.getElementById("reg_sucursal_usr").value = sucursal;

        document.querySelector("#modal_crear_usuario h1").textContent = "Editar Usuario";
        document.getElementById("btn_guardar_usuario").textContent = "Guardar Cambios";
        document.getElementById("reg_contrasena").required = false;

        mostrarModal("modal_crear_usuario");
        return;
    }

    if (btnEliminar) {
        event.preventDefault();
        if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
            const tr = btnEliminar.closest("tr");
            tr?.remove();
        }
    }
});

// =========================
// BUSCADOR DE PROVEEDORES
// =========================
const buscarProveedorInput = document.getElementById("buscar_proveedor");

buscarProveedorInput?.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();
    const tbody = document.querySelector("#proveedores .tabla_agg tbody");
    if (!tbody) return;
    
    const rows = tbody.querySelectorAll("tr:not(.no-results-row)");
    let matches = 0;
    
    rows.forEach(row => {
        const nameCell = row.cells[1]; // Column "Proveedor"
        if (nameCell) {
            const nameText = nameCell.textContent.toLowerCase();
            if (nameText.includes(query)) {
                row.style.display = "";
                matches++;
            } else {
                row.style.display = "none";
            }
        }
    });
    
    // Check if we need to show a "no results" row
    let noResultsRow = tbody.querySelector(".no-results-row");
    if (matches === 0 && query !== "") {
        if (!noResultsRow) {
            noResultsRow = document.createElement("tr");
            noResultsRow.className = "no-results-row";
            noResultsRow.innerHTML = `
                <td colspan="8" style="color: #64748b; padding: 24px; text-align: center; font-weight: 500;">
                    No se encontraron proveedores que coincidan con "${event.target.value}"
                </td>
            `;
            tbody.appendChild(noResultsRow);
        } else {
            noResultsRow.querySelector("td").textContent = `No se encontraron proveedores que coincidan con "${event.target.value}"`;
            noResultsRow.style.display = "";
        }
    } else {
        if (noResultsRow) {
            noResultsRow.style.display = "none";
        }
    }
});

// =========================
// GESTIÓN DE PROVEEDORES
// =========================
let supplierRowBeingEdited = null;

const provNombreInput = document.getElementById("prov_nombre");
const provContactoInput = document.getElementById("prov_contacto");
const provTelefonoInput = document.getElementById("prov_telefono");
const provCorreoInput = document.getElementById("prov_correo");
const provEstadoInput = document.getElementById("prov_estado");

const aggNewProveedorDiv = document.getElementById("agg_new_proveedor");
const btnGuardarProveedor = document.getElementById("btn_guardar_proveedor");
const cancelEditProveedorDiv = document.getElementById("cancel_edit_proveedor");
const tablaProveedoresBody = document.querySelector("#proveedores .tabla_agg tbody");

const resetFormProveedor = () => {
    if (provNombreInput) provNombreInput.value = "";
    if (provContactoInput) provContactoInput.value = "";
    if (provTelefonoInput) provTelefonoInput.value = "";
    if (provCorreoInput) provCorreoInput.value = "";
    if (provEstadoInput) provEstadoInput.value = "Activo";

    supplierRowBeingEdited = null;
    
    if (btnGuardarProveedor) btnGuardarProveedor.textContent = "AGREGAR NUEVO PROVEEDOR";
    if (cancelEditProveedorDiv) cancelEditProveedorDiv.style.display = "none";
};

aggNewProveedorDiv?.addEventListener("click", (event) => {
    event.preventDefault();

    if (!provNombreInput || !provContactoInput || !provTelefonoInput || !provCorreoInput || !provEstadoInput) return;

    const nombre = provNombreInput.value.trim();
    const contacto = provContactoInput.value.trim();
    const telefono = provTelefonoInput.value.trim();
    const correo = provCorreoInput.value.trim();
    const estado = provEstadoInput.value;

    if (!nombre || !contacto || !telefono || !correo) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    const entrega = supplierRowBeingEdited ? supplierRowBeingEdited.cells[5].textContent.trim() : "3 días";
    const estadoClass = estado === "Activo" ? "estado activo" : "estado inactivo";

    if (supplierRowBeingEdited) {
        // Lógica de Edición
        supplierRowBeingEdited.cells[1].textContent = nombre;
        supplierRowBeingEdited.cells[2].textContent = contacto;
        supplierRowBeingEdited.cells[3].textContent = telefono;
        supplierRowBeingEdited.cells[4].textContent = correo;
        supplierRowBeingEdited.cells[5].textContent = entrega;
        supplierRowBeingEdited.cells[6].innerHTML = `<span class="${estadoClass}">${estado}</span>`;
        
        alert("¡Proveedor modificado exitosamente!");
        resetFormProveedor();
    } else {
        // Lógica de Creación: Buscar el último ID en la tabla y sumar 1
        let maxId = 0;
        const rows = tablaProveedoresBody.querySelectorAll("tr:not(.no-results-row)");
        rows.forEach(row => {
            const idVal = parseInt(row.cells[0].textContent.trim());
            if (!isNaN(idVal) && idVal > maxId) {
                maxId = idVal;
            }
        });
        const nuevoId = maxId + 1;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${nuevoId}</td>
            <td>${nombre}</td>
            <td>${contacto}</td>
            <td>${telefono}</td>
            <td>${correo}</td>
            <td>${entrega}</td>
            <td><span class="${estadoClass}">${estado}</span></td>
            <td>
                <button class="btn_modificar_proveedor">MODIFICAR</button>
                <button class="btn_eliminar_proveedor">ELIMINAR</button>
            </td>
        `;
        
        // Append row to the body
        tablaProveedoresBody?.appendChild(tr);
        alert("¡Proveedor agregado exitosamente!");
        resetFormProveedor();
    }

    // Actualizar select de proveedores en compras si existe
    if (typeof window.popularProveedoresSelect === "function") {
        window.popularProveedoresSelect();
    }
});

cancelEditProveedorDiv?.addEventListener("click", (event) => {
    event.preventDefault();
    resetFormProveedor();
});

tablaProveedoresBody?.addEventListener("click", (event) => {
    const btnModificar = event.target.closest(".btn_modificar_proveedor");
    const btnEliminar = event.target.closest(".btn_eliminar_proveedor");

    if (btnModificar) {
        event.preventDefault();
        const tr = btnModificar.closest("tr");
        supplierRowBeingEdited = tr;

        // Populate fields
        if (provNombreInput) provNombreInput.value = tr.cells[1].textContent.trim();
        if (provContactoInput) provContactoInput.value = tr.cells[2].textContent.trim();
        if (provTelefonoInput) provTelefonoInput.value = tr.cells[3].textContent.trim();
        if (provCorreoInput) provCorreoInput.value = tr.cells[4].textContent.trim();
        
        const estadoText = tr.cells[6].textContent.trim();
        if (provEstadoInput) provEstadoInput.value = estadoText === "Activo" ? "Activo" : "Inactivo";

        // Change button text
        if (btnGuardarProveedor) btnGuardarProveedor.textContent = "GUARDAR CAMBIOS";
        if (cancelEditProveedorDiv) cancelEditProveedorDiv.style.display = "flex";

        // Scroll to form
        document.querySelector(".header_proveedores")?.scrollIntoView({ behavior: "smooth" });
    }

    if (btnEliminar) {
        event.preventDefault();
        const tr = btnEliminar.closest("tr");
        const nombre = tr.cells[1].textContent.trim();
        if (confirm(`¿Estás seguro de que deseas eliminar al proveedor "${nombre}"?`)) {
            tr.remove();
            
            // If the row being edited was deleted, reset form
            if (supplierRowBeingEdited === tr) {
                resetFormProveedor();
            }

            // Actualizar select de proveedores en compras si existe
            if (typeof window.popularProveedoresSelect === "function") {
                window.popularProveedoresSelect();
            }
        }
    }
});

// ==========================================================================
// CENTRAL PRODUCT CATALOG STATE & LOGIC (DYNAMIC INVENTORY SYSTEM)
// ==========================================================================

const defaultProducts = [
    {
        id: "1",
        name: "Cerveza Toña",
        category: "Licores",
        price: 35,
        groupings: {
            "Unidad": 1,
            "Six Pack": 6,
            "Caja": 24
        },
        location: "Mostrador"
    },
    {
        id: "2",
        name: "Flor de Caña 7 Años",
        category: "Licores",
        price: 250,
        groupings: {
            "Unidad": 1,
            "Caja": 12,
            "Paquete": 12
        },
        location: "Bodega"
    },
    {
        id: "3",
        name: "Vino Tinto Concha y Toro",
        category: "Licores",
        price: 300,
        groupings: {
            "Unidad": 1,
            "Caja": 6
        },
        location: "Mostrador"
    },
    {
        id: "4",
        name: "Cerveza Victoria",
        category: "Licores",
        price: 30,
        groupings: {
            "Unidad": 1,
            "Six Pack": 6,
            "Caja": 24
        },
        location: "Mostrador"
    },
    {
        id: "5",
        name: "Whisky Chivas Regal",
        category: "Licores",
        price: 1500,
        groupings: {
            "Unidad": 1,
            "Caja": 6
        },
        location: "Bodega"
    },
    {
        id: "6",
        name: "Marlboro",
        category: "Cigarros",
        price: 70,
        groupings: {
            "Unidad": 1,
            "Cajilla": 20,
            "Paquete": 10
        },
        location: "Mostrador"
    },
    {
        id: "7",
        name: "Pepsi",
        category: "Bebidas",
        price: 25,
        groupings: {
            "Unidad": 1,
            "Paquete": 6
        },
        location: "Mostrador"
    }
];

window.productosInventario = [];

function cargarProductos() {
    const data = localStorage.getItem("productosInventario");
    if (data) {
        try {
            window.productosInventario = JSON.parse(data);
            // Sanitizar ubicaciones para usar solo Mostrador y Bodega
            window.productosInventario.forEach(prod => {
                if (prod.location === "Refrigerador" || prod.location === "Vitrina" || prod.location === "Caja Principal" || prod.location === "Seleccionar") {
                    prod.location = "Mostrador";
                } else if (prod.location === "Bodega A" || prod.location === "Bodega B") {
                    prod.location = "Bodega";
                }
            });
            localStorage.setItem("productosInventario", JSON.stringify(window.productosInventario));
        } catch (e) {
            console.error("Error al parsear productos, restableciendo por defecto.", e);
            window.productosInventario = [...defaultProducts];
            guardarProductos();
        }
    } else {
        window.productosInventario = [...defaultProducts];
        guardarProductos();
    }
}

function guardarProductos() {
    localStorage.setItem("productosInventario", JSON.stringify(window.productosInventario));
    renderizarTodoProductos();
    
    // Notify the groupings pricing tab to reload its products dropdown
    if (typeof window.actualizarDropdownPreciosAgrupacion === "function") {
        window.actualizarDropdownPreciosAgrupacion();
    }
    
    // Notify the inventory movement logic to update its tables and options
    if (typeof window.actualizarInventario === "function") {
        window.actualizarInventario();
    }
}

window.guardarProductos = guardarProductos;

// Dynamic Rendering Functions
function renderizarTodoProductos() {
    renderMainProductsTable();
    renderRegisteredProductsTable();
    renderModificationList();
}

window.renderizarTodoProductos = renderizarTodoProductos;

function renderMainProductsTable() {
    const tbody = document.getElementById("tabla_gestion_productos_body");
    if (!tbody) return;

    tbody.innerHTML = window.productosInventario.map(prod => {
        const groupingsText = Object.entries(prod.groupings)
            .map(([name, equiv]) => `<span class="badge">${name} (${equiv} ud${equiv > 1 ? 's' : ''})</span>`)
            .join(' ');

        return `
            <tr data-id="${prod.id}">
                <td><strong>${prod.name}</strong></td>
                <td>
                    <div class="badges">
                        ${groupingsText}
                    </div>
                </td>
                <td>
                    <button class="btn_modi_gestion_dinamico" data-id="${prod.id}">MODIFICAR</button>
                    <button class="btn_eliminar_gestion_dinamico" data-id="${prod.id}">ELIMINAR</button>
                </td>
            </tr>
        `;
    }).join('');

    if (typeof window.filtrarProductosGestion === "function") {
        window.filtrarProductosGestion();
    }
}

function renderRegisteredProductsTable() {
    const tbody = document.getElementById("tabla_registrados_productos_body");
    if (!tbody) return;

    tbody.innerHTML = window.productosInventario.map((prod, index) => {
        const groupingsText = Object.entries(prod.groupings)
            .map(([name, equiv]) => `<span class="badge">${name} (${equiv} ud${equiv > 1 ? 's' : ''})</span>`)
            .join(' ');

        return `
            <tr data-id="${prod.id}">
                <td>${index + 1}</td>
                <td><strong>${prod.name}</strong></td>
                <td>${prod.category}</td>
                <td>
                    <div class="badges">
                        ${groupingsText}
                    </div>
                </td>
                <td>
                    <select class="ubicacion" data-id="${prod.id}" onchange="cambiarUbicacionProducto('${prod.id}', this.value)">
                        <option value="Mostrador" ${prod.location === "Mostrador" ? "selected" : ""}>Mostrador</option>
                        <option value="Bodega" ${prod.location === "Bodega" ? "selected" : ""}>Bodega</option>
                    </select>
                </td>
                <td>
                    <button class="btn_delete btn_eliminar_registrado_dinamico" data-id="${prod.id}">Eliminar</button>
                </td>
            </tr>
        `;
    }).join('');
}

window.cambiarUbicacionProducto = function(id, nuevaUbicacion) {
    const prod = window.productosInventario.find(p => p.id === id);
    if (prod) {
        prod.location = nuevaUbicacion;
        localStorage.setItem("productosInventario", JSON.stringify(window.productosInventario));
    }
};

function renderModificationList(filterQuery = "") {
    const listContainer = document.getElementById("modificar_producto_list");
    if (!listContainer) return;

    const filtered = window.productosInventario.filter(prod => 
        prod.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(filterQuery.toLowerCase())
    );

    listContainer.innerHTML = filtered.map(prod => `
        <div class="product_item" data-id="${prod.id}">
            <div class="product_name">${prod.name}</div>
            <div class="product_category">${prod.category}</div>
        </div>
    `).join('');

    // Rebind click listener on items
    const items = listContainer.querySelectorAll(".product_item");
    items.forEach(item => {
        item.addEventListener("click", () => {
            items.forEach(i => i.classList.remove("active"));
            item.classList.add("active");
            cargarFormularioModificar(item.dataset.id);
        });
    });
}

let selectedModProductId = null;

function cargarFormularioModificar(id) {
    const prod = window.productosInventario.find(p => p.id === id);
    if (!prod) return;

    selectedModProductId = id;

    document.getElementById("modificar_producto_nombre").value = prod.name;
    document.getElementById("modificar_producto_precio").value = prod.price || "";
    document.getElementById("modificar_producto_categoria").value = prod.category;
    document.getElementById("modificar_producto_ubicacion").value = prod.location || "Bodega";

    // Set checkboxes and quantities
    const container = document.getElementById("modificar_producto_groupings");
    if (container) {
        const rows = container.querySelectorAll(".group_item_row");
        rows.forEach(row => {
            const checkbox = row.querySelector("input[type='checkbox']");
            const groupName = checkbox.dataset.group;
            const equivInput = row.querySelector(".group_equiv_input");

            if (groupName === "Unidad") {
                checkbox.checked = true;
                row.classList.add("active");
                return;
            }

            if (prod.groupings && prod.groupings[groupName] !== undefined) {
                checkbox.checked = true;
                row.classList.add("active");
                equivInput.value = prod.groupings[groupName];
            } else {
                checkbox.checked = false;
                row.classList.remove("active");
                // Restore default value if unchecked
                if (groupName === "Six Pack") equivInput.value = 6;
                else if (groupName === "Caja") equivInput.value = 24;
                else if (groupName === "Paquete") equivInput.value = 12;
                else if (groupName === "Cajilla") equivInput.value = 20;
                else if (groupName === "Botella") equivInput.value = 1;
                else if (groupName === "Media Botella") equivInput.value = 1;
            }
        });
    }
}

// Form Submit Handlers & Listeners
document.getElementById("form_crear_producto")?.addEventListener("submit", (e) => {
    e.preventDefault();

    const nombre = document.getElementById("crear_producto_nombre").value.trim();
    const precio = parseFloat(document.getElementById("crear_producto_precio").value);
    const categoria = document.getElementById("crear_producto_categoria").value;

    if (!nombre || isNaN(precio) || !categoria) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    // Get checked groupings and their custom quantities
    const groupings = { "Unidad": 1 };
    const container = document.getElementById("crear_producto_groupings");
    const rows = container.querySelectorAll(".group_item_row");
    rows.forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        const groupName = checkbox.dataset.group;
        const equivInput = row.querySelector(".group_equiv_input");

        if (groupName !== "Unidad" && checkbox.checked) {
            const equivVal = parseInt(equivInput.value) || 1;
            groupings[groupName] = equivVal;
        }
    });

    const nuevoProd = {
        id: String(Date.now()),
        name: nombre,
        price: precio,
        category: categoria,
        groupings: groupings,
        location: "Mostrador"
    };

    window.productosInventario.push(nuevoProd);
    guardarProductos();

    // Reset form
    document.getElementById("form_crear_producto").reset();
    rows.forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox.dataset.group !== "Unidad") {
            row.classList.remove("active");
            const groupName = checkbox.dataset.group;
            const equivInput = row.querySelector(".group_equiv_input");
            if (groupName === "Six Pack") equivInput.value = 6;
            else if (groupName === "Caja") equivInput.value = 24;
            else if (groupName === "Paquete") equivInput.value = 12;
            else if (groupName === "Cajilla") equivInput.value = 20;
            else if (groupName === "Botella") equivInput.value = 1;
            else if (groupName === "Media Botella") equivInput.value = 1;
        }
    });

    alert("¡Producto creado exitosamente!");
});

document.getElementById("btn_guardar_modificacion_producto")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectedModProductId) {
        alert("Por favor, selecciona un producto de la lista primero.");
        return;
    }

    const nombre = document.getElementById("modificar_producto_nombre").value.trim();
    const precio = parseFloat(document.getElementById("modificar_producto_precio").value);
    const categoria = document.getElementById("modificar_producto_categoria").value;
    const ubicacion = document.getElementById("modificar_producto_ubicacion").value;

    if (!nombre || isNaN(precio) || !categoria) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
    }

    const prod = window.productosInventario.find(p => p.id === selectedModProductId);
    if (!prod) return;

    // Get checked groupings and their custom quantities
    const groupings = { "Unidad": 1 };
    const container = document.getElementById("modificar_producto_groupings");
    const rows = container.querySelectorAll(".group_item_row");
    rows.forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        const groupName = checkbox.dataset.group;
        const equivInput = row.querySelector(".group_equiv_input");

        if (groupName !== "Unidad" && checkbox.checked) {
            const equivVal = parseInt(equivInput.value) || 1;
            groupings[groupName] = equivVal;
        }
    });

    prod.name = nombre;
    prod.price = precio;
    prod.category = categoria;
    prod.location = ubicacion;
    prod.groupings = groupings;

    guardarProductos();
    alert("¡Producto modificado exitosamente!");
});

function cargarAdministradoresEliminarProducto() {
    const selectAdmin = document.getElementById("eliminar_producto_admin");
    if (!selectAdmin) return;

    selectAdmin.innerHTML = "";

    // Carmelo es el administrador principal por defecto
    const optCarmelo = document.createElement("option");
    optCarmelo.value = "Carmelo";
    optCarmelo.textContent = "Carmelo (Administrador Principal)";
    selectAdmin.appendChild(optCarmelo);

    // Buscar otros administradores en la lista de usuarios
    const userRows = document.querySelectorAll("#tabla_usuarios_body tr");
    userRows.forEach(row => {
        const cells = row.cells;
        if (cells && cells.length >= 5) {
            const nombre = cells[0].textContent.trim();
            const rolText = cells[3].textContent.trim();
            if (rolText.toLowerCase().includes("admin") && nombre.toLowerCase() !== "carmelo") {
                const opt = document.createElement("option");
                opt.value = nombre;
                opt.textContent = `${nombre} (Administrador)`;
                selectAdmin.appendChild(opt);
            }
        }
    });
}

window.abrirSolicitudEliminarProducto = function(productoId) {
    const prod = window.productosInventario.find(p => p.id === productoId);
    if (!prod) return;

    document.getElementById("eliminar_producto_id").value = productoId;
    document.getElementById("eliminar_producto_motivo").value = "";
    cargarAdministradoresEliminarProducto();
    
    // Mostrar modal
    mostrarModal("modal_solicitar_eliminar_producto");
};

document.getElementById("btn_eliminar_producto")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectedModProductId) {
        alert("Selecciona un producto de la lista para eliminar.");
        return;
    }
    window.abrirSolicitudEliminarProducto(selectedModProductId);
});

document.getElementById("buscar_producto_modificar")?.addEventListener("input", (e) => {
    renderModificationList(e.target.value);
});

// Click Delegations for dynamic tables
document.getElementById("tabla_gestion_productos_body")?.addEventListener("click", (e) => {
    const btnModi = e.target.closest(".btn_modi_gestion_dinamico");
    const btnElim = e.target.closest(".btn_eliminar_gestion_dinamico");

    if (btnModi) {
        e.preventDefault();
        const id = btnModi.dataset.id;
        mostrarModal("modal_modificar_producto");
        cargarFormularioModificar(id);
        
        setTimeout(() => {
            const listItems = document.querySelectorAll("#modificar_producto_list .product_item");
            listItems.forEach(item => {
                if (item.dataset.id === id) {
                    item.classList.add("active");
                    item.scrollIntoView({ behavior: "smooth", block: "nearest" });
                } else {
                    item.classList.remove("active");
                }
            });
        }, 50);
    }

    if (btnElim) {
        e.preventDefault();
        const id = btnElim.dataset.id;
        window.abrirSolicitudEliminarProducto(id);
    }
});

document.getElementById("tabla_registrados_productos_body")?.addEventListener("click", (e) => {
    const btnElim = e.target.closest(".btn_eliminar_registrado_dinamico");
    if (btnElim) {
        e.preventDefault();
        const id = btnElim.dataset.id;
        window.abrirSolicitudEliminarProducto(id);
    }
});

// ==========================================
// GESTIÓN DE CATEGORÍAS
// ==========================================
const defaultCategorias = ["Licores", "Cigarros", "Bebidas", "Snacks"];

function getCategorias() {
    const data = localStorage.getItem("categoriasInventario");
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            console.error("Error al parsear categoriasInventario", e);
        }
    }
    localStorage.setItem("categoriasInventario", JSON.stringify(defaultCategorias));
    return defaultCategorias;
}
window.getCategorias = getCategorias;

function actualizarCategoriasEnUI() {
    const categorias = getCategorias();

    // 1. Selector en modal crear producto
    const selectCrear = document.getElementById("crear_producto_categoria");
    if (selectCrear) {
        selectCrear.innerHTML = '<option value="">Seleccionar</option>' + 
            categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // 2. Selector en modal modificar producto
    const selectMod = document.getElementById("modificar_producto_categoria");
    if (selectMod) {
        const valActual = selectMod.value;
        selectMod.innerHTML = categorias.map(c => `<option value="${c}">${c}</option>`).join('');
        if (valActual && categorias.includes(valActual)) {
            selectMod.value = valActual;
        }
    }

    // 3. Selector de filtro en gestión de productos
    const selectFiltroProd = document.getElementById("Selec_catego");
    if (selectFiltroProd) {
        selectFiltroProd.innerHTML = '<option value="">Seleccionar categoría</option>' + 
            categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // 4. Selector de filtro en inventario
    const selectFiltroInvent = document.getElementById("cat_invent");
    if (selectFiltroInvent) {
        selectFiltroInvent.innerHTML = '<option value="">Seleccionar categoría</option>' + 
            categorias.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    // 5. Botones de categoría en el Punto de Venta (POS)
    const navBotton = document.querySelector("#punto-venta .nav_botton");
    if (navBotton) {
        const activeCat = navBotton.querySelector(".cat_bot.active")?.dataset.category || "todos";
        navBotton.innerHTML = '<button class="cat_bot" data-category="todos">Todos</button>' + 
            categorias.map(c => `<button class="cat_bot" data-category="${c.toLowerCase()}">${c}</button>`).join('');

        const botonesCategorias = navBotton.querySelectorAll('.cat_bot');
        let foundActive = false;
        botonesCategorias.forEach(boton => {
            if (boton.dataset.category === activeCat) {
                boton.classList.add('active');
                foundActive = true;
            }
            boton.addEventListener('click', () => {
                botonesCategorias.forEach(b => b.classList.remove('active'));
                boton.classList.add('active');
                if (typeof window.filtrarPorCategoria === "function") {
                    window.filtrarPorCategoria(boton.dataset.category);
                }
            });
        });
        if (!foundActive && botonesCategorias[0]) {
            botonesCategorias[0].classList.add('active');
        }
    }

    // 6. Lista en el panel de Gestión de Categorías
    const listaCategoriasUI = document.getElementById("lista_categorias_usuarios");
    if (listaCategoriasUI) {
        listaCategoriasUI.innerHTML = categorias.map(c => {
            const esDefault = defaultCategorias.includes(c);
            const deleteBtn = !esDefault ? `<button type="button" onclick="eliminarCategoria('${c}')" style="border: none; background: transparent; color: #ef4444; cursor: pointer; font-weight: bold; padding: 0 2px; font-size: 1rem; line-height: 1;">×</button>` : '';
            return `
                <span class="badge_categoria" style="background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 8px;">
                    ${c}
                    ${deleteBtn}
                </span>
            `;
        }).join('');
    }

    // 7. Selector en modal editar categoría
    const selectEditarCat = document.getElementById("select_editar_categoria");
    if (selectEditarCat) {
        const valActual = selectEditarCat.value;
        selectEditarCat.innerHTML = '<option value="">Seleccionar categoría</option>' + 
            categorias.map(c => `<option value="${c}">${c}</option>`).join('');
        if (valActual && categorias.includes(valActual)) {
            selectEditarCat.value = valActual;
        }
    }
}
window.actualizarCategoriasEnUI = actualizarCategoriasEnUI;

function agregarCategoria(nuevaCategoria) {
    const limpia = nuevaCategoria.trim();
    if (!limpia) return false;

    const categorias = getCategorias();
    if (categorias.some(c => c.toLowerCase() === limpia.toLowerCase())) {
        alert("La categoría ya existe.");
        return false;
    }

    categorias.push(limpia);
    localStorage.setItem("categoriasInventario", JSON.stringify(categorias));
    actualizarCategoriasEnUI();
    return true;
}
window.agregarCategoria = agregarCategoria;

function eliminarCategoria(categoria) {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${categoria}"?`)) {
        let categorias = getCategorias();
        categorias = categorias.filter(c => c !== categoria);
        localStorage.setItem("categoriasInventario", JSON.stringify(categorias));
        actualizarCategoriasEnUI();
    }
}
window.eliminarCategoria = eliminarCategoria;

function editarCategoria(categoriaVieja, categoriaNueva) {
    const viejaLimpia = categoriaVieja.trim();
    const nuevaLimpia = categoriaNueva.trim();
    if (!viejaLimpia || !nuevaLimpia) return false;
    if (viejaLimpia.toLowerCase() === nuevaLimpia.toLowerCase()) return false;

    let categorias = getCategorias();
    const index = categorias.findIndex(c => c.toLowerCase() === viejaLimpia.toLowerCase());
    if (index === -1) {
        alert("La categoría a editar no existe.");
        return false;
    }

    if (categorias.some((c, i) => i !== index && c.toLowerCase() === nuevaLimpia.toLowerCase())) {
        alert("Ya existe una categoría con ese nombre.");
        return false;
    }

    const originalVieja = categorias[index];
    categorias[index] = nuevaLimpia;
    localStorage.setItem("categoriasInventario", JSON.stringify(categorias));

    let productosModificados = false;
    window.productosInventario = window.productosInventario.map(prod => {
        if (prod.category && prod.category.toLowerCase() === originalVieja.toLowerCase()) {
            prod.category = nuevaLimpia;
            productosModificados = true;
        }
        return prod;
    });

    if (productosModificados) {
        localStorage.setItem("productosInventario", JSON.stringify(window.productosInventario));
        renderizarTodoProductos();
        if (typeof window.actualizarDropdownPreciosAgrupacion === "function") {
            window.actualizarDropdownPreciosAgrupacion();
        }
    }

    actualizarCategoriasEnUI();
    return true;
}
window.editarCategoria = editarCategoria;

// Vincular formulario de agregar categoría y editar categoría
document.addEventListener("DOMContentLoaded", () => {
    // Formulario de agregar categoría en modal
    const formCrearCat = document.getElementById("form_crear_categoria");
    formCrearCat?.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = document.getElementById("nueva_categoria_nombre");
        if (input && input.value.trim()) {
            const val = input.value.trim();
            if (agregarCategoria(val)) {
                alert(`¡Categoría "${val}" agregada exitosamente!`);
                input.value = "";
                closeMostAggProdu();
            }
        }
    });

    // Formulario de editar categoría en modal
    const formEditarCat = document.getElementById("form_editar_categoria");
    formEditarCat?.addEventListener("submit", (e) => {
        e.preventDefault();
        const select = document.getElementById("select_editar_categoria");
        const input = document.getElementById("editar_categoria_nombre");
        if (select && input && select.value && input.value.trim()) {
            const catVieja = select.value;
            const nuevoNombre = input.value.trim();
            if (editarCategoria(catVieja, nuevoNombre)) {
                alert(`¡Categoría modificada de "${catVieja}" a "${nuevoNombre}" exitosamente!`);
                select.value = "";
                input.value = "";
                closeMostAggProdu();
            }
        } else {
            alert("Por favor, selecciona una categoría y escribe el nuevo nombre.");
        }
    });

    // Cambiar input en modal editar categoría cuando cambia la selección
    const selectEditarCat = document.getElementById("select_editar_categoria");
    selectEditarCat?.addEventListener("change", (e) => {
        const input = document.getElementById("editar_categoria_nombre");
        if (input) {
            input.value = e.target.value;
        }
    });

    // Botones de categoría en el listado de gestión de productos
    const btnAgregarCatProd = document.getElementById("btn_agregar_categoria_prod");
    btnAgregarCatProd?.addEventListener("click", (e) => {
        e.preventDefault();
        mostrarModal("modal_crear_categoria");
        const input = document.getElementById("nueva_categoria_nombre");
        if (input) input.value = "";
    });

    const btnEditarCatProd = document.getElementById("btn_editar_categoria_prod");
    btnEditarCatProd?.addEventListener("click", (e) => {
        e.preventDefault();
        const categorias = getCategorias();
        if (categorias.length === 0) {
            alert("No hay categorías registradas.");
            return;
        }
        mostrarModal("modal_editar_categoria");
        const select = document.getElementById("select_editar_categoria");
        const input = document.getElementById("editar_categoria_nombre");
        if (select) select.value = "";
        if (input) input.value = "";
    });

    // Buscador y filtro de categorías en la gestión de productos
    const inputBuscarProd = document.getElementById("buscar_producto_gestion");
    const selectFiltroCat = document.getElementById("Selec_catego");

    const filtrar = () => {
        const query = inputBuscarProd?.value.trim().toLowerCase() || "";
        const cat = selectFiltroCat?.value || "";
        const tbody = document.getElementById("tabla_gestion_productos_body");
        if (!tbody) return;

        const rows = tbody.querySelectorAll("tr");
        rows.forEach(row => {
            const prodId = row.dataset.id;
            const prod = window.productosInventario.find(p => p.id === prodId);
            if (!prod) return;

            const matchesName = prod.name.toLowerCase().includes(query);
            const matchesCat = !cat || prod.category.toLowerCase() === cat.toLowerCase();

            if (matchesName && matchesCat) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    };

    inputBuscarProd?.addEventListener("input", filtrar);
    selectFiltroCat?.addEventListener("change", filtrar);

    // Formulario de solicitud de eliminación de producto
    const formEliminarProd = document.getElementById("form_solicitar_eliminar_producto");
    formEliminarProd?.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const prodId = document.getElementById("eliminar_producto_id").value;
        const motivoInput = document.getElementById("eliminar_producto_motivo");
        const adminSelect = document.getElementById("eliminar_producto_admin");

        if (!prodId || !motivoInput || !adminSelect) return;

        const motivo = motivoInput.value.trim();
        const admin = adminSelect.value;
        const solicitante = (typeof activeOperator !== "undefined" && activeOperator) ? activeOperator : "Carmelo";

        if (!motivo) {
            alert("Por favor, escriba el motivo de la eliminación.");
            return;
        }

        const prod = window.productosInventario.find(p => p.id === prodId);
        if (!prod) {
            alert("Producto no encontrado.");
            return;
        }

        const solicitudes = JSON.parse(localStorage.getItem("solicitudesAnulacion")) || [];
        const nuevoSolId = `PROD-${String(Date.now()).slice(-4)}`;

        const nuevaSol = {
            id: nuevoSolId,
            ventaId: nuevoSolId,
            monto: prod.price,
            tipo: "Producto",
            fecha: new Date().toISOString().split("T")[0],
            motivo: motivo,
            solicitadoPor: solicitante,
            adminAsignado: admin,
            estado: "Pendiente",
            detallesProducto: {
                id: prod.id,
                name: prod.name,
                category: prod.category,
                location: prod.location,
                price: prod.price,
                groupings: prod.groupings
            }
        };

        solicitudes.unshift(nuevaSol);
        localStorage.setItem("solicitudesAnulacion", JSON.stringify(solicitudes));

        // Registro de Auditoría
        if (typeof registrarLogOperar === "function") {
            const sucursal = (typeof activeSucursal !== "undefined") ? activeSucursal : "Central";
            registrarLogOperar(solicitante, sucursal, `Solicitó la eliminación del producto "${prod.name}" (ID: ${prod.id}) asignado a ${admin} por: ${motivo}`);
        }

        alert(`Solicitud de eliminación para "${prod.name}" registrada. Requiere la aprobación del administrador asignado (${admin}) en la pestaña de Anulaciones.`);

        // Cerrar modal
        closeMostAggProdu();

        // Re-renderizar solicitudes en la bandeja
        if (typeof window.renderSolicitudes === "function") {
            window.renderSolicitudes();
        }
    });

    window.filtrarProductosGestion = filtrar;
});

// Initial Load
cargarProductos();
renderizarTodoProductos();
actualizarCategoriasEnUI();
if (typeof window.actualizarDropdownPreciosAgrupacion === "function") {
    window.actualizarDropdownPreciosAgrupacion();
}
if (window.productosInventario.length > 0) {
    cargarFormularioModificar(window.productosInventario[0].id);
}
