<?php if (is_active_sidebar('eshop-footer-area')) { ?>
    <div id="content-footer-section" class="row clearfix">
        <?php
        // Calling the header sidebar if it exists.
        dynamic_sidebar('eshop-footer-area');
        ?>
    </div>
<?php } ?>

<!-- prefooter -->
<?php
if (!is_front_page() && !is_checkout()) {

    $footer_page = carbon_get_theme_option('footer_page');

    if (!empty($footer_page)) {
        $page_id = $footer_page[0]['id'];
        echo apply_filters('the_content', get_post_field('post_content', $page_id));
    }
}
?>

<footer id="colophon" class="footer" role="contentinfo">
    <div class="container">

        <div class="footer-brand">
            <?php
            $footer_logo = get_theme_mod('footer_logo');
            $img = wp_get_attachment_image_src($footer_logo, 'full');
            if ($img) : echo '<a class="custom-logo-link" href="' . site_url() . '"><img src="' . $img[0] . '" alt=""></a>';
            endif;
            ?>
        </div>

        <?php if (is_active_sidebar('footer-sidebar-1')) : ?>
            <div class="footer-col">
                <?php dynamic_sidebar('footer-sidebar-1'); ?>
            </div>
        <?php endif; ?>

        <?php if (is_active_sidebar('footer-sidebar-2')) : ?>
            <div class="footer-col">
                <?php dynamic_sidebar('footer-sidebar-2'); ?>
            </div>
        <?php endif; ?>

        <?php if (is_active_sidebar('footer-sidebar-3')) : ?>
            <div class="footer-col">
                <?php dynamic_sidebar('footer-sidebar-3'); ?>
            </div>
        <?php endif; ?>
    </div>
    <div class="container">
        <?php if (is_active_sidebar('footer-sidebar-4')) : ?>

            <?php dynamic_sidebar('footer-sidebar-4'); ?>

        <?php endif; ?>
    </div>
</footer>
<div id="back-top">
    <a href="#top">
        <span></span>
    </a>
</div>
</div>
<!-- end main container -->
<?php if (current_user_can('manage_options')) : ?>
    <div class="current-temp"
        style="position: fixed;
  background: rgba(255,255,255,.7);
  color: #404040;
  padding: 5px 10px;
  font-size: 10px;
  bottom: 10px;
  right: 10px;">
        <?php echo get_current_template() ?>
    </div>
<?php endif; ?>

<?php get_template_part('template-parts/toggle-contacts'); ?>

<?php get_template_part('template-parts/mobile-menu');
?>

<div id="main-form" style="display:none;max-width:600px;">
    <?php get_template_part('template-parts/main-form'); ?>
</div>

<?php if (!is_cart()) : ?>
    <!--== Start Mini Cart Wrapper ==-->
    <div id="minicart-popup">
        <button class="close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.75 11.236L5.993 5.993L11.236 11.236M11.236 0.75L5.992 5.993L0.75 0.75" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>


        <?php woocommerce_mini_cart()
        ?>
    </div>
    <!--== End Mini Cart Wrapper ==-->

<?php endif; ?>


<?php wp_footer(); ?>
</body>

</html>