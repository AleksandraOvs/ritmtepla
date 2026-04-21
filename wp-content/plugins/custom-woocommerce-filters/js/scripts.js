document.addEventListener('DOMContentLoaded', () => {
    /* ===============================
       КНОПКА ОТКРЫТИЯ ФИЛЬТРА НА <992PX
    =============================== */

    const button = document.querySelector('button.toggle-filter');
    const sidebar = document.querySelector('.sidebar-area-wrapper._filters');
    const closeBtn = document.querySelector('.close-filters');
    const applyBtn = document.querySelector('#cwc-apply-filters');

    if (!button || !sidebar) return;

    // Открытие / переключение
    button.addEventListener('click', () => {
        if (window.innerWidth <= 480) {
            sidebar.classList.toggle('show');
        }
    });

    // Закрытие по кнопке
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            sidebar.classList.remove('show');
        });
    }

    // Закрытие по клику вне сайдбара
    document.addEventListener('click', (e) => {
        if (
            window.innerWidth <= 480 &&
            sidebar.classList.contains('show') &&
            !sidebar.contains(e.target) &&
            !button.contains(e.target)
        ) {
            sidebar.classList.remove('show');
        }
    });

    // Закрытие по Esc
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            sidebar.classList.remove('show');
        }
    });

    // Закрытие после применения фильтров на <576px
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            if (window.innerWidth < 480) {
                sidebar.classList.remove('show');
            }
        });
    }
});