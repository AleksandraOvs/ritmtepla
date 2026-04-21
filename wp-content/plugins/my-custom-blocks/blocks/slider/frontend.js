document.addEventListener('DOMContentLoaded', function () {

    let sliders = document.querySelectorAll('.slider');
    let swipers = [];

    function initSwiper() {
        sliders.forEach((slider, index) => {
            if (!swipers[index]) {
                swipers[index] = new Swiper(slider, {
                    slidesPerView: 1.4,
                    spaceBetween: 16,
                    loop: false,
                    navigation: {
                        nextEl: slider.querySelector('.swiper-button-next'),
                        prevEl: slider.querySelector('.swiper-button-prev'),
                    },

                    breakpoints: {
                        480: {
                            slidesPerView: 1.1,
                            spaceBetween: 16
                        }
                    }
                });
            }
        });
    }
    initSwiper();
    window.addEventListener('resize', initSwiper);

});