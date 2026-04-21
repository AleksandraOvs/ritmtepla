document.addEventListener('DOMContentLoaded', () => {
    if (typeof Swiper === 'undefined') return;

    document.querySelectorAll('.categories-slider').forEach(slider => {
        new Swiper(slider, {
            slidesPerView: 1.2,
            spaceBetween: 20,
            loop: false,
            navigation: {
                nextEl: slider.querySelector('.swiper-button-next'),
                prevEl: slider.querySelector('.swiper-button-prev'),
            },
            pagination: {
                el: slider.querySelector('.swiper-pagination'),
                clickable: true,
            },
            breakpoints: {
                1024: {
                    slidesPerView: 4, // 4 товара в ряд
                },
                768: {
                    slidesPerView: 2, // 2 товара в ряд
                },
                480: {
                    slidesPerView: 1.4, // 1 товар в ряд
                }
            }
        });
    });
});