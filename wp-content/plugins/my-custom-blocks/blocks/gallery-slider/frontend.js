document.addEventListener('DOMContentLoaded', function () {
    const sliders = document.querySelectorAll('.gallery-slider');

    sliders.forEach(slider => {
        new Swiper(slider, {
            slidesPerView: 1.1,
            spaceBetween: 7,
            loop: false,

            pagination: {
                el: slider.querySelector('.swiper-pagination'),
                clickable: true
            },

            navigation: {
                nextEl: slider.querySelector('.swiper-button-next'),
                prevEl: slider.querySelector('.swiper-button-prev'),
            },

            breakpoints: {
                576: {
                    slidesPerView: 1.3,
                    spaceBetween: 16,
                }
            }
        });
    });
});