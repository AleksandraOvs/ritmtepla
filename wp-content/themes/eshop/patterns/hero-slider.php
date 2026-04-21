<?php

/**
 * Title: Слайдер - первый экран
 * Slug: eshop/hero-slider
 * Categories: text, layout
 * Description: Hero slider
 */
?>
<!-- wp:group {"align":"full"} -->
<div class="wp-block-group alignfull">


    <!-- wp:columns {"className":"swiper js-swiper --hero-slider"} -->
    <div class="wp-block-columns swiper js-swiper --hero-slider">
        <!-- wp:column {"className":"swiper-wrapper"} -->
        <div class="wp-block-column swiper-wrapper">
            <!-- wp:group {"className":"swiper-slide hero-slider__slide"} -->
            <div class="wp-block-group swiper-slide hero-slider__slide">
                <!-- wp:image {"url":"https://russian.tours/wp-content/themes/tours/images/svg/placeholder.svg"} -->
                <figure class="wp-block-image"><img src="https://russian.tours/wp-content/themes/tours/images/svg/placeholder.svg" alt=""></figure>
                <!-- /wp:image -->
            </div>
            <!-- /wp:group -->
        </div>
        <!-- /wp:column -->

        <!-- wp:html -->
        <div class="sliders-controls only-mobile">
            <div class="swiper-button-prev">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.155625 6.17277L5.72906 11.4821C5.82208 11.571 5.94576 11.6205 6.07438 11.6205C6.203 11.6205 6.32667 11.571 6.41969 11.4821L6.42438 11.4759C6.46972 11.433 6.50584 11.3812 6.53052 11.3239C6.5552 11.2665 6.56793 11.2047 6.56793 11.1423C6.56793 11.0799 6.5552 11.0181 6.53052 10.9607C6.50584 10.9034 6.46972 10.8516 6.42438 10.8087L1.1775 5.80871L6.42438 0.811831C6.46972 0.768902 6.50584 0.717179 6.53052 0.659823C6.5552 0.602466 6.56793 0.540679 6.56793 0.478237C6.56793 0.415795 6.5552 0.354009 6.53052 0.296652C6.50584 0.239295 6.46972 0.187573 6.42438 0.144644L6.41969 0.138393C6.32667 0.0495653 6.203 7.397e-08 6.07438 7.24362e-08C5.94576 7.09024e-08 5.82208 0.0495653 5.72906 0.138393L0.155625 5.44777C0.106457 5.49448 0.0673049 5.5507 0.0405508 5.61302C0.0137967 5.67534 7.00955e-08 5.74245 6.92868e-08 5.81027C6.8478e-08 5.87809 0.0137967 5.9452 0.0405508 6.00752C0.0673049 6.06983 0.106457 6.12606 0.155625 6.17277Z" fill="white" />
                </svg>

            </div>
            <div class="slider-pagination swiper-pagination"></div>
            <div class="swiper-button-next">
                <svg width="7" height="12" viewBox="0 0 7 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.41231 5.44777L0.838869 0.138393C0.745849 0.049565 0.622177 -2.59897e-07 0.493557 -2.65519e-07C0.364937 -2.71142e-07 0.241264 0.049565 0.148244 0.138393L0.143557 0.144643C0.0982116 0.187572 0.0620944 0.239294 0.0374117 0.296651C0.0127289 0.354008 -9.71849e-07 0.415795 -9.74579e-07 0.478237C-9.77308e-07 0.540679 0.0127289 0.602466 0.0374117 0.659823C0.0620944 0.717179 0.0982116 0.768902 0.143557 0.811831L5.39043 5.81183L0.143556 10.8087C0.0982111 10.8516 0.0620939 10.9034 0.0374112 10.9607C0.0127285 11.0181 -1.43799e-06 11.0799 -1.44072e-06 11.1423C-1.44345e-06 11.2047 0.0127285 11.2665 0.0374112 11.3239C0.0620939 11.3812 0.0982111 11.433 0.143556 11.4759L0.148243 11.4821C0.241263 11.571 0.364937 11.6205 0.493556 11.6205C0.622176 11.6205 0.745849 11.571 0.838869 11.4821L6.41231 6.17277C6.46148 6.12606 6.50063 6.06983 6.52738 6.00752C6.55414 5.9452 6.56793 5.87809 6.56793 5.81027C6.56793 5.74245 6.55414 5.67534 6.52738 5.61302C6.50063 5.5507 6.46148 5.49448 6.41231 5.44777Z" fill="white" />
                </svg>
            </div>
        </div>
        <!-- /wp:html -->

    </div>
    <!-- /wp:columns -->
</div>
<!-- /wp:group -->