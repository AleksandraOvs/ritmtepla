document.addEventListener('DOMContentLoaded', function () {
    var sliders = document.querySelectorAll('.posts-slider');

    sliders.forEach(function (slider) {
        // Инициализация Swiper
        var swiper = new Swiper(slider, {
            slidesPerView: 3,
            spaceBetween: 20,
            navigation: {
                nextEl: slider.querySelector('.swiper-button-next'),
                prevEl: slider.querySelector('.swiper-button-prev'),
            },
            pagination: {
                el: slider.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });

        // Табсы категорий
        var tabsContainer = slider.previousElementSibling;
        if (!tabsContainer || !tabsContainer.classList.contains('posts-slider-categories')) return;

        var tabs = tabsContainer.querySelectorAll('.category-tab');

        tabs.forEach(function (tab) {
            tab.addEventListener('click', function () {
                // Активная кнопка
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                var catId = tab.dataset.cat;

                // Показываем все записи, если "Все"
                slider.querySelectorAll('.swiper-slide').forEach(function (slide) {
                    var slideCats = slide.dataset.categories.split(',');
                    if (catId === 'all' || slideCats.includes(catId)) {
                        slide.style.display = '';
                    } else {
                        slide.style.display = 'none';
                    }
                });

                swiper.update();
            });
        });
    });
});