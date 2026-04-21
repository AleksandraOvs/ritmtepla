document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper === 'undefined') return;

    document.querySelectorAll('.--hero-slider').forEach(slider => {
        new Swiper(slider, {
            slidesPerView: 1,
            loop: false,

            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },

            speed: 1500, // скорость анимации (мс)

            autoplay: {
                delay: 5000,          // 5 секунд
                disableOnInteraction: false, // не останавливать после свайпа
                pauseOnMouseEnter: true      // пауза при наведении
            },

            pagination: {
                el: slider.querySelector('.swiper-pagination'),
                clickable: true,
            },

            navigation: {
                nextEl: slider.querySelector('.swiper-button-next'),
                prevEl: slider.querySelector('.swiper-button-prev'),

            }
        });
    });

    document.querySelectorAll('.--banners-slider').forEach(slider => {
        new Swiper(slider, {
            slidesPerView: 1,
            loop: false,

            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },

            speed: 1500, // скорость анимации (мс)

            autoplay: {
                delay: 5000,          // 5 секунд
                disableOnInteraction: false, // не останавливать после свайпа
                pauseOnMouseEnter: true      // пауза при наведении
            },

            pagination: {
                el: slider.querySelector('.swiper-pagination'),
                clickable: true,
            },
        });
    });

});

document.addEventListener('DOMContentLoaded', () => {

    function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    function smoothScrollToElement(selector, duration = 700) {
        const target = document.querySelector(selector);
        if (!target) return;

        const element = document.scrollingElement || document.documentElement;
        const start = element.scrollTop;
        const offset = 160; // под хедер
        const targetTop = target.getBoundingClientRect().top + start - offset;
        const change = targetTop - start;
        const startTime = performance.now();

        function animate(currentTime) {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            element.scrollTop = start + change * easeInOutQuad(progress);
            if (progress < 1) requestAnimationFrame(animate);
        }

        requestAnimationFrame(animate);
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            const href = link.getAttribute('href');

            // ❗ игнорируем пустые якоря
            if (!href || href === '#') return;

            const target = document.querySelector(href);

            // ❗ если элемента нет — не ломаем поведение
            if (!target) return;

            e.preventDefault();

            smoothScrollToElement(href);
        });
    });

});