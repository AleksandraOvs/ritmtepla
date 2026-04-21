document.addEventListener('DOMContentLoaded', () => {

    const filtersWrapper = document.querySelector('.sidebar-area-wrapper._filters');
    const productsWrapper = document.querySelector('.products');

    let activeFilters = {};

    if (!filtersWrapper || !productsWrapper) return;

    // =========================
    // 🔥 Синхронизация из DOM
    // =========================
    function syncActiveFiltersFromDOM() {
        activeFilters = {};

        document.querySelectorAll('.filter-item.active').forEach(el => {
            const taxonomy = el.dataset.taxonomy;
            const slug = decodeURIComponent(el.dataset.slug);

            if (!activeFilters[taxonomy]) {
                activeFilters[taxonomy] = [];
            }

            activeFilters[taxonomy].push(slug);
        });

        // instock
        const instock = document.querySelector('.instock-filter.active');
        if (instock) {
            activeFilters.instock = 1;
        }
    }

    // =========================
    // 🔥 Сбор данных
    // =========================
    function getFiltersData() {
        const data = {
            action: 'cwc_filter_products',
            current_cat_id: filtersWrapper.dataset.currentCat || 0
        };

        for (let tax in activeFilters) {
            if (tax === 'instock') {
                data.instock = 1;
                continue;
            }

            if (activeFilters[tax].length) {
                data['filter_' + tax] = activeFilters[tax];
            }
        }

        return data;
    }

    // =========================
    // 🔥 AJAX
    // =========================
    function applyFilters() {
        const data = getFiltersData();

        productsWrapper.classList.add('loading');

        fetch(cwc_ajax_object.ajax_url, {
            method: 'POST',
            body: new URLSearchParams(data)
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {

                    // товары
                    productsWrapper.innerHTML = res.data.html;

                    // фильтры
                    const newFiltersWrapper = document.querySelector('.sidebar-area-wrapper._filters');
                    if (newFiltersWrapper && res.data.filters) {
                        newFiltersWrapper.innerHTML = res.data.filters;
                    }

                    // 🔥 ВАЖНО — вернуть active состояние
                    restoreActiveClasses();

                } else {
                    console.warn('Ошибка фильтрации', res);
                }
            })
            .catch(err => {
                console.error('FETCH ERROR:', err);
            })
            .finally(() => {
                productsWrapper.classList.remove('loading');
            });
    }

    // =========================
    // 🔥 Восстановление active
    // =========================
    function restoreActiveClasses() {
        document.querySelectorAll('.filter-item').forEach(el => {
            const taxonomy = el.dataset.taxonomy;
            const slug = decodeURIComponent(el.dataset.slug);

            if (
                activeFilters[taxonomy] &&
                activeFilters[taxonomy].includes(slug)
            ) {
                el.classList.add('active');
            }
        });

        if (activeFilters.instock) {
            const instock = document.querySelector('.instock-filter');
            if (instock) instock.classList.add('active');
        }
    }

    // =========================
    // 🔥 Клик по фильтру
    // =========================
    document.addEventListener('click', (e) => {

        const filterItem = e.target.closest('.filter-item');
        if (!filterItem) return;

        e.preventDefault();

        const taxonomy = filterItem.dataset.taxonomy;
        const slug = decodeURIComponent(filterItem.dataset.slug);

        // инициализация
        if (!activeFilters[taxonomy]) {
            activeFilters[taxonomy] = [];
        }

        // 🔥 ВАЖНО: теперь только 1 значение на атрибут
        if (activeFilters[taxonomy][0] === slug) {
            // снять выбор
            delete activeFilters[taxonomy];
        } else {
            // заменить, а не добавлять
            activeFilters[taxonomy] = [slug];
        }

        applyFilters();
    });

    // =========================
    // 🔥 instock
    // =========================
    document.addEventListener('click', (e) => {
        const instock = e.target.closest('.instock-filter');
        if (!instock) return;

        e.preventDefault();

        if (activeFilters.instock) {
            delete activeFilters.instock;
        } else {
            activeFilters.instock = 1;
        }

        applyFilters();
    });

    // =========================
    // 🔥 Reset
    // =========================
    document.addEventListener('click', (e) => {
        if (e.target.matches('#cwc-reset-filters')) {
            e.preventDefault();

            activeFilters = {};
            applyFilters();
        }
    });

    // =========================
    // 🔥 Инициализация
    // =========================
    syncActiveFiltersFromDOM();

});