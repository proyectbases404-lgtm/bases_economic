// ==========================================
// DARK MODE TOGGLE SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const btnDarkMode = document.getElementById("btnDarkMode");
    const body = document.body;

    // Restore saved preference from localStorage
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode === "true") {
        body.classList.add("dark-mode");
    }

    // Toggle dark mode on button click
    if (btnDarkMode) {
        btnDarkMode.addEventListener("click", () => {
            body.classList.toggle("dark-mode");

            // Save preference
            const isDark = body.classList.contains("dark-mode");
            localStorage.setItem("darkMode", isDark);

            // Small animation feedback on the button
            btnDarkMode.style.transform = "scale(0.85) rotate(-15deg)";
            setTimeout(() => {
                btnDarkMode.style.transform = "";
            }, 200);
        });
    }
});
