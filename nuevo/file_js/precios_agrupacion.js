// ==========================================
// LÓGICA DE PRECIOS POR AGRUPACIÓN (POR MAYOR)
// ==========================================

// Precios precargados en memoria para simulación
const defaultPreciosConfigurados = {
    // Cerveza Toña (ID 1, Precio Base C$35)
    "1": [
        { name: "Six Pack", price: 180, pct: 14.3 }, // normal: 6 * 35 = 210
        { name: "Caja", price: 700, pct: 16.7 }     // normal: 24 * 35 = 840
    ],
    // Cerveza Victoria (ID 4, Precio Base C$30)
    "4": [
        { name: "Six Pack", price: 160, pct: 11.1 }  // normal: 6 * 30 = 180
    ]
};

let preciosConfigurados = {};
try {
    const storedPrecios = localStorage.getItem("preciosConfigurados");
    if (storedPrecios) {
        preciosConfigurados = JSON.parse(storedPrecios);
    } else {
        preciosConfigurados = { ...defaultPreciosConfigurados };
        localStorage.setItem("preciosConfigurados", JSON.stringify(preciosConfigurados));
    }
} catch (e) {
    console.error("Error al inicializar preciosConfigurados de localStorage", e);
    preciosConfigurados = { ...defaultPreciosConfigurados };
}
window.preciosConfigurados = preciosConfigurados;

