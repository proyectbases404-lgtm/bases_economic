// ==========================================
// SISTEMA DE CONTROL DE ACCESO (LOGIN)
// Roles: gerente | admin | vendedor
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const loginForm = document.getElementById("login-form");
    const loginUsernameInput = document.getElementById("login-username");
    const loginPasswordInput = document.getElementById("login-password");
    const btnVerContrasena = document.getElementById("btn-ver-contrasena");
    const body = document.body;

    // 1. ALTERNAR VISIBILIDAD DE CONTRASEÑA
    if (btnVerContrasena && loginPasswordInput) {
        btnVerContrasena.addEventListener("click", () => {
            if (loginPasswordInput.type === "password") {
                loginPasswordInput.type = "text";
                btnVerContrasena.style.opacity = "1";
            } else {
                loginPasswordInput.type = "password";
                btnVerContrasena.style.opacity = "0.65";
            }
        });
    }

    // 2. OBTENER USUARIOS VÁLIDOS DESDE EL DOM (Y EL GERENTE POR DEFECTO)
    function obtenerUsuariosValidos() {
        const usuarios = [
            { username: "carmelo", name: "Carmelo", role: "gerente", sucursal: "Central" }
        ];

        // Escanear la tabla de usuarios en el DOM
        const rows = document.querySelectorAll("#tabla_usuarios_body tr");
        rows.forEach(row => {
            const cells = row.cells;
            if (cells && cells.length >= 5) {
                const nombre = cells[0].textContent.trim();
                const usuario = cells[1].textContent.trim();
                const rolText = cells[3].textContent.trim();
                const sucursal = cells[4].textContent.trim();

                // Mapear rol según el texto de la tabla
                let role = "vendedor";
                const lower = rolText.toLowerCase();
                if (lower.includes("gerente")) {
                    role = "gerente";
                } else if (lower.includes("admin")) {
                    role = "admin";
                }

                if (usuario) {
                    usuarios.push({
                        username: usuario.toLowerCase(),
                        name: nombre,
                        role: role,
                        sucursal: sucursal || "Central"
                    });
                }
            }
        });

        return usuarios;
    }

    // 3. APLICAR DATOS DE USUARIO AL SISTEMA
    function aplicarSesionUsuario(user) {
        // Guardar variables globales en operar.js si existen
        if (typeof activeOperator !== "undefined") {
            window.activeOperator = user.name;
        }
        if (typeof activeRole !== "undefined") {
            window.activeRole = user.role;
        }
        if (typeof activeSucursal !== "undefined") {
            window.activeSucursal = user.sucursal;
        }

        // Actualizar elementos visuales del Header
        const headerLabel = document.querySelector(".header .box_comp label");
        const headerRol = document.querySelector(".header .Cont_usuario .rol");

        if (headerLabel) {
            headerLabel.textContent = user.name;
        }
        if (headerRol) {
            headerRol.textContent = user.role;
            // Aplicar estilo visual según el rol jerárquico
            if (typeof window.aplicarEstiloRolHeader === "function") {
                window.aplicarEstiloRolHeader(headerRol, user.role);
            } else {
                // Fallback si operar.js no ha cargado aún
                if (user.role === "gerente") {
                    headerRol.style.background = "linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(217, 119, 6, 0.12))";
                    headerRol.style.color = "#d97706";
                    headerRol.style.border = "1px solid rgba(245, 158, 11, 0.3)";
                } else if (user.role === "admin") {
                    headerRol.style.background = "rgba(56, 189, 248, 0.15)";
                    headerRol.style.color = "var(--color-acento)";
                    headerRol.style.border = "none";
                } else {
                    headerRol.style.background = "rgba(79, 70, 229, 0.15)";
                    headerRol.style.color = "#818cf8";
                    headerRol.style.border = "none";
                }
            }
        }

        // Sincronizar con la sección de Operar
        const optOperarUsr = document.getElementById("card_operar_usuario");
        const optOperarRol = document.getElementById("card_operar_rol");
        const optOperarSuc = document.getElementById("card_operar_sucursal");

        if (optOperarUsr) optOperarUsr.textContent = user.name;
        if (optOperarRol) {
            const rolLabel = user.role === "gerente" ? "Gerente"
                           : user.role === "admin" ? "Administrador"
                           : "Vendedor";
            optOperarRol.textContent = rolLabel;
        }
        if (optOperarSuc) optOperarSuc.textContent = user.sucursal;

        // Actualizar visibilidad de módulos administrativos
        if (typeof window.actualizarVisibilidadAnulaciones === "function") {
            window.actualizarVisibilidadAnulaciones();
        }

        // Actualizar visibilidad de secciones restringidas por rol
        if (typeof window.actualizarVisibilidadPorRol === "function") {
            window.actualizarVisibilidadPorRol();
        }

        // Actualizar KPIs de turnos en operar.js
        if (typeof window.actualizarTurnoKPIs === "function") {
            window.actualizarTurnoKPIs();
        }
    }

    // 4. CONTROL DE ACCESO / INICIAR SESIÓN
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const usernameInput = loginUsernameInput.value.trim().toLowerCase();
            const passwordInput = loginPasswordInput.value.trim();

            const usuariosValidos = obtenerUsuariosValidos();
            const usuarioEncontrado = usuariosValidos.find(
                u => u.username === usernameInput || u.name.toLowerCase() === usernameInput
            );

            if (!usuarioEncontrado) {
                alert("Error: El usuario ingresado no existe en el sistema.");
                return;
            }

            // Las contraseñas de demostración son "1234" (o "admin" para Carmelo)
            const passwordCorrecto = (usuarioEncontrado.username === "carmelo" && passwordInput === "admin") || passwordInput === "1234";

            if (!passwordCorrecto) {
                alert("Error: La contraseña ingresada es incorrecta.");
                return;
            }

            // Inicio de sesión exitoso
            sessionStorage.setItem("loggedInUser", JSON.stringify(usuarioEncontrado));
            aplicarSesionUsuario(usuarioEncontrado);

            // Mostrar el panel de control con transición
            body.classList.remove("login-active");

            // Mostrar notificación de bienvenida
            const rolLabel = usuarioEncontrado.role === "gerente" ? "Gerente"
                           : usuarioEncontrado.role === "admin" ? "Administrador"
                           : "Vendedor";
            alert(`¡Éxito! Bienvenido al sistema, ${usuarioEncontrado.name}. Rol: ${rolLabel}`);

            // Redirigir al inicio por defecto
            const btnInicio = document.querySelector('.nav_button[data-section="inicio"]');
            if (btnInicio) btnInicio.click();
        });
    }

    // 5. COMPROBACIÓN DE SESIÓN AL CARGAR LA PÁGINA
    const usuarioGuardado = sessionStorage.getItem("loggedInUser");
    if (usuarioGuardado) {
        try {
            const user = JSON.parse(usuarioGuardado);
            aplicarSesionUsuario(user);
            body.classList.remove("login-active");
        } catch (e) {
            console.error("Error al restaurar sesión", e);
            body.classList.add("login-active");
        }
    } else {
        body.classList.add("login-active");
    }

    // 6. INTERCEPTAR EL CIERRE DE SESIÓN EN LA BARRA LATERAL
    const btnCerrarSesion = document.querySelector('.nav_button[data-section="cerrar-sesion"]');
    const modalCerrarSesion = document.getElementById("modal_cerrar_sesion");
    const btnConfirmarLogout = document.getElementById("btn_confirmar_logout");
    const btnCancelarLogout = document.getElementById("btn_cancelar_logout");

    if (btnCerrarSesion && modalCerrarSesion) {
        // Clonar botón para remover event listeners previos que redirigen a la sección vacía
        const clone = btnCerrarSesion.cloneNode(true);
        btnCerrarSesion.parentNode.replaceChild(clone, btnCerrarSesion);

        clone.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Mostrar modal personalizado
            modalCerrarSesion.classList.add("open");
        });

        // Botón CONFIRMAR cierre de sesión
        if (btnConfirmarLogout) {
            btnConfirmarLogout.addEventListener("click", () => {
                modalCerrarSesion.classList.remove("open");

                // Limpiar almacenamiento de sesión
                sessionStorage.removeItem("loggedInUser");

                // Limpiar campos del formulario
                if (loginForm) loginForm.reset();

                // Mostrar pantalla de Login
                body.classList.add("login-active");
            });
        }

        // Botón CANCELAR cierre de sesión
        if (btnCancelarLogout) {
            btnCancelarLogout.addEventListener("click", () => {
                modalCerrarSesion.classList.remove("open");
            });
        }

        // Cerrar al hacer clic fuera del modal
        modalCerrarSesion.addEventListener("click", (e) => {
            if (e.target === modalCerrarSesion) {
                modalCerrarSesion.classList.remove("open");
            }
        });
    }
});
