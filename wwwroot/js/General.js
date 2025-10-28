// La función global que será llamada desde C#
window.initializeAnimations = function () {

    // ---------------------- SELECCIÓN DE SECCIONES (scope dentro del root) ----------------------
    const root = document.querySelector('.vader-root');
    if (!root) return;

    const sections = root.querySelectorAll('.vader-section');

    // ---------------------- INTERSECTION OBSERVER ----------------------
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
    if (sections.length > 0) {
        sections[0].classList.add('is-visible');
    }

    // ---------------------- RESIZE (actualiza medidas si es necesario) ----------------------
    window.addEventListener('resize', () => {
        // Actualmente no hay partículas que requieran recalculo,
        // pero dejamos el listener para actualizar comportamientos futuros.
    });
};
