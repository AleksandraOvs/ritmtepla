<?php

/**
 * Title: Баннер с текстом
 * Slug: eshop/banner-text
 * Categories: banner, featured
 * Description: Баннер с текстом.
 */
?>
<!-- wp:columns {"className":"banner"} -->
<div class="wp-block-columns banner">
    <!-- wp:column {"className":"banner-image__container"} -->
    <div class="wp-block-column banner-image__container">
        <!-- wp:image {"className":"banner-image","lock":{"move":true,"remove":true}} -->
        <figure class="wp-block-image banner-image">
            <img src="" alt="">
        </figure>
        <!-- /wp:image -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column -->
    <div class="wp-block-column banner-content__container">
        <!-- wp:group {"className":"banner-content__container"} -->
        <div class="wp-block-group banner-content">

            <!-- wp:heading {"level":2,"className":"banner-title"} -->
            <h2 class="banner-title">Заголовок</h2>
            <!-- /wp:heading -->

            <!-- wp:paragraph {"className":"banner-desc"} -->
            <p class="banner-desc">Описание вашего тура или предложения.</p>
            <!-- /wp:paragraph -->

            <!-- wp:buttons -->
            <div class="wp-block-buttons">
                <!-- wp:button -->
                <div class="wp-block-button"><a class="wp-block-button__link">Подробнее</a></div>
                <!-- /wp:button -->
            </div>
            <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:column -->
</div>
<!-- /wp:columns -->