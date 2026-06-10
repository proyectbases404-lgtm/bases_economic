(function() {
    // Crear el contenedor de toasts si no existe
    function getOrCreateContainer() {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    // Mapear un mensaje de alert para determinar su tipo
    function detectSeverity(message) {
        const msg = String(message).toLowerCase();
        if (msg.includes('éxito') || msg.includes('exito') || msg.includes('exitosamente') || msg.includes('guardado') || msg.includes('guardada') || msg.includes('creado') || msg.includes('creada') || msg.includes('modificado') || msg.includes('modificada') || msg.includes('eliminado') || msg.includes('eliminada') || msg.includes('procesada') || msg.includes('realizada') || msg.includes('realizado') || msg.includes('aprobada') || msg.includes('registrado') || msg.includes('registrada')) {
            return 'success';
        }
        if (msg.includes('por favor') || msg.includes('selecciona') || msg.includes('completa') || msg.includes('obligatorio') || msg.includes('menor al total') || msg.includes('ya existe') || msg.includes('no hay') || msg.includes('describa el motivo') || msg.includes('en curso') || msg.includes('requeridos') || msg.includes('debe ser')) {
            return 'warning';
        }
        if (msg.includes('error') || msg.includes('falló') || msg.includes('incorrecto') || msg.includes('rechazada')) {
            return 'error';
        }
        return 'info';
    }

    // Iconos SVG para cada tipo (Lucide icons style)
    const icons = {
        success: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>`,
        warning: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>`,
        error: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>`,
        info: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>`
    };

    // Función para mostrar el modal de éxito con el checkmark animado
    function showSuccessPopup(message) {
        const existing = document.getElementById('custom-success-popup');
        if (existing) existing.remove();

        const popup = document.createElement('div');
        popup.id = 'custom-success-popup';
        popup.className = 'custom-success-popup';
        popup.innerHTML = `
            <div class="success-popup-card">
                <div class="success-icon-wrapper">
                    <svg class="success-checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                        <circle class="success-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                        <path class="success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                    </svg>
                </div>
                <h3 class="success-popup-title">Operación Exitosa</h3>
                <p class="success-popup-message">${String(message).replace(/\n/g, '<br>')}</p>
                <button class="success-popup-btn" id="success-popup-btn">Aceptar</button>
            </div>
        `;

        document.body.appendChild(popup);

        // Forzar reflow y mostrar
        popup.offsetHeight;
        popup.classList.add('show');

        function closePopup() {
            if (!popup.classList.contains('show')) return;
            popup.classList.remove('show');
            popup.addEventListener('transitionend', () => {
                popup.remove();
            });
        }

        // Auto cerrar tras 3.5 segundos
        const autoTimeout = setTimeout(closePopup, 3500);

        // Cerrar al hacer clic en el botón
        popup.querySelector('#success-popup-btn').addEventListener('click', () => {
            clearTimeout(autoTimeout);
            closePopup();
        });

        // Cerrar al hacer clic fuera de la tarjeta
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                clearTimeout(autoTimeout);
                closePopup();
            }
        });
    }

    // Función principal para mostrar un Toast
    window.showToast = function(message, type = null) {
        if (!type) {
            type = detectSeverity(message);
        }

        if (type === 'success') {
            showSuccessPopup(message);
            return;
        }

        const container = getOrCreateContainer();
        const toast = document.createElement('div');
        toast.className = `custom-toast toast-${type}`;
        
        // Convertir saltos de línea \n a elementos HTML br para preservar el formato en recibos
        const formattedMessage = String(message).replace(/\n/g, '<br>');

        toast.innerHTML = `
            <div class="toast-icon">
                ${icons[type] || icons.info}
            </div>
            <div class="toast-message">${formattedMessage}</div>
            <button class="toast-close">&times;</button>
        `;

        container.appendChild(toast);

        // Forzar reflow para animación
        toast.offsetHeight;

        // Mostrar con animación
        toast.classList.add('show');

        // Función para remover con animación
        function removeToast() {
            if (toast.classList.contains('hide')) return;
            toast.classList.replace('show', 'hide');
            toast.addEventListener('transitionend', () => {
                toast.remove();
            });
        }

        // Auto remove después de 5 segundos
        const autoTimeout = setTimeout(removeToast, 5000);

        // Click en cerrar
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoTimeout);
            removeToast();
        });
    };

    // Sobrescribir window.alert nativo
    window.alert = function(message) {
        window.showToast(message);
    };
})();
