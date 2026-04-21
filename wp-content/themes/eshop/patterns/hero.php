<?php

/**
 * Title: Первый экран для страницы — Hero
 * Slug: eshop/hero
 * Categories: hero, featured
 * Description: Hero-блок.
 */
?>

<!-- wp:columns {"className":"hero-block container"} -->
<div class="wp-block-columns hero-block container">
    <!-- wp:column {"className":"hero-block__col"} -->
    <div class="wp-block-column hero-block__col">
        <!-- wp:group {"className":"hero-block__col__inner"} -->
        <div class="wp-block-group hero-block__col__inner">
            <!-- wp:heading {"level":1,"className":"title"} -->
            <h1 class="title">Заголовок</h2>
                <!-- /wp:heading -->
                <!-- wp:paragraph {"className":"hero-desc"} -->
                <p class="hero-desc">Описание вашего тура или предложения.</p>
                <!-- /wp:paragraph -->

                <!-- wp:buttons {"className":"hero-block__col__inner__btns"} -->
                <div class="wp-block-buttons hero-block__col__inner__btns">
                    <!-- wp:button -->
                    <div class="wp-block-button"><a class="wp-block-button__link">Подробнее</a></div>
                    <!-- /wp:button -->
                    <!-- wp:button -->
                    <div class="wp-block-button"><a class="wp-block-button__link">Подробнее</a></div>
                    <!-- /wp:button -->
                </div>
                <!-- /wp:buttons -->
        </div>
        <!-- /wp:group -->
    </div>
    <!-- /wp:column -->

    <!-- wp:column {"className":"hero-block__col hero-image"} -->
    <div class="wp-block-column hero-block__col hero-image">
        <!-- wp:image {"url":"/wp-content/themes/eshop/img/svg/placeholder.svg"} -->
        <figure class="wp-block-image"><img src="/wp-content/themes/eshop/img/svg/placeholder.svg" alt="hero picture"></figure>
        <!-- /wp:image -->
    </div>
    <!-- /wp:column -->
</div>
<!-- /wp:columns -->