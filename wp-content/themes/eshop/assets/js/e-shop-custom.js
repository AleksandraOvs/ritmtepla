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

    function easeOutQuint(t) {
        return 1 - Math.pow(1 - t, 5);
    }

    function smoothScrollTo(target, duration = 1000, offset = 200) {
        const element = document.scrollingElement || document.documentElement;
        const start = element.scrollTop;
        const targetTop = target.getBoundingClientRect().top + start - offset;
        const change = targetTop - start;
        const startTime = performance.now();

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = easeOutQuint(progress);

            element.scrollTop = start + change * ease;

            if (elapsed < duration) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    document.addEventListener('click', function (e) {
        const link = e.target.closest('a[href*="#"]');
        if (!link) return;

        const url = new URL(link.href);
        const id = url.hash;

        if (!id) return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();

        smoothScrollTo(target, 1000, 100);
    });

});