<?php

/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package eshop
 */

?>
<!doctype html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="https://gmpg.org/xfn/11">

    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <?php wp_body_open(); ?>
    <div id="page" class="site">
        <a class="skip-link screen-reader-text" href="#primary"><?php esc_html_e('Skip to content', 'eshop'); ?></a>

        <header id="masthead" class="site-header">
            <div class="site-header-top">
                <div class="container">
                    <div class="site-branding">
                        <?php
                        $header_logo = get_theme_mod('header_logo');
                        $img = wp_get_attachment_image_src($header_logo, 'full');
                        if ($img) : echo '<a class="custom-logo-link" href="' . site_url() . '"><img src="' . $img[0] . '" alt=""></a>';
                        endif;
                        ?>
                    </div><!-- .site-branding -->


                    <?php get_template_part('template-parts/contacts') ?>

                    <div class="header-right">
                        <?php if (!is_cart()) : ?>
                            <button class="cart-icon" id="open-minicart">
                                <div class="shopping-cart-icon">
                                    <svg width="21" height="18" viewBox="0 0 21 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.85449 14.583C9.71744 14.583 10.417 15.2826 10.417 16.1455C10.417 17.0085 9.71744 17.708 8.85449 17.708C7.99155 17.708 7.29199 17.0085 7.29199 16.1455C7.29199 15.2826 7.99155 14.583 8.85449 14.583Z" fill="black" />
                                        <path d="M15.1045 14.583C15.9674 14.583 16.667 15.2826 16.667 16.1455C16.667 17.0085 15.9674 17.708 15.1045 17.708C14.2415 17.708 13.542 17.0085 13.542 16.1455C13.542 15.2826 14.2415 14.583 15.1045 14.583Z" fill="black" />
                                        <path d="M19.792 4.50882e-06C19.9644 -0.00050161 20.1342 0.041608 20.2861 0.123051C20.4381 0.20462 20.5681 0.322791 20.6631 0.466801C20.758 0.610814 20.816 0.776419 20.8311 0.948247C20.8461 1.12015 20.8175 1.29375 20.749 1.45215L17.624 8.74317C17.4605 9.1265 17.0837 9.375 16.667 9.375H7.2627L8.02148 11.458H16.667V13.541H8.02148C7.5941 13.5403 7.17715 13.4084 6.82715 13.1631C6.47718 12.9178 6.21004 12.5714 6.06348 12.1699L2.39648 2.08301H0V4.50882e-06H19.792Z" fill="black" />
                                    </svg>

                                </div>

                                <?php if (WC()->cart->get_cart_contents_count() > 0): ?>
                                    <span class="cart-count"><?php //echo WC()->cart->get_cart_contents_count()
                                                                ?>
                                        <?php echo WC()->cart->get_cart_contents_count(); ?>
                                    </span>
                                <?php endif; ?>

                            </button>
                        <?php endif; ?>

                        <nav id="site-navigation" class="main-navigation">

                            <div class="header-menu__inner">
                                <a href="/#catalog" class="button">Каталог</a>
                                <!-- <a href="#catalog" class="button toggle-menu">Каталог</a> -->
                                <!-- <div class="header-menu">
                                    <?php //wp_nav_menu([
                                    //'container' => false,
                                    // 'theme_location' => 'header_menu',
                                    //'walker' => new Custom_Walker_Nav_Menu,
                                    // 'depth' => 2,
                                    //]); 
                                    ?>
                                </div> -->

                            </div>
                            <div class="header-menu__inner">
                                <a href="/" class="button toggle-menu stroke-button">Меню</a>
                                <div class="header-menu">
                                    <div class="close-menu">
                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M0.708 12.616L0 11.908L5.6 6.308L0 0.708L0.708 0L6.308 5.6L11.908 0L12.616 0.708L7.016 6.308L12.616 11.908L11.908 12.616L6.308 7.016L0.708 12.616Z" fill="white" />
                                        </svg>
                                    </div>
                                    <?php wp_nav_menu([
                                        'container' => false,
                                        'theme_location' => 'header',
                                        // 'walker' => new Custom_Walker_Nav_Menu,
                                        // 'depth' => 2,
                                    ]); ?>
                                </div>
                            </div>
                        </nav><!-- #site-navigation -->
                    </div>


                    <button class="menu-toggle" aria-controls="primary-menu" aria-expanded="false">
                        <div class="bar"></div>
                        <div class="bar"></div>
                        <div class="bar"></div>
                    </button>
                </div>
            </div>

        </header><!-- #masthead -->