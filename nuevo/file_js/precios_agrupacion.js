// ==========================================
// LÓGICA DE PRECIOS POR AGRUPACIÓN (POR MAYOR)
// ==========================================

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
    const configContainer = document.getElementById("agrupaciones_config_container");
    const listContainer = document.getElementById("lista_agrupaciones_inputs");

    // Precios precargados en memoria para simulación
    const preciosConfigurados = {
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

    window.actualizarDropdownPreciosAgrupacion = function() {
        if (!selectProd) return;
        const valGuardada = selectProd.value;

        selectProd.innerHTML = '<option value="">Seleccione un producto...</option>';
        if (window.productosInventario) {
            window.productosInventario.forEach(prod => {
                const opt = document.createElement("option");
                opt.value = prod.id;
                opt.dataset.price = prod.price;
                opt.textContent = `${prod.name} (Precio Base: C$${prod.price})`;
                selectProd.appendChild(opt);
            });
        }

        if (valGuardada && Array.from(selectProd.options).some(o => o.value === valGuardada)) {
            selectProd.value = valGuardada;
            selectProd.dispatchEvent(new Event("change"));
        } else {
            configContainer.style.display = "none";
        }
    };

    // Populate initially
    window.actualizarDropdownPreciosAgrupacion();

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
    btnGuardar?.addEventListener("click", () => {
        const prodId = selectProd.value;
        if (!prodId) return;

        const productObj = window.productosInventario.find(p => p.id === prodId);
        if (!productObj) return;

        const prodName = productObj.name;

        const items = listContainer.querySelectorAll(".agrupacion_config_item");
        const listBody = document.getElementById("tabla_resumen_precios_body");
        if (!listBody) return;

        // Eliminar registros anteriores del mismo producto en la tabla para evitar duplicados visuales
        const rows = listBody.querySelectorAll("tr");
        rows.forEach(r => {
            if (r.cells[0].textContent === prodName) {
                r.remove();
            }
        });

        // Crear/Actualizar la configuración en memoria y agregar las filas a la tabla
        preciosConfigurados[prodId] = [];

        items.forEach(item => {
            const groupName = item.dataset.groupName;
            const equiv = parseInt(item.dataset.equiv);
            const basePrice = productObj.price;
            const normalPrice = basePrice * equiv;
            
            // Leer el porcentaje de descuento e input de precio especial
            const pctDesc = parseFloat(item.querySelector(".input_discount_pct").value) || 0;
            const promoValText = item.querySelector(".input_promo_price").value;
            const promoPrice = parseFloat(promoValText.replace("C$", "").trim()) || normalPrice;

            // Guardar en memoria
            preciosConfigurados[prodId].push({ name: groupName, price: promoPrice, pct: pctDesc });

            // Crear y agregar la fila a la tabla
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${prodName}</strong></td>
                <td>${groupName} (${equiv} uds)</td>
                <td>C$ ${normalPrice.toFixed(0)}.00</td>
                <td class="precio_promo">C$ ${promoPrice.toFixed(0)}.00</td>
                <td><span class="badge_pct">${pctDesc.toFixed(1)}% desc.</span></td>
            `;
            // Insertar al inicio de la tabla
            listBody.insertBefore(tr, listBody.firstChild);
        });

        alert(`¡Precios al por mayor guardados exitosamente para ${prodName}!`);
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
