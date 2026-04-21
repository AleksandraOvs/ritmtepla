document.addEventListener('DOMContentLoaded', function () {

    let sliders = document.querySelectorAll('.pics-slider');
    let swipers = [];

    function initSwiper() {

        if (window.innerWidth < 1024) {

            sliders.forEach((slider, index) => {

                if (!swipers[index]) {

                    swipers[index] = new Swiper(slider, {
                        slidesPerView: 1,
                        spaceBetween: 16,
                        loop: false,
                        pagination: {
                            el: slider.querySelector('.swiper-pagination'),
                            clickable: true,
                        },

                        breakpoints: {
                            480: {
                                slidesPerView: 1,
                                spaceBetween: 16
                            },
                            768: {
                                slidesPerView: 2,
                                spaceBetween: 20
                            }
                        }
                    });

                }

            });

        } else {

            swipers.forEach(swiper => {
                if (swiper) swiper.destroy(true, true);
            });

            swipers = [];

        }
    }

    initSwiper();

    window.addEventListener('resize', initSwiper);

});