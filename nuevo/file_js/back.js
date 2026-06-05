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

    const selectedModal = document.getElementById(modalId);
    if (selectedModal) {
        selectedModal.style.display = "block";
    }
    openMostAggProdu();
};

window.mostrarModal = mostrarModal;
window.closeMostAggProdu = closeMostAggProdu;

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
    const crearUsuarioClose = target.closest("#regr_crear_usuario");
    const btnAceptar = target.closest("#btn_aceptar");
    const btnCancelar = target.closest("#btn_cancelar");

    // Abrir modal aviso
    if (closeButton || modifyButton || verVentasClose || crearUsuarioClose || verComprasClose) {
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

    if (!nombre || !usuario || !contrasena) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    const rolClass = rol === "Administrador" ? "rol_admin" : "rol_cliente";

    if (userRowBeingEdited) {
        // Lógica de Edición: Actualizar la fila existente
        userRowBeingEdited.cells[0].textContent = nombre;
        userRowBeingEdited.cells[1].textContent = usuario;
        if (contrasena !== "********" && contrasena !== "") {
            userRowBeingEdited.cells[2].textContent = "********";
        }
        userRowBeingEdited.cells[3].innerHTML = `<span class="${rolClass}">${rol}</span>`;
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

        document.getElementById("reg_nombre").value = nombre;
        document.getElementById("reg_usuario").value = usuario;
        document.getElementById("reg_contrasena").value = "********"; // placeholder
        document.getElementById("reg_rol").value = rol;

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
        location: "Refrigerador"
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
        location: "Bodega A"
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
        location: "Vitrina"
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
        location: "Refrigerador"
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
        location: "Bodega B"
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
        location: "Vitrina"
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
        location: "Refrigerador"
    }
];

window.productosInventario = [];

function cargarProductos() {
    const data = localStorage.getItem("productosInventario");
    if (data) {
        try {
            window.productosInventario = JSON.parse(data);
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
}

// Dynamic Rendering Functions
function renderizarTodoProductos() {
    renderMainProductsTable();
    renderRegisteredProductsTable();
    renderModificationList();
}

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
                        <option value="Seleccionar" ${prod.location === "Seleccionar" ? "selected" : ""}>Seleccionar</option>
                        <option value="Bodega A" ${prod.location === "Bodega A" ? "selected" : ""}>Bodega A</option>
                        <option value="Bodega B" ${prod.location === "Bodega B" ? "selected" : ""}>Bodega B</option>
                        <option value="Refrigerador" ${prod.location === "Refrigerador" ? "selected" : ""}>Refrigerador</option>
                        <option value="Vitrina" ${prod.location === "Vitrina" ? "selected" : ""}>Vitrina</option>
                        <option value="Caja Principal" ${prod.location === "Caja Principal" ? "selected" : ""}>Caja Principal</option>
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
    document.getElementById("modificar_producto_ubicacion").value = prod.location || "Bodega A";

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
        location: "Seleccionar"
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

document.getElementById("btn_eliminar_producto")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!selectedModProductId) {
        alert("Selecciona un producto de la lista para eliminar.");
        return;
    }

    const prod = window.productosInventario.find(p => p.id === selectedModProductId);
    if (!prod) return;

    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${prod.name}"?`)) {
        window.productosInventario = window.productosInventario.filter(p => p.id !== selectedModProductId);
        selectedModProductId = null;
        
        document.getElementById("modificar_producto_nombre").value = "";
        document.getElementById("modificar_producto_precio").value = "";
        document.getElementById("modificar_producto_categoria").value = "Licores";
        document.getElementById("modificar_producto_ubicacion").value = "Bodega A";
        
        const container = document.getElementById("modificar_producto_groupings");
        if (container) {
            container.querySelectorAll(".group_item_row").forEach(row => {
                const checkbox = row.querySelector("input[type='checkbox']");
                if (checkbox.dataset.group !== "Unidad") {
                    checkbox.checked = false;
                    row.classList.remove("active");
                }
            });
        }

        guardarProductos();
        alert("Producto eliminado exitosamente.");
    }
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
        const prod = window.productosInventario.find(p => p.id === id);
        if (prod && confirm(`¿Estás seguro de que deseas eliminar "${prod.name}"?`)) {
            window.productosInventario = window.productosInventario.filter(p => p.id !== id);
            guardarProductos();
            alert("Producto eliminado.");
        }
    }
});

document.getElementById("tabla_registrados_productos_body")?.addEventListener("click", (e) => {
    const btnElim = e.target.closest(".btn_eliminar_registrado_dinamico");
    if (btnElim) {
        e.preventDefault();
        const id = btnElim.dataset.id;
        const prod = window.productosInventario.find(p => p.id === id);
        if (prod && confirm(`¿Estás seguro de que deseas eliminar "${prod.name}"?`)) {
            window.productosInventario = window.productosInventario.filter(p => p.id !== id);
            guardarProductos();
            alert("Producto eliminado.");
        }
    }
});

// Initial Load
cargarProductos();
renderizarTodoProductos();
if (typeof window.actualizarDropdownPreciosAgrupacion === "function") {
    window.actualizarDropdownPreciosAgrupacion();
}
if (window.productosInventario.length > 0) {
    cargarFormularioModificar(window.productosInventario[0].id);
}