document.addEventListener("DOMContentLoaded", () => {
    // 1. GESTIÓN DE PESTAÑAS (TABS)
    const tabButtons = document.querySelectorAll(".tab_prod_btn");
    const tabLista = document.getElementById("tab_lista_productos");
    const tabPrecios = document.getElementById("tab_precios_agrupacion");

    tabButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remover clase activa de todos los botones
            tabButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const tab = btn.dataset.tab;
            if (tab === "lista-productos") {
                tabLista.style.display = "block";
                tabPrecios.style.display = "none";
            } else {
                tabLista.style.display = "none";
                tabPrecios.style.display = "block";
            }
        });
    });

    // 2. CONFIGURADOR DE PRECIOS POR PRODUCTO
    const selectProd = document.getElementById("select_prod_agrupacion");
    const buscarProdInput = document.getElementById("buscar_prod_agrupacion");
    const resultadosBusqueda = document.getElementById("resultados_busqueda_agrupacion");
    const configContainer = document.getElementById("agrupaciones_config_container");
    const listContainer = document.getElementById("lista_agrupaciones_inputs");

    const iniciarAutocompletadoAgrupacion = () => {
        if (!buscarProdInput || !resultadosBusqueda) return;

        // Filtrar y mostrar resultados mientras escribe
        buscarProdInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                resultadosBusqueda.style.display = "none";
                selectProd.value = "";
                selectProd.dispatchEvent(new Event("change"));
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

                    buscarProdInput.value = name;
                    selectProd.value = id;
                    resultadosBusqueda.style.display = "none";

                    selectProd.dispatchEvent(new Event("change"));
                });
            });
        });

        // Mostrar lista completa al hacer click/focus
        buscarProdInput.addEventListener("focus", () => {
            const query = buscarProdInput.value.toLowerCase().trim();
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

                    buscarProdInput.value = name;
                    selectProd.value = id;
                    resultadosBusqueda.style.display = "none";

                    selectProd.dispatchEvent(new Event("change"));
                });
            });
        });

        // Cerrar resultados al hacer click fuera
        document.addEventListener("click", (e) => {
            if (!buscarProdInput.contains(e.target) && !resultadosBusqueda.contains(e.target)) {
                resultadosBusqueda.style.display = "none";
            }
        });
    };

    window.actualizarDropdownPreciosAgrupacion = function() {
        if (!selectProd) return;
        const valGuardada = selectProd.value;

        if (window.productosInventario && valGuardada) {
            const prodExistente = window.productosInventario.find(p => p.id === valGuardada);
            if (prodExistente) {
                if (buscarProdInput) buscarProdInput.value = prodExistente.name;
                selectProd.value = valGuardada;
                selectProd.dispatchEvent(new Event("change"));
                return;
            }
        }

        if (buscarProdInput) buscarProdInput.value = "";
        selectProd.value = "";
        configContainer.style.display = "none";
    };

    // Inicializar autocompletado
    iniciarAutocompletadoAgrupacion();

    selectProd?.addEventListener("change", (e) => {
        const prodId = e.target.value;
        if (!prodId) {
            configContainer.style.display = "none";
            return;
        }

        const productObj = window.productosInventario.find(p => p.id === prodId);
        if (!productObj) {
            configContainer.style.display = "none";
            return;
        }

        const basePrice = productObj.price;

        // Determinar qué agrupaciones aplican al producto según su configuración
        let allowedGroupings = Object.keys(productObj.groupings).filter(g => g !== "Unidad");

        if (allowedGroupings.length === 0) {
            listContainer.innerHTML = `<p style="color: #64748b; font-size: 0.875rem; padding: 12px; text-align: center;">Este producto no tiene agrupaciones por volumen disponibles.</p>`;
            configContainer.style.display = "block";
            return;
        }

        // Generar las tarjetas de configuración para cada agrupación
        listContainer.innerHTML = allowedGroupings.map(groupName => {
            const equiv = productObj.groupings[groupName] || 6;
            const normalPrice = basePrice * equiv;
            
            // Buscar si ya hay un descuento o precio promocional configurado; si no, por defecto 10%
            const configExistente = (preciosConfigurados[prodId] || []).find(c => c.name === groupName);
            const pctDesc = configExistente ? configExistente.pct : 10.0;
            const promoPrice = normalPrice * (1 - (pctDesc / 100));
            const ahorro = normalPrice - promoPrice;

            return `
                <div class="agrupacion_config_item" data-group-name="${groupName}" data-equiv="${equiv}">
                    <div class="agrup_item_header">
                        <span style="font-weight: 700; color: #0f172a;">${groupName}</span>
                        <span class="agrup_equiv_badge">${equiv} Unidades</span>
                    </div>
                    <div class="agrup_pricing_fields" style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 12px;">
                        <div class="form_group">
                            <label>Precio Normal Sugerido</label>
                            <input type="text" value="C$ ${normalPrice.toFixed(0)}" readonly style="background: #e2e8f0; font-weight: bold; color: #475569; border: 1px solid #cbd5e1; height: 38px; border-radius: 6px; padding: 0 10px; font-size: 0.85rem; outline: none;">
                        </div>
                        <div class="form_group">
                            <label>Descuento por mayor (%)</label>
                            <input type="number" class="input_discount_pct" value="${pctDesc.toFixed(1)}" min="0" max="99" step="0.5" data-normal-price="${normalPrice}" oninput="calculatePriceFromDiscount(this)" style="border: 1px solid #cbd5e1; font-weight: bold; color: #2563eb; height: 38px; border-radius: 6px; padding: 0 10px; font-size: 0.85rem; outline: none;">
                        </div>
                        <div class="form_group">
                            <label>Precio Especial (Calculado)</label>
                            <input type="text" class="input_promo_price" value="C$ ${promoPrice.toFixed(0)}" readonly style="background: #f0fdf4; border: 1px solid #bbf7d0; font-weight: bold; color: #166534; height: 38px; border-radius: 6px; padding: 0 10px; font-size: 0.85rem; outline: none;">
                        </div>
                    </div>
                    <div class="discount_indicator" style="font-size: 0.75rem; font-weight: 600; color: #166534; margin-top: 6px;">
                        <span>Ahorro de C$ ${ahorro.toFixed(0)} por agrupación</span>
                    </div>
                </div>
            `;
        }).join('');

        configContainer.style.display = "block";
    });

    // 3. GUARDAR CAMBIOS Y ACTUALIZAR TABLA DE RESUMEN
    const btnGuardar = document.getElementById("btn_guardar_precios_agrupacion");
    
    const renderResumenPreciosTabla = () => {
        const listBody = document.getElementById("tabla_resumen_precios_body");
        if (!listBody) return;

        listBody.innerHTML = "";
        
        Object.entries(preciosConfigurados).forEach(([prodId, configs]) => {
            const productObj = window.productosInventario?.find(p => String(p.id) === String(prodId));
            if (!productObj) return;

            configs.forEach(config => {
                const groupName = config.name;
                const equiv = productObj.groupings ? (productObj.groupings[groupName] || 1) : 1;
                const basePrice = productObj.price;
                const normalPrice = basePrice * equiv;
                const promoPrice = config.price;
                const pctDesc = config.pct;

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${productObj.name}</strong></td>
                    <td>${groupName} (${equiv} uds)</td>
                    <td>C$ ${normalPrice.toFixed(0)}.00</td>
                    <td class="precio_promo">C$ ${promoPrice.toFixed(0)}.00</td>
                    <td><span class="badge_pct">${pctDesc.toFixed(1)}% desc.</span></td>
                `;
                listBody.appendChild(tr);
            });
        });
    };

    // Render summary table initially
    setTimeout(renderResumenPreciosTabla, 100);

    btnGuardar?.addEventListener("click", () => {
        const prodId = selectProd.value;
        if (!prodId) return;

        const productObj = window.productosInventario.find(p => p.id === prodId);
        if (!productObj) return;

        const prodName = productObj.name;
        const items = listContainer.querySelectorAll(".agrupacion_config_item");

        // Crear/Actualizar la configuración en memoria
        preciosConfigurados[prodId] = [];

        items.forEach(item => {
            const groupName = item.dataset.groupName;
            const equiv = parseInt(item.dataset.equiv);
            const basePrice = productObj.price;
            const normalPrice = basePrice * equiv;
            
            const pctDesc = parseFloat(item.querySelector(".input_discount_pct").value) || 0;
            const promoValText = item.querySelector(".input_promo_price").value;
            const promoPrice = parseFloat(promoValText.replace("C$", "").trim()) || normalPrice;

            preciosConfigurados[prodId].push({ name: groupName, price: promoPrice, pct: pctDesc });
        });

        // Guardar en localStorage
        localStorage.setItem("preciosConfigurados", JSON.stringify(preciosConfigurados));
        
        // Volver a renderizar la tabla de resumen
        renderResumenPreciosTabla();

        alert(`¡Precios al por mayor guardados exitosamente para ${prodName}!`);
        
        // Limpiar selección de producto
        if (buscarProdInput) buscarProdInput.value = "";
        selectProd.value = "";
        configContainer.style.display = "none";
    });
});

// Función global que calcula el precio promocional en tiempo real basándose en el porcentaje ingresado
window.calculatePriceFromDiscount = function(input) {
    const normalPrice = parseFloat(input.dataset.normalPrice);
    const pctDesc = parseFloat(input.value) || 0;
    const card = input.closest(".agrupacion_config_item");
    const promoInput = card.querySelector(".input_promo_price");
    const indicator = card.querySelector(".discount_indicator");

    if (pctDesc < 0 || pctDesc >= 100) {
        promoInput.value = "C$ " + normalPrice.toFixed(0);
        indicator.innerHTML = `<span style="color: #dc2626; font-weight: bold;">Descuento no válido (debe ser entre 0% y 99%)</span>`;
        return;
    }

    const promoPrice = normalPrice * (1 - (pctDesc / 100));
    const ahorro = normalPrice - promoPrice;

    promoInput.value = `C$ ${promoPrice.toFixed(0)}`;
    indicator.innerHTML = `<span>Ahorro de C$ ${ahorro.toFixed(0)} por agrupación</span>`;
};
